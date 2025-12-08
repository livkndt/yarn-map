import { MapPin } from 'lucide-react';

export default function ShopsPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <MapPin className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-foreground">
          Shop Directory & Map
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Coming Soon - Shop Directory & Map
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;re building an interactive map and directory of yarn shops
          across the UK. Check back soon!
        </p>
      </div>
    </div>
  );
}
