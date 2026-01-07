'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import dynamic from 'next/dynamic';
import type { Event } from '@/types';

const EventDetailModal = dynamic(
  () =>
    import('../event-detail-modal').then((mod) => ({
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

export function EventsCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [reportEntity, setReportEntity] = useState<{
    type: 'Event' | 'Shop';
    id: string;
  } | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const startDate = format(monthStart, "yyyy-MM-dd'T'00:00:00");
        const endDate = format(monthEnd, "yyyy-MM-dd'T'23:59:59");

        const response = await fetch(
          `/api/events?startDate=${startDate}&endDate=${endDate}&limit=1000`,
        );
        const data = await response.json();

        if (response.ok) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [monthStart, monthEnd]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((event) => {
      const eventStart = parseISO(event.startDate);
      const eventEnd = event.endDate ? parseISO(event.endDate) : eventStart;
      const daysInEvent = eachDayOfInterval({
        start: eventStart,
        end: eventEnd,
      });

      daysInEvent.forEach((day) => {
        const key = format(day, 'yyyy-MM-dd');
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(event);
      });
    });
    return map;
  }, [events]);

  const getEventsForDate = (date: Date): Event[] => {
    const key = format(date, 'yyyy-MM-dd');
    return eventsByDate.get(key) || [];
  };

  const handleDateClick = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length > 0) {
      setSelectedDate(date);
      if (dayEvents.length === 1) {
        setSelectedEvent(dayEvents[0]);
      }
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
          Events Calendar
        </h1>
        <p className="mt-2 text-muted-foreground">Browse events by month</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading events...</div>
            </div>
          ) : (
            <>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-semibold text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
                {days.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const dayEvents = getEventsForDate(day);

                  return (
                    <div
                      key={idx}
                      onClick={() => handleDateClick(day)}
                      className={`min-h-[80px] cursor-pointer border p-2 transition-colors hover:bg-muted/50 ${
                        isCurrentMonth
                          ? 'bg-background'
                          : 'bg-muted/30 text-muted-foreground'
                      } ${isToday ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div
                        className={`mb-1 text-sm font-medium ${
                          isToday ? 'text-primary' : ''
                        }`}
                      >
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="block w-full truncate rounded bg-primary/10 px-1 text-left text-xs text-primary hover:bg-primary/20"
                            title={event.name}
                          >
                            {event.name}
                          </button>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Date Events List */}
              {selectedDate && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="mb-4 font-semibold">
                    Events on {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <div className="font-medium">{event.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {event.location}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setSelectedEvent(event)}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
