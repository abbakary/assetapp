"use client";

import { useState } from "react";
import { Bell, Menu, RefreshCw } from "lucide-react";
import { Sidebar } from "./sidebar";
import { AssetRegistryDashboard } from "./asset-registry";
import { AssetHierarchyDashboard } from "./asset-hierarchy";
import { DocumentManagementDashboard } from "./document-management";
import { LifecycleTrackingDashboard } from "./lifecycle-tracking";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("registry");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "registry":
        return <AssetRegistryDashboard />;
      case "hierarchy":
        return <AssetHierarchyDashboard />;
      case "documents":
        return <DocumentManagementDashboard />;
      case "lifecycle":
        return <LifecycleTrackingDashboard />;
      default:
        return <AssetRegistryDashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "registry":
        return "Asset Registry";
      case "hierarchy":
        return "Asset Hierarchy";
      case "documents":
        return "Document Management";
      case "lifecycle":
        return "Lifecycle Tracking";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-md hover:bg-secondary transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Dashboard</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-md hover:bg-secondary transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button className="relative p-2 rounded-md hover:bg-secondary transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="h-6 w-px bg-border" />
            <div className="text-sm text-muted-foreground">
              Last updated: <span className="text-foreground">2 min ago</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
