import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Find fiber arts events and yarn shops across the UK
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Discover knitting circles, crochet workshops, yarn festivals, and
            independent yarn shops near you. Your guide to the UK fiber arts
            community.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/events">
                <Calendar className="mr-2 h-5 w-5" />
                Browse Events
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <Link href="/shops">
                <MapPin className="mr-2 h-5 w-5" />
                Find Yarn Shops
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <Calendar className="h-8 w-8 text-primary" />
                <h2 className="mt-4 font-heading text-xl font-semibold">
                  Events Directory
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Find knitting circles, crochet workshops, yarn festivals, and
                  fiber arts events happening across the UK.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <MapPin className="h-8 w-8 text-primary" />
                <h2 className="mt-4 font-heading text-xl font-semibold">
                  Shop Directory
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Discover independent yarn shops, their locations, contact
                  information, and specialties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
