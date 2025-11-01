'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LayoutGrid, Upload, CalendarHeart, Users, LogOut } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { UserNav } from './user-nav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/upload', icon: Upload, label: 'Upload Photo' },
  { href: '/special-days', icon: CalendarHeart, label: 'Special Days' },
  { href: '/family', icon: Users, label: 'Family' },
];

export function Header() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link href="/dashboard" className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Logo className="h-8 w-8" />
              <span className="font-headline">FamilyVault</span>
            </Link>
            {navItems.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  pathname.startsWith(item.href) ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
             <Button variant="ghost" className="w-full justify-start" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center justify-end">
        <UserNav />
      </div>
    </header>
  );
}
