import { useNavigate } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useEmployee } from "@/hooks/useEmployee";
import { useTheme } from "@/components/providers/theme-provider";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Role } from "@/hooks/useRole";

export type HeaderProps = {
  user: SupabaseUser;
  role: Role | null;
};
const Header = ({ user, role }: HeaderProps) => {
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const { employee, googleAvatar } = useEmployee();

  const displayName = employee
    ? `${employee.first_name} ${employee.last_name}`
    : user?.user_metadata?.full_name ?? user?.email ?? "User";

  const initials = employee
    ? `${employee.first_name?.[0] ?? ""}${
        employee.last_name?.[0] ?? ""
      }`.toUpperCase()
    : (user?.user_metadata?.full_name?.[0] ?? "?").toUpperCase();

  const avatarUrl = googleAvatar ?? employee?.profile_image ?? null;

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign out error:", error.message);
    else window.location.href = "/";
  };
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 transition-all duration-300 ease-in-out">
      <SidebarTrigger />

      <section className="user-nav ">
        <nav>
          <ul className="">
            <li className="user-nav-item flex gap-6 items-center relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="justify-center whitespace-nowrap text-sm font-medium h-10 flex items-center gap-2 p-2 hover:bg-muted transition-colors hover:text-accent-foreground rounded-lg">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xs font-semibold">
                          {initials}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {role}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={10}>
                  <DropdownMenuLabel>
                    {" "}
                    <p className="font-medium">
                      {user.user_metadata?.full_name}
                    </p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem>
                    <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                    Profile
                  </DropdownMenuItem> */}
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="h-[1.2rem] w-[1.2rem] mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
        </nav>
      </section>
    </header>
  );
};

export default Header;
