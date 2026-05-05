import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AdminPanel from "@/components/admin-panel";
import AccessDenied from "@/components/access-denied";
import LoginModal from "@/components/login-modal";
import type { Company, Platform } from "@shared/schema";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);

  const { data: authData, isLoading: authLoading } = useQuery<{ user: any | null }>({
    queryKey: ["/api/user"],
  });

  const { data: adminData, isLoading: adminLoading } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/user/is-admin"],
    enabled: authData?.user !== null && authData?.user !== undefined,
  });

  const { data: company } = useQuery<Company>({
    queryKey: ["/api/company"],
  });

  const { data: platforms = [] } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });

  const isAuthenticated = authData?.user !== null && authData?.user !== undefined;
  const isAdmin = adminData?.isAdmin === true;

  // Show loading state while checking auth and admin status
  // CRITICAL: Must wait for adminLoading to complete to avoid showing AdminPanel to non-admins
  if (authLoading || (isAuthenticated && adminLoading) || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lamplight-accent"></div>
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600 mb-6">You must be logged in to access the admin panel.</p>
          <button
            onClick={() => setLoginOpen(true)}
            className="bg-lamplight-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Login
          </button>
        </div>
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} redirect="/admin" />
      </div>
    );
  }

  // If authenticated but not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AccessDenied onClose={() => setLocation('/')} />
      </div>
    );
  }

  // If authenticated and admin, show admin panel
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanel 
        company={company} 
        platforms={platforms} 
        onClose={() => setLocation('/')} 
      />
    </div>
  );
}
