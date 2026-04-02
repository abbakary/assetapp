'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function Home() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return <DashboardLayout />;
}
