import { Configuration, PublicClientApplication } from "@azure/msal-browser";
import { apiRequest } from "./queryClient";

// Simplest possible MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: "",
    authority: "https://login.microsoftonline.com/common/",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

// Login request scopes
export const loginRequest = {
  scopes: ["User.Read"],
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Function to handle Microsoft login
export async function openMicrosoftLoginPage() {
  try {
    // Get Azure configuration from server
    const response = await fetch("/api/azure-config");
    const config = await response.json();
    
    if (!config?.clientId || !config?.tenantId) {
      throw new Error("Invalid Azure configuration");
    }
    
    // Use direct URL to Microsoft login page without MSAL
    // This is the simplest approach and should avoid endsWith error
    const url = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize` +
      `?client_id=${config.clientId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(window.location.origin)}` +
      `&scope=openid profile email` +
      `&response_mode=query`;
    
    // Navigate directly to the login page
    window.location.href = url;
    
    return true;
  } catch (error) {
    console.error("Error opening Microsoft login page:", error);
    throw error;
  }
}

// Initialize function - just fetches config for logging
export async function initializeMsal() {
  const response = await fetch("/api/azure-config");
  const config = await response.json();
  
  console.log("MSAL config:", config);
  
  return msalInstance;
}