import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, Map as MapIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-6xl font-bold text-primary sm:text-8xl">
        404
      </h1>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        Page Not Found
      </h2>
      <p className="mt-4 max-w-md text-muted-foreground">
        Oops! It looks like you've wandered off the trail. The page you're
        looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button asChild variant="default">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shops">
            <MapIcon className="mr-2 h-4 w-4" />
            Find Shops
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/events">
            <Search className="mr-2 h-4 w-4" />
            Find Events
          </Link>
        </Button>
      </div>
    </div>
  );
}
