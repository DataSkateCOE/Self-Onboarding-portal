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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Document } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  Upload, 
  Download, 
  MoreVertical, 
  Trash2, 
  Eye,
  FileText,
  FileLock,
  File
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface ExtendedDocument extends Document {
  partnerName: string;
}

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [documentType, setDocumentType] = useState<string>("ALL");
  
  // Fetch documents
  const { data: documents, isLoading, isError } = useQuery<ExtendedDocument[]>({
    queryKey: ['/api/documents'],
  });
  
  // Mock data for demonstration
  const demoDocuments: ExtendedDocument[] = [
    {
      id: 1,
      partnerId: 1,
      fileName: "acme_corporation_certificate.pem",
      fileType: "application/x-pem-file",
      fileSize: 512000, // 512 KB
      documentType: "certificate",
      uploadedAt: "2023-04-15T14:32:21.000Z",
      storagePath: "/documents/certificates/acme_corporation_certificate.pem",
      partnerName: "Acme Corporation"
    },
    {
      id: 2,
      partnerId: 1,
      fileName: "acme_private_key.pfx",
      fileType: "application/x-pkcs12",
      fileSize: 128000, // 128 KB
      documentType: "key",
      uploadedAt: "2023-04-15T14:33:45.000Z",
      storagePath: "/documents/keys/acme_private_key.pfx",
      partnerName: "Acme Corporation"
    },
    {
      id: 3,
      partnerId: 2,
      fileName: "supplychain_agreement.pdf",
      fileType: "application/pdf",
      fileSize: 2048000, // 2 MB
      documentType: "agreement",
      uploadedAt: "2023-05-06T10:15:30.000Z",
      storagePath: "/documents/agreements/supplychain_agreement.pdf",
      partnerName: "SupplyChain Inc."
    },
    {
      id: 4,
      partnerId: 3,
      fileName: "globallogistics_cert.der",
      fileType: "application/x-x509-ca-cert",
      fileSize: 256000, // 256 KB
      documentType: "certificate",
      uploadedAt: "2023-04-28T09:22:15.000Z",
      storagePath: "/documents/certificates/globallogistics_cert.der",
      partnerName: "Global Logistics"
    },
    {
      id: 5,
      partnerId: 4,
      fileName: "digital_solutions_requirements.docx",
      fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileSize: 1536000, // 1.5 MB
      documentType: "specification",
      uploadedAt: "2023-04-10T16:45:00.000Z",
      storagePath: "/documents/specifications/digital_solutions_requirements.docx",
      partnerName: "Digital Solutions"
    }
  ];
  
  const displayData = documents || demoDocuments;
  
  // Filter documents by search query and type
  const filteredDocuments = displayData.filter(document => {
    const matchesSearch = 
      document.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.partnerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = documentType === "ALL" || document.documentType.toLowerCase() === documentType.toLowerCase();
    
    return matchesSearch && matchesType;
  });
  
  // Get document types for filtering
  const documentTypes = ["ALL", ...new Set(displayData.map(doc => doc.documentType))];
  
  // Get file icon based on document type
  const getFileIcon = (documentType: string) => {
    switch (documentType.toLowerCase()) {
      case "certificate":
        return <FileText className="h-10 w-10 text-blue-500" />;
      case "key":
        return <FileLock className="h-10 w-10 text-red-500" />;
      case "agreement":
        return <FileText className="h-10 w-10 text-green-500" />;
      case "specification":
        return <FileText className="h-10 w-10 text-purple-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-72" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <Trash2 className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium">Failed to load documents</h3>
            <p className="text-muted-foreground mt-2">There was an error loading the documents. Please try again later.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/documents'] })}
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
          <h2 className="text-xl font-semibold text-gray-800">Document Repository</h2>
          <p className="text-sm text-gray-600">Manage all partner documents in a centralized repository</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search documents..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="ALL" onValueChange={setDocumentType}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
          {documentTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type === "ALL" ? "All Documents" : type.charAt(0).toUpperCase() + type.slice(1) + "s"}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="ALL" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center py-10">
                  <p className="text-muted-foreground">No documents found matching your criteria</p>
                </CardContent>
              </Card>
            ) : (
              filteredDocuments.map((document) => (
                <Card key={document.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {getFileIcon(document.documentType)}
                        <div>
                          <CardTitle className="text-base font-medium mb-1">
                            {document.fileName.length > 25 
                              ? document.fileName.substring(0, 22) + "..." 
                              : document.fileName}
                          </CardTitle>
                          <CardDescription>{document.partnerName}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">
                          {document.documentType.charAt(0).toUpperCase() + document.documentType.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{formatFileSize(document.fileSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uploaded:</span>
                        <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="secondary" size="sm" className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Create TabsContent for each document type */}
        {documentTypes.filter(type => type !== "ALL").map((type) => (
          <TabsContent key={type} value={type} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center py-10">
                    <p className="text-muted-foreground">No {type.toLowerCase()} documents found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredDocuments.map((document) => (
                  <Card key={document.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {getFileIcon(document.documentType)}
                          <div>
                            <CardTitle className="text-base font-medium mb-1">
                              {document.fileName.length > 25 
                                ? document.fileName.substring(0, 22) + "..." 
                                : document.fileName}
                            </CardTitle>
                            <CardDescription>{document.partnerName}</CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Download</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant="outline">
                            {document.documentType.charAt(0).toUpperCase() + document.documentType.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span>{formatFileSize(document.fileSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Uploaded:</span>
                          <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="secondary" size="sm" className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Documents;
