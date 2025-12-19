import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  X,
  Building,
  Grid3X3,
  Images,
  Settings,
  Save,
  Plus,
  Edit,
  Trash2,
  ProjectorIcon,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  FileText
} from "lucide-react";
import type { Company, Platform, LegalDocument } from "@shared/schema";
import { insertCompanySchema, insertPlatformSchema, insertLegalDocumentSchema } from "@shared/schema";

interface AdminPanelProps {
  company?: Company;
  platforms: Platform[];
  onClose: () => void;
}

type AdminSection = "company" | "platforms" | "legal" | "media" | "settings";

const companyFormSchema = insertCompanySchema.extend({
  id: z.number().optional(),
  logo: z.string().nullable().transform(val => val ?? ""),
  logoHeight: z.number().nullable().transform(val => val ?? 40),
  showNameWithLogo: z.boolean().nullable().transform(val => val ?? false),
  contactEmail: z.string().nullable().transform(val => val ?? ""),
  siteTitle: z.string().nullable().transform(val => val ?? ""),
  maintenanceMode: z.boolean().nullable().transform(val => val ?? false),
  footerBlurb: z.string().nullable().transform(val => val ?? ""),
  showPlatforms: z.boolean().nullable().transform(val => val ?? true),
  showAbout: z.boolean().nullable().transform(val => val ?? true),
  showContact: z.boolean().nullable().transform(val => val ?? true),
});

const platformFormSchema = insertPlatformSchema;
const legalDocumentFormSchema = insertLegalDocumentSchema;

