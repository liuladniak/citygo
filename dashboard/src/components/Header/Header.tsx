import "./Header.css";
import Icon from "../ui/SVGIcons/Icon";
import { chevronDownPath } from "../ui/SVGIcons/iconPaths";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/providers/theme-provider";
import { LogOut, Settings, User } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Role } from "@/hooks/useRole";
import { supabase } from "@/lib/supabaseClient";

export type HeaderProps = {
  user: SupabaseUser;
  role: Role | null;
};
const Header = ({ user, role }: HeaderProps) => {
  // const [searchQuery, setSearchQuery] = useState("");
  const { setTheme } = useTheme();
  // const [punchStatus, setPunchStatus] = useState()
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
          <p>
            {/* Logged in as {user.user_metadata?.full_name} {role && `(${role})`} */}
          </p>
          <ul className="user-nav-list">
            <li className="user-nav-item">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-green-100 text-green-800 flex items-center">
                    <div className="mx-auto block h-2 w-2 rounded-full bg-green-800 mr-2"></div>
                    Clocked in
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="">
                    <div className=" block h-2 w-2 rounded-full bg-green-800 mr-2"></div>
                    Clock in
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className=" block h-2 w-2 rounded-full bg-yellow-600 mr-2"></div>
                    Meal Break
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className=" block h-2 w-2 rounded-full bg-red-800 mr-2"></div>
                    Clock out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li className="user-nav-item user-nav__status relative">
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
                  <button className="user-nav-link justify-center whitespace-nowrap text-sm font-medium h-10 flex items-center gap-2 p-2 hover:bg-muted transition-colors hover:text-accent-foreground rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center relative">
                      <span className="text-white text-sm font-medium absolute top-[8px]">
                        TW
                      </span>
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {user.user_metadata?.full_name}
                      </p>

                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                    <Icon iconPath={chevronDownPath} size={16} />
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
                  <DropdownMenuItem>
                    <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
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
