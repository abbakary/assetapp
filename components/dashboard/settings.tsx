'use client';

import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Bell, Lock, Palette, Database, Info } from 'lucide-react';

export function SettingsDashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure system preferences and settings</p>
      </div>

      {/* Your Account */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Your Account
          </CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <p className="text-sm text-muted-foreground mt-1">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <div className="mt-1">
                <Badge className={
                  user?.role === 'admin'
                    ? 'bg-blue-500/20 text-blue-400'
                    : user?.role === 'staff_manager'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-green-500/20 text-green-400'
                }>
                  {user?.role === 'admin'
                    ? 'Administrator'
                    : user?.role === 'staff_manager'
                    ? 'Staff Manager'
                    : 'Viewer'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <p className="text-sm text-muted-foreground mt-1">{user?.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <p className="text-sm text-muted-foreground mt-1">{user?.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Account Status</label>
              <div className="mt-1">
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <label className="text-sm font-medium">Asset Updates</label>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <label className="text-sm font-medium">Maintenance Alerts</label>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <label className="text-sm font-medium">Document Changes</label>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <label className="text-sm font-medium">System Notifications</label>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Enable Two-Factor Authentication
          </Button>
          <div className="p-4 bg-yellow-500/5 border border-yellow-500/30 rounded-lg mt-4">
            <p className="text-sm text-yellow-400">
              <span className="font-semibold">Demo Mode:</span> Security features are simulated for demonstration purposes only.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            System Configuration
          </CardTitle>
          <CardDescription>System-wide settings for the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Operating Country</p>
              <p className="text-lg font-semibold mt-1">Tanzania</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Map Configuration</p>
              <p className="text-lg font-semibold mt-1">Leaflet/CartoDB</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Default Timezone</p>
              <p className="text-lg font-semibold mt-1">East Africa Time (EAT)</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Language</p>
              <p className="text-lg font-semibold mt-1">English</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Application Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-green-400">Operational</span>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-slate-700 bg-slate-800/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Need help? Contact the system administrator for support and assistance.
            </p>
            <Button variant="outline" className="w-full">
              Visit Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
