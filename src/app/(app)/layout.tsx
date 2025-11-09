'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { useAuthContext } from '@/contexts/auth-provider';
import { Logo } from '@/components/icons/logo';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Logo className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pt-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
