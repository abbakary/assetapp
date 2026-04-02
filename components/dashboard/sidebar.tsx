"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Activity,
  Users,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const menuItems = [
  {
    id: "registry",
    label: "Asset Registry",
    icon: LayoutDashboard,
  },
  {
    id: "hierarchy",
    label: "Asset Hierarchy",
    icon: Building2,
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
  },
  {
    id: "lifecycle",
    label: "Lifecycle Tracking",
    icon: Activity,
  },
];

const bottomMenuItems = [
  {
    id: "users",
    label: "User Management",
    icon: Users,
    requiredRole: "admin",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar({ activeTab, onTabChange, collapsed = false, onToggleCollapse }: SidebarProps) {
  const router = useRouter();
  const { user, logout, hasPermission } = useUser();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-500/20 text-blue-400";
      case "staff_manager":
        return "bg-amber-500/20 text-amber-400";
      case "viewer":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "staff_manager":
        return "Manager";
      case "viewer":
        return "Viewer";
      default:
        return role;
    }
  };
  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-sidebar-foreground">Asset Management</h1>
              <p className="text-xs text-muted-foreground">Enterprise System</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        {onToggleCollapse && !collapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-sidebar-accent pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
            />
          </div>
        </div>
      )}

      {/* Main Menu */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className={cn("h-5 w-5", collapsed && "mx-auto")} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const canAccess = !item.requiredRole || hasPermission("canAccessSettings") || (item.id === "users" && hasPermission("canManageUsers"));

          if (!canAccess) return null;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className={cn("h-5 w-5", collapsed && "mx-auto")} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        {user && (
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <div className="flex items-center gap-1">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded", getRoleColor(user.role))}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-sidebar-foreground"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
