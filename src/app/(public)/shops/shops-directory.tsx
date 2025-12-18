'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, List, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import type { MapShop } from './shops-map';
import type { Shop } from '@/types';

const ShopsMap = dynamic(
  () => import('./shops-map').then((mod) => ({ default: mod.ShopsMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  },
);
import { ShopDetailModal } from './shop-detail-modal';
import { ReportModal } from '@/components/report-modal';

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

export function ShopsDirectory() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [highlightedShopId, setHighlightedShopId] = useState<string | null>(
    null,
  );
  const [reportEntity, setReportEntity] = useState<{
    type: 'Event' | 'Shop';
    id: string;
  } | null>(null);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All Regions');
  const [offset, setOffset] = useState(0);
  const limit = 100;

  const fetchShops = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (city && city !== 'All Regions') {
        params.append('city', city);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/shops?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setShops(data.shops);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [city, offset]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      setOffset(0);
      fetchShops();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleRequestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        },
      );
    }
  };

  const shopsWithLocation = useMemo(
    () =>
      shops.filter(
        (shop): shop is Shop & { latitude: number; longitude: number } =>
          !!(shop.latitude && shop.longitude),
      ) as unknown as MapShop[],
    [shops],
  );

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const sortedShops = useMemo(() => {
    if (!userLocation) return shops;

    return [...shops].sort((a, b) => {
      if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) {
        return 0;
      }
      const distA = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        a.latitude,
        a.longitude,
      );
      const distB = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        b.latitude,
        b.longitude,
      );
      return distA - distB;
    });
  }, [shops, userLocation]);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
          Yarn Shops Directory
        </h1>
        <p className="mt-2 text-muted-foreground">
          Discover independent yarn shops across the UK
        </p>
      </div>

      {/* Filters and View Toggle */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search shops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={city} onValueChange={setCity}>
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
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            className="md:hidden"
          >
            <List className="mr-2 h-4 w-4" />
            List
          </Button>
          <Button
            variant={view === 'map' ? 'default' : 'outline'}
            onClick={() => setView('map')}
            className="md:hidden"
          >
            <MapIcon className="mr-2 h-4 w-4" />
            Map
          </Button>
        </div>
      </div>

      {/* Desktop: Split View, Mobile: Tabs */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Map View - 60% on desktop */}
        <div
          className={`${
            view === 'map' ? 'block' : 'hidden'
          } lg:block lg:flex-[0.6]`}
        >
          <div className="h-[600px] w-full rounded-lg border lg:h-[calc(100vh-250px)]">
            <ShopsMap
              shops={shopsWithLocation}
              highlightedShopId={highlightedShopId}
              userLocation={userLocation}
              onShopClick={(shop) => setSelectedShop(shop)}
            />
          </div>
          {userLocation && (
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={handleRequestLocation}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Center on My Location
            </Button>
          )}
        </div>

        {/* List View - 40% on desktop */}
        <div
          className={`${
            view === 'list' ? 'block' : 'hidden'
          } lg:block lg:flex-[0.4]`}
        >
          <Card className="h-[600px] overflow-hidden lg:h-[calc(100vh-250px)]">
            <div className="flex h-full flex-col">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {total} shops found
                  </div>
                  {!userLocation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRequestLocation}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Use My Location
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-4 w-3/4 rounded bg-muted" />
                          <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : sortedShops.length === 0 ? (
                  <div className="py-12 text-center">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-medium">No shops found</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try adjusting your filters
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedShops.map((shop) => {
                      const distance =
                        userLocation && shop.latitude && shop.longitude
                          ? calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              shop.latitude,
                              shop.longitude,
                            )
                          : null;

                      return (
                        <Card
                          key={shop.id}
                          className={`cursor-pointer transition-shadow hover:shadow-lg ${
                            highlightedShopId === shop.id
                              ? 'ring-2 ring-primary'
                              : ''
                          }`}
                          onClick={() => {
                            setSelectedShop(shop);
                            setHighlightedShopId(shop.id);
                          }}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-semibold">{shop.name}</h3>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {shop.city}, {shop.postcode}
                              </span>
                            </div>
                            {distance !== null && (
                              <div className="mt-1 text-sm text-muted-foreground">
                                {distance < 1
                                  ? `${Math.round(distance * 1000)}m away`
                                  : `${distance.toFixed(1)}km away`}
                              </div>
                            )}
                            <Button
                              className="mt-3 w-full"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShop(shop);
                                setHighlightedShopId(shop.id);
                              }}
                            >
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Shop Detail Modal */}
      {selectedShop && (
        <ShopDetailModal
          shop={selectedShop}
          open={!!selectedShop}
          onClose={() => {
            setSelectedShop(null);
            setHighlightedShopId(null);
          }}
          onReport={() => {
            setReportEntity({ type: 'Shop', id: selectedShop.id });
            setSelectedShop(null);
            setHighlightedShopId(null);
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
