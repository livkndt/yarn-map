'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import dynamic from 'next/dynamic';
import type { Event, Shop } from '@/types';

const ReportModal = dynamic(
  () =>
    import('@/components/report-modal').then((mod) => ({
      default: mod.ReportModal,
    })),
  { ssr: false },
);

export default function ReportPage() {
  const [entityType, setEntityType] = useState<'Event' | 'Shop'>('Shop');
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'Event' | 'Shop';
    id: string;
  } | null>(null);

  useEffect(() => {
    const fetchEntities = async () => {
      if (!search || search.length < 2) {
        setEvents([]);
        setShops([]);
        return;
      }

      setLoading(true);
      try {
        if (entityType === 'Event') {
          const params = new URLSearchParams({
            search,
            limit: '10',
          });
          const response = await fetch(`/api/events?${params.toString()}`);
          const data = await response.json();
          if (response.ok) {
            setEvents(data.events || []);
          }
        } else {
          const params = new URLSearchParams({
            search,
            limit: '10',
          });
          const response = await fetch(`/api/shops?${params.toString()}`);
          const data = await response.json();
          if (response.ok) {
            setShops(data.shops || []);
          }
        }
      } catch (error) {
        console.error('Error fetching entities:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchEntities();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, entityType]);

  const handleSelectEntity = (id: string) => {
    setSelectedEntity({ type: entityType, id });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold">Report an Issue</h1>
        <p className="mb-8 text-muted-foreground">
          Help us keep the directory accurate by reporting issues with events or
          shops.
        </p>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  What would you like to report?
                </label>
                <Select
                  value={entityType}
                  onValueChange={(value) => {
                    setEntityType(value as 'Event' | 'Shop');
                    setSearch('');
                    setEvents([]);
                    setShops([]);
                    setSelectedEntity(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shop">Yarn Shop</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Search for {entityType === 'Event' ? 'an event' : 'a shop'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={`Search ${entityType === 'Event' ? 'events' : 'shops'} by name, location, or description...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Type at least 2 characters to search
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center text-muted-foreground">Searching...</div>
        )}

        {!loading && search.length >= 2 && (
          <>
            {entityType === 'Event' && events.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No events found. Try a different search term.
                </CardContent>
              </Card>
            )}

            {entityType === 'Shop' && shops.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No shops found. Try a different search term.
                </CardContent>
              </Card>
            )}

            {entityType === 'Event' && events.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Select an Event</h2>
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className="cursor-pointer transition-colors hover:bg-accent"
                    onClick={() => handleSelectEntity(event.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <h3 className="font-medium">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatEventDate(event.startDate)}
                            {event.endDate &&
                              ` - ${formatEventDate(event.endDate)}`}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            <MapPin className="mr-1 inline h-3 w-3" />
                            {event.location}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {entityType === 'Shop' && shops.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Select a Shop</h2>
                {shops.map((shop) => (
                  <Card
                    key={shop.id}
                    className="cursor-pointer transition-colors hover:bg-accent"
                    onClick={() => handleSelectEntity(shop.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <h3 className="font-medium">{shop.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {shop.city}, {shop.postcode}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {shop.address}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {!search && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Select a type and search for{' '}
              {entityType === 'Event' ? 'an event' : 'a shop'} to report an
              issue.
            </CardContent>
          </Card>
        )}

        {selectedEntity && (
          <ReportModal
            entityType={selectedEntity.type}
            entityId={selectedEntity.id}
            open={true}
            onClose={() => {
              setSelectedEntity(null);
              setSearch('');
              setEvents([]);
              setShops([]);
            }}
          />
        )}
      </div>
    </div>
  );
}
