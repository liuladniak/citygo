import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header, { HeaderProps } from "../Header/Header";
import { ThemeProvider } from "../providers/theme-provider";
import { SidebarProvider } from "../ui/sidebar";
import AppSidebar from "../AppSidebar";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/useAuth";
import { LoginWithGoogle } from "../LoginWithGoogle";
import { useRole } from "@/hooks/useRole";
import { RequireRole } from "../RequireRole";
const SIDEBAR_COOKIE_NAME = "sidebar_state";

function LayoutContent({ user, role }: HeaderProps) {
  return (
    <>
      <AppSidebar />
      {/* <SidebarTrigger /> */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 w-full">
        <Header user={user} role={role} />
        <main className="flex-1 transition-all duration-300 w-full px-4">
          {/* <Outlet /> */}
          <RequireRole allowed={["admin", "manager", "associate"]}>
            <Outlet />
          </RequireRole>
        </main>
      </div>
    </>
  );
}

function AppLayout() {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useRole(user?.id);
  const location = useLocation();

  const defaultOpen = useMemo(() => {
    const cookieValue = Cookies.get(SIDEBAR_COOKIE_NAME);
    return cookieValue !== "false";
  }, []);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);

  if (loading || roleLoading) return <p>Loading...</p>;
  if (!user) return <LoginWithGoogle />;
  return (
    <div>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SidebarProvider defaultOpen={defaultOpen}>
          <LayoutContent user={user} role={role} />
        </SidebarProvider>
      </ThemeProvider>
    </div>
  );
}

export default AppLayout;
