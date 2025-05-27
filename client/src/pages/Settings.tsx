import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Shield, 
  BellRing, 
  Mail, 
  Check, 
  Save, 
  RefreshCw,
  Key
} from "lucide-react";

// Profile schema
const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
});

// Notification schema
const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  partnerUpdates: z.boolean().default(true),
  approvalRequests: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

// Security schema
const securitySchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

// API settings schema
const apiSettingsSchema = z.object({
  apiKey: z.string().optional(),
  webhookUrl: z.string().url({ message: "Please enter a valid URL." }).optional(),
  allowedIps: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;
type ApiSettingsFormValues = z.infer<typeof apiSettingsSchema>;

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "John Smith",
      email: "john@acmecorp.com",
      companyName: "Acme Corporation",
      jobTitle: "IT Manager",
      phone: "555-123-4567",
    },
  });
  
  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      partnerUpdates: true,
      approvalRequests: true,
      securityAlerts: true,
      marketingEmails: false,
    },
  });
  
  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // API settings form
  const apiSettingsForm = useForm<ApiSettingsFormValues>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      apiKey: "sk_test_51JU5TvKGT123HHnda8daa8e6Z",
      webhookUrl: "https://example.com/webhooks/partner",
      allowedIps: "192.168.1.1, 10.0.0.1",
    },
  });
  
  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
    setIsLoading(true);
    // In a real app, you would submit this data to your API
    setTimeout(() => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle notification form submission
  const onNotificationSubmit = (data: NotificationFormValues) => {
    setIsLoading(true);
    // In a real app, you would submit this data to your API
    setTimeout(() => {
      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been updated successfully.",
      });
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle security form submission
  const onSecuritySubmit = (data: SecurityFormValues) => {
    setIsLoading(true);
    // In a real app, you would submit this data to your API
    setTimeout(() => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle API settings form submission
  const onApiSettingsSubmit = (data: ApiSettingsFormValues) => {
    setIsLoading(true);
    // In a real app, you would submit this data to your API
    setTimeout(() => {
      toast({
        title: "API settings updated",
        description: "Your API settings have been updated successfully.",
      });
      setIsLoading(false);
    }, 1000);
  };
  
  // Regenerate API key
  const regenerateApiKey = () => {
    setIsLoading(true);
    // In a real app, you would call your API to generate a new key
    setTimeout(() => {
      const newApiKey = "sk_test_" + Math.random().toString(36).substring(2, 15);
      apiSettingsForm.setValue("apiKey", newApiKey);
      toast({
        title: "API key regenerated",
        description: "Your new API key has been generated. Make sure to update your applications.",
      });
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-600">Manage your account settings and preferences</p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form 
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)} 
                  className="space-y-6"
                  id="profile-form"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Corporation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="IT Manager" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="555-123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => profileForm.reset()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="profile-form"
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form 
                  onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                  className="space-y-6"
                  id="notification-form"
                >
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Receive email notifications for important updates
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Notification Types</h3>
                      
                      <FormField
                        control={notificationForm.control}
                        name="partnerUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Partner Updates</FormLabel>
                              <FormDescription className="text-xs">
                                Updates about your partner's status changes
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="approvalRequests"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Approval Requests</FormLabel>
                              <FormDescription className="text-xs">
                                Notifications for new approval requests
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="securityAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Security Alerts</FormLabel>
                              <FormDescription className="text-xs">
                                Important security-related notifications
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Marketing Emails</FormLabel>
                              <FormDescription className="text-xs">
                                Receive updates about new features and promotional offers
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => notificationForm.reset()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="notification-form"
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form 
                  onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
                  className="space-y-6"
                  id="security-form"
                >
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Change Password</h3>
                    
                    <FormField
                      control={securityForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => securityForm.reset()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="security-form"
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Update Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* API Settings */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Manage your API keys and webhook configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiSettingsForm}>
                <form 
                  onSubmit={apiSettingsForm.handleSubmit(onApiSettingsSubmit)}
                  className="space-y-6"
                  id="api-form"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <FormField
                        control={apiSettingsForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input {...field} readOnly />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={regenerateApiKey}
                                disabled={isLoading}
                              >
                                Regenerate
                              </Button>
                            </div>
                            <FormDescription>
                              Your API key provides access to the Partner API. Keep it secure.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={apiSettingsForm.control}
                      name="webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourdomain.com/webhook" {...field} />
                          </FormControl>
                          <FormDescription>
                            Events will be sent to this URL when they occur in the system.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiSettingsForm.control}
                      name="allowedIps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allowed IP Addresses</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter comma-separated IP addresses" 
                              className="min-h-24"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Restrict API access to these IP addresses. Leave empty to allow all.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => apiSettingsForm.reset()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="api-form"
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save API Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
