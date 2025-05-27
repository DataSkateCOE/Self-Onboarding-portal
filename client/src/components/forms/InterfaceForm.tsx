import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InterfaceFormData, interfaceSchema } from "@shared/schema";
import { useState, useMemo, useEffect } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useQuery } from "@tanstack/react-query";

interface InterfaceFormProps {
  formData: InterfaceFormData;
  onUpdate: (data: InterfaceFormData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const InterfaceForm = ({ formData, onUpdate, onNext, onPrevious }: InterfaceFormProps) => {
  const form = useForm<InterfaceFormData>({
    resolver: zodResolver(interfaceSchema),
    defaultValues: formData,
  });
  
  const [direction, setDirection] = useState(formData.direction || "send");

  const handleDirectionChange = (dir: string) => {
    setDirection(dir);
    if (onUpdate) {
      onUpdate({ ...form.getValues(), direction: dir });
    }
  };

  // Watch protocol to conditionally render fields
  const protocol = form.watch("protocol");

  // Auth types and format types based on protocol
  const authTypes = useMemo(() => {
    if (protocol === "sftp" || protocol === "ftp") {
      return [
        { value: "basic", label: "Basic" },
        { value: "identityKey", label: "Identity Key" },
        { value: "basicIdentityKey", label: "Basic + Identity Key" },
      ];
    }
    return [
      { value: "basic", label: "Basic Authentication" },
      { value: "oauth2", label: "OAuth 2.0" },
      { value: "certificate", label: "Certificate-based" },
      { value: "apiKey", label: "API Key" },
    ];
  }, [protocol]);

  const formatTypes = useMemo(() => {
    if (protocol === "sftp" || protocol === "ftp") {
      return [
        { value: "edi", label: "EDI" },
        { value: "nonEdi", label: "Non EDI" },
      ];
    }
    return [];
  }, [protocol]);

  const protocols = [
    { value: "https", label: "HTTPS" },
    { value: "sftp", label: "SFTP" },
    { value: "ftp", label: "FTP" },
    { value: "as2", label: "AS2" }
  ];
  
  const addEndpoint = () => {
    const endpoints = form.getValues("endpoints") || [];
    form.setValue("endpoints", [...endpoints, { name: "", url: "" }]);
  };
  
  const removeEndpoint = (index: number) => {
    const endpoints = form.getValues("endpoints") || [];
    if (endpoints.length > 1) {
      form.setValue("endpoints", endpoints.filter((_, i) => i !== index));
    }
  };
  
  const onSubmit = (data: InterfaceFormData) => {
    console.log("[InterfaceForm] Submitting data:", data);
    try {
      onUpdate(data);
      onNext();
    } catch (err) {
      console.error("[InterfaceForm] Error during submit:", err);
    }
  };
  
  const authType = form.watch("authType");

  // Fetch certificates for Identity Key dropdown
  const { data: certificates = [], isLoading: certificatesLoading } = useQuery({
    queryKey: ["/api/certificates"],
  });

  // Ensure at least one endpoint for non-SFTP/FTP protocols
  useEffect(() => {
    if ((protocol !== "sftp" && protocol !== "ftp") && (!form.getValues("endpoints") || form.getValues("endpoints").length === 0)) {
      form.setValue("endpoints", [{ name: "", url: "" }]);
    }
  }, [protocol]);

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 mb-4">Interface Configuration</h3>
      <p className="text-sm text-gray-600 mb-6">Configure your communication protocols and endpoints.</p>
      <div className="mb-6">
        <ToggleGroup
          type="single"
          value={direction}
          onValueChange={(val) => {
            if (val) handleDirectionChange(val);
          }}
          className="w-full"
        >
          <ToggleGroupItem
            value="send"
            className="w-1/2 data-[state=on]:bg-red-600 data-[state=on]:text-white"
          >
            Send to Partner
          </ToggleGroupItem>
          <ToggleGroupItem
            value="receive"
            className="w-1/2 data-[state=on]:bg-red-600 data-[state=on]:text-white"
          >
            Receive from Partner
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="protocol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Communication Protocol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a protocol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="https">HTTPS</SelectItem>
                      <SelectItem value="sftp">SFTP</SelectItem>
                      <SelectItem value="ftp">FTP</SelectItem>
                      <SelectItem value="as2">AS2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authentication Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select authentication type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* HTTPS options */}
                      {protocol === "https" && <>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="apiKey">API key</SelectItem>
                      </>}
                      {/* SFTP/FTP options */}
                      {(protocol === "sftp" || protocol === "ftp") && <>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="identityKey">Identity Key</SelectItem>
                        <SelectItem value="basicIdentityKey">Basic + Identity Key</SelectItem>
                      </>}
                      {/* AS2 or other protocols can have their own options here if needed */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* HTTPS-specific fields */}
          {protocol === "https" && (
            <div className="space-y-4">
              {/* Username & Password for Basic */}
              {form.watch("authType") === "basic" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {/* HTTP header name & API key for API key */}
              {form.watch("authType") === "apiKey" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="httpHeaderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HTTP header name</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apiKeyValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API key</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* SFTP/FTP-specific fields */}
          {(protocol === "sftp" || protocol === "ftp") && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host</FormLabel>
                      <FormControl>
                        <Input placeholder="localhost" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input placeholder="21" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="characterEncoding"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character encoding override</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select character encoding" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="utf-8">UTF-8</SelectItem>
                        <SelectItem value="ascii">ASCII</SelectItem>
                        <SelectItem value="latin1">Latin-1</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Username & Password for Basic or Basic + Identity Key */}
              {(form.watch("authType") === "basic" || form.watch("authType") === "basicIdentityKey") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {/* Identity Key dropdown for Identity Key or Basic + Identity Key */}
              {(form.watch("authType") === "identityKey" || form.watch("authType") === "basicIdentityKey") && (
                <FormField
                  control={form.control}
                  name="identityKeyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identity Key</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an identity key" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {certificatesLoading ? (
                            <div className="p-2 text-center">Loading certificates...</div>
                          ) : certificates.length > 0 ? (
                            certificates.map(cert => (
                              <SelectItem key={cert.id} value={cert.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <span>{cert.alias || cert.fileName}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center">No certificates found</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="sourcePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source path</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supportFormatType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Format type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="edi">EDI</SelectItem>
                        <SelectItem value="nonEdi">Non EDI</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fileNamePattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File name pattern</FormLabel>
                    <FormControl>
                      <Input placeholder="*" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="archivalPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Archival path</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          
          {/* Endpoints for non-SFTP/FTP/HTTPS protocols, only if protocol is selected */}
          {(protocol && protocol !== "sftp" && protocol !== "ftp" && protocol !== "https") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Endpoints</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEndpoint}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Endpoint
                </Button>
              </div>
              {form.watch("endpoints")?.map((_, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start border border-gray-200 rounded-md p-4">
                  <FormField
                    control={form.control}
                    name={`endpoints.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endpoint Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Production API" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`endpoints.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/api" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEndpoint(index)}
                      className="mt-8"
                      disabled={form.watch("endpoints")?.length <= 1}
                    >
                      <MinusCircle className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Previous
            </Button>
            <Button type="submit">
              Next Step
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default InterfaceForm;
