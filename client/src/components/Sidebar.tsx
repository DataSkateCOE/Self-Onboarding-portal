import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { SidebarProps, NavSection } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { LogOut } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const navSections: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: "ri-dashboard-line",
      },
      {
        label: "New Onboarding",
        href: "/new-onboarding",
        icon: "ri-add-line",
      },
      {
        label: "Pending Approvals",
        href: "/pending-approvals",
        icon: "ri-time-line",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Partners",
        href: "/partners",
        icon: "ri-team-line",
      },
      {
        label: "Documents",
        href: "/documents",
        icon: "ri-file-list-3-line",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: "ri-settings-3-line",
      },
    ],
  },
];

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const [location] = useLocation();
  const [user] = useState({
    name: "John Smith",
    role: "Admin",
    initials: "JS",
  });

  if (!isOpen) return null;

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              SP
            </div>
            <span className="text-gray-800 font-medium text-lg">Partner Portal</span>
          </div>
        </div>
        
        <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
          {navSections.map((section, index) => (
            <div key={index} className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </div>
              
              {section.items.map((item, itemIndex) => {
                const isActive = location === item.href;
                
                return (
                  <Link 
                    key={itemIndex} 
                    href={item.href}
                  >
                    <a 
                      className={cn(
                        "flex items-center px-4 py-2.5 text-sm font-medium",
                        isActive 
                          ? "bg-primary-50 text-primary border-l-2 border-primary" 
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <i className={cn(item.icon, "mr-3 text-lg")}></i>
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </div>
          ))}
          
          <div className="mt-6 px-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Need Help?</h4>
              <p className="text-xs text-gray-600 mb-3">Contact our support team for assistance with your onboarding process.</p>
              <Button 
                variant="outline" 
                className="w-full px-3 py-2 text-xs font-medium text-primary bg-white border border-primary hover:bg-primary-50"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </nav>
        
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-300">{user.initials}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs font-medium text-gray-500">{user.role}</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="ml-auto p-0 h-auto" size="sm">
                    <LogOut className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
