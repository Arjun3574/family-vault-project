'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { UserAuthForm } from '@/components/auth/user-auth-form';
import { Logo } from '@/components/icons/logo';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Logo className="h-12 w-12 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-2xl">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Logo className="h-16 w-16 text-primary" />
          <h1 className="font-headline text-4xl font-bold tracking-tighter">
            Welcome to FamilyVault
          </h1>
          <p className="text-muted-foreground">
            Your secure digital scrapbook for precious family memories.
          </p>
        </div>
        <UserAuthForm className="mt-8" />
      </div>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FamilyVault. All rights reserved.</p>
      </footer>
    </div>
  );
}
