"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  X,
  Building2,
  Car,
  Cpu,
  LandPlot,
  Wrench,
  Armchair,
  Check,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssetClass, AssetStatus, AssetCondition } from "@/lib/types";

// Dynamic import for the location picker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import("./location-picker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-lg bg-secondary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

interface AssetFormData {
  name: string;
  assetClass: AssetClass;
  type: string;
  parentId: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  landTitle: string;
  useType: string;
  condition: AssetCondition;
  status: AssetStatus;
  acquisitionDate: string;
  acquisitionMethod: string;
  cost: number;
  currentValue: number;
  residualValue: number;
  usefulLife: number;
  fundingSource: string;
  responsibleUnit: string;
  ownership: string;
  manufacturer: string;
  serialNumber: string;
}

const initialFormData: AssetFormData = {
  name: "",
  assetClass: "buildings",
  type: "",
  parentId: "",
  location: "",
  latitude: null,
  longitude: null,
  address: "",
  landTitle: "",
  useType: "",
  condition: "good",
  status: "active",
  acquisitionDate: "",
  acquisitionMethod: "",
  cost: 0,
  currentValue: 0,
  residualValue: 0,
  usefulLife: 0,
  fundingSource: "",
  responsibleUnit: "",
  ownership: "",
  manufacturer: "",
  serialNumber: "",
};

const assetClasses: { value: AssetClass; label: string; icon: React.ElementType }[] = [
  { value: "land", label: "Land", icon: LandPlot },
  { value: "buildings", label: "Buildings", icon: Building2 },
  { value: "vehicles", label: "Vehicles", icon: Car },
  { value: "equipment", label: "Equipment", icon: Wrench },
  { value: "ict", label: "ICT Assets", icon: Cpu },
  { value: "furniture", label: "Furniture", icon: Armchair },
];

const assetTypes: Record<AssetClass, string[]> = {
  land: ["Vacant Land", "Parking Lot", "Agricultural", "Commercial Plot"],
  buildings: ["Office Building", "Warehouse", "Residential", "Storage Facility", "Industrial"],
  vehicles: ["Sedan", "SUV", "Truck", "Van", "Utility Vehicle", "Bus"],
  equipment: ["HVAC System", "Generator", "Pump", "Compressor", "Machinery"],
  ict: ["Server", "Network Equipment", "Computer", "Projector", "AV Equipment"],
  furniture: ["Office Desk", "Chair", "Cabinet", "Conference Table", "Workstation"],
};

const conditions: { value: AssetCondition; label: string; color: string }[] = [
  { value: "excellent", label: "Excellent", color: "bg-emerald-500" },
  { value: "good", label: "Good", color: "bg-blue-500" },
  { value: "fair", label: "Fair", color: "bg-amber-500" },
  { value: "poor", label: "Poor", color: "bg-red-500" },
];

const statuses: { value: AssetStatus; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active / In Use" },
  { value: "under-maintenance", label: "Under Maintenance" },
  { value: "decommissioned", label: "Decommissioned" },
  { value: "disposed", label: "Disposed" },
];

interface AssetRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssetFormData) => void;
  parentAssets?: { id: string; name: string }[];
}

