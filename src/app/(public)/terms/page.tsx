import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Yarn Map',
  description:
    'Read the terms and conditions for using Yarn Map and contributing listings.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <section className="text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            By using Yarn Map, you agree to the terms below. These help keep the
            directory accurate, respectful, and useful for the community.
          </p>
        </section>

        <section className="space-y-6 text-sm text-muted-foreground">
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              1. Using the directory
            </h2>
            <p>
              Yarn Map is provided for personal, non-commercial use. You may
              browse listings, share links to listings, and use the information
              to plan visits to shops or events.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              2. Submitting listings
            </h2>
            <p>
              You can submit shops or events you know about. Please only submit
              information you believe is accurate and up to date. We may edit or
              remove submissions to maintain quality and relevance.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              3. Content accuracy
            </h2>
            <p>
              We do our best to keep listings accurate, but details can change.
              Yarn Map does not guarantee the accuracy, completeness, or
              availability of any listing.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              4. Third-party links
            </h2>
            <p>
              Listings may link to external websites. Yarn Map is not
              responsible for third-party content, policies, or services.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              5. Changes to these terms
            </h2>
            <p>
              We may update these terms over time. Continued use of Yarn Map
              means you accept the updated terms.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
