'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Shop } from '@/types';

export type MapShop = Shop & {
  latitude: number;
  longitude: number;
};

interface ShopsMapProps {
  shops: MapShop[];
  highlightedShopId: string | null;
  userLocation: { lat: number; lng: number } | null;
  onShopClick: (shop: MapShop) => void;
}

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon (yarn ball color - warm pink/coral)
const createCustomIcon = (isHighlighted: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${isHighlighted ? '#f97316' : '#ec4899'};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

function MapController({
  shops,
  userLocation,
}: {
  shops: MapShop[];
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (shops.length === 0) return;

    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 12);
      return;
    }

    // Fit bounds to show all shops
    const bounds = L.latLngBounds(
      shops.map((shop) => [shop.latitude, shop.longitude]),
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, shops, userLocation]);

  return null;
}

export function ShopsMap({
  shops,
  highlightedShopId,
  userLocation,
  onShopClick,
}: ShopsMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  if (typeof window === 'undefined') {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <p className="text-muted-foreground">No shops with location data</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[54.5, -2.0]} // Center of UK
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController shops={shops} userLocation={userLocation} />
      <MarkerClusterGroup
        iconCreateFunction={(cluster) => {
          const count = cluster.getChildCount();
          let size = 'small';
          if (count > 50) size = 'large';
          else if (count > 10) size = 'medium';

          const sizes = {
            small: [40, 40],
            medium: [50, 50],
            large: [60, 60],
          };

          return L.divIcon({
            html: `<div class="cluster-marker cluster-${size}">
              <span class="cluster-count">${count}</span>
            </div>`,
            className: 'custom-cluster',
            iconSize: sizes[size as keyof typeof sizes],
          });
        }}
      >
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            position={[shop.latitude, shop.longitude]}
            icon={createCustomIcon(highlightedShopId === shop.id)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{shop.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {shop.city}, {shop.postcode}
                </p>
                <button
                  onClick={() => onShopClick(shop)}
                  className="mt-2 rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={L.divIcon({
            className: 'user-location-marker',
            html: `<div style="
              background-color: #3b82f6;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        >
          <Popup>Your Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