export default function AdminPanel({ company, platforms, onClose }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("company");
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [editingDocument, setEditingDocument] = useState<LegalDocument | null>(null);
  const [showPlatformForm, setShowPlatformForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [platformToToggle, setPlatformToToggle] = useState<Platform | null>(null);
  const [importUrl, setImportUrl] = useState("");
  const [logoPreviewError, setLogoPreviewError] = useState(false);
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all platforms (including inactive) for admin view
  const { data: adminPlatforms = [], isLoading: adminPlatformsLoading } = useQuery<Platform[]>({
    queryKey: ["/api/platforms", { includeInactive: true }],
    queryFn: async () => {
      const response = await fetch("/api/platforms?includeInactive=true");
      if (!response.ok) throw new Error("Failed to fetch platforms");
      return response.json();
    },
  });

  // Company form
  const companyForm = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company?.name ?? "",
      logo: company?.logo ?? "",
      logoHeight: company?.logoHeight ?? 40,
      showNameWithLogo: company?.showNameWithLogo ?? false,
      heroTitle: company?.heroTitle ?? "",
      heroDescription: company?.heroDescription ?? "",
      aboutTitle: company?.aboutTitle ?? "",
      aboutDescription: company?.aboutDescription ?? "",
      contactEmail: company?.contactEmail ?? "",
      siteTitle: company?.siteTitle ?? "",
      maintenanceMode: company?.maintenanceMode ?? false,
      footerBlurb: company?.footerBlurb ?? "",
      showPlatforms: company?.showPlatforms ?? true,
      showAbout: company?.showAbout ?? true,
      showContact: company?.showContact ?? true,
    },
  });

  // Platform form
  const platformForm = useForm<z.infer<typeof platformFormSchema>>({
    resolver: zodResolver(platformFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      link: "",
      logo: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  // Legal document form
  const documentForm = useForm<z.infer<typeof legalDocumentFormSchema>>({
    resolver: zodResolver(legalDocumentFormSchema),
    defaultValues: {
      type: "",
      title: "",
      content: "",
      isActive: true,
    },
  });

  // Fetch legal documents
  const { data: legalDocuments = [], isLoading: documentsLoading } = useQuery<LegalDocument[]>({
    queryKey: ["/api/legal-documents"],
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof companyFormSchema>) => {
      const response = await apiRequest("PUT", `/api/company/${company?.id || 1}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company"] });
      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update company information",
        variant: "destructive",
      });
    },
  });

  // Create platform mutation
  const createPlatformMutation = useMutation({
    mutationFn: async (data: z.infer<typeof platformFormSchema>) => {
      const response = await apiRequest("POST", "/api/platforms", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/platforms", { includeInactive: true }] });
      toast({
        title: "Success",
        description: "Platform created successfully",
      });
      setShowPlatformForm(false);
      platformForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create platform",
        variant: "destructive",
      });
    },
  });

  // Update platform mutation
  const updatePlatformMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof platformFormSchema> }) => {
      const response = await apiRequest("PUT", `/api/platforms/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/platforms", { includeInactive: true }] });
      toast({
        title: "Success",
        description: "Platform updated successfully",
      });
      setEditingPlatform(null);
      platformForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update platform",
        variant: "destructive",
      });
    },
  });

  // Delete platform mutation
  const deletePlatformMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/platforms/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/platforms", { includeInactive: true }] });
      toast({
        title: "Success",
        description: "Platform deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete platform",
        variant: "destructive",
      });
    },
  });

  // Toggle platform active status mutation
  const togglePlatformMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/platforms/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/platforms", { includeInactive: true }] });
      toast({
        title: "Success",
        description: "Platform status updated successfully",
      });
      setShowToggleConfirm(false);
      setPlatformToToggle(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update platform status",
        variant: "destructive",
      });
    },
  });

  // Extract from URL mutation
  const extractFromUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/platforms/extract-from-url", { url });
      return response.json();
    },
    onSuccess: (data) => {
      setEditingPlatform(null); // Clear editing state
      platformForm.reset({
        name: data.name,
        description: data.description,
        category: data.category,
        link: data.link,
        logo: data.logo,
        isActive: data.isActive,
        sortOrder: adminPlatforms.length + 1,
      });
      setShowUrlImport(false);
      setImportUrl("");
      setShowPlatformForm(true);
      toast({
        title: "Success",
        description: "Business data extracted! Review and save the platform.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to extract data from URL. Please try again or enter manually.",
        variant: "destructive",
      });
    },
  });

  // Create legal document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof legalDocumentFormSchema>) => {
      const response = await apiRequest("POST", "/api/legal-documents", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal-documents"] });
      toast({
        title: "Success",
        description: "Legal document created successfully",
      });
      setShowDocumentForm(false);
      documentForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create legal document",
        variant: "destructive",
      });
    },
  });

  // Update legal document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof legalDocumentFormSchema> }) => {
      const response = await apiRequest("PUT", `/api/legal-documents/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal-documents"] });
      toast({
        title: "Success",
        description: "Legal document updated successfully",
      });
      setEditingDocument(null);
      documentForm.reset();
      setShowDocumentForm(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update legal document",
        variant: "destructive",
      });
    },
  });

  // Delete legal document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/legal-documents/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal-documents"] });
      toast({
        title: "Success",
        description: "Legal document deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete legal document",
        variant: "destructive",
      });
    },
  });

  const onCompanySubmit = (data: z.infer<typeof companyFormSchema>) => {
    updateCompanyMutation.mutate(data);
  };

  const onPlatformSubmit = (data: z.infer<typeof platformFormSchema>) => {
    if (editingPlatform) {
      updatePlatformMutation.mutate({ id: editingPlatform.id, data });
    } else {
      createPlatformMutation.mutate(data);
    }
  };

  const onDocumentSubmit = (data: z.infer<typeof legalDocumentFormSchema>) => {
    if (editingDocument) {
      updateDocumentMutation.mutate({ id: editingDocument.id, data });
    } else {
      createDocumentMutation.mutate(data);
    }
  };

  const handleEditPlatform = (platform: Platform) => {
    setEditingPlatform(platform);
    platformForm.reset({
      name: platform.name,
      description: platform.description,
      category: platform.category,
      link: platform.link,
      logo: platform.logo || "",
      isActive: platform.isActive,
      sortOrder: platform.sortOrder,
    });
    setShowPlatformForm(true);
  };

  const handleAddPlatform = () => {
    setEditingPlatform(null);
    platformForm.reset({
      name: "",
      description: "",
      category: "",
      link: "",
      logo: "",
      isActive: true,
      sortOrder: adminPlatforms.length + 1,
    });
    setShowPlatformForm(true);
  };

  const handleImportFromUrl = () => {
    setShowUrlImport(true);
  };

  const handleExtractUrl = () => {
    if (!importUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    extractFromUrlMutation.mutate(importUrl);
  };

  const handleEditDocument = (document: LegalDocument) => {
    setEditingDocument(document);
    documentForm.reset({
      type: document.type,
      title: document.title,
      content: document.content,
      isActive: document.isActive,
    });
    setShowDocumentForm(true);
  };

  const handleAddDocument = () => {
    setEditingDocument(null);
    documentForm.reset({
      type: "",
      title: "",
      content: "",
      isActive: true,
    });
    setShowDocumentForm(true);
  };

  const handleTogglePlatform = (platform: Platform) => {
    setPlatformToToggle(platform);
    setShowToggleConfirm(true);
  };

  const confirmTogglePlatform = () => {
    if (platformToToggle) {
      togglePlatformMutation.mutate({
        id: platformToToggle.id,
        isActive: !platformToToggle.isActive,
      });
    }
  };

  const navItems = [
    { id: "company" as AdminSection, label: "Company Info", icon: Building },
    { id: "platforms" as AdminSection, label: "Manage Platforms", icon: Grid3X3 },
    { id: "legal" as AdminSection, label: "Legal Documents", icon: FileText },
    { id: "media" as AdminSection, label: "Media Library", icon: Images },
    { id: "settings" as AdminSection, label: "Settings", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-lamplight-primary flex items-center">
            <Settings className="h-6 w-6 mr-2" />
            Lamplight Technology - Admin Panel
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-5rem)]">
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 p-6 border-r border-slate-200">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      activeSection === item.id 
                        ? "bg-lamplight-accent text-white" 
                        : "text-slate-600 hover:bg-slate-200"
                    }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === "company" && (
              <div>
                <h3 className="text-xl font-semibold text-lamplight-primary mb-6">Company Information</h3>
                <Form {...companyForm}>
                  <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-6">
                    <FormField
                      control={companyForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Logo</FormLabel>
                          <div className="space-y-2">
                            <FormControl>
                              <Input 
                                {...field}
                                value={field.value || ""}
                                placeholder="https://example.com/logo.png"
                                onChange={(e) => {
                                  field.onChange(e);
                                  setLogoPreviewError(false);
                                }}
                              />
                            </FormControl>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-500">or</span>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 5000000) {
                                      toast({
                                        title: "Error",
                                        description: "Image must be less than 5MB",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      field.onChange(reader.result as string);
                                      setLogoPreviewError(false);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="flex-1"
                                data-testid="input-logo-upload"
                              />
                            </div>
                          </div>
                          <FormMessage />
                          {field.value && !logoPreviewError && (
                            <div className="mt-2">
                              <img 
                                src={field.value} 
                                alt="Logo preview" 
                                className="h-16 w-auto object-contain border border-slate-200 rounded p-2"
                                onError={() => setLogoPreviewError(true)}
                              />
                            </div>
                          )}
                          {logoPreviewError && field.value && (
                            <p className="text-sm text-red-500 mt-2">
                              Unable to load image. Please check the URL or upload a valid image file.
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={companyForm.control}
                        name="logoHeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo Height (pixels)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min={20}
                                max={120}
                                {...field}
                                value={field.value ?? 40}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 40)}
                                data-testid="input-logo-height"
                              />
                            </FormControl>
                            <p className="text-xs text-slate-500">Height of logo in the header (20-120px)</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={companyForm.control}
                        name="showNameWithLogo"
                        render={({ field }) => (
                          <FormItem className="flex flex-col justify-end">
                            <div className="flex items-center space-x-3 pb-2">
                              <FormControl>
                                <Switch
                                  checked={field.value ?? false}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-show-name-with-logo"
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">Show company name with logo</FormLabel>
                            </div>
                            <p className="text-xs text-slate-500">Display company name text next to the logo</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={companyForm.control}
                      name="heroTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hero Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="heroDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hero Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="aboutTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="aboutDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="footerBlurb"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Footer Blurb</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} placeholder="Company description shown in footer" value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-lg font-semibold text-lamplight-primary mb-4">Section Visibility</h4>
                      <p className="text-sm text-slate-600 mb-4">Control which sections appear on your website. Disabled sections will be hidden from navigation, the page, and the footer.</p>
                      
                      <div className="space-y-4">
                        <FormField
                          control={companyForm.control}
                          name="showPlatforms"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                              <div>
                                <FormLabel className="text-base font-medium">Show Platforms Section</FormLabel>
                                <p className="text-sm text-slate-600">Display the platforms showcase and related navigation links</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-show-platforms"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={companyForm.control}
                          name="showAbout"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                              <div>
                                <FormLabel className="text-base font-medium">Show About Section</FormLabel>
                                <p className="text-sm text-slate-600">Display the about section and related navigation links</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-show-about"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={companyForm.control}
                          name="showContact"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                              <div>
                                <FormLabel className="text-base font-medium">Show Contact Section</FormLabel>
                                <p className="text-sm text-slate-600">Display the contact section and related navigation links</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-show-contact"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-lamplight-accent hover:bg-blue-600 text-white"
                      disabled={updateCompanyMutation.isPending}
                      data-testid="button-save-company"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateCompanyMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </div>
            )}

            {activeSection === "platforms" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-lamplight-primary">Manage Platforms</h3>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleImportFromUrl}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      data-testid="button-import-url"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Import from URL
                    </Button>
                    <Button 
                      onClick={handleAddPlatform}
                      className="bg-lamplight-success hover:bg-emerald-600 text-white"
                      data-testid="button-add-platform"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Platform
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {adminPlatformsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lamplight-accent mx-auto"></div>
                      <p className="text-slate-600 mt-2">Loading platforms...</p>
                    </div>
                  ) : (
                    adminPlatforms.map((platform) => (
                      <Card key={platform.id} className="bg-slate-50 border border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ProjectorIcon className="h-6 w-6 text-lamplight-accent" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-lamplight-primary">{platform.name}</h4>
                                <p className="text-sm text-slate-600">{platform.category}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={platform.isActive ? "default" : "secondary"}>
                                    {platform.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={platform.isActive ?? false}
                                      onCheckedChange={() => handleTogglePlatform(platform)}
                                      disabled={togglePlatformMutation.isPending}
                                      data-testid={`switch-platform-${platform.id}`}
                                    />
                                    <span className="text-xs text-slate-500">
                                      {platform.isActive ? "Enabled" : "Disabled"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditPlatform(platform)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deletePlatformMutation.mutate(platform.id)}
                                disabled={deletePlatformMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSection === "legal" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-lamplight-primary">Legal Documents</h3>
                  <Button
                    onClick={handleAddDocument}
                    className="bg-lamplight-success hover:bg-emerald-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                </div>
                <div className="space-y-4">
                  {documentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lamplight-accent mx-auto"></div>
                      <p className="text-slate-600 mt-2">Loading documents...</p>
                    </div>
                  ) : legalDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">No legal documents found</p>
                    </div>
                  ) : (
                    legalDocuments.map((document) => (
                      <Card key={document.id} className="bg-slate-50 border border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-lamplight-accent" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-lamplight-primary">{document.title}</h4>
                                <p className="text-sm text-slate-600 capitalize">{document.type}</p>
                                <Badge variant={document.isActive ? "default" : "secondary"}>
                                  {document.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/legal/${document.type}`, '_blank')}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDocument(document)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteDocumentMutation.mutate(document.id)}
                                disabled={deleteDocumentMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSection === "media" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-lamplight-primary">Media Library</h3>
                  <Button className="bg-lamplight-success hover:bg-emerald-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Media
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-100 rounded-lg p-4 text-center">
                    <Images className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">No media files</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "settings" && (
              <div>
                <h3 className="text-xl font-semibold text-lamplight-primary mb-6">System Settings</h3>
                <Form {...companyForm}>
                  <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-6">
                    <FormField
                      control={companyForm.control}
                      name="siteTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="maintenanceMode"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch 
                              id="maintenance" 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel htmlFor="maintenance" className="!mt-0">Maintenance Mode</FormLabel>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="bg-lamplight-accent hover:bg-blue-600 text-white"
                      disabled={updateCompanyMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateCompanyMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Platform Form Dialog */}
      <Dialog open={showPlatformForm} onOpenChange={setShowPlatformForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlatform ? "Edit Platform" : "Add Platform"}
            </DialogTitle>
          </DialogHeader>
          <Form {...platformForm}>
            <form onSubmit={platformForm.handleSubmit(onPlatformSubmit)} className="space-y-4">
              <FormField
                control={platformForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={platformForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={platformForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={platformForm.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Link</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={platformForm.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Logo</FormLabel>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value || ""} 
                            type="url"
                            placeholder="https://example.com/logo.png" 
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={generatingLogo || !platformForm.watch("category")}
                          onClick={async () => {
                            const category = platformForm.watch("category");
                            if (!category) {
                              toast({
                                title: "Error",
                                description: "Please enter a category first",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            setGeneratingLogo(true);
                            try {
                              const response = await apiRequest("POST", "/api/platforms/generate-logo", {
                                category,
                                name: platformForm.watch("name")
                              });
                              const data = await response.json();
                              platformForm.setValue("logo", data.logo);
                              toast({
                                title: "Success",
                                description: "Logo generated successfully",
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to generate logo",
                                variant: "destructive",
                              });
                            } finally {
                              setGeneratingLogo(false);
                            }
                          }}
                          data-testid="button-generate-logo"
                        >
                          {generatingLogo ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">or upload an image</span>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5000000) {
                                toast({
                                  title: "Error",
                                  description: "Image must be less than 5MB",
                                  variant: "destructive",
                                });
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                field.onChange(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="flex-1"
                          data-testid="input-platform-logo-upload"
                        />
                      </div>
                      {field.value && (
                        <div className="mt-2">
                          <img 
                            src={field.value} 
                            alt="Logo preview" 
                            className="h-16 w-auto object-contain border border-slate-200 rounded p-2"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={platformForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch 
                        checked={field.value || false} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel>Active</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPlatformForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-lamplight-accent hover:bg-blue-600 text-white"
                  disabled={createPlatformMutation.isPending || updatePlatformMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingPlatform ? "Update" : "Create"} Platform
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* URL Import Dialog */}
      <Dialog open={showUrlImport} onOpenChange={setShowUrlImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Platform from URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Enter a business website URL and our AI will extract the business name, 
              description, category, and find an appropriate image.
            </p>
            <div>
              <Input
                type="url"
                placeholder="https://example.com"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !extractFromUrlMutation.isPending) {
                    handleExtractUrl();
                  }
                }}
                disabled={extractFromUrlMutation.isPending}
                data-testid="input-import-url"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowUrlImport(false);
                  setImportUrl("");
                }}
                disabled={extractFromUrlMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExtractUrl}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={extractFromUrlMutation.isPending}
                data-testid="button-extract-url"
              >
                {extractFromUrlMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Extract Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Legal Document Form Dialog */}
      <Dialog open={showDocumentForm} onOpenChange={setShowDocumentForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? "Edit Legal Document" : "Add Legal Document"}
            </DialogTitle>
          </DialogHeader>
          <Form {...documentForm}>
            <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={documentForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="privacy">Privacy Policy</SelectItem>
                          <SelectItem value="terms">Terms of Service</SelectItem>
                          <SelectItem value="cookies">Cookie Policy</SelectItem>
                          <SelectItem value="support">Support Policy</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={documentForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={documentForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={20} className="font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={documentForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Active</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDocumentForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-lamplight-accent hover:bg-blue-600 text-white"
                  disabled={createDocumentMutation.isPending || updateDocumentMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingDocument ? "Update" : "Create"} Document
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Toggle Platform Confirmation */}
      <AlertDialog open={showToggleConfirm} onOpenChange={setShowToggleConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {platformToToggle?.isActive ? "disable" : "enable"} "{platformToToggle?.name}"?
              {platformToToggle?.isActive 
                ? " This platform will be hidden from the public website." 
                : " This platform will be visible on the public website."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmTogglePlatform}
              className="bg-lamplight-accent hover:bg-blue-600"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
