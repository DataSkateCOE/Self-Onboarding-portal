import { useState, FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileCheck, FileX, Loader2 } from "lucide-react";

const CertificateUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [alias, setAlias] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a certificate file to upload",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create FormData for the file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "certificate");
      
      if (alias) {
        formData.append("alias", alias);
      }
      
      if (description) {
        formData.append("description", description);
      }
      
      // Upload the certificate
      const response = await fetch("/api/certificates", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload certificate");
      }
      
      // Show success toast
      toast({
        title: "Certificate uploaded",
        description: "Your certificate has been uploaded successfully",
        variant: "default",
      });
      
      // Clear form
      setFile(null);
      setAlias("");
      setDescription("");
      
      // Reset file input
      const fileInput = document.getElementById("certificate-file") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
      
      // Invalidate certificates query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload certificate",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Upload Certificate</CardTitle>
        <CardDescription>
          Upload a new security certificate for partner onboarding
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificate-file">Certificate File</Label>
            <Input 
              id="certificate-file" 
              type="file" 
              onChange={handleFileChange}
              accept=".pem,.cert,.crt,.key,.p12,.pfx"
              required
            />
            <p className="text-xs text-muted-foreground">
              Accepted formats: .pem, .cert, .crt, .key, .p12, .pfx
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alias">Certificate Alias (Optional)</Label>
            <Input 
              id="alias" 
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Friendly name for this certificate"
            />
            <p className="text-xs text-muted-foreground">
              A descriptive name to easily identify this certificate
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this certificate"
              rows={3}
            />
          </div>
          
          {file && (
            <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
              <FileCheck className="h-4 w-4 text-green-600" />
              <span>{file.name}</span>
              <span className="text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!file || isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Certificate
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CertificateUploadForm;