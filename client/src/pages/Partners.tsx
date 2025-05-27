import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PartnerWithApproval, OnboardingStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, ArrowUpDown, Eye, Check, X } from "lucide-react";

const Partners = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OnboardingStatus | "ALL">("ALL");
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithApproval | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  // Fetch partners
  const { data: partners, isLoading, isError } = useQuery<PartnerWithApproval[]>({
    queryKey: ['/api/partners'],
  });
  
  // Mock data for demonstration - in a real app, this would come from the backend
  const demoPartners: PartnerWithApproval[] = [
    {
      id: 1,
      userId: 1,
      companyName: "Acme Corporation",
      contactName: "John Smith",
      contactEmail: "john@acmecorp.com",
      contactPhone: "555-123-4567",
      partnerType: "B2B_EDI",
      status: "APPROVED",
      currentStep: 4,
      totalSteps: 4,
      submittedAt: "2023-04-15T00:00:00.000Z",
      approvedAt: "2023-04-18T00:00:00.000Z",
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
      status: "REJECTED",
      currentStep: 4,
      totalSteps: 4,
      submittedAt: "2023-04-28T00:00:00.000Z",
      rejectedAt: "2023-04-30T00:00:00.000Z",
    },
    {
      id: 4,
      userId: 4,
      companyName: "Digital Solutions",
      contactName: "Sarah Williams",
      contactEmail: "sarah@digitalsolutions.com",
      contactPhone: "555-234-5678",
      partnerType: "GENERIC",
      status: "APPROVED",
      currentStep: 3,
      totalSteps: 3,
      submittedAt: "2023-04-10T00:00:00.000Z",
      approvedAt: "2023-04-12T00:00:00.000Z",
    },
    {
      id: 5,
      userId: 5,
      companyName: "Tech Innovators",
      contactName: "Michael Brown",
      contactEmail: "michael@techinnovators.com",
      contactPhone: "555-876-5432",
      partnerType: "B2B_EDI",
      status: "DRAFT",
      currentStep: 2,
      totalSteps: 4,
    },
    {
      id: 6,
      userId: 6,
      companyName: "Retail Solutions",
      contactName: "Jennifer Lee",
      contactEmail: "jennifer@retailsolutions.com",
      contactPhone: "555-345-6789",
      partnerType: "GENERIC",
      status: "SUBMITTED",
      currentStep: 3,
      totalSteps: 3,
      submittedAt: "2023-05-02T00:00:00.000Z",
    }
  ];
  
  const displayData = partners || demoPartners;
  
  // Filter by search query and status
  const filteredPartners = displayData.filter(partner => {
    const matchesSearch = 
      partner.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || partner.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Status badge component
  const getStatusBadge = (status: OnboardingStatus) => {
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
  
  const statusCounts = {
    ALL: displayData.length,
    DRAFT: displayData.filter(p => p.status === "DRAFT").length,
    SUBMITTED: displayData.filter(p => p.status === "SUBMITTED").length,
    PENDING_APPROVAL: displayData.filter(p => p.status === "PENDING_APPROVAL").length,
    APPROVED: displayData.filter(p => p.status === "APPROVED").length,
    REJECTED: displayData.filter(p => p.status === "REJECTED").length,
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-72" />
        </div>
        <Skeleton className="h-12 w-full" />
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
            <h3 className="text-lg font-medium">Failed to load partners</h3>
            <p className="text-muted-foreground mt-2">There was an error loading the partners data. Please try again later.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => window.location.reload()}
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
          <h2 className="text-xl font-semibold text-gray-800">Partners</h2>
          <p className="text-sm text-gray-600">Manage all partner accounts and their integration status</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search partners..."
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
      
      <Tabs defaultValue="ALL" onValueChange={(value) => setStatusFilter(value as OnboardingStatus | "ALL")}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
          <TabsTrigger value="ALL">
            All ({statusCounts.ALL})
          </TabsTrigger>
          <TabsTrigger value="DRAFT">
            Draft ({statusCounts.DRAFT})
          </TabsTrigger>
          <TabsTrigger value="SUBMITTED">
            Submitted ({statusCounts.SUBMITTED})
          </TabsTrigger>
          <TabsTrigger value="PENDING_APPROVAL">
            Pending ({statusCounts.PENDING_APPROVAL})
          </TabsTrigger>
          <TabsTrigger value="APPROVED">
            Approved ({statusCounts.APPROVED})
          </TabsTrigger>
          <TabsTrigger value="REJECTED">
            Rejected ({statusCounts.REJECTED})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ALL" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">No partners found matching your criteria</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPartners.map((partner) => (
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
                          {getStatusBadge(partner.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(partner.currentStep / partner.totalSteps) * 100} className="h-2 w-24" />
                            <span className="text-xs text-muted-foreground">
                              {Math.round((partner.currentStep / partner.totalSteps) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPartner(partner);
                              setIsDetailsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between py-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredPartners.length} of {displayData.length} partners
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Duplicate the TabsContent for each status, with value matching the TabsTrigger */}
        {["DRAFT", "SUBMITTED", "PENDING_APPROVAL", "APPROVED", "REJECTED"].map((status) => (
          <TabsContent key={status} value={status} className="mt-0">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">No partners found with {status.toLowerCase()} status</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPartners.map((partner) => (
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
                            {getStatusBadge(partner.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={(partner.currentStep / partner.totalSteps) * 100} className="h-2 w-24" />
                              <span className="text-xs text-muted-foreground">
                                {Math.round((partner.currentStep / partner.totalSteps) * 100)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedPartner(partner);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between py-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredPartners.length} of {displayData.filter(p => p.status === status).length} partners
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Partner Details Dialog */}
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
                  <dl className="grid grid-cols-1 gap-2 text-sm">
                    <div className="grid grid-cols-2">
                      <dt className="text-muted-foreground">Company Name:</dt>
                      <dd>{selectedPartner?.companyName}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="text-muted-foreground">Contact Name:</dt>
                      <dd>{selectedPartner?.contactName}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="text-muted-foreground">Email:</dt>
                      <dd>{selectedPartner?.contactEmail}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="text-muted-foreground">Phone:</dt>
                      <dd>{selectedPartner?.contactPhone}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="text-muted-foreground">Partner Type:</dt>
                      <dd>{selectedPartner?.partnerType === "B2B_EDI" ? "B2B EDI Partner" : "Generic Partner"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Onboarding Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-2 text-sm">
                    <div className="grid grid-cols-2">
                      <dt className="text-muted-foreground">Status:</dt>
                      <dd>
                        {selectedPartner && getStatusBadge(selectedPartner.status)}
                      </dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="text-muted-foreground">Submitted:</dt>
                      <dd>{selectedPartner?.submittedAt ? new Date(selectedPartner.submittedAt as string).toLocaleString() : "Not submitted"}</dd>
                    </div>
                    {selectedPartner?.approvedAt && (
                      <div className="grid grid-cols-2">
                        <dt className="text-muted-foreground">Approved:</dt>
                        <dd>{new Date(selectedPartner.approvedAt as string).toLocaleString()}</dd>
                      </div>
                    )}
                    {selectedPartner?.rejectedAt && (
                      <div className="grid grid-cols-2">
                        <dt className="text-muted-foreground">Rejected:</dt>
                        <dd>{new Date(selectedPartner.rejectedAt as string).toLocaleString()}</dd>
                      </div>
                    )}
                    <div className="grid grid-cols-2">
                      <dt className="text-muted-foreground">Progress:</dt>
                      <dd>
                        {selectedPartner ? `${selectedPartner.currentStep} of ${selectedPartner.totalSteps} steps` : "N/A"}
                      </dd>
                    </div>
                    <div className="col-span-2 pt-2">
                      <dt className="text-muted-foreground mb-1">Completion:</dt>
                      <dd className="w-full">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: selectedPartner ? `${(selectedPartner.currentStep / selectedPartner.totalSteps) * 100}%` : "0%" }}
                          ></div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground mt-1">
                          {selectedPartner ? `${Math.round((selectedPartner.currentStep / selectedPartner.totalSteps) * 100)}%` : "0%"}
                        </div>
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPartner?.documents && selectedPartner.documents.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {selectedPartner.documents.map((doc) => (
                      <li key={doc.id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <i className="ri-file-text-line text-gray-500 mr-3"></i>
                          <div>
                            <p className="text-sm font-medium">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(doc.fileSize / 1024)} KB • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm py-2">No documents available</p>
                )}
              </CardContent>
            </Card>
            
            {selectedPartner?.interfaceConfig && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Interface Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="grid grid-cols-2">
                      <dt className="text-muted-foreground">Protocol:</dt>
                      <dd>{selectedPartner.interfaceConfig.protocol || "Not specified"}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="text-muted-foreground">Auth Type:</dt>
                      <dd>{selectedPartner.interfaceConfig.authType || "Not specified"}</dd>
                    </div>
                  </dl>
                  
                  {selectedPartner.interfaceConfig.endpoints && selectedPartner.interfaceConfig.endpoints.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Endpoints</h4>
                      <ul className="border rounded-md divide-y">
                        {selectedPartner.interfaceConfig.endpoints.map((endpoint, index) => (
                          <li key={index} className="px-3 py-2">
                            <p className="text-sm font-medium">{endpoint.name}</p>
                            <p className="text-xs text-muted-foreground">{endpoint.url}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Partners;
