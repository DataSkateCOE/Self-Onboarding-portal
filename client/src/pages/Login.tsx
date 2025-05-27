import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { LogIn, AlertCircle } from "lucide-react";
import { BsMicrosoft } from "react-icons/bs";

import { msalInstance, loginRequest, initializeMsal, msalConfig, openMicrosoftLoginPage } from "@/lib/auth";
import logo from "@/assets/logo.png";
import rocket from "@/assets/rocket.gif";

// Form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Form setup
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });
  
  // Initialize MSAL when component mounts
  useEffect(() => {
    const init = async () => {
      try {
        await initializeMsal();
      } catch (error) {
        console.error("Failed to initialize MSAL:", error);
      }
    };
    
    init();
  }, []);
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => {
      return apiRequest({
        url: "/api/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      setLoginError(error.message || "Invalid username or password");
    },
  });
  
  // Handle form submission
  const onSubmit = (data: LoginFormValues) => {
    setLoginError(null);
    loginMutation.mutate(data);
  };

  // Handle Microsoft login with simplified direct URL approach
  const handleMicrosoftLogin = async () => {
    try {
      setLoginError(null);
      console.log("Starting Microsoft login with direct URL approach");
      
      // This will navigate directly to Microsoft login page
      // No popup, no complex MSAL configuration needed
      await openMicrosoftLoginPage();
      
      // Note: The redirection happens automatically, so this code
      // after the openMicrosoftLoginPage() call won't execute immediately
      
    } catch (error: any) {
      console.error("Microsoft login error:", error);
      setLoginError("Failed to login with Microsoft: " + (error?.message || "Unknown error"));
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - hero section with red background */}
      <div className="hidden md:flex md:w-2/3 bg-red-600 flex-col p-12 justify-between relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-red-500 opacity-80 -top-10 -right-10 z-0"></div>
        <div className="absolute w-96 h-96 rounded-full bg-red-700 opacity-60 -bottom-10 -left-10 z-0"></div>
        <div className="z-10">
          
        </div>
        
        <div className="flex justify-center items-center z-10">
          <img 
            src={rocket}
            alt="Rocket" 
            className="w-100 h-100 object-contain rocket-animation"
          />
        </div>
        
        <div className="z-10 text-white/80 text-sm">
          <p>Designed with passion. Built for Precision. Trusted by Experts.</p>
          <p>© Proprietary Copyright Reserved</p>
        </div>
      </div>
      
      {/* Right side - login form */}
      <div className="w-full md:w-1/3 flex items-center justify-center bg-black p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
          <img
            src={logo}
            alt="DataSkate Logo"
            className="mx-auto mb-4 w-48 h-48 object-contain"
          />
            <p className="text-gray-400">Partner Onboarding Portal</p>
          </div>
          
          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                {...form.register("username")}
                placeholder="user@dataskate.io"
                className="bg-black border-gray-700 text-white"
              />
              {form.formState.errors.username && (
                <p className="text-red-500 text-sm">{form.formState.errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Input
                {...form.register("password")}
                type="password"
                placeholder="••••••••"
                className="bg-black border-gray-700 text-white"
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe" 
                  {...form.register("rememberMe")}
                />
                <label 
                  htmlFor="rememberMe" 
                  className="text-sm text-gray-400 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              
              <a href="#" className="text-sm text-gray-400 hover:text-white">
                Forgot Password?
              </a>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  SIGNING IN...
                </span>
              ) : "SIGN IN"}
            </Button>
            
            <div className="text-center">
              <span className="text-gray-500">or</span>
            </div>
            
            <Button 
              type="button"
              onClick={handleMicrosoftLogin}
              className="w-full bg-transparent border border-gray-700 text-white hover:bg-gray-800"
              variant="outline"
            >
              <BsMicrosoft className="mr-2 h-4 w-4" />
              Sign in with Microsoft
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;