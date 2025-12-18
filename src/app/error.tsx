'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Securely log the error
    logger.error('Client-side error caught by boundary', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        Something went wrong!
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        We encountered an unexpected error. Our team has been notified and we're
        working to fix it.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={() => reset()} variant="default">
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button asChild variant="outline">
          <a href="/">Go to Homepage</a>
        </Button>
      </div>
    </div>
  );
}
