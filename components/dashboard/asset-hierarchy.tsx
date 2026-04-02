"use client";

import { useState } from "react";
import {
  Building2,
  Layers,
  DoorOpen,
  Cpu,
  ChevronRight,
  ChevronDown,
  Check,
  Settings,
  Grid3X3,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockHierarchy, mockAssets } from "@/lib/mock-data";
import type { AssetHierarchyNode } from "@/lib/types";

const typeIcons: Record<string, React.ElementType> = {
  building: Building2,
  floor: Layers,
  room: DoorOpen,
  equipment: Cpu,
};

const typeColors: Record<string, string> = {
  building: "text-blue-400",
  floor: "text-emerald-400",
  room: "text-amber-400",
  equipment: "text-purple-400",
};

interface TreeNodeProps {
  node: AssetHierarchyNode;
  level: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  expandedIds: Set<string>;
}

function TreeNode({ node, level, selectedId, onSelect, onToggle, expandedIds }: TreeNodeProps) {
  const Icon = typeIcons[node.type] || Cpu;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer transition-colors",
          isSelected ? "bg-primary/20 text-primary" : "hover:bg-secondary/50",
          level > 0 && "ml-4"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="p-0.5 hover:bg-secondary rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <Icon className={cn("h-4 w-4", typeColors[node.type])} />
        <span className={cn("text-sm", isSelected && "font-medium")}>{node.name}</span>
        {node.type === "equipment" && (
          <Check className="h-4 w-4 text-emerald-400 ml-auto" />
        )}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggle={onToggle}
              expandedIds={expandedIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AssetHierarchyDashboard() {
  const [selectedId, setSelectedId] = useState<string | null>("room-101");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(["city-office", "building-a", "floor-1", "room-101"])
  );
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");

  const handleToggle = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Get selected asset details
  const selectedAsset = mockAssets.find((a) => a.id === "AST-003"); // HVAC Unit for demo

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Asset Hierarchy Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("tree")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "tree" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tree View */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-3 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="font-medium">City Office Complex</span>
            </div>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {mockHierarchy.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onToggle={handleToggle}
                expandedIds={expandedIds}
              />
            ))}
          </div>
        </div>

        {/* Asset Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Details Panel */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/30">
              <h2 className="text-lg font-semibold text-primary">Room 101 - Office Space</h2>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Asset ID:</p>
                <p className="text-sm font-medium">A10234</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location:</p>
                <p className="text-sm font-medium">City Hall - 2nd Floor</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Condition:</p>
                <p className="text-sm font-medium text-emerald-400">Good</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type:</p>
                <p className="text-sm font-medium">Office Space</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Area:</p>
                <p className="text-sm font-medium">120 sq.m</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Acquisition Date:</p>
                <p className="text-sm font-medium">12/05/2010</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Useful Life:</p>
                <p className="text-sm font-medium">45 Years</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Inspection:</p>
                <p className="text-sm font-medium">Jan 2022</p>
              </div>
            </div>
          </div>

          {/* Installed Equipment */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/30">
              <h3 className="font-semibold">Installed Equipment</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium">HVAC Unit - Installed 2018</p>
                    <p className="text-xs text-muted-foreground">Carrier | HV-20094</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                  Service
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium">Projector - Installed 2020</p>
                    <p className="text-xs text-muted-foreground">Epson | PR-10234</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  Good
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium">Network Rack - Installed 2019</p>
                    <p className="text-xs text-muted-foreground">Cisco | NR-55678</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  Good
                </span>
              </div>
            </div>
          </div>

          {/* Equipment Photos */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/30">
              <h3 className="font-semibold">Equipment Photos</h3>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3">
              <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Cpu className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-xs">HVAC Unit</p>
                </div>
              </div>
              <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-xs">Room View</p>
                </div>
              </div>
              <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Layers className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-xs">Equipment Rack</p>
                </div>
              </div>
            </div>
          </div>

          {/* Child Assets */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/30">
              <h3 className="font-semibold">Child Assets</h3>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3">
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="text-sm font-medium">EQ-5001</p>
                <p className="text-xs text-primary mt-1">Air Conditioner</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="text-sm font-medium">EQ-5002</p>
                <p className="text-xs text-primary mt-1">Projector</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="text-sm font-medium">EQ-5003</p>
                <p className="text-xs text-primary mt-1">Smart Board</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
