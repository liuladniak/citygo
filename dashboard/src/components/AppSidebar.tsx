import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import {
  Calendar,
  ChartColumnBig,
  ChevronUp,
  ClipboardList,
  Flag,
  Home,
  ListTodo,
  Settings,
  UserSearch,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/lib/supabaseClient";
import logoIcon from "@/assets/logos/logo-icon.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const navItems = [
  { url: "/", title: "Dashboard", icon: Home },
  { url: "/tours", title: "Tours", icon: Flag },
  { url: "/schedule", title: "Schedule", icon: Calendar },
  { url: "/bookings", title: "Bookings", icon: ClipboardList, badge: true },
  { url: "/team", title: "Team", icon: Users, managerOnly: true },
  { url: "/analytics", title: "Analytics", icon: ChartColumnBig },
  { url: "/tasks", title: "Tasks", icon: ListTodo },
  { url: "/guests", title: "Guests", icon: UserSearch },
  { url: "/settings", title: "Settings", icon: Settings },
];

const AppSidebar = () => {
  const { user } = useAuth();
  const { role } = useRole(user?.id);
  const { employee, googleAvatar } = useEmployee();
  const navigate = useNavigate();

  const { data: pendingCount } = useQuery({
    queryKey: ["pending-bookings-count"],
    queryFn: async () => {
      const { data } = await axios.get(`/api/bookings/all`, {
        params: { status: "pending", limit: 1 },
      });
      return data.total as number;
    },
    refetchInterval: 2 * 60 * 1000,
  });

  const displayName = employee
    ? `${employee.first_name} ${employee.last_name}`
    : user?.email ?? "User";

  const avatarUrl = googleAvatar ?? employee?.profile_image ?? null;

  const visibleItems = navItems.filter(
    (item) => !item.managerOnly || role === "admin" || role === "manager"
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="relative border-r h-screen">
      <ScrollArea className="h-full rounded-md border">
        <SidebarHeader className="py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="p-0">
                <Link to="/" className="overflow-visible">
                  <img src={logoIcon} className="w-5 h-5" alt="logo" />
                  <span className="font-semibold text-brand-secondary">
                    CityGo
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator className="w-full mx-0" />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton onClick={() => navigate(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge && pendingCount && pendingCount > 0 && (
                      <SidebarMenuBadge>{pendingCount}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-semibold text-primary-foreground shrink-0">
                        {displayName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <span className="flex-1 truncate text-left">
                      {displayName}
                    </span>
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </ScrollArea>
    </Sidebar>
  );
};

export default AppSidebar;
