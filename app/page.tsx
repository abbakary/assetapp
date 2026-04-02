'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function Home() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user === null) {
      // User is not logged in, redirect to login
      router.replace('/login');
    }
  }, [user, router]);

  // Show dashboard for logged in users, empty for unauthenticated (will redirect to login)
  return user ? <DashboardLayout /> : <div />;
}
