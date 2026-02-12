import { ReactNode } from "react";
import type { Role } from "@/hooks/useRole";

import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

type RequireRoleProps = {
  allowed: Role[];
  children: ReactNode;
};

export function RequireRole({ allowed, children }: RequireRoleProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useRole(user?.id);

  if (authLoading || (user && roleLoading)) return <p>Loading...</p>;
  if (!user) return <p>Please sign in</p>;
  if (!role || !allowed.includes(role)) return <p>Access denied</p>;
  return <>{children}</>;
}
