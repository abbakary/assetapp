export type AssetStatus = 'planned' | 'active' | 'under-maintenance' | 'decommissioned' | 'disposed';
export type AssetClass = 'land' | 'buildings' | 'vehicles' | 'equipment' | 'ict' | 'furniture';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor';

// User Management Types
export type UserRole = 'admin' | 'staff_manager' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
}

export interface RolePermissions {
  canViewAssets: boolean;
  canCreateAssets: boolean;
  canEditAssets: boolean;
  canDeleteAssets: boolean;
  canViewDocuments: boolean;
  canUploadDocuments: boolean;
  canDeleteDocuments: boolean;
  canViewReports: boolean;
  canExportReports: boolean;
  canManageUsers: boolean;
  canAccessSettings: boolean;
}

// Role-to-Permissions Mapping
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewAssets: true,
    canCreateAssets: true,
    canEditAssets: true,
    canDeleteAssets: true,
    canViewDocuments: true,
    canUploadDocuments: true,
    canDeleteDocuments: true,
    canViewReports: true,
    canExportReports: true,
    canManageUsers: true,
    canAccessSettings: true,
  },
  staff_manager: {
    canViewAssets: true,
    canCreateAssets: true,
    canEditAssets: true,
    canDeleteAssets: false,
    canViewDocuments: true,
    canUploadDocuments: true,
    canDeleteDocuments: false,
    canViewReports: true,
    canExportReports: true,
    canManageUsers: false,
    canAccessSettings: false,
  },
  viewer: {
    canViewAssets: true,
    canCreateAssets: false,
    canEditAssets: false,
    canDeleteAssets: false,
    canViewDocuments: true,
    canUploadDocuments: false,
    canDeleteDocuments: false,
    canViewReports: true,
    canExportReports: false,
    canManageUsers: false,
    canAccessSettings: false,
  },
};

export interface Asset {
  id: string;
  name: string;
  assetClass: AssetClass;
  type: string;
  location: string;
  status: AssetStatus;
  condition: AssetCondition;
  value: number;
  acquisitionDate: string;
  latitude?: number;
  longitude?: number;
  parentId?: string;
  responsibleUnit: string;
  usefulLife: number;
  remainingLife: number;
  lastInspection?: string;
  manufacturer?: string;
  serialNumber?: string;
  installedDate?: string;
}

export interface AssetHierarchyNode {
  id: string;
  name: string;
  type: 'building' | 'floor' | 'room' | 'equipment';
  children?: AssetHierarchyNode[];
  expanded?: boolean;
}

export interface Document {
  id: string;
  assetId: string;
  name: string;
  type: 'title' | 'plan' | 'permit' | 'warranty' | 'photo' | 'maintenance';
  uploadDate: string;
  size: string;
  thumbnail?: string;
}

export interface InterventionLog {
  id: string;
  date: string;
  action: string;
  description: string;
  status: 'completed' | 'in-progress' | 'scheduled' | 'overdue';
}

export interface StatusCount {
  planned: number;
  active: number;
  underMaintenance: number;
  decommissioned: number;
  disposed: number;
}
