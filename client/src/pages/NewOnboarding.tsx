import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PartnerType } from "@/types";
import PartnerTypeCard from "@/components/PartnerTypeCard";
import MultiStepForm from "@/components/MultiStepForm";

const NewOnboarding = () => {
  const [selectedPartnerType, setSelectedPartnerType] = useState<PartnerType | null>(null);
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <Card className="shadow-sm overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-primary to-primary/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-800/80"></div>
            <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome to the Partner Onboarding Portal</h2>
              <p className="text-primary-100 max-w-lg">Streamline your integration process and complete your onboarding in just a few steps.</p>
            </div>
          </div>
          
          <CardContent className="px-6 py-5 sm:px-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Start a new onboarding process</h3>
                <p className="mt-1 text-sm text-gray-600">Choose the partner type that best fits your integration needs.</p>
              </div>
              <div className="mt-4 md:mt-0">
                <a 
                  href="#" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                >
                  View Documentation
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {!selectedPartnerType ? (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Partner Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PartnerTypeCard
              title="Anypoint Partner Manager (B2B EDI)"
              description="For partners requiring EDI document exchange with standardized formats and secure B2B connections."
              steps="4-step onboarding process"
              imageSrc="https://images.unsplash.com/photo-1633613286991-611fe299c4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"
              onClick={() => setSelectedPartnerType("B2B_EDI")}
            />
            
            <PartnerTypeCard
              title="Generic Partner"
              description="For partners requiring general integration, training, resources, and support channel establishment."
              steps="Multi-step onboarding process"
              imageSrc="https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"
              onClick={() => setSelectedPartnerType("GENERIC")}
            />
          </div>
        </div>
      ) : (
        <MultiStepForm 
          partnerType={selectedPartnerType} 
          onClose={() => setSelectedPartnerType(null)}
        />
      )}
    </div>
  );
};

export default NewOnboarding;
