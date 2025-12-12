'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-heading text-xl font-bold text-primary">
              Yarn Map
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              href="/events"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive('/events') ? 'text-primary' : 'text-foreground',
              )}
            >
              Events
            </Link>
            <Link
              href="/shops"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive('/shops') ? 'text-primary' : 'text-foreground',
              )}
            >
              Shops
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <Link
                href="/events"
                className={cn(
                  'block rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent',
                  isActive('/events')
                    ? 'bg-accent text-primary'
                    : 'text-foreground',
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/shops"
                className={cn(
                  'block rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent',
                  isActive('/shops')
                    ? 'bg-accent text-primary'
                    : 'text-foreground',
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Shops
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
