import Link from 'next/link';
import { Metadata } from 'next';
import { Calendar, HelpCircle, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'About Yarn Map',
  description:
    'Learn how Yarn Map helps you find UK yarn shops and fiber arts events, and how to add listings to the directory.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <section className="text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            About Yarn Map
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Yarn Map is a community-powered directory for finding fiber arts
            events and independent yarn shops across the UK. Browse what is near
            you, discover new places to visit, and help keep the listings
            accurate.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/events">
                <Calendar className="mr-2 h-5 w-5" />
                Browse Events
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/shops">
                <MapPin className="mr-2 h-5 w-5" />
                Browse Shops
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="h-5 w-5 text-primary" />
                Events directory
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Find knitting circles, crochet workshops, yarn festivals, and
              other fiber arts gatherings with filters for dates and locations.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-5 w-5 text-primary" />
                Shop listings
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Discover independent yarn shops, browse details, and use the map
              to plan your next visit.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plus className="h-5 w-5 text-primary" />
                Community submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Know a shop or event that is missing? Submit it and help the
              directory stay up to date for everyone.
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-2xl font-semibold">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  How can I add my yarn shop or event to the directory?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Head to the homepage and use the &quot;Submit a Shop&quot; or
                &quot;Submit an Event&quot; buttons. Share the name, location,
                dates, and any helpful links, and we will review it before
                publishing.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  I spotted an error or an out-of-date listing. What should I
                  do?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Use the <Link href="/report">report form</Link> to flag the
                listing and share the correction. This helps us keep details
                accurate for everyone.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Does Yarn Map only cover the UK?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Yes. Yarn Map focuses on UK yarn shops and fiber arts events so
                listings are easier to find and verify.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  How quickly are submissions published?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Submissions are reviewed before they appear in the directory.
                Timing can vary, but we aim to add listings as quickly as
                possible.
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
