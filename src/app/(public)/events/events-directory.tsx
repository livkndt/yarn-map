'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Search, Filter, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';

const EventDetailModal = dynamic(
  () =>
    import('./event-detail-modal').then((mod) => ({
      default: mod.EventDetailModal,
    })),
  { ssr: false },
);

const ReportModal = dynamic(
  () =>
    import('@/components/report-modal').then((mod) => ({
      default: mod.ReportModal,
    })),
  { ssr: false },
);

const SubmissionModal = dynamic(
  () =>
    import('@/components/submission-modal').then((mod) => ({
      default: mod.SubmissionModal,
    })),
  { ssr: false },
);
import type { Event } from '@/types';

const UK_REGIONS = [
  'All Regions',
  'North',
  'Midlands',
  'South',
  'Scotland',
  'Wales',
  'Northern Ireland',
  'London',
];

interface EventsDirectoryProps {
  initialEvents?: Event[];
  initialTotal?: number;
}

export function EventsDirectory({
  initialEvents = [],
  initialTotal = 0,
}: EventsDirectoryProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(initialTotal);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [reportEntity, setReportEntity] = useState<{
    type: 'Event' | 'Shop';
    id: string;
  } | null>(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const isInitialMount = useRef(true);

  // Filters
  const [upcoming, setUpcoming] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All Regions');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (upcoming) {
        params.append('upcoming', 'true');
      }

      if (location && location !== 'All Regions') {
        params.append('location', location);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/events?${params.toString()}`, {
        cache: 'no-store', // Always fetch fresh data to avoid stale cache
      });
      const data = await response.json();

      if (response.ok) {
        setEvents(data.events);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize the events display to prevent unnecessary re-renders
  const displayEvents = useMemo(() => events, [events]);

  useEffect(() => {
    // Skip initial fetch if we have initial data
    if (isInitialMount.current && initialEvents.length > 0) {
      isInitialMount.current = false;
      return;
    }
    isInitialMount.current = false;
    fetchEvents();
  }, [upcoming, location, offset]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      setOffset(0);
      fetchEvents();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const formatEventDate = (startDate: string, endDate: string | null) => {
    const start = parseISO(startDate);
    if (endDate) {
      const end = parseISO(endDate);
      if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
        return format(start, 'd MMMM yyyy');
      }
      return `${format(start, 'd')}-${format(end, 'd MMMM yyyy')}`;
    }
    return format(start, 'd MMMM yyyy');
  };

  const truncateDescription = (text: string | null, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
            Events Directory
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover fiber arts events across the UK
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setSubmissionModalOpen(true)}
            variant="outline"
            className="hidden md:flex"
          >
            <Plus className="mr-2 h-4 w-4" />
            Submit Event
          </Button>
          <Button asChild variant="outline" className="hidden md:flex">
            <Link href="/events/calendar">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendar View
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={location}
              onValueChange={(value) => {
                setLocation(value);
                setOffset(0); // Reset to first page when location changes
              }}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {UK_REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={upcoming ? 'default' : 'outline'}
                onClick={() => {
                  setUpcoming(true);
                  setOffset(0);
                }}
              >
                Upcoming
              </Button>
              <Button
                variant={!upcoming ? 'default' : 'outline'}
                onClick={() => {
                  setUpcoming(false);
                  setOffset(0);
                }}
              >
                All Events
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {loading && events.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-20 w-full rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No events found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back soon for new events!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {displayEvents.length} of {total} events
          </div>
          <div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            suppressHydrationWarning
          >
            {displayEvents.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-lg"
                suppressHydrationWarning
                onClick={() => setSelectedEvent(event)}
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2">{event.name}</CardTitle>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatEventDate(event.startDate, event.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {truncateDescription(event.description, 150)}
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                    }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {Math.floor(offset / limit) + 1} of{' '}
                {Math.ceil(total / limit)}
              </span>
              <Button
                variant="outline"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onReport={() => {
            setReportEntity({ type: 'Event', id: selectedEvent.id });
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Report Modal */}
      {reportEntity && (
        <ReportModal
          entityType={reportEntity.type}
          entityId={reportEntity.id}
          open={!!reportEntity}
          onClose={() => setReportEntity(null)}
        />
      )}

      {/* Submission Modal */}
      <SubmissionModal
        entityType="Event"
        open={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
      />
    </div>
  );
}
