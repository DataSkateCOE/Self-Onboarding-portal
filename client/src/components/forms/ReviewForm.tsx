import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReviewFormData, reviewSchema } from "@shared/schema";
import { OnboardingFormData } from "@/types";
import { CheckCircle2, FileText } from "lucide-react";

interface ReviewFormProps {
  formData: OnboardingFormData;
  onUpdate: (data: ReviewFormData) => void;
  onSubmit: () => void;
  onPrevious: () => void;
  isSubmitting: boolean;
}

const ReviewForm = ({ formData, onUpdate, onSubmit, onPrevious, isSubmitting }: ReviewFormProps) => {
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: formData.review,
  });
  
  const handleSubmit = (data: ReviewFormData) => {
    onUpdate(data);
    onSubmit();
  };
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 mb-4">Review and Submit</h3>
      <p className="text-sm text-gray-600 mb-6">Please review your information before submission.</p>
      
      <div className="space-y-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h4 className="text-base font-medium flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Company Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-sm text-gray-500">Company Name</p>
                <p className="text-sm font-medium">{formData.companyInfo.companyName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Name</p>
                <p className="text-sm font-medium">{formData.companyInfo.contactName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Email</p>
                <p className="text-sm font-medium">{formData.companyInfo.contactEmail || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Phone</p>
                <p className="text-sm font-medium">{formData.companyInfo.contactPhone || "Not provided"}</p>
              </div>
              {formData.companyInfo.address && (
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium">{formData.companyInfo.address || "Not provided"}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h4 className="text-base font-medium flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Security Certificates
            </h4>
            
            <div className="space-y-3">
              {formData.security.selectedCertificate ? (
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {formData.security.selectedCertificate.alias || formData.security.selectedCertificate.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Certificate ID: {formData.security.selectedCertificate.id}
                    </p>
                    {formData.security.selectedCertificate.storageUrl && (
                      <a 
                        href={formData.security.selectedCertificate.storageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:text-primary-dark underline mt-1 inline-flex items-center"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View Certificate
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No certificate selected</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h4 className="text-base font-medium flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Interface Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-sm text-gray-500">Protocol</p>
                <p className="text-sm font-medium">{formData.interface.protocol || "Not selected"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Authentication Type</p>
                <p className="text-sm font-medium">{formData.interface.authType || "Not selected"}</p>
              </div>
              {formData.interface.direction && (
                <div>
                  <p className="text-sm text-gray-500">Direction</p>
                  <p className="text-sm font-medium">
                    {formData.interface.direction === "send" ? "Send to Partner" : formData.interface.direction === "receive" ? "Receive from Partner" : "Not selected"}
                  </p>
                </div>
              )}
              {formData.interface.username && (
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="text-sm font-medium">{formData.interface.username}</p>
                </div>
              )}
              {formData.interface.password && (
                <div>
                  <p className="text-sm text-gray-500">Password</p>
                  <p className="text-sm font-medium">••••••••</p>
                </div>
              )}
              {formData.interface.httpHeaderName && (
                <div>
                  <p className="text-sm text-gray-500">HTTP Header Name</p>
                  <p className="text-sm font-medium">{formData.interface.httpHeaderName}</p>
                </div>
              )}
              {formData.interface.apiKeyValue && (
                <div>
                  <p className="text-sm text-gray-500">API Key</p>
                  <p className="text-sm font-medium">••••••••</p>
                </div>
              )}
              {formData.interface.identityKeyId && (
                <div>
                  <p className="text-sm text-gray-500">Identity Key</p>
                  <p className="text-sm font-medium">{formData.interface.identityKeyId}</p>
                </div>
              )}
              {formData.interface.host && (
                <div>
                  <p className="text-sm text-gray-500">Host</p>
                  <p className="text-sm font-medium">{formData.interface.host}</p>
                </div>
              )}
              {formData.interface.port && (
                <div>
                  <p className="text-sm text-gray-500">Port</p>
                  <p className="text-sm font-medium">{formData.interface.port}</p>
                </div>
              )}
              {formData.interface.characterEncoding && (
                <div>
                  <p className="text-sm text-gray-500">Character Encoding</p>
                  <p className="text-sm font-medium">{formData.interface.characterEncoding}</p>
                </div>
              )}
              {formData.interface.sourcePath && (
                <div>
                  <p className="text-sm text-gray-500">Source Path</p>
                  <p className="text-sm font-medium">{formData.interface.sourcePath}</p>
                </div>
              )}
              {formData.interface.supportFormatType && (
                <div>
                  <p className="text-sm text-gray-500">Support Format Type</p>
                  <p className="text-sm font-medium">{formData.interface.supportFormatType}</p>
                </div>
              )}
              {formData.interface.fileNamePattern && (
                <div>
                  <p className="text-sm text-gray-500">File Name Pattern</p>
                  <p className="text-sm font-medium">{formData.interface.fileNamePattern}</p>
                </div>
              )}
              {formData.interface.archivalPath && (
                <div>
                  <p className="text-sm text-gray-500">Archival Path</p>
                  <p className="text-sm font-medium">{formData.interface.archivalPath}</p>
                </div>
              )}
              {formData.interface.additionalSettings && Object.keys(formData.interface.additionalSettings).length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Additional Settings</p>
                  <ul className="text-sm font-medium">
                    {Object.entries(formData.interface.additionalSettings).map(([key, value]) => (
                      <li key={key}>{key}: {value}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Separator className="my-4" />
          </CardContent>
        </Card>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I agree to the Terms and Conditions and Privacy Policy
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Previous
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !form.getValues().acceptTerms}
            >
              {isSubmitting ? "Submitting..." : "Submit Onboarding Request"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ReviewForm;
