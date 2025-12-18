'use client';

import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, ExternalLink, Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Event } from '@/types';

interface EventDetailModalProps {
  event: Event;
  open: boolean;
  onClose: () => void;
  onReport: () => void;
}

export function EventDetailModal({
  event,
  open,
  onClose,
  onReport,
}: EventDetailModalProps) {
  const formatEventDate = (startDate: string, endDate: string | null) => {
    const start = parseISO(startDate);
    if (endDate) {
      const end = parseISO(endDate);
      if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
        return {
          date: format(start, 'd MMMM yyyy'),
          time: format(start, 'HH:mm'),
        };
      }
      return {
        date: `${format(start, 'd')}-${format(end, 'd MMMM yyyy')}`,
        time: `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
      };
    }
    return {
      date: format(start, 'd MMMM yyyy'),
      time: format(start, 'HH:mm'),
    };
  };

  const dateInfo = formatEventDate(event.startDate, event.endDate);

  const googleMapsUrl =
    event.latitude && event.longitude
      ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${event.address}, ${event.location}`,
        )}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{event.name}</DialogTitle>
          <DialogDescription>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{dateInfo.date}</div>
                  {dateInfo.time && (
                    <div className="text-sm text-muted-foreground">
                      {dateInfo.time}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{event.location}</div>
                  <div className="text-sm text-muted-foreground">
                    {event.address}
                  </div>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {event.description && (
            <div>
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {event.description}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            {event.website && (
              <Button asChild variant="outline" className="flex-1">
                <a
                  href={event.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Website
                </a>
              </Button>
            )}
            <Button asChild variant="outline" className="flex-1">
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="mr-2 h-4 w-4" />
                Open in Maps
              </a>
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onReport();
                onClose();
              }}
            >
              <Flag className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
