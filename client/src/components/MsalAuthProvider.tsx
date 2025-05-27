import { ReactNode, useEffect, useState } from "react";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { AccountInfo, InteractionStatus } from "@azure/msal-browser";
import { useLocation } from "wouter";
import { msalInstance, loginRequest, initializeMsal } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

interface MsalAuthCallbackProps {
  children: ReactNode;
}

// This component handles authentication callbacks from Azure AD
const MsalAuthCallback = ({ children }: MsalAuthCallbackProps) => {
  const { instance, inProgress, accounts } = useMsal();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleAuthCallbacks = async () => {
      // Handle redirect response if available - this is now our primary authentication method
      try {
        // Make sure MSAL is initialized first with the correct configuration
        await initializeMsal();
        
        console.log("Checking for redirect response...");
        const response = await instance.handleRedirectPromise();
        
        if (response && response.account) {
          console.log("Redirect login successful!", response.account);
          // Authentication successful, call our backend to synchronize the user
          await syncAzureUser(response.account);
          // Redirect to dashboard
          setLocation("/dashboard");
        } else if (accounts.length > 0) {
          // Already logged in with an account, sync that account
          console.log("Found existing authenticated account:", accounts[0].username);
          await syncAzureUser(accounts[0]);
          
          // If we're on the login page, redirect to dashboard
          if (window.location.pathname === "/login") {
            setLocation("/dashboard");
          }
        } else {
          console.log("No authenticated account found");
        }
      } catch (error) {
        console.error("Error during auth callback handling:", error);
      }
    };

    // Only process redirects when the interaction is complete
    if (inProgress === InteractionStatus.None) {
      handleAuthCallbacks();
    } else {
      console.log("MSAL interaction in progress:", inProgress);
    }
  }, [instance, inProgress, setLocation, accounts]);

  // Function to synchronize Azure user with our backend
  const syncAzureUser = async (account: AccountInfo) => {
    try {
      await apiRequest({
        url: "/api/auth/azure",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: account.homeAccountId,
          username: account.username,
          name: account.name,
          idTokenClaims: account.idTokenClaims,
        }),
      });
    } catch (error) {
      console.error("Error syncing user with backend:", error);
    }
  };

  return <>{children}</>;
};

interface MsalAuthProviderProps {
  children: ReactNode;
}

const MsalAuthProvider = ({ children }: MsalAuthProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeMsal();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize MSAL:", error);
        setIsInitialized(true); // Still set to true so we render children
      }
    };
    
    initialize();
  }, []);
  
  if (!isInitialized) {
    // Return a loading state while MSAL is initializing
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  return (
    <MsalProvider instance={msalInstance}>
      <MsalAuthCallback>{children}</MsalAuthCallback>
    </MsalProvider>
  );
};

export default MsalAuthProvider;