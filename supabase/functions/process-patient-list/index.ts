
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenAI } from "npm:@google/genai";
import { z } from "npm:zod";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    const requestBody = await req.json();
    if (!requestBody.uploadId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: uploadId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    const { uploadId } = requestBody;
    
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'public' }
    });
    
    // Get upload details with transaction
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single();
      
    if (uploadError) {
      console.error('Error fetching upload:', {
        error: uploadError,
        uploadId: uploadId,
        timestamp: new Date().toISOString()
      });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch upload details',
          details: uploadError.message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (!upload) {
      console.error('Upload not found:', uploadId);
      return new Response(
        JSON.stringify({ error: 'Upload not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Get file from storage with error details
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('patient_lists')
      .download(upload.file_path);
      
    if (fileError) {
      console.error('Error downloading file:', {
        error: fileError,
        filePath: upload.file_path,
        uploadId: uploadId,
        timestamp: new Date().toISOString()
      });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to download file',
          details: fileError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    try {
      // Define patient schema with Zod
      // Simplified schema without recursion risks
      const PatientSchema = z.object({
        full_name: z.string().min(2),
        status: z.enum(['stable', 'critical', 'unknown']),
        additional_info: z.object({
          age: z.number().int().min(0).max(120)
        }).strict().optional()
      });

      // Initialize Google GenAI
      const genai = new GoogleGenAI(Deno.env.get('GOOGLE_API_KEY') || '');
      
      // Process image with GenAI
      const fileBuffer = await fileData.arrayBuffer();
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

      let base64Data = base64Image;
      let mimeType = 'image/png'; // Default MIME type
      if (base64Image.startsWith('data:image/png;base64,')) {
        base64Data = base64Image.split(',')[1];
      } else if (base64Image.startsWith('data:image/jpeg;base64,')) {
        mimeType = 'image/jpeg';
        base64Data = base64Image.split(',')[1];
      } else {
        throw new Error('Failed to parse the image MimeType');
      }

      try {
        // Try to decode the base64 data
        const buffer = Buffer.from(base64Data, 'base64');
        // If decoding is successful, re-encode it to ensure it's in the correct format
        base64Data = buffer.toString('base64');
      } catch (error) {
        // If decoding fails, assume it's not a valid base64 string and log the error
        console.error('Error decoding base64 string:', error);
        throw new Error('Failed to parse the image Base64');
      }
      
      const prompt = `
        Extract patient information from this hospital document.
        Return JSON array with each patient containing:
        - full_name (string)
        - status (stable/critical/unknown)
        - additional_info (object containing age)
        Keep the response under 100KB.
        GIVE THE RESPONSE IN JSON FORMAT.
      `;

      const response = await genai.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        config: {
          responseModalities: ["Text", "Image"],
        },
        contents: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
        ]
      });

      // Parse and validate the response
      let patients;
      try {
        const jsonString = response.text();
        const rawPatients = JSON.parse(jsonString);
        patients = z.array(PatientSchema).parse(rawPatients);
      } catch (error) {
        console.error('Error parsing GenAI response:', error);
        throw new Error('Failed to parse patient data from document');
      }
    
      // Process database operations
      let processedCount = 0;
      
      // Update upload status to processing
      const { error: updateError } = await supabase
        .from('uploads')
        .update({
          ocr_status: 'processing',
          processed: false
        })
        .eq('id', uploadId);

      if (updateError) throw updateError;

      // Insert validated patients
      for (const patient of patients) {
        const { error } = await supabase
          .from('victims')
          .insert({
            full_name: patient.full_name,
            status: patient.status,
            hospital_id: upload.hospital_id,
            event_id: upload.event_id,
            additional_info: patient.additional_info
          });

        if (!error) processedCount++;
      }

      // Finalize upload record with extracted data
      const { error: finalizeError } = await supabase
        .from('uploads')
        .update({
          ocr_status: 'completed',
          ocr_data: { patients },
          processed: true,
          processing_results: { 
            status: processedCount > 0 ? 'success' : 'failed',
            count: processedCount,
            total: patients.length
          }
        })
        .eq('id', uploadId);

      if (finalizeError) throw finalizeError;
    
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Patient list processed successfully',
          patientsCount: patients.length,
          insertedCount: processedCount,
          patients: patients.slice(0, 5) // Return first 5 for verification
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (innerError) {
      console.error('Error in processing pipeline:', {
        error: innerError,
        uploadId: uploadId,
        timestamp: new Date().toISOString(),
        stack: innerError.stack
      });
      throw innerError;
    }
    
  } catch (error) {
    console.error('Error processing patient list:', {
      error: error,
      timestamp: new Date().toISOString(),
      stack: error.stack
    });
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process patient list',
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
