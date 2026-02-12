import {
  Calendar,
  Home,
  Flag,
  ClipboardList,
  Users,
  ChartColumnBig,
  TicketCheck,
  ListTodo,
  UserSearch,
  Settings,
  Bus,
  ChevronUp,
  User2,
  Plus,
  ChevronDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import logoIcon from "@/assets/logos/logo-icon.png";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";

import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { url: "/", title: "Dashboard", icon: Home },
  { url: "/tours", title: "Tours", icon: Flag },
  {
    url: "/schedule",
    title: "Schedule",
    icon: Calendar,
  },
  {
    url: "/bookings",
    title: "Bookings",
    icon: ClipboardList,
  },
  {
    url: "/team",
    title: "Team",
    icon: Users,
  },
  {
    url: "/analytics",
    title: "Analytics",
    icon: ChartColumnBig,
  },
  {
    url: "/invoices",
    title: "Invoices",
    icon: TicketCheck,
  },
  {
    url: "/tasks",
    title: "Tasks",
    icon: ListTodo,
  },
  {
    url: "/reports",
    title: "Reports",
    icon: ClipboardList,
  },
  {
    url: "/guests",
    title: "Guests",
    icon: UserSearch,
  },
  {
    url: "/settings",
    title: "Settings",
    icon: Settings,
  },
];
const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon" className="relative border-r h-screen">
      <ScrollArea className="h-full rounded-md border">
        <SidebarHeader className="py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="p-0">
                <Link to="/" className="overflow-visible ">
                  <img src={logoIcon} className="w-5 h-5" alt="logo" />
                  <span className="font-semibold text-brand-secondary ">
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
            <SidebarGroupLabel>
              <span className="">Application</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span className=" ">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {item.title === "Bookings" && (
                      <SidebarMenuBadge>
                        <span className="">12</span>
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>
              <span className="">Bookings</span>
            </SidebarGroupLabel>
            <SidebarGroupAction>
              <Plus />
              <span className="sr-only ">Add Booking</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/bookings">
                      <ClipboardList />{" "}
                      <span className="">See All Bookings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/booking/add">
                      <Plus />
                      <span className="">Add New Booking</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="">
            <SidebarGroupLabel>
              <span className="">Nested</span>
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/bookings">
                      <ClipboardList />
                      <span className="">See All Bookings</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link to="/">
                          <Plus />
                          <span className="">Add Booking</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link to="/">
                          <Plus /> <span className="">Add Category</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  <span className="">Collapsible Group</span>
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/bookings">
                          <ClipboardList />
                          <span className="">See All Bookings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/booking/add">
                          <Plus />
                          <span className="">Add New Booking</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 />

                    <span className="">John Doe</span>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Account</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
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
