import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Upload, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Certificate {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  uploadedAt: string | Date;
  alias?: string;
  description?: string;
  storagePath: string;
  userId: number;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(date: string | Date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const MyCerts = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [alias, setAlias] = useState("");
  const [description, setDescription] = useState("");
  const [documentType, setDocumentType] = useState("certificate"); // Default to certificate
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get certificates from API
  const { data: certificates, isLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
  });
  
  // Delete certificate mutation
  const deleteCertMutation = useMutation({
    mutationFn: async (certId: number) => {
      const response = await fetch(`/api/certificates/${certId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete certificate");
      }
      
      return certId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      toast({
        title: "Certificate Deleted",
        description: "The certificate has been deleted successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete certificate: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (!alias) {
      toast({
        title: "Error",
        description: "Please provide an alias name for the certificate",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("documentType", documentType);
      formData.append("alias", alias);
      formData.append("description", description);
      
      // In a real application, get the userId from the auth context
      const userId = 1; // Default to admin user for testing
      formData.append("userId", userId.toString());
      
      const response = await fetch("/api/certificates", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload certificate");
      }
      
      // Reset form
      setSelectedFile(null);
      setAlias("");
      setDescription("");
      setDocumentType("certificate");
      
      // Refresh certificates list
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      
      toast({
        title: "Success",
        description: "Certificate uploaded successfully",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to upload certificate: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDeleteCertificate = (certId: number) => {
    if (window.confirm("Are you sure you want to delete this certificate?")) {
      deleteCertMutation.mutate(certId);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Security Certificates</h1>
        <Button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-red-600 hover:bg-red-700"
        >
          {showUploadForm ? 'Hide Upload Form' : 'Upload New Certificate'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload new certificate card - conditionally rendered */}
        {showUploadForm && (
          <Card>
            <CardHeader>
              <CardTitle>Upload New Certificate</CardTitle>
              <CardDescription>
                Upload a new security certificate or key file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Certificate Type</Label>
                  <select 
                    id="documentType"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="certificate">Certificate</option>
                    <option value="key">Private Key</option>
                    <option value="ca">CA Certificate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alias">Alias Name *</Label>
                  <Input
                    id="alias"
                    placeholder="Provide a recognizable name for this certificate"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">This name will help you identify the certificate when selecting it later</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter a description for this certificate"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certificate">Certificate File</Label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {selectedFile ? (
                          <div className="text-center">
                            <CheckCircle className="w-8 h-8 mb-2 text-green-500" />
                            <p className="font-semibold">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatBytes(selectedFile.size)}
                            </p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PEM, PFX, CRT, KEY (MAX. 10MB)
                            </p>
                          </>
                        )}
                      </div>
                      <Input
                        id="certificate"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pem,.pfx,.crt,.key,.cer,.der"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleUpload} 
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Certificate"}
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Certificates list - expanded to full width when upload form is hidden */}
        <div className={showUploadForm ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Certificates</h2>
            {!showUploadForm && certificates && certificates.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowUploadForm(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Add Certificate
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-10">Loading certificates...</div>
          ) : !certificates || certificates.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <Shield className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No certificates found</p>
              <p className="text-gray-400 text-sm mb-4">Upload a certificate to get started</p>
              {!showUploadForm && (
                <Button 
                  onClick={() => setShowUploadForm(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Upload New Certificate
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <Card key={cert.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base truncate" title={cert.fileName}>
                          {cert.alias || cert.fileName}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {cert.fileName} • {formatBytes(cert.fileSize)} • Uploaded {formatDate(cert.uploadedAt)}
                        </CardDescription>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteCertificate(cert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {cert.documentType}
                      </span>
                    </div>
                    {cert.description && (
                      <p className="text-sm text-gray-600 mt-2">{cert.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCerts;