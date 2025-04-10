
import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle2, FileText, Loader2, X } from 'lucide-react';
import { GoogleGenAI, GoogleGenAIOptions } from '@google/genai';
import { z } from 'zod';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const SETTINGS_STORAGE_KEY = 'appSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EventSelector from '@/components/common/EventSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';

// Define an interface that extends the upload data with our new fields
interface ExtendedUpload {
  id: string;
  file_path: string;
  file_type: string;
  hospital_id: string | null;
  event_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  ocr_status: string | null;
  processed: boolean | null;
  processing_results: { status?: string; count?: number } | null;
  ocr_data: Record<string, unknown> | null;
}

// Define patient schema
const PatientSchema = z.object({
  full_name: z.string().min(1),
  status: z.enum(['stable', 'critical', 'unknown']),
  additional_info: z.object({
    age: z.number().int().min(0).max(130).nullable().optional(),
  }).optional(),
});

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'uploading' | 'saving' | 'complete' | 'error'>('idle');
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [extractedPatients, setExtractedPatients] = useState<z.infer<typeof PatientSchema>[]>([]);
  const [showDataDialog, setShowDataDialog] = useState(false);
  
  const { toast } = useToast();
  const { t } = useI18n();
  const { hospitals, currentEvent } = useAppContext();

  const [aiSettings, setAiSettings] = useState<{
    aiProvider: string;
    aiModel: string;
    apiKey: string;
  } | null>(null);

  // Load AI settings from localStorage
  useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);
        setAiSettings({
          aiProvider: settings.aiProvider,
          aiModel: settings.aiModel,
          apiKey: settings.apiKey
        });
      } catch (error) {
        console.error('Failed to parse AI settings:', error);
      }
    }
  }, []);

  const extractPatientData = async (file: File) => {
    try {
      const apiKey = aiSettings?.apiKey;
      if (!apiKey) {
        throw new Error('API key not configured in settings');
      }
      if (!aiSettings.aiModel) {
        throw new Error('Missing AI provider');
      }
      if (aiSettings.aiProvider !== 'Google') {
        throw new Error('Only Google provider is currently supported');
      }

      // --- File Processing & GenAI ---
      // Define patient schema with Zod
      const PatientSchema = z.object({
        full_name: z.string().min(1).describe("Patient's full name"),
        status: z.enum(['stable', 'critical', 'unknown']).describe("Patient's condition"),
        additional_info: z.object({
            age: z.number().int().min(0).max(130).nullable().optional().describe("Patient's age (optional)"),
            // Allow any other additional fields
        }).catchall(z.unknown()).optional().describe("Optional additional patient info")
      }).describe("Schema for a single patient");

      const PatientsArraySchema = z.array(PatientSchema).describe("Array of patients");


      // Initialize Google GenAI
      const genai = new GoogleGenAI({ apiKey });

      // Process image data
      const fileBuffer = await file.arrayBuffer();
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
            "status": "string (must be 'stable', 'critical', or 'unknown')", // if there's nothing use 'unknown'
            "additional_info": {
              "age": number (integer age, or null if not found/readable),
              ...(other info)
            }
          },
          ...
        ]
        If no patients are found or the document is unreadable, return an empty array [].
        Do not include any explanatory text, markdown formatting, or anything other than the JSON array itself.
      `;

      console.log(`Making GenAI request`, {
          mimeType,
          promptLength: prompt.length,
          base64DataLength: base64Data.length,
          model: aiSettings.aiModel
      });

      // --- GenAI Call ---
      const result = await genai.models.generateContent({
          model: aiSettings.aiModel,
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

      let response;
      console.log(`Received GenAI response:`, response);
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

      let patientsData: z.infer<typeof PatientsArraySchema>;
      try {
        console.log('Attempting to parse GenAI response...');
        let jsonString = responseText;

        // Clean potential markdown formatting
        const jsonMatch = responseText.match(/```(?:json)?([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1].trim();
          console.log('Extracted JSON from markdown block.');
        } else {
          // Fallback: Try to find the start of the JSON array directly
          const arrayStart = jsonString.indexOf('[');
          const arrayEnd = jsonString.lastIndexOf(']');
          if (arrayStart !== -1 && arrayEnd !== -1) {
            jsonString = jsonString.substring(arrayStart, arrayEnd + 1);
            console.log('Extracted JSON array directly.');
          } else {
            throw new Error("Could not find valid JSON array in the response.");
          }
        }

        if (!jsonString) {
             throw new Error("Extracted JSON string is empty after cleaning.");
        }

        console.log('Cleaned JSON string (first 200 chars):', jsonString.slice(0, 200));
        const rawPatients = JSON.parse(jsonString);
        console.log(`Parsed ${rawPatients.length} raw patient objects.`);

        const validationResult = PatientsArraySchema.safeParse(rawPatients);

        if (!validationResult.success) {
          console.error(`Zod validation failed:`, validationResult.error.errors);
          // Log the problematic raw data (truncated) for debugging
          console.error("Raw data (truncated):", JSON.stringify(rawPatients).slice(0, 500));
          throw new Error(`Invalid patient data structure received from AI: ${validationResult.error.message}`);
        }
        patientsData = validationResult.data;
        console.log(`Successfully parsed and validated ${patientsData.length} patients`);

      } catch (parseError) {
        console.error(`Error parsing/validating GenAI response`, {
          errorMessage: parseError instanceof Error ? parseError.message : String(parseError),
          responseSnippet: responseText.slice(0, 500) + (responseText.length > 500 ? '...' : ''), // Log more for debugging parsing
        });
        // Throw a specific error for the inner catch
        throw new Error(`Failed to parse/validate patient data from document: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
      
      const patients = z.array(PatientSchema).parse(patientsData);
      return patients;
    } catch (error) {
      console.error('Extraction error:', error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setUploadComplete(false);
      setProcessingStatus('idle');
    }
  };

  const handleExtraction = async () => {
    setIsUploading(true);
    setProcessingStatus('processing');
    try {
      const patients = await extractPatientData(selectedFile);
      setExtractedPatients(patients);
      setShowDataDialog(true);
      setIsUploading(false);
    } catch (error) {
      setIsUploading(false);
      setProcessingStatus('error');
      toast({
        title: 'Extraction failed',
        description: 'Could not extract patient data from image',
        variant: "destructive"
      });
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedHospital || !currentEvent || !extractedPatients.length) {
      toast({
        title: t('uploadPage.errors.missingInfo'),
        description: t('uploadPage.errors.missingInfoDescription'),
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setProcessingStatus('uploading');
    
    try {
      // Generate unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${uuidv4()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('patient_lists')
        .upload(filePath, selectedFile);
        
      if (storageError) {
        throw new Error(`Storage error: ${storageError.message}`);
      }
      
      // Create record in uploads table
      setProcessingStatus('saving');
      const { data: uploadData, error: uploadError } = await supabase
        .from('uploads') 
        .insert({
          file_path: filePath,
          file_type: selectedFile.type,
          hospital_id: selectedHospital,
          event_id: currentEvent.id,
          processed: true,
          ocr_status: 'completed',
          ocr_data: { patients: extractedPatients },
          processing_results: {
            status: 'success',
            extracted_count: extractedPatients.length,
            inserted_count: extractedPatients.length,
          }
        })
        .select()
        .single();
        
      if (uploadError) {
        setProcessingStatus('error');
        throw new Error(`Upload record error: ${uploadError.message}`);
      }

      // Insert patients into victims table
      for (const patient of extractedPatients) {
        await supabase
          .from('victims')
          .insert({
            full_name: patient.full_name,
            status: patient.status,
            hospital_id: selectedHospital,
            event_id: currentEvent.id,
            additional_info: patient.additional_info,
            upload_id: uploadData.id
          });
      }
      
      setUploadComplete(true);
      setUploadedFileId(uploadData.id);
      setIsUploading(false);
      
      toast({
        title: t('uploadPage.errors.uploadSuccess'),
        description: `${extractedPatients.length} patient records were extracted and added to the database.`,
      });
      
      setProcessingStatus('complete');
      
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setProcessingStatus('error');
      setUploadComplete(true);
      toast({
        title: t('uploadPage.errors.uploadFailed'),
        description: error instanceof Error ? error.message : t('uploadPage.errors.uploadFailedDescription'),
        variant: "destructive"
      });
    }
  };
  
  const pollProcessingStatus = async (uploadId: string) => {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('id', uploadId)
        .single();
        
      if (error) {
        throw error;
      }
      
      // Type assertion to work with our extended fields
      const uploadData = data as unknown as ExtendedUpload;
      
      if (uploadData.ocr_status === 'completed' && uploadData.processed) {
        setProcessingStatus('complete');
        toast({
          title: "Processing complete",
          description: `${uploadData.processing_results?.count || 0} patient records were extracted and added to the database.`,
        });
      } else if (uploadData.ocr_status === 'error') {
        setProcessingStatus('error');
        toast({
          title: "Processing failed",
          description: "There was an error processing the patient list.",
          variant: "destructive"
        });
      } else {
        // Continue polling
        setTimeout(() => pollProcessingStatus(uploadId), 3000);
      }
    } catch (error) {
      console.error('Polling error:', error);
      setProcessingStatus('error');
    }
  };

  const handleConfirmData = () => {
    setShowDataDialog(false);
    handleUpload();
  };

  return (
    <DashboardLayout>
      {/* Data Preview Dialog */}
      <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Extracted Patient Data</h2>
            <button onClick={() => setShowDataDialog(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="border rounded-md p-4 overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Status</th>
                  {extractedPatients.flatMap(p => 
                    p.additional_info ? Object.keys(p.additional_info) : []
                  )
                  .filter((value, index, self) => self.indexOf(value) === index)
                  .map(key => (
                    <th key={key} className="text-left p-2 capitalize">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {extractedPatients.map((patient, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <input
                        type="text"
                        value={patient.full_name}
                        onChange={(e) => {
                          const updated = [...extractedPatients];
                          updated[index].full_name = e.target.value;
                          setExtractedPatients(updated);
                        }}
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={patient.status}
                        onChange={(e) => {
                          const updated = [...extractedPatients];
                          updated[index].status = e.target.value as 'stable' | 'critical' | 'unknown';
                          setExtractedPatients(updated);
                        }}
                        className="bg-transparent border-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="stable">Stable</option>
                        <option value="critical">Critical</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </td>
                    {patient.additional_info && Object.entries(patient.additional_info).map(([key, value]) => (
                      <td key={key} className="p-2">
                        <input
                          type={typeof value === 'number' ? 'number' : 'text'}
                          value={value || ''}
                          onChange={(e) => {
                            const updated = [...extractedPatients];
                            if (!updated[index].additional_info) {
                              updated[index].additional_info = {};
                            }
                            updated[index].additional_info[key] = 
                              typeof value === 'number' ? parseInt(e.target.value) : e.target.value;
                            setExtractedPatients(updated);
                          }}
                          className="w-full bg-transparent border-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDataDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmData}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : 'Confirm & Upload'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('uploadPage.title')}</h1>
          <p className="text-gray-500 mt-1">
            {t('uploadPage.description')}
          </p>
        </div>
        
        <EventSelector />
        
        <Card>
          <CardHeader>
            <CardTitle>{t('uploadPage.uploadCard.title')}</CardTitle>
            <CardDescription>
              {t('uploadPage.uploadCard.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="hospital">{t('uploadPage.uploadCard.hospitalSelect')}</Label>
                  <Select 
                    value={selectedHospital || ""} 
                    onValueChange={setSelectedHospital}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('uploadPage.uploadCard.hospitalPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map(hospital => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="picture">{t('uploadPage.uploadCard.fileInput')}</Label>
                  <input
                    id="picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div 
                    onClick={() => document.getElementById('picture')?.click()}
                    className={`border-2 border-dashed rounded-md p-6 cursor-pointer text-center transition-colors
                      ${selectedFile ? 'border-primary/40 bg-primary/5' : 'border-gray-300 hover:border-primary/30 hover:bg-gray-50'}
                    `}
                  >
                    {previewUrl ? (
                      <div className="space-y-3">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-h-[200px] mx-auto object-contain rounded-md"
                        />
                        <p className="text-sm text-gray-500">{selectedFile?.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div>
                        <p className="text-sm font-medium">{t('uploadPage.uploadCard.filePrompt')}</p>
                        <p className="text-xs text-gray-500">{t('uploadPage.uploadCard.fileTypes')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {uploadComplete && processingStatus === 'processing' && (
                <Alert variant="default" className="bg-blue-50 border-blue-200">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <AlertTitle>{t('uploadPage.uploadCard.processing.title')}</AlertTitle>
                  <AlertDescription>
                    {t('uploadPage.uploadCard.processing.description')}
                  </AlertDescription>
                </Alert>
              )}
              
              {processingStatus === 'complete' && (
                <Alert variant="default" className="bg-success/20 border-success/40">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertTitle>{t('uploadPage.uploadCard.complete.title')}</AlertTitle>
                  <AlertDescription>
                    {t('uploadPage.uploadCard.complete.description')}
                  </AlertDescription>
                </Alert>
              )}
              
              {processingStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t('uploadPage.uploadCard.error.title')}</AlertTitle>
                  <AlertDescription>
                    {t('uploadPage.uploadCard.error.description')}
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <FileText className="h-4 w-4 text-amber-600" />
                <AlertTitle>{t('uploadPage.uploadCard.info.title')}</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>{t('uploadPage.uploadCard.info.point1')}</li>
                    <li>{t('uploadPage.uploadCard.info.point2')}</li>
                    <li>{t('uploadPage.uploadCard.info.point3')}</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleExtraction} 
                  disabled={!selectedFile || isUploading || !selectedHospital || processingStatus === 'processing' || processingStatus === 'complete'}
                  className="ml-auto"
                >
                  {processingStatus === 'uploading' ? t('uploadPage.uploadCard.uploadButton.uploading') : 
                   processingStatus === 'saving' ? t('uploadPage.uploadCard.uploadButton.saving') : 
                   processingStatus === 'processing' ? t('uploadPage.uploadCard.uploadButton.processing') : 
                   processingStatus === 'complete' ? t('uploadPage.uploadCard.uploadButton.complete') : 
                   t('uploadPage.uploadCard.uploadButton.default')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UploadPage;
