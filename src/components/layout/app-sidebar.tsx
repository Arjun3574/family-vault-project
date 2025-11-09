'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Upload, CalendarHeart, Users, LogOut } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/auth-provider';

const navItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/upload', icon: Upload, label: 'Upload Photo' },
  { href: '/special-days', icon: CalendarHeart, label: 'Special Days' },
  { href: '/family', icon: Users, label: 'Family' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthContext();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r bg-card p-4 shadow-inner md:flex">
      <div className="flex items-center gap-3 px-2 py-4">
        <Logo className="h-8 w-8 text-primary" />
        <span className="font-headline text-2xl font-bold">FamilyVault</span>
      </div>
      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <Button
              variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
