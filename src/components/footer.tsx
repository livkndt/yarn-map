import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Yarn Map
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Find fiber arts events and yarn shops across the UK
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">
              Directory
            </h4>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  href="/events"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/shops"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Shops
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">
              Support
            </h4>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  href="/report"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Report an Issue
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Yarn Map. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
