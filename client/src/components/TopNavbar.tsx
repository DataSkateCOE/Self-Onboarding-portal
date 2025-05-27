import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  Menu, 
  Bell, 
  HelpCircle, 
  Settings, 
  UserCircle 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { msalInstance } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface TopNavbarProps {
  onMenuClick: () => void;
}

const TopNavbar = ({ onMenuClick }: TopNavbarProps) => {
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Handle logout
  const handleLogout = async () => {
    try {
      const accounts = msalInstance.getAllAccounts();
      // If using MSAL, we need to logout
      if (accounts.length > 0) {
        await msalInstance.logoutPopup();
      }
      
      // Clear any session cookies on the server side
      await fetch('/api/logout', { method: 'POST' });
      
      // Navigate to login page
      setLocation('/login');
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Get page title based on location
  const getPageTitle = () => {
    switch (location) {
      case "/dashboard":
        return "Dashboard";
      case "/new-onboarding":
        return "New Onboarding";
      case "/pending-approvals":
        return "Pending Approvals";
      case "/partners":
        return "Partners";
      case "/documents":
        return "Documents";
      case "/settings":
        return "Settings";
      default:
        return "Self Partner Onboarding Portal";
    }
  };

  // Generate breadcrumbs based on location
  const getBreadcrumbs = () => {
    const paths = location.split('/').filter(Boolean);
    
    return (
      <nav className="flex text-sm font-medium">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          Home
        </Link>
        
        {paths.map((path, index) => (
          <div key={index} className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            {index === paths.length - 1 ? (
              <span className="text-primary">{path.replace(/-/g, ' ')}</span>
            ) : (
              <Link 
                href={`/${paths.slice(0, index + 1).join('/')}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {path.replace(/-/g, ' ')}
              </Link>
            )}
          </div>
        ))}
      </nav>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {isMobile && (
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMenuClick}
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        )}
        
        <div className="flex-1 flex justify-between items-center">
          <div className="flex items-center md:ml-0">
            <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-600">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-600">
              <HelpCircle className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 flex items-center">
                  <span className="hidden md:flex md:items-center">
                    <span className="ml-1 mr-2 text-sm font-medium text-gray-700">John Smith</span>
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-300">JS</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 py-2 bg-gray-50 border-b border-gray-200">
        {getBreadcrumbs()}
      </div>
    </header>
  );
};

export default TopNavbar;
