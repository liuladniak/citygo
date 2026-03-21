import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Loader2 } from "lucide-react";

export function RequireManager({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useRole(user?.id);

  if (authLoading || roleLoading || (user && !role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (role !== "admin" && role !== "manager") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
