import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartnerWithApproval } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface ApprovalTableProps {
  searchQuery?: string;
}

const ApprovalTable = ({ searchQuery = "" }: ApprovalTableProps) => {
  // Fetch pending approvals specifically - these have already been enriched with partner data
  const { data: pendingApprovals = [], isLoading } = useQuery<PartnerWithApproval[]>({
    queryKey: ['/api/approvals/pending'],
  });
  
  // Get only the last 5 pending approvals
  const latestPendingApprovals = [...pendingApprovals]
    .sort((a, b) => {
      // First try to use submittedAt if available
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 
                   (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 
                   (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return dateB - dateA; // Sort in descending order (newest first)
    })
    .slice(0, 5); // Get only the first 5 items after sorting
  
  const displayData = latestPendingApprovals;
  
  const filteredApprovals = displayData.filter(partner => 
    (partner.companyName && partner.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (partner.contactEmail && partner.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
    searchQuery === ""
  );
  
  if (isLoading) {
    return <ApprovalTableSkeleton />;
  }
  
  return (
    <Card className="border border-gray-200 overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <CardTitle className="text-base font-medium text-gray-800">Last 5 Approval Requests</CardTitle>
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
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredApprovals.map((partner) => (
              <tr key={partner.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gray-300">
                        {partner.companyName ? partner.companyName.substring(0, 2).toUpperCase() : 'PA'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{partner.companyName}</div>
                      <div className="text-sm text-gray-500">{partner.contactEmail}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {partner.partnerType === "B2B_EDI" ? "B2B EDI Partner" : "Generic Partner"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {partner.status === "PENDING_APPROVAL" && (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Pending
                    </Badge>
                  )}
                  {partner.status === "APPROVED" && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Approved
                    </Badge>
                  )}
                  {partner.status === "REJECTED" && (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                      Rejected
                    </Badge>
                  )}
                  {(partner.status === "DRAFT" || partner.status === "SUBMITTED") && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      In Progress
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {partner.submittedAt ? 
                    new Date(partner.submittedAt).toLocaleDateString() + ' ' + new Date(partner.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                    (partner.createdAt ? 
                      new Date(partner.createdAt).toLocaleDateString() + ' ' + new Date(partner.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                      'N/A')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="link" className="text-primary hover:text-primary/90 mr-3">
                    Review
                  </Button>
                  <Button variant="link" className="text-gray-600 hover:text-gray-900">
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <CardFooter className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
        <Button variant="link" className="text-primary hover:text-primary-dark" asChild>
          <Link href="/pending-approvals">
            View all approval requests <i className="ri-arrow-right-line ml-1 inline-block align-middle"></i>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const ApprovalTableSkeleton = () => {
  return (
    <Card className="border border-gray-200 overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <Skeleton className="h-6 w-64" />
      </CardHeader>
      
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4 space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
      
      <CardFooter className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
        <Skeleton className="h-4 w-48" />
      </CardFooter>
    </Card>
  );
};

export default ApprovalTable;
