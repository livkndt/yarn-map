'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Plus } from 'lucide-react';

const SubmissionModal = dynamic(
  () =>
    import('@/components/submission-modal').then((mod) => ({
      default: mod.SubmissionModal,
    })),
  {
    ssr: false,
  },
);

export function SubmissionSection() {
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionType, setSubmissionType] = useState<
    'Event' | 'Shop' | undefined
  >();

  return (
    <>
      <section className="border-t bg-primary/5">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Plus className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground">
              Help Us Grow the Directory
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Know of a yarn shop or fiber arts event that's not listed? Submit
              it to help others discover it!
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="default"
                onClick={() => {
                  setSubmissionType('Shop');
                  setSubmissionModalOpen(true);
                }}
                className="w-full sm:w-auto"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Submit a Shop
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setSubmissionType('Event');
                  setSubmissionModalOpen(true);
                }}
                className="w-full sm:w-auto"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Submit an Event
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SubmissionModal
        entityType={submissionType}
        open={submissionModalOpen}
        onClose={() => {
          setSubmissionModalOpen(false);
          setSubmissionType(undefined);
        }}
      />
    </>
  );
}
