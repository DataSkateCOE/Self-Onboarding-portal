import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SecurityFormData, securitySchema } from "@shared/schema";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  storageUrl?: string;
  userId: number;
}

interface SecurityFormProps {
  formData: SecurityFormData;
  onUpdate: (data: SecurityFormData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const SecurityForm = ({ formData, onUpdate, onNext, onPrevious }: SecurityFormProps) => {
  const form = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: formData,
  });
  
  const [selectedCertificateId, setSelectedCertificateId] = useState<string>("");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  
  // Fetch certificates from the API
  const { data: certificates, isLoading: certificatesLoading } = useQuery<Certificate[]>({
    queryKey: ['/api/certificates'],
  });
  
  useEffect(() => {
    if (formData.selectedCertificateId) {
      setSelectedCertificateId(formData.selectedCertificateId);
    }
    if (formData.selectedCertificate) {
      setSelectedCertificate(formData.selectedCertificate);
    }
  }, [formData.selectedCertificateId, formData.selectedCertificate]);
  
  const handleCertificateSelect = (certificateId: string) => {
    setSelectedCertificateId(certificateId);
    
    if (certificateId && certificates) {
      const cert = certificates.find(cert => cert.id.toString() === certificateId);
      if (cert) {
        setSelectedCertificate(cert);
        // Store the selected certificate in the form data
        onUpdate({ 
          selectedCertificateId: certificateId,
          selectedCertificate: cert 
        });
        // Update react-hook-form state
        form.setValue("selectedCertificateId", certificateId, { shouldValidate: true, shouldDirty: true });
        form.setValue("selectedCertificate", cert, { shouldValidate: true, shouldDirty: true });
      }
    }
  };
  
  const onSubmit = () => {
    // Pass the selected certificate to the next step
    onNext();
  };
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 mb-4">Security Certificates</h3>
      <p className="text-sm text-gray-600 mb-6">Select a certificate for secure data exchange.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="selectCertificate">Select Certificate</Label>
                <Select value={selectedCertificateId} onValueChange={handleCertificateSelect}>
                  <SelectTrigger id="selectCertificate" className="w-full">
                    <SelectValue placeholder="Select a certificate" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificatesLoading ? (
                      <div className="p-2 text-center">Loading certificates...</div>
                    ) : certificates && certificates.length > 0 ? (
                      certificates.map(cert => (
                        <SelectItem key={cert.id} value={cert.id.toString()}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{cert.alias || cert.fileName}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center">No certificates found</div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Choose a certificate from the dropdown to continue.
                </p>
              </div>
            </div>
            
            {selectedCertificate && (
              <Alert className="bg-green-50 border-green-200 text-green-800 mt-4">
                <Check className="h-4 w-4 mr-2" />
                <AlertDescription>
                  Certificate selected: <strong>{selectedCertificate.alias || selectedCertificate.fileName}</strong>
                  {selectedCertificate.storageUrl && (
                    <div className="mt-2">
                      <a 
                        href={selectedCertificate.storageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark underline text-xs flex items-center"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View Certificate
                      </a>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Previous
            </Button>
            <Button type="submit" disabled={!selectedCertificateId}>
              Next Step
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SecurityForm;
