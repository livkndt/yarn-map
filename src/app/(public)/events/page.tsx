import { Metadata } from 'next';
import { EventsDirectory } from './events-directory';

export const metadata: Metadata = {
  title: 'UK Fiber Arts Events | Yarn Map',
  description:
    'Find knitting circles, crochet workshops, yarn festivals, and fiber arts events happening across the UK.',
};

export const revalidate = 3600; // Revalidate every hour

export default function EventsPage() {
  return <EventsDirectory />;
}
