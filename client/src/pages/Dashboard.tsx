import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import AdminDashboard from "@/components/AdminDashboard";
import PartnerDashboard from "@/components/PartnerDashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  // For demo purposes - in a real application, this would come from authentication
  const [userRole, setUserRole] = useState<"admin" | "partner">("admin");
  
  // Mock data fetch for demonstration - would be real data in production
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/me'],
    throwOnError: true,
  });
  
  // Toggle role for demo purposes
  const toggleRole = () => {
    setUserRole(prev => prev === "admin" ? "partner" : "admin");
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Demo role switcher */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-medium">Current View: {userRole === "admin" ? "Admin" : "Partner"}</h3>
              <p className="text-sm text-gray-500">For demo purposes only</p>
            </div>
            <Button onClick={toggleRole}>
              Switch to {userRole === "admin" ? "Partner" : "Admin"} View
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {userRole === "admin" ? <AdminDashboard /> : <PartnerDashboard />}
    </div>
  );
};

export default Dashboard;
