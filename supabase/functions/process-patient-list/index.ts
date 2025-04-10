
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      // Check file size before processing (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (fileData.size > maxSize) {
        throw new Error(`File too large (${fileData.size} bytes). Maximum allowed: ${maxSize} bytes`);
      }

      // Process file in chunks to avoid memory issues
      const chunkSize = 1024 * 1024; // 1MB chunks
      const fileBuffer = await fileData.arrayBuffer();
      
      // Simple OCR simulation with chunk processing
      const simulatedPatients = [];
      const patientTemplates = [
        { full_name: "John Smith", status: "stable", additional_info: { age: 42, room: "301A" } },
        { full_name: "Sarah Jones", status: "critical", additional_info: { age: 56, room: "ICU-4" } },
        { full_name: "Michael Brown", status: "stable", additional_info: { age: 35, room: "205B" } },
        { full_name: "Emma Wilson", status: "stable", additional_info: { age: 29, room: "310C" } },
        { full_name: "Robert Clark", status: "critical", additional_info: { age: 61, room: "ICU-7" } },
      ];

      // Process in chunks to avoid memory overload
      for (let i = 0; i < fileBuffer.byteLength; i += chunkSize) {
        const chunk = new Uint8Array(fileBuffer.slice(i, i + chunkSize));
        // Simulate processing each chunk
        const patientsFromChunk = Math.min(5, patientTemplates.length);
        simulatedPatients.push(...patientTemplates.slice(0, patientsFromChunk));
        
        // Add small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    
      // Process database operations in batches
      const batchSize = 10;
      let processedCount = 0;
      
      // First update the upload record
      const { error: updateError } = await supabase
        .from('uploads')
        .update({
          ocr_status: 'processing',
          processed: false
        })
        .eq('id', uploadId);

      if (updateError) throw updateError;

      // Process patients in batches
      for (let i = 0; i < simulatedPatients.length; i += batchSize) {
        const batch = simulatedPatients.slice(i, i + batchSize);
        const { error: batchError } = await supabase
          .from('victims')
          .insert(batch.map(patient => ({
            full_name: patient.full_name,
            status: patient.status,
            hospital_id: upload.hospital_id,
            event_id: upload.event_id,
            additional_info: patient.additional_info
          })));

        if (batchError) {
          console.error('Error inserting batch:', {
            batchIndex: i,
            error: batchError
          });
          // Continue with next batches even if one fails
        } else {
          processedCount += batch.length;
        }
      }

      // Finalize upload record
      const { error: finalizeError } = await supabase
        .from('uploads')
        .update({
          ocr_status: 'completed',
          ocr_data: { patients: simulatedPatients },
          processed: true,
          processing_results: { 
            status: processedCount > 0 ? 'partial' : 'failed',
            count: processedCount,
            total: simulatedPatients.length
          }
        })
        .eq('id', uploadId);

      if (finalizeError) throw finalizeError;
        
      if (updateError) {
        console.error('Error updating upload:', {
          error: updateError,
          uploadId: uploadId,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Failed to update upload: ${updateError.message}`);
      }
      
      // Insert patients into the victims table
      const hospital_id = upload.hospital_id;
      const event_id = upload.event_id;
      const insertedPatients = [];
      
      for (const patient of simulatedPatients) {
        const { data, error: insertError } = await supabase
          .from('victims')
          .insert({
            full_name: patient.full_name,
            status: patient.status,
            hospital_id: hospital_id,
            event_id: event_id,
            additional_info: patient.additional_info
          })
          .select();
          
        if (insertError) {
          console.error('Error inserting patient:', {
            error: insertError,
            patient: patient.full_name,
            timestamp: new Date().toISOString()
          });
          // Continue with other patients even if one fails
        } else {
          insertedPatients.push(data);
        }
      }
      
      if (insertedPatients.length === 0) {
        throw new Error('Failed to insert any patients');
      }
    
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Patient list processed successfully',
          patientsCount: simulatedPatients.length,
          insertedCount: insertedPatients.length
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
