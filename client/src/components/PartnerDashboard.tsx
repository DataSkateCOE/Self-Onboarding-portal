import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerWithApproval } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const PartnerDashboard = () => {
  const { data: partnerData, isLoading } = useQuery<PartnerWithApproval>({
    queryKey: ['/api/partner/me'],
  });
  
  if (isLoading) {
    return <PartnerDashboardSkeleton />;
  }
  
  // For demo purposes
  const demoPartner: PartnerWithApproval = {
    id: 1,
    userId: 1,
    companyName: "Demo Company",
    contactName: "John Smith",
    contactEmail: "john@demo.com",
    contactPhone: "555-123-4567",
    partnerType: "B2B_EDI",
    status: "PENDING_APPROVAL",
    submittedAt: new Date().toISOString(),
  };
  
  const partner = partnerData || demoPartner;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "SUBMITTED":
        return <Badge variant="secondary">Submitted</Badge>;
      case "PENDING_APPROVAL":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-blue-700/80"></div>
          <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome, {partner.contactName}</h2>
            <p className="text-primary-100 max-w-lg">
              Streamline your integration process and complete your onboarding in just a few steps.
            </p>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Your Onboarding Progress</CardTitle>
              <CardDescription>
                {partner.status === "APPROVED" 
                  ? "Your onboarding is complete! You can now access all features."
                  : "Continue your onboarding process to gain full access to the platform."}
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/new-onboarding">
                {partner.status === "DRAFT" ? "Continue Onboarding" : "View Onboarding Details"}
              </Link>
            </Button>
          </div>
          
          {partner.status !== "APPROVED" && (
            <div className="mt-6">
              <div className="mt-2 flex justify-between">
                <span className="text-sm text-gray-500">Status: {getStatusBadge(partner.status)}</span>
                {partner.submittedAt && (
                  <span className="text-sm text-gray-500">
                    Submitted: {new Date(partner.submittedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Activity or Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Follow these steps to complete your partner onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                <i className="ri-check-line text-green-600 text-xs"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Complete company information</p>
                <p className="text-xs text-gray-500">Basic details about your organization</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                <i className="ri-check-line text-green-600 text-xs"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Upload security certificates</p>
                <p className="text-xs text-gray-500">Required for secure communications</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center mr-3 mt-0.5">
                <i className="ri-time-line text-primary-600 text-xs"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Configure interface settings</p>
                <p className="text-xs text-gray-500">Setup connection protocols and endpoints</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-gray-600 text-xs">4</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Review and submit</p>
                <p className="text-xs text-gray-500">Final review before submission</p>
              </div>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/new-onboarding">
              Continue Onboarding
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const PartnerDashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      <Card className="border-none shadow-md overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary to-blue-600"></div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-start">
                <Skeleton className="h-5 w-5 rounded-full mr-3" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    </div>
  );
};

export default PartnerDashboard;
