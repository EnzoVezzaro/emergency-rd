
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
    const { uploadId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get upload details
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single();
      
    if (uploadError) {
      console.error('Error fetching upload:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch upload details' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Get file from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('patient_lists')
      .download(upload.file_path);
      
    if (fileError) {
      console.error('Error downloading file:', fileError);
      return new Response(
        JSON.stringify({ error: 'Failed to download file' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Convert file to base64 for OCR API
    const fileBuffer = await fileData.arrayBuffer();
    const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    
    // Simple OCR simulation - in a real app, you would integrate with an OCR API
    // For demo purposes, we'll generate sample patient data
    const simulatedPatients = [
      { full_name: "John Smith", status: "stable", additional_info: { age: 42, room: "301A" } },
      { full_name: "Sarah Jones", status: "critical", additional_info: { age: 56, room: "ICU-4" } },
      { full_name: "Michael Brown", status: "stable", additional_info: { age: 35, room: "205B" } },
      { full_name: "Emma Wilson", status: "stable", additional_info: { age: 29, room: "310C" } },
      { full_name: "Robert Clark", status: "critical", additional_info: { age: 61, room: "ICU-7" } },
    ];
    
    // Update upload with extracted data
    const { error: updateError } = await supabase
      .from('uploads')
      .update({
        ocr_status: 'completed',
        ocr_data: { patients: simulatedPatients },
        processed: true,
        processing_results: { status: 'success', count: simulatedPatients.length }
      })
      .eq('id', uploadId);
      
    if (updateError) {
      console.error('Error updating upload:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update upload with OCR data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Insert patients into the victims table
    const hospital_id = upload.hospital_id;
    const event_id = upload.event_id;
    
    for (const patient of simulatedPatients) {
      const { error: insertError } = await supabase
        .from('victims')
        .insert({
          full_name: patient.full_name,
          status: patient.status,
          hospital_id: hospital_id,
          event_id: event_id,
          additional_info: patient.additional_info
        });
        
      if (insertError) {
        console.error('Error inserting patient:', insertError);
        // Continue with other patients even if one fails
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Patient list processed successfully',
        patientsCount: simulatedPatients.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing patient list:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process patient list' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
