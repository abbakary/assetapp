'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, getDemoUser, getAllDemoUsers } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'viewer'>('admin');
  const [isLoading, setIsLoading] = useState(false);

  const demoUsers = {
    admin: getDemoUser('admin_demo'),
    manager: getDemoUser('manager_demo'),
    viewer: getDemoUser('viewer_demo'),
  };

  const handleLogin = async (role: 'admin' | 'manager' | 'viewer') => {
    setIsLoading(true);
    setSelectedRole(role);
    
    // Simulate auth delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = demoUsers[role];
    login(user);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Asset Management System</h1>
          <p className="text-slate-400">Tanzania Asset Registry Platform</p>
        </div>

        {/* Main Card */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white">Demo Login</CardTitle>
            <CardDescription className="text-slate-400">
              Select a role to explore the system with different permission levels
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Admin Demo User */}
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRole === 'admin'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => setSelectedRole('admin')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-blue-600/30 text-blue-300 text-xs font-semibold">
                        ADMIN
                      </span>
                      Admin User
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{demoUsers.admin.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Full access: Create, edit, delete assets, manage users, export reports
                    </p>
                  </div>
                  <Button
                    onClick={() => handleLogin('admin')}
                    disabled={isLoading && selectedRole === 'admin'}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    {isLoading && selectedRole === 'admin' ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Loading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" /> Login
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Staff Manager Demo User */}
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRole === 'manager'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => setSelectedRole('manager')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-amber-600/30 text-amber-300 text-xs font-semibold">
                        MANAGER
                      </span>
                      Staff Manager
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{demoUsers.manager.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Limited access: Create and edit assets, upload documents, view reports
                    </p>
                  </div>
                  <Button
                    onClick={() => handleLogin('manager')}
                    disabled={isLoading && selectedRole === 'manager'}
                    className="bg-amber-600 hover:bg-amber-700"
                    size="sm"
                  >
                    {isLoading && selectedRole === 'manager' ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Loading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" /> Login
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Viewer Demo User */}
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRole === 'viewer'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => setSelectedRole('viewer')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-green-600/30 text-green-300 text-xs font-semibold">
                        VIEWER
                      </span>
                      Viewer User
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{demoUsers.viewer.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Read-only access: View assets, documents, and reports only
                    </p>
                  </div>
                  <Button
                    onClick={() => handleLogin('viewer')}
                    disabled={isLoading && selectedRole === 'viewer'}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {isLoading && selectedRole === 'viewer' ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Loading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" /> Login
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-700">
              <h4 className="text-sm font-semibold text-white mb-2">About Demo Mode</h4>
              <p className="text-xs text-slate-400">
                This is a demonstration system. Authentication is simulated for development purposes. 
                Each role has different permissions to show how the system responds to user access levels.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-500 text-sm">
          <p>© 2024 Asset Management System • Tanzania</p>
        </div>
      </div>
    </div>
  );
}