export function AssetRegistrationForm({ isOpen, onClose, onSubmit, parentAssets = [] }: AssetRegistrationFormProps) {
  const [formData, setFormData] = useState<AssetFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof AssetFormData, string>>>({});
  const [activeSection, setActiveSection] = useState<string>("basic");

  const handleInputChange = (field: keyof AssetFormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address,
      location: address.split(",")[0] || address,
    }));
    setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AssetFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Asset name is required";
    if (!formData.assetClass) newErrors.assetClass = "Asset class is required";
    if (!formData.type) newErrors.type = "Asset type is required";
    if (formData.latitude === null) newErrors.latitude = "Location is required";
    if (formData.longitude === null) newErrors.longitude = "Location is required";
    if (!formData.responsibleUnit.trim()) newErrors.responsibleUnit = "Responsible unit is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      setFormData(initialFormData);
      onClose();
    }
  };

  if (!isOpen) return null;

  const sections = [
    { id: "basic", label: "Basic Info" },
    { id: "location", label: "Location" },
    { id: "financial", label: "Financial" },
    { id: "technical", label: "Technical" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <h2 className="text-xl font-bold text-primary">Register New Asset</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-border bg-secondary/20">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeSection === section.id
                  ? "bg-primary/20 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Info Section */}
          {activeSection === "basic" && (
            <div className="space-y-6">
              {/* Asset Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Asset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter asset name"
                  className={cn(
                    "w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                    errors.name && "ring-2 ring-red-500"
                  )}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Asset Class */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Asset Class <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {assetClasses.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => {
                        handleInputChange("assetClass", value);
                        handleInputChange("type", "");
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                        formData.assetClass === value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", formData.assetClass === value ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("text-sm font-medium", formData.assetClass === value && "text-primary")}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Asset Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className={cn(
                      "w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none",
                      errors.type && "ring-2 ring-red-500"
                    )}
                  >
                    <option value="">Select asset type</option>
                    {assetTypes[formData.assetClass]?.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                </div>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
              </div>

              {/* Parent Asset */}
              <div>
                <label className="block text-sm font-medium mb-2">Parent Asset (for hierarchy)</label>
                <div className="relative">
                  <select
                    value={formData.parentId}
                    onChange={(e) => handleInputChange("parentId", e.target.value)}
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    <option value="">None (Top-level asset)</option>
                    {parentAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>{asset.name} ({asset.id})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                </div>
              </div>

              {/* Status & Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value as AssetStatus)}
                      className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                    >
                      {statuses.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Condition</label>
                  <div className="flex gap-2">
                    {conditions.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => handleInputChange("condition", c.value)}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all border-2",
                          formData.condition === c.value
                            ? `${c.color} text-white border-transparent`
                            : "bg-secondary border-border hover:border-primary/50"
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ownership & Responsible Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ownership</label>
                  <input
                    type="text"
                    value={formData.ownership}
                    onChange={(e) => handleInputChange("ownership", e.target.value)}
                    placeholder="e.g., City Government"
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Responsible Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.responsibleUnit}
                    onChange={(e) => handleInputChange("responsibleUnit", e.target.value)}
                    placeholder="e.g., Facilities Management"
                    className={cn(
                      "w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                      errors.responsibleUnit && "ring-2 ring-red-500"
                    )}
                  />
                  {errors.responsibleUnit && <p className="text-red-500 text-xs mt-1">{errors.responsibleUnit}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Location Section */}
          {activeSection === "location" && (
            <div className="space-y-6">
              {/* Map */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Location on Map <span className="text-red-500">*</span>
                </label>
                <LocationPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationSelect={handleLocationSelect}
                />
                {(errors.latitude || errors.longitude) && (
                  <p className="text-red-500 text-xs mt-1">Please select a location on the map</p>
                )}
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude ?? ""}
                    onChange={(e) => handleInputChange("latitude", e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g., 40.7128"
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude ?? ""}
                    onChange={(e) => handleInputChange("longitude", e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g., -74.006"
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Full address (auto-filled from map selection)"
                  rows={2}
                  className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* Location Name & Land Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location Name</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., Downtown District"
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Land Title Reference</label>
                  <input
                    type="text"
                    value={formData.landTitle}
                    onChange={(e) => handleInputChange("landTitle", e.target.value)}
                    placeholder="e.g., LT-2024-001"
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Use Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Use Type</label>
                <input
                  type="text"
                  value={formData.useType}
                  onChange={(e) => handleInputChange("useType", e.target.value)}
                  placeholder="e.g., Commercial, Residential, Industrial"
                  className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          )}

          {/* Financial Section */}
          {activeSection === "financial" && (
            <div className="space-y-6">
              {/* Acquisition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Acquisition Date</label>
                  <input
                    type="date"
                    value={formData.acquisitionDate}
                    onChange={(e) => handleInputChange("acquisitionDate", e.target.value)}
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Acquisition Method</label>
                  <select
                    value={formData.acquisitionMethod}
                    onChange={(e) => handleInputChange("acquisitionMethod", e.target.value)}
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    <option value="">Select method</option>
                    <option value="purchase">Purchase</option>
                    <option value="lease">Lease</option>
                    <option value="donation">Donation</option>
                    <option value="construction">Construction</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>

              {/* Values */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Acquisition Cost ($)</label>
                  <input
                    type="number"
                    value={formData.cost || ""}
                    onChange={(e) => handleInputChange("cost", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Current Value ($)</label>
                  <input
                    type="number"
                    value={formData.currentValue || ""}
                    onChange={(e) => handleInputChange("currentValue", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Residual Value ($)</label>
                  <input
                    type="number"
                    value={formData.residualValue || ""}
                    onChange={(e) => handleInputChange("residualValue", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Useful Life & Funding */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Useful Life (years)</label>
                  <input
                    type="number"
                    value={formData.usefulLife || ""}
                    onChange={(e) => handleInputChange("usefulLife", parseInt(e.target.value) || 0)}
                    placeholder="e.g., 10"
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Funding Source</label>
                  <input
                    type="text"
                    value={formData.fundingSource}
                    onChange={(e) => handleInputChange("fundingSource", e.target.value)}
                    placeholder="e.g., Capital Budget 2024"
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Technical Section */}
          {activeSection === "technical" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                    placeholder="e.g., Carrier, Dell, Ford"
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                    placeholder="e.g., SN-12345-ABC"
                    className="w-full bg-secondary px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Note</h4>
                <p className="text-xs text-muted-foreground">
                  Additional technical specifications can be added after the asset is registered. 
                  You can also attach documents such as warranties, manuals, and certifications in the Document Management section.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-secondary/30">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {activeSection !== "basic" && (
              <button
                onClick={() => {
                  const idx = sections.findIndex((s) => s.id === activeSection);
                  if (idx > 0) setActiveSection(sections[idx - 1].id);
                }}
                className="px-6 py-2.5 rounded-md text-sm font-medium bg-secondary hover:bg-secondary/80 transition-colors"
              >
                Previous
              </button>
            )}
            {activeSection !== "technical" ? (
              <button
                onClick={() => {
                  const idx = sections.findIndex((s) => s.id === activeSection);
                  if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
                }}
                className="px-6 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Register Asset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
