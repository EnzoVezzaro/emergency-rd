
import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
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

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { t } = useI18n();
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
        title: t('uploadPage.errors.missingInfo'),
        description: t('uploadPage.errors.missingInfoDescription'),
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
        title: t('uploadPage.errors.uploadSuccess'),
        description: t('uploadPage.errors.uploadSuccessDescription'),
      });
      
      // Start OCR processing
      setProcessingStatus('processing');
      console.log('here: ');
      const { error: processError } = await supabase.functions.invoke('process-patient-list', {
        body: { uploadId: uploadData.id }
      });

      console.log('here: 2');
      
      if (processError) {
        setIsUploading(false);
        throw new Error(`Processing error: ${processError.message}`);
      }
      
      // Poll for processing status
      pollProcessingStatus(uploadData.id);
      
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

  return (
    <DashboardLayout>
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
                  onClick={handleUpload} 
                  disabled={!selectedFile || isUploading || !selectedHospital || processingStatus === 'processing' || processingStatus === 'complete'}
                  className="ml-auto"
                >
                  {isUploading ? t('uploadPage.uploadCard.uploadButton.uploading') : 
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
