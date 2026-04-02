'use client';

import { useState } from 'react';
import { useUser, getAllDemoUsers } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Shield, Mail, Phone, Calendar, Lock } from 'lucide-react';
import type { User, UserRole } from '@/lib/types';
import { ROLE_PERMISSIONS } from '@/lib/types';

export function UserManagementDashboard() {
  const { user: currentUser, hasPermission } = useUser();
  const [users] = useState<User[]>(getAllDemoUsers());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Check if user has permission to access this page
  if (!currentUser || !hasPermission('canManageUsers')) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-semibold text-red-500">Access Denied</p>
              <p className="text-sm text-red-400">Only administrators can access user management.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'staff_manager':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'viewer':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'staff_manager':
        return 'Staff Manager';
      case 'viewer':
        return 'Viewer';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'suspended':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleDeleteClick = (userToRemove: User) => {
    setUserToDelete(userToRemove);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    // In a real system, you would call an API to delete the user
    if (userToDelete) {
      console.log('Delete user:', userToDelete.id);
    }
    setShowDeleteDialog(false);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-2">Manage users, roles, and permissions across the system</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total Users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {users.filter(u => u.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active Users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">
                {users.filter(u => u.role === 'staff_manager').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Managers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">
                {users.filter(u => u.status === 'suspended').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Suspended</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card
            key={user.id}
            className={`cursor-pointer transition-all border ${
              selectedUser?.id === user.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedUser(user)}
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* User Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>

                {/* User Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>{user.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Badge className={getStatusColor(user.status)}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                  {user.lastLogin && (
                    <span className="text-xs text-muted-foreground">
                      Last: {new Date(user.lastLogin).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={currentUser.id === user.id}
                    title={currentUser.id === user.id ? 'Cannot edit yourself' : 'Edit user (Coming soon)'}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    disabled={currentUser.id === user.id}
                    onClick={() => handleDeleteClick(user)}
                    title={currentUser.id === user.id ? 'Cannot delete yourself' : 'Delete user'}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Details Panel */}
      {selectedUser && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {selectedUser.name} - Permissions
            </CardTitle>
            <CardDescription>
              Permissions assigned to {getRoleLabel(selectedUser.role)} role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(ROLE_PERMISSIONS[selectedUser.role]).map(([permission, hasAccess]) => {
                const permissionLabel = permission
                  .replace('can', '')
                  .replace(/([A-Z])/g, ' $1')
                  .trim();

                return (
                  <div
                    key={permission}
                    className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border"
                  >
                    <div
                      className={`w-4 h-4 rounded ${
                        hasAccess
                          ? 'bg-green-500/20 border border-green-500'
                          : 'bg-red-500/20 border border-red-500'
                      }`}
                    />
                    <span className="text-sm">
                      {permissionLabel}
                      <span className={`ml-2 text-xs ${hasAccess ? 'text-green-400' : 'text-red-400'}`}>
                        ({hasAccess ? 'Allowed' : 'Denied'})
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{userToDelete?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
