import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface GenericPartnerFormProps {
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// Create schemas for each step
const partnerInfoSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  industryType: z.string().min(2, "Industry type is required"),
  businessDescription: z.string().min(10, "Please provide a brief description of your business"),
  primaryGoals: z.string().min(10, "Please describe your primary goals"),
});

const resourcesSchema = z.object({
  trainingNeeded: z.boolean().default(false),
  resourcesRequested: z.array(z.string()).optional(),
  specialRequirements: z.string().optional(),
});

const reviewSchema = z.object({
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

const GenericPartnerForm = ({
  currentStep,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting
}: GenericPartnerFormProps) => {
  
  // Forms for each step
  const partnerInfoForm = useForm<z.infer<typeof partnerInfoSchema>>({
    resolver: zodResolver(partnerInfoSchema),
    defaultValues: {
      companyName: "",
      industryType: "",
      businessDescription: "",
      primaryGoals: "",
    },
  });
  
  const resourcesForm = useForm<z.infer<typeof resourcesSchema>>({
    resolver: zodResolver(resourcesSchema),
    defaultValues: {
      trainingNeeded: false,
      resourcesRequested: [],
      specialRequirements: "",
    },
  });
  
  const reviewForm = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });
  
  const handlePartnerInfoSubmit = (data: z.infer<typeof partnerInfoSchema>) => {
    console.log("Partner info:", data);
    onNext();
  };
  
  const handleResourcesSubmit = (data: z.infer<typeof resourcesSchema>) => {
    console.log("Resources:", data);
    onNext();
  };
  
  const handleReviewSubmit = (data: z.infer<typeof reviewSchema>) => {
    console.log("Review:", data);
    onSubmit();
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Partner Information</h3>
            <p className="text-sm text-gray-600 mb-6">Tell us about your organization and goals.</p>
            
            <Form {...partnerInfoForm}>
              <form onSubmit={partnerInfoForm.handleSubmit(handlePartnerInfoSubmit)} className="space-y-6">
                <FormField
                  control={partnerInfoForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={partnerInfoForm.control}
                  name="industryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Healthcare, Finance, Retail" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={partnerInfoForm.control}
                  name="businessDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Briefly describe your business and services"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={partnerInfoForm.control}
                  name="primaryGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Goals for this Partnership</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What do you hope to achieve through this partnership?"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button type="submit">
                    Next Step
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );
        
      case 2:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Training and Resources</h3>
            <p className="text-sm text-gray-600 mb-6">Let us know what resources you need.</p>
            
            <Form {...resourcesForm}>
              <form onSubmit={resourcesForm.handleSubmit(handleResourcesSubmit)} className="space-y-6">
                <FormField
                  control={resourcesForm.control}
                  name="trainingNeeded"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I require training on using the platform
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="space-y-3">
                  <FormLabel>Resources Requested</FormLabel>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["API Documentation", "Integration Guide", "Use Case Examples", "Best Practices Guide"].map((resource) => (
                      <FormItem key={resource} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={resourcesForm.watch("resourcesRequested")?.includes(resource)}
                            onCheckedChange={(checked) => {
                              const current = resourcesForm.watch("resourcesRequested") || [];
                              if (checked) {
                                resourcesForm.setValue("resourcesRequested", [...current, resource]);
                              } else {
                                resourcesForm.setValue(
                                  "resourcesRequested",
                                  current.filter((r) => r !== resource)
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {resource}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                </div>
                
                <FormField
                  control={resourcesForm.control}
                  name="specialRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requirements or needs for your integration"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <Button type="button" variant="outline" onClick={onPrevious}>
                    Previous
                  </Button>
                  <Button type="submit">
                    Next Step
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );
        
      case 3:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Review and Submit</h3>
            <p className="text-sm text-gray-600 mb-6">Please review your information before submission.</p>
            
            <div className="space-y-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-base font-medium mb-4">Partner Information</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Company Name</p>
                      <p className="text-sm font-medium">{partnerInfoForm.getValues("companyName") || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Industry Type</p>
                      <p className="text-sm font-medium">{partnerInfoForm.getValues("industryType") || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Business Description</p>
                      <p className="text-sm font-medium">{partnerInfoForm.getValues("businessDescription") || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Primary Goals</p>
                      <p className="text-sm font-medium">{partnerInfoForm.getValues("primaryGoals") || "Not provided"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-base font-medium mb-4">Training and Resources</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Training Needed</p>
                      <p className="text-sm font-medium">{resourcesForm.getValues("trainingNeeded") ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Resources Requested</p>
                      <div className="text-sm font-medium">
                        {resourcesForm.getValues("resourcesRequested")?.length ? (
                          <ul className="list-disc pl-5">
                            {resourcesForm.getValues("resourcesRequested")?.map((resource, index) => (
                              <li key={index}>{resource}</li>
                            ))}
                          </ul>
                        ) : (
                          "None"
                        )}
                      </div>
                    </div>
                    {resourcesForm.getValues("specialRequirements") && (
                      <div>
                        <p className="text-sm text-gray-500">Special Requirements</p>
                        <p className="text-sm font-medium">{resourcesForm.getValues("specialRequirements")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Form {...reviewForm}>
              <form onSubmit={reviewForm.handleSubmit(handleReviewSubmit)} className="space-y-6">
                <FormField
                  control={reviewForm.control}
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
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Onboarding Request"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return renderStepContent();
};

export default GenericPartnerForm;
