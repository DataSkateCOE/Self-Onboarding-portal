import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  FileText, 
  Download, 
  Trash2, 
  AlertCircle, 
  Eye, 
  Upload
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import CertificateUploadForm from "@/components/CertificateUploadForm";

interface Certificate {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  uploadedAt: string | Date;
  alias?: string | null;
  description?: string | null;
  storagePath: string;
  storageUrl?: string | null;
  userId: number;
}

const formatDate = (dateValue?: string | Date | null): string => {
  if (!dateValue) return "N/A";
  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const CertificateManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch certificates
  const { data: certificates = [], isLoading, isError } = useQuery<Certificate[]>({
    queryKey: ['/api/certificates'],
  });

  // Filter certificates based on search query
  const filteredCertificates = certificates.filter(cert => 
    cert.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cert.alias && cert.alias.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (cert.description && cert.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle certificate deletion
  const handleDeleteCertificate = async () => {
    if (!selectedCertificate) return;
    
    try {
      await apiRequest(`/api/certificates/${selectedCertificate.id}`, {
        method: 'DELETE',
      });
      
      // Show success toast
      toast({
        title: "Certificate deleted",
        description: "The certificate has been successfully deleted",
        variant: "default",
      });
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setSelectedCertificate(null);
      
      // Refresh certificates list
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the certificate",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Certificate Management</h2>
            <p className="text-sm text-gray-600">Manage security certificates for partner onboarding</p>
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        
        <div className="flex justify-between mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
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

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium">Failed to load certificates</h3>
            <p className="text-muted-foreground mt-2">There was an error loading the certificates. Please try again later.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/certificates'] })}
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Certificate Management</h2>
          <p className="text-sm text-gray-600">Manage security certificates for partner onboarding</p>
        </div>
        
        <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Certificate
        </Button>
      </div>
      
      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search certificates..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Badge variant="outline" className="h-9 px-3 flex items-center">
          {filteredCertificates.length} Certificate{filteredCertificates.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Security Certificates</CardTitle>
          <CardDescription>
            All available certificates for partner onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCertificates.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No certificates found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery ? "No certificates match your search" : "Upload a certificate to get started"}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary/70" />
                          <div>
                            <p>{cert.alias || cert.fileName}</p>
                            {cert.alias && (
                              <p className="text-xs text-muted-foreground">{cert.fileName}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{cert.fileType}</TableCell>
                      <TableCell>{formatFileSize(cert.fileSize)}</TableCell>
                      <TableCell>{formatDate(cert.uploadedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {cert.storageUrl && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={cert.storageUrl} target="_blank" rel="noopener noreferrer" title="View Certificate">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedCertificate(cert);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="Delete Certificate"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this certificate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="bg-muted p-3 rounded-md flex items-start gap-3 my-2">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{selectedCertificate.alias || selectedCertificate.fileName}</p>
                {selectedCertificate.alias && (
                  <p className="text-sm text-muted-foreground">{selectedCertificate.fileName}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {formatFileSize(selectedCertificate.fileSize)} • Uploaded on {formatDate(selectedCertificate.uploadedAt)}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCertificate}
            >
              Delete Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Upload Certificate Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Certificate</DialogTitle>
            <DialogDescription>
              Upload a new security certificate for partner onboarding
            </DialogDescription>
          </DialogHeader>
          
          <CertificateUploadForm />
          
          <DialogFooter className="sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsUploadDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CertificateManagement;