import { Metadata } from 'next';
import { EventsCalendar } from './events-calendar';

export const metadata: Metadata = {
  title: 'Events Calendar | Yarn Map',
  description: 'View fiber arts events on a calendar',
};

export default function EventsCalendarPage() {
  return <EventsCalendar />;
}
