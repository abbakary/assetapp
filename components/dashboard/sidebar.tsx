"use client";

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
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar({ activeTab, onTabChange, collapsed = false, onToggleCollapse }: SidebarProps) {
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
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">AM</span>
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-foreground">Asset Manager</p>
              <p className="text-xs text-muted-foreground">admin@company.com</p>
            </div>
          )}
          {!collapsed && (
            <button className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
