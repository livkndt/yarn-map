'use client';

import { MapPin, ExternalLink, Phone, Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Shop {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  postcode: string;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  phone: string | null;
  source: string | null;
}

interface ShopDetailModalProps {
  shop: Shop;
  open: boolean;
  onClose: () => void;
  onReport: () => void;
}

export function ShopDetailModal({
  shop,
  open,
  onClose,
  onReport,
}: ShopDetailModalProps) {
  const googleMapsUrl =
    shop.latitude && shop.longitude
      ? `https://www.google.com/maps?q=${shop.latitude},${shop.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${shop.address}, ${shop.city}, ${shop.postcode}`,
        )}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{shop.name}</DialogTitle>
          <DialogDescription>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {shop.city}, {shop.postcode}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {shop.address}
                  </div>
                </div>
              </div>
              {shop.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a
                    href={`tel:${shop.phone}`}
                    className="font-medium hover:underline"
                  >
                    {shop.phone}
                  </a>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {shop.description && (
            <div>
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {shop.description}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            {shop.website && (
              <Button asChild variant="outline" className="flex-1">
                <a
                  href={shop.website}
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
            {shop.phone && (
              <Button asChild variant="outline" className="flex-1 sm:hidden">
                <a href={`tel:${shop.phone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </a>
              </Button>
            )}
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
