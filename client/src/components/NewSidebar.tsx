import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { SidebarProps, NavSection } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, FileText, Users, Home, PlusCircle, Clock, ChevronRight, CheckCircle, Shield } from "lucide-react";
import { useState } from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { DataSkateLogo } from "@/assets/dataskate-logo";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarNavHeader,
  SidebarNavHeaderTitle,
  SidebarNavLink,
} from "@/components/ui/sidebar";
import dataskateLogo from "@/assets/DataSkate-logo-16_9 (Main).png";

const navSections: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: Home,
      },
      {
        label: "New Onboarding",
        href: "/new-onboarding",
        icon: PlusCircle,
      },
      {
        label: "Pending Approvals",
        href: "/pending-approvals",
        icon: Clock,
      },
      {
        label: "Completed Approvals",
        href: "/completed-approvals",
        icon: CheckCircle,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Partners",
        href: "/partners",
        icon: Users,
      },
      {
        label: "Documents",
        href: "/documents",
        icon: FileText,
      },
      {
        label: "Certificate Management",
        href: "/certificates",
        icon: Shield,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

const NewSidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const [location] = useLocation();
  const [user] = useState({
    name: "Admin User",
    role: "Administrator",
    initials: "AU",
  });

  if (!isOpen) return null;

  return (
    <aside className="hidden md:block">
      <Sidebar className="w-64 h-screen border-r rounded-none">
        <SidebarHeader className="h-18 flex items-center px-4">
          <div className="flex justify-center w-full">
            <img src={dataskateLogo} alt="DataSkate Logo" className="h-16 w-auto" />
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-2">
          {navSections.map((section, index) => (
            <div key={index} className="mb-6">
              <SidebarNavHeader>
                <SidebarNavHeaderTitle className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </SidebarNavHeaderTitle>
              </SidebarNavHeader>
              
              <SidebarNav>
                {section.items.map((item, itemIndex) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <SidebarNavLink 
                      key={itemIndex} 
                      href={item.href}
                      isActive={isActive}
                      className={isActive ? "bg-primary/10 text-primary" : ""}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                      {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                    </SidebarNavLink>
                  );
                })}
              </SidebarNav>
            </div>
          ))}
          
          <div className="mt-6 p-4">
            <div className="bg-accent/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Need Help?</h4>
              <p className="text-xs text-muted-foreground mb-3">Contact our support team for assistance with the onboarding process.</p>
              <Button 
                variant="outline" 
                className="w-full text-xs"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </SidebarContent>
        
        <SidebarFooter className="p-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarFooter>
      </Sidebar>
    </aside>
  );
};

export default NewSidebar;