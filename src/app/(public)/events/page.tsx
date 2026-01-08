import { Metadata } from 'next';
import { EventsDirectory } from './events-directory';
import { db } from '@/lib/db';
import type { Event } from '@/types';

export const metadata: Metadata = {
  title: 'UK Fiber Arts Events | Yarn Map',
  description:
    'Find knitting circles, crochet workshops, yarn festivals, and fiber arts events happening across the UK.',
};

export const revalidate = 3600; // Revalidate every hour

async function getInitialEvents(): Promise<{ events: Event[]; total: number }> {
  try {
    const [events, total] = await Promise.all([
      db.event.findMany({
        where: {
          startDate: {
            gte: new Date(),
          },
        },
        orderBy: { startDate: 'asc' },
        take: 20,
        skip: 0,
      }),
      db.event.count({
        where: {
          startDate: {
            gte: new Date(),
          },
        },
      }),
    ]);

    return {
      events: events.map((event) => ({
        id: event.id,
        name: event.name,
        description: event.description,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate?.toISOString() ?? null,
        location: event.location,
        address: event.address,
        region: event.region,
        latitude: event.latitude,
        longitude: event.longitude,
        website: event.website,
        source: event.source,
      })),
      total,
    };
  } catch (error) {
    console.error('Error fetching initial events:', error);
    return { events: [], total: 0 };
  }
}

export default async function EventsPage() {
  const initialData = await getInitialEvents();
  return (
    <EventsDirectory
      initialEvents={initialData.events}
      initialTotal={initialData.total}
    />
  );
}
