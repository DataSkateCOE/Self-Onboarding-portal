import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CompanyInfoForm from "@/components/forms/CompanyInfoForm";
import SecurityForm from "@/components/forms/SecurityForm";
import InterfaceForm from "@/components/forms/InterfaceForm";
import ReviewForm from "@/components/forms/ReviewForm";
import GenericPartnerForm from "@/components/forms/GenericPartnerForm";
import { PartnerType, OnboardingFormData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface MultiStepFormProps {
  partnerType: PartnerType;
  onClose: () => void;
}



const MultiStepForm = ({ partnerType, onClose }: MultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyInfo: {
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    },
    security: {
      selectedCertificateId: "",
      selectedCertificate: null,
    },
    interface: {
      protocol: "",
      authType: "",
      endpoints: [{ name: "", url: "" }],
    },
    review: {
      acceptTerms: false,
    },
  });
  
  const submitMutation = useMutation({
    mutationFn: (data: OnboardingFormData) => {
      // Transform the OnboardingFormData to match the expected API format
      const transformedData = {
        // Use the company info data as the base
        ...data.companyInfo,
        // Mock a userId since we don't have auth
        userId: 2, // Using a sample user ID for now
        // Include partner type
        partnerType,
        // Include certificate information
        certificateId: data.security.selectedCertificateId || null,
        // Include interface config as JSON, with all details for persistence
        interfaceConfig: {
          security: {
            selectedCertificateId: data.security.selectedCertificateId,
            certificateDetails: data.security.selectedCertificate ? {
              id: data.security.selectedCertificate.id,
              name: data.security.selectedCertificate.fileName,
              alias: data.security.selectedCertificate.alias
            } : null
          },
          interface: data.interface,
          review: data.review
        },
      };

      return apiRequest({
        url: '/api/partners',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transformedData)
      });
    },
    onSuccess: () => {
      // Invalidate both partner and approval queries to refresh all related components
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/approvals/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Onboarding request submitted",
        description: "Your onboarding request has been submitted successfully.",
        variant: "default",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to submit",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleNext = () => {
    // For B2B_EDI partners, we have 4 steps, for generic partners we route directly to the GenericPartnerForm
    const maxSteps = partnerType === "B2B_EDI" ? 4 : 3;
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      submitMutation.mutate(formData);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const updateFormData = (step: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: {
        ...prev[step as keyof OnboardingFormData],
        ...data,
      }
    }));
  };
  
  const renderStepContent = () => {
    if (partnerType === "B2B_EDI") {
      switch (currentStep) {
        case 1:
          return (
            <CompanyInfoForm 
              formData={formData.companyInfo} 
              onUpdate={(data) => updateFormData('companyInfo', data)}
              onNext={handleNext}
            />
          );
        case 2:
          return (
            <SecurityForm 
              formData={formData.security}
              onUpdate={(data) => updateFormData('security', data)}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          );
        case 3:
          return (
            <InterfaceForm 
              formData={formData.interface}
              onUpdate={(data) => updateFormData('interface', data)}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          );
        case 4:
          return (
            <ReviewForm 
              formData={formData}
              onUpdate={(data) => updateFormData('review', data)}
              onSubmit={() => submitMutation.mutate(formData)}
              onPrevious={handlePrevious}
              isSubmitting={submitMutation.isPending}
            />
          );
        default:
          return null;
      }
    } else {
      // Generic partner form
      return (
        <GenericPartnerForm 
          currentStep={currentStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={() => submitMutation.mutate(formData)}
          isSubmitting={submitMutation.isPending}
        />
      );
    }
  };
  
  return (
    <Card className="border border-gray-200 overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {partnerType === "B2B_EDI" ? "B2B EDI Partner Onboarding" : "Generic Partner Onboarding"}
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        

      </div>
      
      <hr className="border-gray-200" />
      
      <div className="p-6">
        {renderStepContent()}
      </div>
    </Card>
  );
};

export default MultiStepForm;
