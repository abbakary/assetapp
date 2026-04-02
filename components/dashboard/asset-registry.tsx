"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  Car,
  Cpu,
  LandPlot,
  Wrench,
  Armchair,
  MapPin,
  Search,
  Filter,
  ChevronDown,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockAssets, assetClassCounts } from "@/lib/mock-data";
import type { Asset, AssetClass, AssetStatus } from "@/lib/types";
import dynamic from "next/dynamic";
import { AssetRegistrationForm } from "./asset-registration-form";

const AssetMap = dynamic(() => import("./asset-map"), { ssr: false });

const assetClassIcons: Record<AssetClass, React.ElementType> = {
  land: LandPlot,
  buildings: Building2,
  vehicles: Car,
  equipment: Wrench,
  ict: Cpu,
  furniture: Armchair,
};

const assetClassLabels: Record<AssetClass, string> = {
  land: "Land",
  buildings: "Buildings",
  vehicles: "Vehicles",
  equipment: "Equipment",
  ict: "ICT",
  furniture: "Furniture",
};

const statusColors: Record<AssetStatus, string> = {
  planned: "bg-blue-500",
  active: "bg-emerald-500",
  "under-maintenance": "bg-amber-500",
  decommissioned: "bg-orange-600",
  disposed: "bg-red-600",
};

const statusLabels: Record<AssetStatus, string> = {
  planned: "Planned",
  active: "Active",
  "under-maintenance": "Maintenance",
  decommissioned: "Decommissioned",
  disposed: "Disposed",
};

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-md text-sm hover:bg-secondary/80 transition-colors min-w-[120px]"
      >
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium">{options.find((o) => o.value === value)?.label || "All"}</span>
        <ChevronDown className="h-4 w-4 ml-auto" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-lg z-20 min-w-full">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors first:rounded-t-md last:rounded-b-md",
                  value === option.value && "bg-primary/20 text-primary"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function AssetRegistryDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClass === "all" || asset.assetClass === selectedClass;
      const matchesStatus = selectedStatus === "all" || asset.status === selectedStatus;
      const matchesLocation =
        selectedLocation === "all" ||
        asset.location.toLowerCase().includes(selectedLocation.toLowerCase());
      return matchesSearch && matchesClass && matchesStatus && matchesLocation;
    });
  }, [searchQuery, selectedClass, selectedStatus, selectedLocation, assets]);

  const stats = useMemo(() => {
    return {
      total: assets.length,
      active: assets.filter((a) => a.status === "active").length,
      underMaintenance: assets.filter((a) => a.status === "under-maintenance").length,
      decommissioned: assets.filter((a) => a.status === "decommissioned" || a.status === "disposed")
        .length,
      totalValue: assets.reduce((sum, a) => sum + a.value, 0),
    };
  }, [assets]);

  const handleAssetSubmit = (formData: any) => {
    const newAsset: Asset = {
      id: `AST-${String(assets.length + 1).padStart(3, "0")}`,
      name: formData.name,
      assetClass: formData.assetClass,
      type: formData.type,
      location: formData.location || formData.address?.split(",")[0] || "Unknown",
      status: formData.status,
      condition: formData.condition,
      value: formData.currentValue || formData.cost || 0,
      acquisitionDate: formData.acquisitionDate || new Date().toISOString().split("T")[0],
      latitude: formData.latitude,
      longitude: formData.longitude,
      parentId: formData.parentId || undefined,
      responsibleUnit: formData.responsibleUnit,
      usefulLife: formData.usefulLife || 10,
      remainingLife: formData.usefulLife || 10,
      manufacturer: formData.manufacturer,
      serialNumber: formData.serialNumber,
    };
    setAssets((prev) => [newAsset, ...prev]);
  };

  const parentAssets = assets
    .filter((a) => a.assetClass === "buildings" || a.assetClass === "land")
    .map((a) => ({ id: a.id, name: a.name }));

  const classOptions = [
    { value: "all", label: "All" },
    ...Object.entries(assetClassLabels).map(([value, label]) => ({ value, label })),
  ];

  const statusOptions = [
    { value: "all", label: "All" },
    ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
  ];

  const locationOptions = [
    { value: "all", label: "All" },
    { value: "downtown", label: "Downtown" },
    { value: "industrial", label: "Industrial" },
    { value: "motor pool", label: "Motor Pool" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Asset Registry Dashboard</h1>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total Assets:</span>
            <span className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Under Maintenance:</span>
            <span className="text-xl font-bold text-amber-500">{stats.underMaintenance}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Decommissioned:</span>
            <span className="text-xl font-bold text-red-500">{stats.decommissioned}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <FilterDropdown label="Asset Class" value={selectedClass} options={classOptions} onChange={setSelectedClass} />
        <FilterDropdown label="Location" value={selectedLocation} options={locationOptions} onChange={setSelectedLocation} />
        <FilterDropdown label="Status" value={selectedStatus} options={statusOptions} onChange={setSelectedStatus} />
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors">
          <Filter className="h-4 w-4" />
          Advanced Search
        </button>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Register Asset
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Asset Table */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Asset ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Asset Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAssets.map((asset, index) => (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={cn(
                      "hover:bg-secondary/30 transition-colors cursor-pointer",
                      index % 2 === 0 ? "bg-card" : "bg-secondary/10",
                      selectedAsset?.id === asset.id && "bg-primary/20 ring-1 ring-primary"
                    )}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-primary">{asset.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{asset.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{asset.type}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {asset.location}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white",
                          statusColors[asset.status]
                        )}
                      >
                        {statusLabels[asset.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      ${asset.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Map */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-medium">Asset Locations</h3>
          </div>
          <div className="h-[300px]">
            <AssetMap assets={filteredAssets} selectedAsset={selectedAsset} onAssetClick={setSelectedAsset} />
          </div>
          {/* Selected Asset Info */}
          {selectedAsset && (
            <div className="p-3 border-t border-border bg-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">{selectedAsset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedAsset.latitude?.toFixed(6)}, {selectedAsset.longitude?.toFixed(6)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
          {/* Map Legend */}
          <div className="p-3 border-t border-border bg-secondary/30">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600" />
                <span>Decommissioned</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Planned</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Object.entries(assetClassCounts).map(([key, count]) => {
          const Icon = assetClassIcons[key as AssetClass];
          return (
            <div
              key={key}
              className="bg-card rounded-lg border border-border p-4 flex items-center gap-3 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="p-2 bg-primary/20 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{assetClassLabels[key as AssetClass]}</p>
                <p className="text-lg font-bold">{count.toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 rounded-lg border border-emerald-500/30 p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500 rounded-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-emerald-400">Active Assets</p>
            <p className="text-2xl font-bold text-emerald-500">1,800</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-600/20 to-amber-500/10 rounded-lg border border-amber-500/30 p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500 rounded-lg">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-amber-400">Under Construction</p>
            <p className="text-2xl font-bold text-amber-500">70</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-600/20 to-red-500/10 rounded-lg border border-red-500/30 p-4 flex items-center gap-4">
          <div className="p-3 bg-red-600 rounded-lg">
            <LandPlot className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-red-400">Decommissioned</p>
            <p className="text-2xl font-bold text-red-500">70</p>
          </div>
        </div>
      </div>

      {/* Asset Registration Form */}
      <AssetRegistrationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAssetSubmit}
        parentAssets={parentAssets}
      />
    </div>
  );
}
