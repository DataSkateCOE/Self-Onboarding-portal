import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, X, Info, Building, User, Mail, Phone, Link as LinkIcon, MapPin, Globe, FileText, Shield, Database } from "lucide-react";
import { format } from "date-fns";
import { PartnerWithApproval } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const CompletedApprovals = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithApproval | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const handleViewDetails = (partner: PartnerWithApproval) => {
    setSelectedPartner(partner);
    setIsDetailsOpen(true);
  };
  
  // Fetch approvals completed this month
  const { data: completedApprovals = [], isLoading, isError } = useQuery<PartnerWithApproval[]>({
    queryKey: ['/api/approvals/completed-this-month'],
  });
  
  // Filter approvals by company name
  const filteredApprovals = completedApprovals.filter((approval: PartnerWithApproval) => {
    if (!searchQuery) return true;
    
    return approval.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-72" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <X className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium">Failed to load completed approvals</h3>
            <p className="text-muted-foreground mt-2">There was an error loading the completed approvals. Please try again later.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/approvals/completed-this-month'] })}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Partner Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Partner Onboarding Details</DialogTitle>
            <DialogDescription>
              Complete information submitted during the partner onboarding process
            </DialogDescription>
          </DialogHeader>
          
          {selectedPartner && (
            <div className="space-y-6 py-4">
              {/* Company Information */}
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Building className="h-5 w-5 text-primary-600" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company Name</p>
                    <p className="text-base">{selectedPartner.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Partner Type</p>
                    <Badge className={`
                      ${selectedPartner.partnerType === 'B2B_EDI' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                    `}>
                      {selectedPartner.partnerType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Industry</p>
                    <p className="text-base">{selectedPartner.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Website</p>
                    <p className="text-base">{selectedPartner.website || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <Separator />
              
              {/* Contact Information */}
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-primary-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Name</p>
                    <p className="text-base">{selectedPartner.contactName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-base">{selectedPartner.contactEmail}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-base">{selectedPartner.contactPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Address */}
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  Address
                </h3>
                <div className="grid grid-cols-1 gap-2 pl-7">
                  <p className="text-base">{selectedPartner.address || 'Not provided'}</p>
                  <p className="text-base">
                    {[
                      selectedPartner.city, 
                      selectedPartner.state, 
                      selectedPartner.zipCode, 
                      selectedPartner.country
                    ].filter(Boolean).join(', ') || 'Not provided'}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              {/* Security Information */}
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-primary-600" />
                  Security Information
                </h3>
                <div className="pl-7">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        {/* Show certificate details with highest priority from various locations */}
                        {selectedPartner.interfaceConfig?.security?.certificateDetails ? (
                          <>
                            <p className="text-sm font-medium">
                              {selectedPartner.interfaceConfig.security.certificateDetails.alias || 
                              selectedPartner.interfaceConfig.security.certificateDetails.fileName ||
                              selectedPartner.interfaceConfig.security.certificateDetails.name ||
                              "Security Certificate"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Certificate File: {selectedPartner.interfaceConfig.security.certificateDetails.fileName || 
                                               selectedPartner.interfaceConfig.security.certificateDetails.name}
                            </p>
                            {selectedPartner.interfaceConfig.security.certificateDetails.storageUrl && (
                              <a 
                                href={selectedPartner.interfaceConfig.security.certificateDetails.storageUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:text-primary-dark underline mt-1 inline-block"
                              >
                                View Certificate
                              </a>
                            )}</>
                        ) : selectedPartner.certificateId ? (
                          <>
                            <p className="text-sm font-medium">Security Certificate</p>
                            <p className="text-xs text-gray-500">
                              Certificate ID: {selectedPartner.certificateId}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm">
                            Security information was provided and approved
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Interface Information */}
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Database className="h-5 w-5 text-primary-600" />
                  Interface Configuration
                </h3>
                <div className="pl-7">
                  {selectedPartner.interfaceConfig && selectedPartner.interfaceConfig.interface ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Protocol</p>
                          <p className="text-sm">
                            {selectedPartner.interfaceConfig.interface.protocol || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Authentication Type</p>
                          <p className="text-sm">
                            {selectedPartner.interfaceConfig.interface.authType || "Not specified"}
                          </p>
                        </div>
                      </div>
                      
                      {selectedPartner.interfaceConfig.interface.endpoints && 
                       selectedPartner.interfaceConfig.interface.endpoints.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mt-2">Endpoints</p>
                          <div className="space-y-1 mt-1">
                            {selectedPartner.interfaceConfig.interface.endpoints.map((endpoint, i) => (
                              <div key={i} className="text-sm">
                                <span className="font-medium">{endpoint.name || "Endpoint"}:</span>{" "}
                                <span className="text-gray-700">{endpoint.url}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm">Interface configuration was provided and approved</p>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {/* Documents */}
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-primary-600" />
                  Submitted Documents
                </h3>
                <div className="pl-7">
                  {selectedPartner.documents && selectedPartner.documents.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedPartner.documents.map((doc, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>{doc.fileName}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm">No documents were submitted</p>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {/* Approval Information */}
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-primary-600" />
                  Approval Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge className="bg-green-100 text-green-800">APPROVED</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Approved Date</p>
                    <p className="text-base">{selectedPartner.approvedAt ? format(new Date(selectedPartner.approvedAt), 'MMM d, yyyy') : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
            >
              Close
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Completed Approvals</h2>
          <p className="text-sm text-gray-600">Partner onboarding requests completed this month</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search completed approvals..."
            className="pl-9 w-full sm:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-gray-800">
            Approvals Completed This Month
          </CardTitle>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approver
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium">No completed approvals this month</p>
                    <p className="text-sm mt-1">Approved partner onboarding requests will appear here</p>
                  </td>
                </tr>
              ) : (
                filteredApprovals.map((approval: PartnerWithApproval) => (
                  <tr key={approval.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary-100 text-primary-600">
                            {approval.companyName?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {approval.companyName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {approval.contactEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`
                        ${approval.partnerType === 'B2B_EDI' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                      `}>
                        {approval.partnerType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {approval.updatedAt ? format(new Date(approval.updatedAt), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Admin
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {approval.documents?.length || 0} files
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(approval)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CompletedApprovals;