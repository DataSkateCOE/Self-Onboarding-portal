import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is authenticated
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/me"],
    queryFn: getQueryFn<any>({ on401: "returnNull" }),
  });

  useEffect(() => {
    if (!isLoading) {
      if (error || !user) {
        // User is not authenticated, redirect to login
        setLocation("/login");
      }
      setIsChecking(false);
    }
  }, [isLoading, error, user, setLocation]);

  // Show loading state while checking authentication
  if (isChecking || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;