import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PartnerWithApproval } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Search, Check, X, Eye, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// Helper function for date formatting
const formatDate = (dateValue?: string | Date | null): string => {
  if (!dateValue) return "N/A";
  
  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const PendingApprovals = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithApproval | null>(null);
  const [approvalComments, setApprovalComments] = useState("");
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch pending approvals
  const { data: pendingApprovals, isLoading, isError } = useQuery<PartnerWithApproval[]>({
    queryKey: ['/api/approvals/pending'],
  });
  
  // Mock data for demonstration - in a real app, this would come from the backend
  const demoApprovals: PartnerWithApproval[] = [
    {
      id: 1,
      userId: 1,
      companyName: "Acme Corporation",
      contactName: "John Smith",
      contactEmail: "john@acmecorp.com",
      contactPhone: "555-123-4567",
      partnerType: "B2B_EDI",
      status: "PENDING_APPROVAL",
      currentStep: 3,
      totalSteps: 4,
      submittedAt: "2023-05-08T00:00:00.000Z",
    },
    {
      id: 2,
      userId: 2,
      companyName: "SupplyChain Inc.",
      contactName: "Maria Johnson",
      contactEmail: "maria@supplychain.com",
      contactPhone: "555-987-6543",
      partnerType: "GENERIC",
      status: "PENDING_APPROVAL",
      currentStep: 2,
      totalSteps: 4,
      submittedAt: "2023-05-06T00:00:00.000Z",
    },
    {
      id: 3,
      userId: 3,
      companyName: "Global Logistics",
      contactName: "Robert Chen",
      contactEmail: "robert@globallogistics.com",
      contactPhone: "555-456-7890",
      partnerType: "B2B_EDI",
      status: "PENDING_APPROVAL",
      currentStep: 4,
      totalSteps: 4,
      submittedAt: "2023-05-05T00:00:00.000Z",
    },
    {
      id: 4,
      userId: 4,
      companyName: "Digital Solutions",
      contactName: "Sarah Williams",
      contactEmail: "sarah@digitalsolutions.com",
      contactPhone: "555-234-5678",
      partnerType: "GENERIC",
      status: "PENDING_APPROVAL",
      currentStep: 3,
      totalSteps: 3,
      submittedAt: "2023-05-04T00:00:00.000Z",
    },
    {
      id: 5,
      userId: 5,
      companyName: "Tech Innovators",
      contactName: "Michael Brown",
      contactEmail: "michael@techinnovators.com",
      contactPhone: "555-876-5432",
      partnerType: "B2B_EDI",
      status: "PENDING_APPROVAL",
      currentStep: 3,
      totalSteps: 4,
      submittedAt: "2023-05-03T00:00:00.000Z",
    }
  ];
  
  const displayData = pendingApprovals || demoApprovals;
  
  const filteredApprovals = displayData.filter(partner => 
    partner.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle approval or rejection
  const handleApprovalAction = async (approve: boolean) => {
    if (!selectedPartner) return;
    
    try {
      // Create a properly formatted POST request
      // Use the partnerId, not the approval ID
      const response = await fetch(`/api/approvals/${selectedPartner.partnerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: approve ? 'APPROVED' : 'REJECTED',
          comments: approvalComments
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      // Invalidate all relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/approvals/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: `Partner ${approve ? 'approved' : 'rejected'} successfully`,
        description: `${selectedPartner.companyName} has been ${approve ? 'approved' : 'rejected'}.`,
        variant: approve ? "default" : "destructive",
      });
      
      setIsApprovalDialogOpen(false);
      setApprovalComments("");
      setSelectedPartner(null);
    } catch (error) {
      console.error("Approval error:", error);
      toast({
        title: "Action failed",
        description: `Failed to ${approve ? 'approve' : 'reject'} partner. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
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
            <h3 className="text-lg font-medium">Failed to load approvals</h3>
            <p className="text-muted-foreground mt-2">There was an error loading the pending approvals. Please try again later.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/approvals/pending'] })}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Pending Approvals</h2>
          <p className="text-sm text-gray-600">Review and manage partner onboarding requests</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Partner Approval Requests</CardTitle>
          <CardDescription>
            Review and approve or reject partner onboarding requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApprovals.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No pending approvals found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {partner.companyName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{partner.companyName}</p>
                          <p className="text-sm text-muted-foreground">{partner.contactEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {partner.partnerType === "B2B_EDI" ? "B2B EDI" : "Generic"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(partner.submittedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            // Set selectedPartner first to show dialog with loading state
                            setSelectedPartner(partner);
                            setIsDetailsDialogOpen(true);
                            
                            // For debug purposes - log the partner to console
                            console.log("Selected partner:", partner);
                            console.log("Has documents:", partner.documents);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => {
                            setSelectedPartner(partner);
                            setIsApprovalDialogOpen(true);
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Partner Request</DialogTitle>
            <DialogDescription>
              Approve or reject the partner onboarding request for {selectedPartner?.companyName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Partner Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Company:</p>
                  <p>{selectedPartner?.companyName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contact:</p>
                  <p>{selectedPartner?.contactName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email:</p>
                  <p>{selectedPartner?.contactEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone:</p>
                  <p>{selectedPartner?.contactPhone}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="comments" className="text-sm font-medium">Comments</label>
              <Textarea
                id="comments"
                placeholder="Add approval or rejection comments..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="destructive" 
              onClick={() => handleApprovalAction(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleApprovalAction(true)}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Partner Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedPartner?.companyName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    {/* Company Name row */}
                    <div className="flex flex-row">
                      <div className="w-1/3 text-muted-foreground">Company Name:</div>
                      <div className="w-2/3">{selectedPartner?.companyName}</div>
                    </div>
                    {/* Contact Name row */}
                    <div className="flex flex-row">
                      <div className="w-1/3 text-muted-foreground">Contact Name:</div>
                      <div className="w-2/3">{selectedPartner?.contactName}</div>
                    </div>
                    {/* Email row */}
                    <div className="flex flex-row">
                      <div className="w-1/3 text-muted-foreground">Email:</div>
                      <div className="w-2/3">{selectedPartner?.contactEmail}</div>
                    </div>
                    {/* Phone row */}
                    <div className="flex flex-row">
                      <div className="w-1/3 text-muted-foreground">Phone:</div>
                      <div className="w-2/3">{selectedPartner?.contactPhone}</div>
                    </div>
                    {/* Partner Type row */}
                    <div className="flex flex-row">
                      <div className="w-1/3 text-muted-foreground">Partner Type:</div>
                      <div className="w-2/3">{selectedPartner?.partnerType === "B2B_EDI" ? "B2B EDI Partner" : "Generic Partner"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Onboarding Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    {/* Status row */}
                    <div className="flex flex-row">
                      <div className="w-1/3 text-muted-foreground">Status:</div>
                      <div className="w-2/3">
                        {selectedPartner?.status === 'PENDING_APPROVAL' && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Pending Approval
                          </Badge>
                        )}
                        {selectedPartner?.status === 'APPROVED' && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Approved
                          </Badge>
                        )}
                        {selectedPartner?.status === 'REJECTED' && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                            Rejected
                          </Badge>
                        )}
                        {selectedPartner?.status === 'DRAFT' && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                            Draft
                          </Badge>
                        )}
                        {selectedPartner?.status === 'SUBMITTED' && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            Submitted
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* Submitted row */}
                    <div className="flex flex-row">
                      <div className="w-1/3 text-muted-foreground">Submitted:</div>
                      <div className="w-2/3">
                        {selectedPartner?.submittedAt ? (typeof selectedPartner.submittedAt === 'string' ? new Date(selectedPartner.submittedAt).toLocaleString() : selectedPartner.submittedAt.toLocaleString()) : "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Security Certificates Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Security Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      {selectedPartner?.interfaceConfig?.security?.certificateDetails ? (
                        <>
                          <p className="text-sm font-medium">
                            {selectedPartner.interfaceConfig.security.certificateDetails.alias || 
                            selectedPartner.interfaceConfig.security.certificateDetails.fileName ||
                            selectedPartner.interfaceConfig.security.certificateDetails.name ||
                            "Security Certificate"}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground text-sm py-2">No certificate information available</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Interface Configuration Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Interface Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPartner?.interfaceConfig?.interface ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Protocol</p>
                        <p className="text-sm font-medium">{selectedPartner.interfaceConfig.interface.protocol || "Not selected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Authentication Type</p>
                        <p className="text-sm font-medium">{selectedPartner.interfaceConfig.interface.authType || "Not selected"}</p>
                      </div>
                      {selectedPartner.interfaceConfig.interface.direction && (
                        <div>
                          <p className="text-sm text-gray-500">Direction</p>
                          <p className="text-sm font-medium">
                            {selectedPartner.interfaceConfig.interface.direction === "send" ? "Send to Partner" : selectedPartner.interfaceConfig.interface.direction === "receive" ? "Receive from Partner" : "Not selected"}
                          </p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.username && (
                        <div>
                          <p className="text-sm text-gray-500">Username</p>
                          <p className="text-sm font-medium">{selectedPartner.interfaceConfig.interface.username}</p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.password && (
                        <div>
                          <p className="text-sm text-gray-500">Password</p>
                          <p className="text-sm font-medium">••••••••</p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.httpHeaderName && (
                        <div>
                          <p className="text-sm text-gray-500">HTTP Header Name</p>
                          <p className="text-sm font-medium">{selectedPartner.interfaceConfig.interface.httpHeaderName}</p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.apiKeyValue && (
                        <div>
                          <p className="text-sm text-gray-500">API Key</p>
                          <p className="text-sm font-medium">••••••••</p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.identityKeyId && (
                        <div>
                          <p className="text-sm text-gray-500">Identity Key</p>
                          <p className="text-sm font-medium">{selectedPartner.interfaceConfig.interface.identityKeyId}</p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.host && (
                        <div>
                          <p className="text-sm text-gray-500">Host</p>
                          <p className="text-sm font-medium">{selectedPartner.interfaceConfig.interface.host}</p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.port && (
                        <div>
                          <p className="text-sm text-gray-500">Port</p>
                          <p className="text-sm font-medium">{selectedPartner.interfaceConfig.interface.port}</p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.characterEncoding && (
                        <div>
                          <p className="text-sm text-gray-500">Character Encoding</p>
                          <p className="text-sm font-medium">{selectedPartner.interfaceConfig.interface.characterEncoding}</p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.sourcePath && (
                        <div>
                          <p className="text-sm text-gray-500">Source Path</p>
                          <p className="text-sm font-medium">{selectedPartner.interfaceConfig.interface.sourcePath}</p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.supportFormatType && (
                        <div>
                          <p className="text-sm text-gray-500">Support Format Type</p>
                          <p className="text-sm font-medium">{selectedPartner.interfaceConfig.interface.supportFormatType}</p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.fileNamePattern && (
                        <div>
                          <p className="text-sm text-gray-500">File Name Pattern</p>
                          <p className="text-sm font-medium">{selectedPartner.interfaceConfig.interface.fileNamePattern}</p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.archivalPath && (
                        <div>
                          <p className="text-sm text-gray-500">Archival Path</p>
                          <p className="text-sm font-medium">{selectedPartner.interfaceConfig.interface.archivalPath}</p>
                        </div>
                      )}
                      {selectedPartner.interfaceConfig.interface.additionalSettings && Object.keys(selectedPartner.interfaceConfig.interface.additionalSettings).length > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Additional Settings</p>
                          <ul className="text-sm font-medium">
                            {Object.entries(selectedPartner.interfaceConfig.interface.additionalSettings).map(([key, value]) => (
                              <li key={key}>{key}: {value}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm py-2">No interface configuration available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button 
              variant="default" 
              onClick={() => {
                setIsDetailsDialogOpen(false);
                setIsApprovalDialogOpen(true);
              }}
            >
              Review this Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingApprovals;
