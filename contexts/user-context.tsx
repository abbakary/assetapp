'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole, RolePermissions, ROLE_PERMISSIONS } from '@/lib/types';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  getPermissions: () => RolePermissions;
  hasPermission: (permission: keyof RolePermissions) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Demo users for development
const DEMO_USERS: Record<string, User> = {
  admin_demo: {
    id: '1',
    email: 'admin@assetmgmt.com',
    name: 'Admin User',
    role: 'admin',
    department: 'IT',
    phone: '+255 123 456 789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    status: 'active',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date().toISOString(),
  },
  manager_demo: {
    id: '2',
    email: 'manager@assetmgmt.com',
    name: 'Staff Manager',
    role: 'staff_manager',
    department: 'Facilities',
    phone: '+255 987 654 321',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
    status: 'active',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date().toISOString(),
  },
  viewer_demo: {
    id: '3',
    email: 'viewer@assetmgmt.com',
    name: 'Viewer User',
    role: 'viewer',
    department: 'Finance',
    phone: '+255 555 666 777',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date().toISOString(),
  },
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Only restore session on client side
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to restore user session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  }, []);

  const getPermissions = useCallback((): RolePermissions => {
    if (!user) {
      return {
        canViewAssets: false,
        canCreateAssets: false,
        canEditAssets: false,
        canDeleteAssets: false,
        canViewDocuments: false,
        canUploadDocuments: false,
        canDeleteDocuments: false,
        canViewReports: false,
        canExportReports: false,
        canManageUsers: false,
        canAccessSettings: false,
      };
    }
    return ROLE_PERMISSIONS[user.role];
  }, [user]);

  const hasPermission = useCallback(
    (permission: keyof RolePermissions): boolean => {
      return getPermissions()[permission] ?? false;
    },
    [getPermissions]
  );

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading: false,
        login,
        logout,
        getPermissions,
        hasPermission,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Helper function to get demo user by key
export function getDemoUser(key: keyof typeof DEMO_USERS) {
  return DEMO_USERS[key];
}

export function getAllDemoUsers() {
  return Object.values(DEMO_USERS);
}
