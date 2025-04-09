
import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  const { toast } = useToast();

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
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setUploadComplete(true);
      toast({
        title: "Upload successful",
        description: "Patient list has been processed and updated.",
      });
    }, 2000);
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
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">Upload image</Label>
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
              
              {uploadComplete && (
                <Alert variant="default" className="bg-success/20 border-success/40">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertTitle>Processing complete</AlertTitle>
                  <AlertDescription>
                    The patient list was successfully processed. 5 patient records were updated.
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Make sure the document clearly shows patient names and relevant information.
                  The AI processes best when text is clearly legible.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isUploading || uploadComplete}
                  className="ml-auto"
                >
                  {isUploading ? "Processing..." : uploadComplete ? "Uploaded" : "Upload & Process"}
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
