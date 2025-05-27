import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

const Home = () => {
  const [_, setLocation] = useLocation();

  // Redirect to dashboard for now
  useEffect(() => {
    setLocation('/dashboard');
  }, [setLocation]);
  
  return (
    <div className="flex flex-col h-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Partner Portal</CardTitle>
          <CardDescription>
            Self Partner Onboarding Portal streamlines your integration process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Please wait while we redirect you to the dashboard...
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setLocation('/dashboard')}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Home;
