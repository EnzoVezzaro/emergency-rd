import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenAI } from "npm:@google/genai";
import { z } from "npm:zod";
// Import Buffer for base64 handling if not implicitly available in Deno environment
// If running in Node compat mode or similar, it might be available.
// Otherwise, you might need a Deno standard library equivalent if direct Buffer isn't working.
// Let's assume Buffer is available for now, as used in the original code.
// If not, use Deno's std/encoding/base64:
// import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
// import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let uploadId: string | undefined = undefined; // Define uploadId outside the try block to be accessible in the outer catch

  try {
    // Validate request body
    const requestBody = await req.json();
    if (!requestBody.uploadId || typeof requestBody.uploadId !== 'string') { // Added type check
      return new Response(
        JSON.stringify({ error: 'Missing or invalid required field: uploadId (string)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    uploadId = requestBody.uploadId; // Assign uploadId here

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY'); // Get API key once

    if (!supabaseUrl || !supabaseServiceKey || !googleApiKey) { // Check Google API Key too
      console.error('Missing required environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_API_KEY)');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey); // Removed db: { schema: 'public' } as it's default

    // --- Start Inner Processing Block ---
    try {
      // Get upload details
      const { data: upload, error: uploadError } = await supabase
        .from('uploads')
        .select('id, file_path, hospital_id, event_id') // Select only needed fields
        .eq('id', uploadId)
        .single();

      if (uploadError) {
        // Throw a more specific error to be caught by the inner catch
        throw new Error(`Failed to fetch upload details: ${uploadError.message}`);
      }

      if (!upload) {
        // Throw a specific error
        throw new Error(`Upload not found: ${uploadId}`);
      }

      // Get file from storage
      const { data: fileBlob, error: fileError } = await supabase // Changed variable name to avoid conflict
        .storage
        .from('patient_lists')
        .download(upload.file_path);

      if (fileError || !fileBlob) {
         // Throw a specific error
        throw new Error(`Failed to download file (${upload.file_path}): ${fileError?.message ?? 'Blob is null'}`);
      }

      // --- File Processing & GenAI ---
      // Define patient schema with Zod
      const PatientSchema = z.object({
        full_name: z.string().min(1).describe("Patient's full name"), // Min 1 char might be more realistic
        status: z.enum(['stable', 'critical', 'unknown']).describe("Patient's condition"),
        additional_info: z.object({
            // Allow age to be null or number, handle potential extraction failures
            age: z.number().int().min(0).max(130).nullable().optional().describe("Patient's age (optional)")
        }).strict().optional().describe("Optional additional patient info")
      }).describe("Schema for a single patient");

      const PatientsArraySchema = z.array(PatientSchema).describe("Array of patients");


      // Initialize Google GenAI
      const genai = new GoogleGenAI(googleApiKey); // Use variable

      // Process image data
      const fileBuffer = await fileBlob.arrayBuffer();
      const uint8Array = new Uint8Array(fileBuffer);

      // Convert Uint8Array to Base64 - More robust method
      let base64String = '';
      const CHUNK_SIZE = 0x8000; // Process in chunks to avoid potential memory issues with large files
      for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
          base64String += String.fromCharCode.apply(null, Array.from(uint8Array.subarray(i, i + CHUNK_SIZE)));
      }
      const base64Data = btoa(base64String);

      // Determine MIME type (assuming common image types)
      // This basic check might need improvement based on actual file types
      let mimeType = 'image/png'; // Default
      const fileHeader = uint8Array.subarray(0, 4);
      const headerString = Array.from(fileHeader).map(byte => byte.toString(16).padStart(2, '0')).join('');
      if (headerString.startsWith('ffd8ff')) mimeType = 'image/jpeg';
      else if (headerString.startsWith('89504e47')) mimeType = 'image/png';
      else if (headerString.startsWith('47494638')) mimeType = 'image/gif';
      else if (headerString.startsWith('52494646') && uint8Array.length > 11 && String.fromCharCode(...uint8Array.subarray(8, 12)) === 'WEBP') mimeType = 'image/webp';
      // Add more checks if needed (e.g., PDF, TIFF) - GenAI supports various types
      // else {
      //   console.warn(`Could not determine MIME type for header: ${headerString}. Defaulting to ${mimeType}`);
      // }

      const prompt = `
        Extract patient information precisely from the provided hospital document image.
        Return ONLY a valid JSON array conforming to this structure:
        [
          {
            "full_name": "string (patient's full name)",
            "status": "string (must be 'stable', 'critical', or 'unknown')",
            "additional_info": {
              "age": number (integer age, or null if not found/readable)
            }
          },
          ...
        ]
        If no patients are found or the document is unreadable, return an empty array [].
        Do not include any explanatory text, markdown formatting, or anything other than the JSON array itself.
      `;

      console.log(`Making GenAI request for uploadId: ${uploadId}`, {
          mimeType,
          promptLength: prompt.length,
          base64DataLength: base64Data.length,
          model: "gemini-pro-vision" // Use the standard vision model unless specifically needing experimental features
      });

       // Update upload status to processing BEFORE calling GenAI
       // This gives better feedback if the GenAI call takes time or fails
      const { error: updateProcessingError } = await supabase
        .from('uploads')
        .update({ ocr_status: 'processing', processed: false, updated_at: new Date() }) // Add updated_at
        .eq('id', uploadId);

      if (updateProcessingError) {
          console.warn(`Failed to update upload status to 'processing' for ${uploadId}: ${updateProcessingError.message}`);
          // Decide if this is critical - maybe just log and continue?
      }


      // --- GenAI Call ---
      const result = await genai.models.generateContent({
          model: "gemini-2.0-flash-exp-image-generation",
          config: {
            responseModalities: ["Text", "Image"],
          },
          contents: [
            { text: `${prompt}` },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ]
        });

      let response;
      if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
        for (const part of result.candidates[0].content.parts) {
          // This must be a json based on the prompt above
          if (part.text) {
            // console.log(part.text);
            response += part.text
          }
        }
      }
      const responseText = response;

      console.log(`Received GenAI response for uploadId: ${uploadId}`, {
          responseTextLength: responseText.length,
          // Be cautious logging potentially large/sensitive responseText directly
          responseTextSnippet: responseText.slice(0, 200) + (responseText.length > 200 ? '...' : '')
      });


      // --- Parse and Validate Response ---
      let patientsData: z.infer<typeof PatientsArraySchema>;
      try {
        // Clean potential markdown/text around JSON
        const jsonMatch = responseText.match(/```(?:json)?([\s\S]*?)```|(\[[\s\S]*\])/);
        if (!jsonMatch) {
            throw new Error("No JSON array found in the response.");
        }
        // Prioritize fenced code block content, fallback to array match
        const jsonString = jsonMatch[1] || jsonMatch[2];

        if (!jsonString) {
             throw new Error("Extracted JSON string is empty.");
        }

        const rawPatients = JSON.parse(jsonString.trim());
        const validationResult = PatientsArraySchema.safeParse(rawPatients);

        if (!validationResult.success) {
          console.error(`Zod validation failed for uploadId: ${uploadId}`, validationResult.error.errors);
          // Log the problematic raw data (truncated) for debugging
          console.error("Raw data (truncated):", JSON.stringify(rawPatients).slice(0, 500));
          throw new Error(`Invalid patient data structure received from AI: ${validationResult.error.message}`);
        }
        patientsData = validationResult.data;
        console.log(`Successfully parsed and validated ${patientsData.length} patients for uploadId: ${uploadId}`);

      } catch (parseError) {
        console.error(`Error parsing/validating GenAI response for uploadId: ${uploadId}`, {
          errorMessage: parseError instanceof Error ? parseError.message : String(parseError),
          responseSnippet: responseText.slice(0, 500) + (responseText.length > 500 ? '...' : ''), // Log more for debugging parsing
        });
        // Throw a specific error for the inner catch
        throw new Error(`Failed to parse/validate patient data from document: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }


      // --- Database Operations ---
      let insertedCount = 0;
      const insertErrors: { index: number; name: string | undefined, error: string }[] = [];

      console.log(`Attempting to insert ${patientsData.length} patients for uploadId: ${uploadId}...`);

      // Use Promise.all for potentially faster inserts (if order doesn't strictly matter and DB can handle concurrent requests)
      // Or keep sequential loop for simpler error handling and less DB load. Let's stick with sequential for now.
      for (const [index, patient] of patientsData.entries()) {
         const { error: insertError } = await supabase
            .from('victims') // Ensure table name is correct
            .insert({
                full_name: patient.full_name,
                status: patient.status,
                hospital_id: upload.hospital_id,
                event_id: upload.event_id,
                additional_info: patient.additional_info, // Already includes age potentially null
                upload_id: upload.id // Link back to the upload for traceability
            });

          if (insertError) {
              console.error(`Error inserting patient ${index + 1}/${patientsData.length} (Name: ${patient.full_name}) for upload ${uploadId}:`, insertError.message);
              insertErrors.push({ index, name: patient.full_name, error: insertError.message });
          } else {
              insertedCount++;
          }
      }

       console.log(`Finished inserting patients for uploadId: ${uploadId}. Success: ${insertedCount}/${patientsData.length}`);


      // --- Finalize Upload Record ---
      const finalStatus = insertedCount > 0 ? 'completed' : (patientsData.length > 0 ? 'failed' : 'completed'); // Completed even if 0 found/inserted ok
      const processingSuccess = insertedCount === patientsData.length;

      const { error: finalizeError } = await supabase
        .from('uploads')
        .update({
          ocr_status: finalStatus,
          // Avoid storing large raw data back into the upload row if possible
          // Storing counts/status is usually sufficient
          // ocr_data: { patients: patientsData }, // Consider if storing the full extracted data here is necessary
          processed: true,
          processing_results: {
            status: processingSuccess ? 'success' : 'partial_failure', // More descriptive status
            extracted_count: patientsData.length,
            inserted_count: insertedCount,
            errors: insertErrors, // Store specific insert errors if needed
          },
          processed_at: new Date().toISOString(), // Add timestamp for completion
          updated_at: new Date().toISOString()
        })
        .eq('id', uploadId);

      if (finalizeError) {
        // This is problematic, log it prominently
        console.error(`CRITICAL: Failed to finalize upload record ${uploadId} after processing:`, finalizeError.message);
        // Don't throw here, as we want to return success to the client if processing mostly worked
        // But the upload record might be in an inconsistent state
      }

      // --- Success Response ---
      return new Response(
        JSON.stringify({
          success: true,
          message: `Patient list processed. Extracted: ${patientsData.length}, Inserted: ${insertedCount}.`,
          uploadId: uploadId,
          results: {
             extractedCount: patientsData.length,
             insertedCount: insertedCount,
             // Optionally return first few patients or errors for quick check
             // patientsPreview: patientsData.slice(0, 3),
             insertErrors: insertErrors
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 } // OK status
      );

    // --- Inner Catch Block ---
    // Catch errors specific to the processing pipeline (after initial setup)
    } catch (innerError) {
      const errorTimestamp = new Date().toISOString();
      const errorMessage = innerError instanceof Error ? innerError.message : String(innerError);
      const errorStack = innerError instanceof Error ? innerError.stack : undefined;

      console.error(`Error in processing pipeline for uploadId: ${uploadId}`, {
        errorMessage: errorMessage,
        // errorStack: errorStack, // Stack can be very long, log conditionally or trim if needed
        uploadId: uploadId, // Use the captured uploadId
        timestamp: errorTimestamp
      });

       // Attempt to update the upload status to 'failed'
       if (uploadId) { // Only if we have an uploadId
            const { error: updateErrorStatusError } = await supabase
                .from('uploads')
                .update({
                    ocr_status: 'failed',
                    processed: true, // Mark as processed (even though it failed)
                    processing_results: {
                        status: 'pipeline_error',
                        error: errorMessage, // Store the error message
                    },
                    processed_at: errorTimestamp,
                    updated_at: errorTimestamp
                })
                .eq('id', uploadId);

            if (updateErrorStatusError) {
                console.error(`Failed to update upload ${uploadId} status to 'failed':`, updateErrorStatusError.message);
            }
       }

       // Re-throw the error to be caught by the outer catch, which sends the HTTP response
      throw innerError;
    }

    // --- Outer Catch Block ---
    } catch (error) {
      const errorTimestamp = new Date().toISOString();
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error('ERROR PROCESSING REQUEST:', {
        uploadId: uploadId || 'unknown',
        error: cleanErrorForLogging(error),
        timestamp: errorTimestamp,
        requestBody: requestBody ? sanitizeForLogging(requestBody) : null
      });

      let httpStatus = 500;
      let errorDetails = errorMessage;

      // Handle specific error types
      if (error instanceof z.ZodError) {
        httpStatus = 400;
        errorDetails = 'Invalid data format: ' + error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      } else if (errorMessage.includes('not found')) {
        httpStatus = 404;
      } else if (errorMessage.includes('permission denied')) {
        httpStatus = 403;
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: httpStatus === 500 ? 'Server error' : httpStatus === 404 ? 'Resource not found' : 'Invalid request',
          details: errorDetails,
          errorId: generateErrorId() // Helps track specific errors
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: httpStatus
        }
      );
  }
});
