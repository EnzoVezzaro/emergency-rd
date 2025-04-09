
import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { hospitals, currentEvent } = useAppContext();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleUpload = async () => {
    if (!selectedFile || !selectedHospital || !currentEvent) {
      toast({
        title: "Missing information",
        description: "Please select a hospital and make sure an event is selected before uploading.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
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
      const { data: uploadData, error: uploadError } = await supabase
        .from('uploads')
        .insert({
          file_path: filePath,
          file_type: selectedFile.type,
          hospital_id: selectedHospital,
          event_id: currentEvent.id,
          processed: false,
        })
        .select()
        .single();
        
      if (uploadError) {
        throw new Error(`Upload record error: ${uploadError.message}`);
      }
      
      setUploadComplete(true);
      setUploadedFileId(uploadData.id);
      setIsUploading(false);
      
      toast({
        title: "Upload successful",
        description: "Patient list has been uploaded and will be processed.",
      });
      
      // Start OCR processing
      setProcessingStatus('processing');
      const { error: processError } = await supabase.functions.invoke('process-patient-list', {
        body: { uploadId: uploadData.id }
      });
      
      if (processError) {
        throw new Error(`Processing error: ${processError.message}`);
      }
      
      // Poll for processing status
      pollProcessingStatus(uploadData.id);
      
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const pollProcessingStatus = async (uploadId: string) => {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('processed, processing_results, ocr_status')
        .eq('id', uploadId)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data.ocr_status === 'completed' && data.processed) {
        setProcessingStatus('complete');
        toast({
          title: "Processing complete",
          description: `${data.processing_results?.count || 0} patient records were extracted and added to the database.`,
        });
      } else if (data.ocr_status === 'error') {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Patient Lists</h1>
          <p className="text-gray-500 mt-1">
            Upload images or documents of patient lists to be processed by AI
          </p>
        </div>
        
        <EventSelector />
        
        <Card>
          <CardHeader>
            <CardTitle>Upload Patient List</CardTitle>
            <CardDescription>
              Upload images of handwritten or typed patient lists.
              Our AI will extract patient information and update the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="hospital">Select Hospital</Label>
                  <Select 
                    value={selectedHospital || ""} 
                    onValueChange={setSelectedHospital}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a hospital" />
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
                  <Label htmlFor="picture">Upload patient list image</Label>
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
                          <p className="text-sm font-medium">Click to upload a file</p>
                          <p className="text-xs text-gray-500">JPG, PNG, or PDF (max 10MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {uploadComplete && processingStatus === 'processing' && (
                <Alert variant="default" className="bg-blue-50 border-blue-200">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <AlertTitle>Processing in progress</AlertTitle>
                  <AlertDescription>
                    The AI is currently extracting patient information from your uploaded document.
                    This may take a few moments.
                  </AlertDescription>
                </Alert>
              )}
              
              {processingStatus === 'complete' && (
                <Alert variant="default" className="bg-success/20 border-success/40">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertTitle>Processing complete</AlertTitle>
                  <AlertDescription>
                    The patient list was successfully processed. Patient records were updated in the database.
                  </AlertDescription>
                </Alert>
              )}
              
              {processingStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Processing failed</AlertTitle>
                  <AlertDescription>
                    There was an error processing the patient list. Please try again or contact support.
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <FileText className="h-4 w-4 text-amber-600" />
                <AlertTitle>Important Information</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Make sure the document clearly shows patient names and relevant information.</li>
                    <li>The AI processes best when text is clearly legible.</li>
                    <li>Both typed and handwritten text can be processed, but typed text yields better results.</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isUploading || !selectedHospital || processingStatus === 'processing' || processingStatus === 'complete'}
                  className="ml-auto"
                >
                  {isUploading ? "Uploading..." : 
                   processingStatus === 'processing' ? "Processing..." : 
                   processingStatus === 'complete' ? "Processed" : 
                   "Upload & Process"}
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
