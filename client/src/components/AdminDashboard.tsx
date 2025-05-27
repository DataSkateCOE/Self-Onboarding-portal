import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ApprovalTable from "@/components/ApprovalTable";
import { StatCard } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch real data from backend
  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ['/api/approvals/pending'],
  });
  
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });
  
  // Dynamic stats based on real data
  const statsData: StatCard[] = [
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals || 0,
      change: stats?.pendingApprovals ? Math.round((stats.pendingApprovals / (stats.totalPartners || 1)) * 100) : 0,
      icon: Clock,
      iconBgColor: "bg-primary-100",
      iconColor: "text-primary-600",
      href: "/pending-approvals"
    },
    {
      title: "Completed This Month",
      value: stats?.completedThisMonth || 0,
      change: stats?.completedThisMonth ? Math.round((stats.completedThisMonth / (stats.totalPartners || 1)) * 100) : 0,
      icon: CheckCircle,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
      href: "/completed-approvals"
    }
  ];
  
  return (
    <div className="space-y-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Partner Onboarding Dashboard</h2>
          <p className="text-sm text-gray-600">Manage and track partner onboarding progress</p>
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
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {isStatsLoading ? (
          // Loading skeleton for stats
          <>
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </>
        ) : (
          // Real stats data
          statsData.map((stat, index) => {
            const Icon = stat.icon;
            const CardComponent = stat.href ? Link : 'div';
            
            return (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-6">
                  <CardComponent 
                    {...(stat.href ? { href: stat.href } : {})}
                    className="flex items-center"
                  >
                    <div className={`flex-shrink-0 h-12 w-12 ${stat.iconBgColor} rounded-md flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                    <div className="ml-5">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500">{stat.title}</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                          <div className={`ml-2 flex items-baseline text-sm font-medium ${stat.title === "Pending Approvals" ? 'text-red-600' : 'text-green-600'}`}>
                            <span className="ml-0.5">{stat.change}%</span>
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </CardComponent>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Partner Approval Requests Table */}
      <ApprovalTable searchQuery={searchQuery} />
    </div>
  );
};

export default AdminDashboard;
