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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  FileText,
  LayoutGrid,
  Tag,
  Upload,
  Copy,
  Eye,
  Clock
} from "lucide-react";
import type { Company, Platform, LegalDocument, AboutFeatureCard, HeroBadge, MediaFile } from "@shared/schema";
import { insertCompanySchema, insertPlatformSchema, insertLegalDocumentSchema, insertAboutFeatureCardSchema, insertHeroBadgeSchema } from "@shared/schema";
import { IconSelector } from "@/components/icon-selector";

type MediaFileMeta = Omit<MediaFile, 'data'>;

function MediaLibrarySection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteMediaId, setDeleteMediaId] = useState<number | null>(null);

  const { data: mediaFiles = [], isLoading: mediaLoading } = useQuery<MediaFileMeta[]>({
    queryKey: ["/api/media"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (fileData: { filename: string; mimeType: string; size: number; data: string; altText?: string }) => {
      const res = await apiRequest("POST", "/api/media", fileData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: "Uploaded", description: "File uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: "Deleted", description: "File deleted successfully" });
      setDeleteMediaId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete file", variant: "destructive" });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Error", description: `${file.name} exceeds 10MB limit`, variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        uploadMutation.mutate({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          data: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const copyUrl = (id: number) => {
    const url = `${window.location.origin}/api/media/${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", description: "URL copied to clipboard" });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-lamplight-primary">Media Library</h3>
        <label>
          <input
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.svg"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button asChild className="bg-lamplight-success hover:bg-emerald-600 text-white cursor-pointer">
            <span>
              <Upload className="h-4 w-4 mr-2" />
              {uploadMutation.isPending ? "Uploading..." : "Upload Media"}
            </span>
          </Button>
        </label>
      </div>

      {mediaLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : mediaFiles.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <Images className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No media files uploaded</p>
          <p className="text-sm text-slate-500 mt-1">Upload images and files to use across your site</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaFiles.map((file) => (
            <Card key={file.id} className="overflow-hidden group">
              <div className="aspect-square bg-slate-100 flex items-center justify-center relative">
                {file.mimeType.startsWith("image/") ? (
                  <img
                    src={`/api/media/${file.id}`}
                    alt={file.altText || file.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="h-12 w-12 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copyUrl(file.id)}
                    title="Copy URL"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(`/api/media/${file.id}`, "_blank")}
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteMediaId(file.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate" title={file.filename}>{file.filename}</p>
                <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteMediaId !== null} onOpenChange={() => setDeleteMediaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media File</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this file. Any places using this file's URL will show a broken image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMediaId && deleteMutation.mutate(deleteMediaId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface AdminPanelProps {
  company?: Company;
  platforms: Platform[];
  onClose: () => void;
}

type AdminSection = "company" | "platforms" | "feature-cards" | "hero-badges" | "legal" | "media" | "settings";

const companyFormSchema = insertCompanySchema.extend({
  id: z.number().optional(),
  logo: z.string().nullable().transform(val => val ?? ""),
  logoHeight: z.number().nullable().transform(val => val ?? 40),
  showNameWithLogo: z.boolean().nullable().transform(val => val ?? false),
  titleFontFamily: z.string().nullable().transform(val => val ?? "Inter"),
  titleFontSize: z.number().nullable().transform(val => val ?? 24),
  titleFontWeight: z.string().nullable().transform(val => val ?? "700"),
  titleColor: z.string().nullable().transform(val => val ?? "#0f172a"),
  sloganText: z.string().nullable().transform(val => val ?? ""),
  sloganFontFamily: z.string().nullable().transform(val => val ?? "Inter"),
  sloganFontSize: z.number().nullable().transform(val => val ?? 14),
  sloganFontWeight: z.string().nullable().transform(val => val ?? "400"),
  sloganColor: z.string().nullable().transform(val => val ?? "#64748b"),
  headerPaddingY: z.number().nullable().transform(val => val ?? 16),
  heroBadge: z.string().nullable().transform(val => val ?? ""),
  heroTitleHighlight: z.string().nullable().transform(val => val ?? ""),
  heroButtonPrimary: z.string().nullable().transform(val => val ?? "Explore Our Platforms"),
  heroButtonSecondary: z.string().nullable().transform(val => val ?? "Learn More"),
  heroBackgroundGradientFrom: z.string().nullable().transform(val => val ?? "#0f172a"),
  heroBackgroundGradientVia: z.string().nullable().transform(val => val ?? "#1e3a8a"),
  heroBackgroundGradientTo: z.string().nullable().transform(val => val ?? "#312e81"),
  heroBlobColor1: z.string().nullable().transform(val => val ?? "#3b82f6"),
  heroBlobColor2: z.string().nullable().transform(val => val ?? "#a855f7"),
  heroBlobColor3: z.string().nullable().transform(val => val ?? "#6366f1"),
  heroBackgroundImage: z.string().nullable().transform(val => val ?? ""),
  heroBackgroundImageOpacity: z.number().nullable().transform(val => val ?? 50),
  heroSideImage: z.string().nullable().transform(val => val ?? ""),
  aboutSectionLabel: z.string().nullable().transform(val => val ?? "Why Choose Us"),
  aboutCardsLayout: z.string().nullable().transform(val => val ?? "3-col"),
  platformsSectionLabel: z.string().nullable().transform(val => val ?? "Our Solutions"),
  platformsTitle: z.string().nullable().transform(val => val ?? ""),
  platformsDescription: z.string().nullable().transform(val => val ?? ""),
  contactSectionLabel: z.string().nullable().transform(val => val ?? "Let's Connect"),
  contactTitle: z.string().nullable().transform(val => val ?? ""),
  contactDescription: z.string().nullable().transform(val => val ?? ""),
  contactButtonText: z.string().nullable().transform(val => val ?? "Contact Us"),
  contactEmail: z.string().nullable().transform(val => val ?? ""),
  siteTitle: z.string().nullable().transform(val => val ?? ""),
  maintenanceMode: z.boolean().nullable().transform(val => val ?? false),
  footerBlurb: z.string().nullable().transform(val => val ?? ""),
  showPlatforms: z.boolean().nullable().transform(val => val ?? true),
  showAbout: z.boolean().nullable().transform(val => val ?? true),
  showContact: z.boolean().nullable().transform(val => val ?? true),
});

const FONT_OPTIONS = [
  "Inter",
  "Roboto", 
  "Open Sans",
  "Poppins",
  "Playfair Display",
  "Montserrat",
  "Lato",
  "Source Sans Pro",
];

const FONT_WEIGHT_OPTIONS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
];

const platformFormSchema = insertPlatformSchema;
const legalDocumentFormSchema = insertLegalDocumentSchema;
const featureCardFormSchema = insertAboutFeatureCardSchema;
const heroBadgeFormSchema = insertHeroBadgeSchema;

export default function AdminPanel({ company, platforms, onClose }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("company");
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [editingDocument, setEditingDocument] = useState<LegalDocument | null>(null);
  const [editingFeatureCard, setEditingFeatureCard] = useState<AboutFeatureCard | null>(null);
  const [editingHeroBadge, setEditingHeroBadge] = useState<HeroBadge | null>(null);
  const [showPlatformForm, setShowPlatformForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showFeatureCardForm, setShowFeatureCardForm] = useState(false);
  const [showHeroBadgeForm, setShowHeroBadgeForm] = useState(false);
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

  // Fetch all feature cards
  const { data: featureCards = [], isLoading: featureCardsLoading } = useQuery<AboutFeatureCard[]>({
    queryKey: ["/api/about-feature-cards"],
  });

  // Fetch all hero badges
  const { data: heroBadges = [], isLoading: heroBadgesLoading } = useQuery<HeroBadge[]>({
    queryKey: ["/api/hero-badges"],
  });

  // Company form
  const companyForm = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company?.name ?? "",
      logo: company?.logo ?? "",
      logoHeight: company?.logoHeight ?? 40,
      showNameWithLogo: company?.showNameWithLogo ?? false,
      titleFontFamily: company?.titleFontFamily ?? "Inter",
      titleFontSize: company?.titleFontSize ?? 24,
      titleFontWeight: company?.titleFontWeight ?? "700",
      titleColor: company?.titleColor ?? "#0f172a",
      sloganText: company?.sloganText ?? "",
      sloganFontFamily: company?.sloganFontFamily ?? "Inter",
      sloganFontSize: company?.sloganFontSize ?? 14,
      sloganFontWeight: company?.sloganFontWeight ?? "400",
      sloganColor: company?.sloganColor ?? "#64748b",
      headerPaddingY: company?.headerPaddingY ?? 16,
      heroBadge: company?.heroBadge ?? "",
      heroTitle: company?.heroTitle ?? "",
      heroTitleHighlight: company?.heroTitleHighlight ?? "",
      heroDescription: company?.heroDescription ?? "",
      heroButtonPrimary: company?.heroButtonPrimary ?? "Explore Our Platforms",
      heroButtonSecondary: company?.heroButtonSecondary ?? "Learn More",
      heroBackgroundGradientFrom: company?.heroBackgroundGradientFrom ?? "#0f172a",
      heroBackgroundGradientVia: company?.heroBackgroundGradientVia ?? "#1e3a8a",
      heroBackgroundGradientTo: company?.heroBackgroundGradientTo ?? "#312e81",
      heroBlobColor1: company?.heroBlobColor1 ?? "#3b82f6",
      heroBlobColor2: company?.heroBlobColor2 ?? "#a855f7",
      heroBlobColor3: company?.heroBlobColor3 ?? "#6366f1",
      heroBackgroundImage: company?.heroBackgroundImage ?? "",
      heroBackgroundImageOpacity: company?.heroBackgroundImageOpacity ?? 50,
      heroSideImage: company?.heroSideImage ?? "",
      aboutSectionLabel: company?.aboutSectionLabel ?? "Why Choose Us",
      aboutTitle: company?.aboutTitle ?? "",
      aboutDescription: company?.aboutDescription ?? "",
      aboutCardsLayout: company?.aboutCardsLayout ?? "3-col",
      platformsSectionLabel: company?.platformsSectionLabel ?? "Our Solutions",
      platformsTitle: company?.platformsTitle ?? "",
      platformsDescription: company?.platformsDescription ?? "",
      contactSectionLabel: company?.contactSectionLabel ?? "Let's Connect",
      contactTitle: company?.contactTitle ?? "",
      contactDescription: company?.contactDescription ?? "",
      contactButtonText: company?.contactButtonText ?? "Contact Us",
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
      comingSoon: false,
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

  // Feature card form
  const featureCardForm = useForm<z.infer<typeof featureCardFormSchema>>({
    resolver: zodResolver(featureCardFormSchema),
    defaultValues: {
      title: "",
      description: "",
      iconName: "",
      gradientFrom: "#3b82f6",
      gradientTo: "#06b6d4",
      borderColor: "#dbeafe",
      sortOrder: 0,
      isActive: true,
    },
  });

  // Hero badge form
  const heroBadgeForm = useForm<z.infer<typeof heroBadgeFormSchema>>({
    resolver: zodResolver(heroBadgeFormSchema),
    defaultValues: {
      text: "",
      iconName: "",
      iconColor: "#fbbf24",
      sortOrder: 0,
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
        comingSoon: data.comingSoon ?? false,
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

  // Create feature card mutation
  const createFeatureCardMutation = useMutation({
    mutationFn: async (data: z.infer<typeof featureCardFormSchema>) => {
      const response = await apiRequest("POST", "/api/about-feature-cards", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about-feature-cards"] });
      toast({
        title: "Success",
        description: "Feature card created successfully",
      });
      setShowFeatureCardForm(false);
      featureCardForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create feature card",
        variant: "destructive",
      });
    },
  });

  // Update feature card mutation
  const updateFeatureCardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof featureCardFormSchema> }) => {
      const response = await apiRequest("PUT", `/api/about-feature-cards/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about-feature-cards"] });
      toast({
        title: "Success",
        description: "Feature card updated successfully",
      });
      setEditingFeatureCard(null);
      setShowFeatureCardForm(false);
      featureCardForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update feature card",
        variant: "destructive",
      });
    },
  });

  // Delete feature card mutation
  const deleteFeatureCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/about-feature-cards/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about-feature-cards"] });
      toast({
        title: "Success",
        description: "Feature card deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete feature card",
        variant: "destructive",
      });
    },
  });

  // Create hero badge mutation
  const createHeroBadgeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof heroBadgeFormSchema>) => {
      const response = await apiRequest("POST", "/api/hero-badges", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hero-badges"] });
      toast({
        title: "Success",
        description: "Hero badge created successfully",
      });
      setShowHeroBadgeForm(false);
      heroBadgeForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create hero badge",
        variant: "destructive",
      });
    },
  });

  // Update hero badge mutation
  const updateHeroBadgeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof heroBadgeFormSchema> }) => {
      const response = await apiRequest("PUT", `/api/hero-badges/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hero-badges"] });
      toast({
        title: "Success",
        description: "Hero badge updated successfully",
      });
      setEditingHeroBadge(null);
      setShowHeroBadgeForm(false);
      heroBadgeForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update hero badge",
        variant: "destructive",
      });
    },
  });

  // Delete hero badge mutation
  const deleteHeroBadgeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/hero-badges/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hero-badges"] });
      toast({
        title: "Success",
        description: "Hero badge deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete hero badge",
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

  const onFeatureCardSubmit = (data: z.infer<typeof featureCardFormSchema>) => {
    if (editingFeatureCard) {
      updateFeatureCardMutation.mutate({ id: editingFeatureCard.id, data });
    } else {
      createFeatureCardMutation.mutate(data);
    }
  };

  const onHeroBadgeSubmit = (data: z.infer<typeof heroBadgeFormSchema>) => {
    if (editingHeroBadge) {
      updateHeroBadgeMutation.mutate({ id: editingHeroBadge.id, data });
    } else {
      createHeroBadgeMutation.mutate(data);
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
      comingSoon: platform.comingSoon ?? false,
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
      comingSoon: false,
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

  const handleEditFeatureCard = (card: AboutFeatureCard) => {
    setEditingFeatureCard(card);
    featureCardForm.reset({
      title: card.title,
      description: card.description,
      iconName: card.iconName,
      gradientFrom: card.gradientFrom,
      gradientTo: card.gradientTo,
      borderColor: card.borderColor,
      sortOrder: card.sortOrder,
      isActive: card.isActive,
    });
    setShowFeatureCardForm(true);
  };

  const handleAddFeatureCard = () => {
    setEditingFeatureCard(null);
    featureCardForm.reset({
      title: "",
      description: "",
      iconName: "",
      gradientFrom: "#3b82f6",
      gradientTo: "#06b6d4",
      borderColor: "#dbeafe",
      sortOrder: featureCards.length,
      isActive: true,
    });
    setShowFeatureCardForm(true);
  };

  const handleEditHeroBadge = (badge: HeroBadge) => {
    setEditingHeroBadge(badge);
    heroBadgeForm.reset({
      text: badge.text,
      iconName: badge.iconName,
      iconColor: badge.iconColor,
      sortOrder: badge.sortOrder,
      isActive: badge.isActive,
    });
    setShowHeroBadgeForm(true);
  };

  const handleAddHeroBadge = () => {
    setEditingHeroBadge(null);
    heroBadgeForm.reset({
      text: "",
      iconName: "",
      iconColor: "#fbbf24",
      sortOrder: heroBadges.length,
      isActive: true,
    });
    setShowHeroBadgeForm(true);
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
    { id: "feature-cards" as AdminSection, label: "Feature Cards", icon: LayoutGrid },
    { id: "hero-badges" as AdminSection, label: "Hero Badges", icon: Tag },
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

                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-lg font-medium text-slate-900 mb-4">Title Styling</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={companyForm.control}
                          name="titleFontFamily"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title Font</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value ?? "Inter"}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-title-font">
                                    <SelectValue placeholder="Select font" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {FONT_OPTIONS.map((font) => (
                                    <SelectItem key={font} value={font}>{font}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="titleFontWeight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title Weight</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value ?? "700"}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-title-weight">
                                    <SelectValue placeholder="Select weight" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {FONT_WEIGHT_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="titleFontSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title Size (px)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min={16}
                                  max={48}
                                  {...field}
                                  value={field.value ?? 24}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 24)}
                                  data-testid="input-title-font-size"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="titleColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title Color</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input 
                                    type="color"
                                    {...field}
                                    value={field.value ?? "#0f172a"}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                    data-testid="input-title-color"
                                  />
                                  <Input 
                                    type="text"
                                    {...field}
                                    value={field.value ?? "#0f172a"}
                                    placeholder="#0f172a"
                                    className="flex-1"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6 mt-2">
                      <h4 className="text-lg font-medium text-slate-900 mb-4">Slogan (Optional)</h4>
                      <FormField
                        control={companyForm.control}
                        name="sloganText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slogan Text</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                value={field.value ?? ""}
                                placeholder="Your company tagline or slogan"
                                data-testid="input-slogan-text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={companyForm.control}
                          name="sloganFontFamily"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slogan Font</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value ?? "Inter"}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-slogan-font">
                                    <SelectValue placeholder="Select font" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {FONT_OPTIONS.map((font) => (
                                    <SelectItem key={font} value={font}>{font}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="sloganFontWeight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slogan Weight</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value ?? "400"}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-slogan-weight">
                                    <SelectValue placeholder="Select weight" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {FONT_WEIGHT_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="sloganFontSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slogan Size (px)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min={10}
                                  max={24}
                                  {...field}
                                  value={field.value ?? 14}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 14)}
                                  data-testid="input-slogan-font-size"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="sloganColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slogan Color</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input 
                                    type="color"
                                    {...field}
                                    value={field.value ?? "#64748b"}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                    data-testid="input-slogan-color"
                                  />
                                  <Input 
                                    type="text"
                                    {...field}
                                    value={field.value ?? "#64748b"}
                                    placeholder="#64748b"
                                    className="flex-1"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6 mt-2">
                      <FormField
                        control={companyForm.control}
                        name="headerPaddingY"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Header Vertical Padding (px)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min={8}
                                max={40}
                                {...field}
                                value={field.value ?? 16}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 16)}
                                data-testid="input-header-padding"
                              />
                            </FormControl>
                            <p className="text-xs text-slate-500">Controls overall header height (8-40px)</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border-t pt-6 mt-2">
                      <h4 className="text-lg font-medium text-slate-900 mb-4">Hero Section</h4>
                    </div>
                    <FormField
                      control={companyForm.control}
                      name="heroBadge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hero Badge Text (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Next-Generation SaaS Solutions" />
                          </FormControl>
                          <p className="text-xs text-slate-500">Small badge text displayed above the hero title</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="heroTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hero Title (Main Part)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Empowering Business Through" />
                          </FormControl>
                          <p className="text-xs text-slate-500">The first part of your hero title (displayed in white)</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="heroTitleHighlight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hero Title (Highlighted Part - Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Software Innovation" />
                          </FormControl>
                          <p className="text-xs text-slate-500">The highlighted part of your hero title (displayed with blue gradient)</p>
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

                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-lg font-medium text-slate-900 mb-4">Hero Buttons</h4>
                    </div>
                    <FormField
                      control={companyForm.control}
                      name="heroButtonPrimary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Button Text</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Explore Our Platforms" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="heroButtonSecondary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Button Text</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Learn More" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-lg font-medium text-slate-900 mb-4">Color Theme Presets</h4>
                      <p className="text-sm text-slate-600 mb-4">Quickly apply predefined color schemes</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            companyForm.setValue("heroBackgroundGradientFrom", "#0f172a");
                            companyForm.setValue("heroBackgroundGradientVia", "#1e3a8a");
                            companyForm.setValue("heroBackgroundGradientTo", "#312e81");
                            companyForm.setValue("heroBlobColor1", "#3b82f6");
                            companyForm.setValue("heroBlobColor2", "#a855f7");
                            companyForm.setValue("heroBlobColor3", "#6366f1");
                          }}
                          className="p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 transition-colors bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
                        >
                          <div className="text-white text-sm font-medium">Ocean Blue (Default)</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            companyForm.setValue("heroBackgroundGradientFrom", "#1e1b4b");
                            companyForm.setValue("heroBackgroundGradientVia", "#7c3aed");
                            companyForm.setValue("heroBackgroundGradientTo", "#db2777");
                            companyForm.setValue("heroBlobColor1", "#a855f7");
                            companyForm.setValue("heroBlobColor2", "#ec4899");
                            companyForm.setValue("heroBlobColor3", "#f43f5e");
                          }}
                          className="p-4 rounded-lg border-2 border-slate-200 hover:border-purple-500 transition-colors bg-gradient-to-br from-indigo-950 via-purple-600 to-pink-600"
                        >
                          <div className="text-white text-sm font-medium">Vibrant Purple</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            companyForm.setValue("heroBackgroundGradientFrom", "#0f172a");
                            companyForm.setValue("heroBackgroundGradientVia", "#047857");
                            companyForm.setValue("heroBackgroundGradientTo", "#0d9488");
                            companyForm.setValue("heroBlobColor1", "#10b981");
                            companyForm.setValue("heroBlobColor2", "#14b8a6");
                            companyForm.setValue("heroBlobColor3", "#06b6d4");
                          }}
                          className="p-4 rounded-lg border-2 border-slate-200 hover:border-emerald-500 transition-colors bg-gradient-to-br from-slate-900 via-emerald-700 to-teal-600"
                        >
                          <div className="text-white text-sm font-medium">Fresh Teal</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            companyForm.setValue("heroBackgroundGradientFrom", "#18181b");
                            companyForm.setValue("heroBackgroundGradientVia", "#27272a");
                            companyForm.setValue("heroBackgroundGradientTo", "#3f3f46");
                            companyForm.setValue("heroBlobColor1", "#71717a");
                            companyForm.setValue("heroBlobColor2", "#a1a1aa");
                            companyForm.setValue("heroBlobColor3", "#d4d4d8");
                          }}
                          className="p-4 rounded-lg border-2 border-slate-200 hover:border-slate-500 transition-colors bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-700"
                        >
                          <div className="text-white text-sm font-medium">Modern Slate</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            companyForm.setValue("heroBackgroundGradientFrom", "#7f1d1d");
                            companyForm.setValue("heroBackgroundGradientVia", "#dc2626");
                            companyForm.setValue("heroBackgroundGradientTo", "#f97316");
                            companyForm.setValue("heroBlobColor1", "#ef4444");
                            companyForm.setValue("heroBlobColor2", "#fb923c");
                            companyForm.setValue("heroBlobColor3", "#fbbf24");
                          }}
                          className="p-4 rounded-lg border-2 border-slate-200 hover:border-red-500 transition-colors bg-gradient-to-br from-red-950 via-red-600 to-orange-500"
                        >
                          <div className="text-white text-sm font-medium">Sunset Orange</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            companyForm.setValue("heroBackgroundGradientFrom", "#1e3a8a");
                            companyForm.setValue("heroBackgroundGradientVia", "#0891b2");
                            companyForm.setValue("heroBackgroundGradientTo", "#0e7490");
                            companyForm.setValue("heroBlobColor1", "#0ea5e9");
                            companyForm.setValue("heroBlobColor2", "#06b6d4");
                            companyForm.setValue("heroBlobColor3", "#22d3ee");
                          }}
                          className="p-4 rounded-lg border-2 border-slate-200 hover:border-cyan-500 transition-colors bg-gradient-to-br from-blue-900 via-cyan-600 to-cyan-700"
                        >
                          <div className="text-white text-sm font-medium">Sky Blue</div>
                        </button>
                      </div>
                    </div>

                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-lg font-medium text-slate-900 mb-4">Hero Background Colors</h4>
                      <p className="text-sm text-slate-600 mb-2">Customize individual colors (overrides presets)</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={companyForm.control}
                        name="heroBackgroundGradientFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gradient From</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  value={field.value ?? "#0f172a"}
                                  className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  {...field}
                                  value={field.value ?? "#0f172a"}
                                  placeholder="#0f172a"
                                  className="flex-1"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={companyForm.control}
                        name="heroBackgroundGradientVia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gradient Via</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  value={field.value ?? "#1e3a8a"}
                                  className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  {...field}
                                  value={field.value ?? "#1e3a8a"}
                                  placeholder="#1e3a8a"
                                  className="flex-1"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={companyForm.control}
                        name="heroBackgroundGradientTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gradient To</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  value={field.value ?? "#312e81"}
                                  className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  {...field}
                                  value={field.value ?? "#312e81"}
                                  placeholder="#312e81"
                                  className="flex-1"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <FormField
                        control={companyForm.control}
                        name="heroBlobColor1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blob Color 1</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  value={field.value ?? "#3b82f6"}
                                  className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  {...field}
                                  value={field.value ?? "#3b82f6"}
                                  placeholder="#3b82f6"
                                  className="flex-1"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={companyForm.control}
                        name="heroBlobColor2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blob Color 2</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  value={field.value ?? "#a855f7"}
                                  className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  {...field}
                                  value={field.value ?? "#a855f7"}
                                  placeholder="#a855f7"
                                  className="flex-1"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={companyForm.control}
                        name="heroBlobColor3"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blob Color 3</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  value={field.value ?? "#6366f1"}
                                  className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  {...field}
                                  value={field.value ?? "#6366f1"}
                                  placeholder="#6366f1"
                                  className="flex-1"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-lg font-medium text-slate-900 mb-4">Hero Images</h4>
                      <p className="text-sm text-slate-600 mb-4">Add images to enhance your hero section</p>
                    </div>
                    <FormField
                      control={companyForm.control}
                      name="heroBackgroundImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Background Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/hero-bg.jpg" />
                          </FormControl>
                          <p className="text-xs text-slate-500">Image will overlay on the gradient background</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="heroBackgroundImageOpacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Background Image Opacity ({field.value}%)</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={field.value ?? 50}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                className="flex-1"
                                aria-label="Background image opacity slider"
                              />
                              <Input
                                type="number"
                                {...field}
                                min="0"
                                max="100"
                                className="w-20"
                              />
                            </div>
                          </FormControl>
                          <p className="text-xs text-slate-500">0 = fully transparent, 100 = fully opaque</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="heroSideImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hero Side Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/hero-illustration.png" />
                          </FormControl>
                          <p className="text-xs text-slate-500">Image displayed alongside the hero text (right side on desktop)</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-lg font-medium text-slate-900 mb-4">About Section</h4>
                    </div>
                    <FormField
                      control={companyForm.control}
                      name="aboutSectionLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About Section Label</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Why Choose Us" />
                          </FormControl>
                          <p className="text-xs text-slate-500">Small uppercase label above the about title</p>
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
                      name="aboutCardsLayout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Feature Cards Layout</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? "3-col"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select layout..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="2-col">2 Columns</SelectItem>
                              <SelectItem value="3-col">3 Columns</SelectItem>
                              <SelectItem value="4-col">4 Columns</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-slate-500">Grid layout for feature cards (responsive on mobile)</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-lg font-medium text-slate-900 mb-4">Platforms Section</h4>
                    </div>
                    <FormField
                      control={companyForm.control}
                      name="platformsSectionLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platforms Section Label</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Our Solutions" />
                          </FormControl>
                          <p className="text-xs text-slate-500">Small uppercase label above the platforms title</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="platformsTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platforms Section Title (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Our SaaS Platforms" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="platformsDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platforms Section Description (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Discover our platforms and services" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-lg font-medium text-slate-900 mb-4">Contact Section</h4>
                    </div>
                    <FormField
                      control={companyForm.control}
                      name="contactSectionLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Section Label</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Let's Connect" />
                          </FormControl>
                          <p className="text-xs text-slate-500">Small uppercase label above the contact title</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="contactTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Section Title (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Get in Touch" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="contactDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Section Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} placeholder="e.g., Ready to transform your business? Our team is here to help." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="contactButtonText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Button Text</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Contact Us" />
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
                                <h4 className="font-semibold text-lamplight-primary flex items-center">
                                  {platform.name}
                                  {platform.comingSoon && (
                                    <Badge variant="secondary" className="ml-2">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Coming Soon
                                    </Badge>
                                  )}
                                </h4>
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

            {activeSection === "feature-cards" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-lamplight-primary">About Section Feature Cards</h3>
                  <Button
                    onClick={handleAddFeatureCard}
                    className="bg-lamplight-success hover:bg-emerald-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature Card
                  </Button>
                </div>
                <div className="space-y-4">
                  {featureCardsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lamplight-accent mx-auto"></div>
                      <p className="text-slate-600 mt-2">Loading feature cards...</p>
                    </div>
                  ) : featureCards.length === 0 ? (
                    <div className="text-center py-8">
                      <LayoutGrid className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">No feature cards found</p>
                    </div>
                  ) : (
                    featureCards.map((card) => (
                      <Card key={card.id} className="bg-slate-50 border border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                className="w-16 h-16 rounded-lg flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(to bottom right, ${card.gradientFrom}, ${card.gradientTo})`
                                }}
                              >
                                <span className="text-2xl text-white">{card.iconName.slice(0, 2)}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-lamplight-primary">{card.title}</h4>
                                <p className="text-sm text-slate-600 line-clamp-1">{card.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={card.isActive ? "default" : "secondary"}>
                                    {card.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  <span className="text-xs text-slate-500">
                                    Icon: {card.iconName}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditFeatureCard(card)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteFeatureCardMutation.mutate(card.id)}
                                disabled={deleteFeatureCardMutation.isPending}
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

            {activeSection === "hero-badges" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-lamplight-primary">Hero Section Badges</h3>
                  <Button
                    onClick={handleAddHeroBadge}
                    className="bg-lamplight-success hover:bg-emerald-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Hero Badge
                  </Button>
                </div>
                <div className="space-y-4">
                  {heroBadgesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lamplight-accent mx-auto"></div>
                      <p className="text-slate-600 mt-2">Loading hero badges...</p>
                    </div>
                  ) : heroBadges.length === 0 ? (
                    <div className="text-center py-8">
                      <Tag className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">No hero badges found</p>
                    </div>
                  ) : (
                    heroBadges.map((badge) => (
                      <Card key={badge.id} className="bg-slate-50 border border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                                <span
                                  className="text-2xl"
                                  style={{ color: badge.iconColor }}
                                >
                                  {badge.iconName.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-lamplight-primary">{badge.text}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={badge.isActive ? "default" : "secondary"}>
                                    {badge.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  <span className="text-xs text-slate-500">
                                    Icon: {badge.iconName}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditHeroBadge(badge)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteHeroBadgeMutation.mutate(badge.id)}
                                disabled={deleteHeroBadgeMutation.isPending}
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
              <MediaLibrarySection />
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
              <FormField
                control={platformForm.control}
                name="comingSoon"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Coming Soon</FormLabel>
                      <FormDescription>
                        Show this platform with a "Coming Soon" badge instead of a Launch link.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="switch-platform-coming-soon"
                      />
                    </FormControl>
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

      {/* Feature Card Form Dialog */}
      <Dialog open={showFeatureCardForm} onOpenChange={setShowFeatureCardForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFeatureCard ? "Edit Feature Card" : "Add Feature Card"}
            </DialogTitle>
          </DialogHeader>
          <Form {...featureCardForm}>
            <form onSubmit={featureCardForm.handleSubmit(onFeatureCardSubmit)} className="space-y-4">
              <FormField
                control={featureCardForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Growth Focused" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={featureCardForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Describe this feature..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={featureCardForm.control}
                name="iconName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <IconSelector
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select an icon..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={featureCardForm.control}
                  name="gradientFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gradient From Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            {...field}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            type="text"
                            {...field}
                            placeholder="#3b82f6"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={featureCardForm.control}
                  name="gradientTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gradient To Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            {...field}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            type="text"
                            {...field}
                            placeholder="#06b6d4"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={featureCardForm.control}
                name="borderColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Border Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          {...field}
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          {...field}
                          placeholder="#dbeafe"
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={featureCardForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Active (visible on website)</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowFeatureCardForm(false);
                    setEditingFeatureCard(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-lamplight-accent hover:bg-blue-600 text-white"
                  disabled={createFeatureCardMutation.isPending || updateFeatureCardMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingFeatureCard ? "Update" : "Create"} Card
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Hero Badge Form Dialog */}
      <Dialog open={showHeroBadgeForm} onOpenChange={setShowHeroBadgeForm}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingHeroBadge ? "Edit Hero Badge" : "Add Hero Badge"}
            </DialogTitle>
          </DialogHeader>
          <Form {...heroBadgeForm}>
            <form onSubmit={heroBadgeForm.handleSubmit(onHeroBadgeSubmit)} className="space-y-4">
              <FormField
                control={heroBadgeForm.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge Text</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Fast & Reliable" maxLength={30} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={heroBadgeForm.control}
                name="iconName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <IconSelector
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select an icon..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={heroBadgeForm.control}
                name="iconColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          {...field}
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          {...field}
                          placeholder="#fbbf24"
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={heroBadgeForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Active (visible on website)</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowHeroBadgeForm(false);
                    setEditingHeroBadge(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-lamplight-accent hover:bg-blue-600 text-white"
                  disabled={createHeroBadgeMutation.isPending || updateHeroBadgeMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingHeroBadge ? "Update" : "Create"} Badge
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
