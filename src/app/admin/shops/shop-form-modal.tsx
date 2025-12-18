'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Shop } from '@/types';

const shopSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postcode: z
    .string()
    .regex(
      /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
      'Invalid UK postcode format',
    ),
  latitude: z.string().refine(
    (val) => {
      if (!val) return false;
      const num = parseFloat(val);
      return !isNaN(num) && num >= -90 && num <= 90;
    },
    { message: 'Latitude must be between -90 and 90' },
  ),
  longitude: z.string().refine(
    (val) => {
      if (!val) return false;
      const num = parseFloat(val);
      return !isNaN(num) && num >= -180 && num <= 180;
    },
    { message: 'Longitude must be between -180 and 180' },
  ),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.string().optional(),
});

type ShopFormData = z.infer<typeof shopSchema>;

interface ShopFormModalProps {
  shop: Shop | null;
  open: boolean;
  onClose: () => void;
  onGeocode: (
    address: string,
    city: string,
    postcode: string,
  ) => Promise<{
    latitude: number;
    longitude: number;
  } | null>;
}

export function ShopFormModal({
  shop,
  open,
  onClose,
  onGeocode,
}: ShopFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const isEditing = !!shop;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
      postcode: '',
      latitude: '',
      longitude: '',
      website: '',
      phone: '',
      source: '',
    },
  });

  const address = watch('address');
  const city = watch('city');
  const postcode = watch('postcode');

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name,
        description: shop.description || '',
        address: shop.address,
        city: shop.city,
        postcode: shop.postcode,
        latitude: shop.latitude?.toString() || '',
        longitude: shop.longitude?.toString() || '',
        website: shop.website || '',
        phone: shop.phone || '',
        source: shop.source || '',
      });
    } else {
      reset();
    }
  }, [shop, reset]);

  const handleGeocodeClick = async () => {
    if (!address || !city || !postcode) {
      toast.error('Please fill in address, city, and postcode first');
      return;
    }

    setGeocoding(true);
    try {
      const result = await onGeocode(address, city, postcode);
      if (result) {
        setValue('latitude', result.latitude.toString());
        setValue('longitude', result.longitude.toString());
        toast.success('Location geocoded successfully');
      } else {
        toast.error(
          'Could not find location. Please enter coordinates manually.',
        );
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to geocode address');
    } finally {
      setGeocoding(false);
    }
  };

  const onSubmit = async (data: ShopFormData) => {
    setSubmitting(true);
    try {
      const payload: any = {
        name: data.name,
        description: data.description || null,
        address: data.address,
        city: data.city,
        postcode: data.postcode.toUpperCase(),
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        website: data.website || null,
        phone: data.phone || null,
        source: data.source || null,
      };

      const url = isEditing ? `/api/shops/${shop.id}` : '/api/shops';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save shop');
        return;
      }

      toast.success(
        isEditing ? 'Shop updated successfully' : 'Shop created successfully',
      );
      onClose();
    } catch (error) {
      console.error('Error saving shop:', error);
      toast.error('Failed to save shop');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Shop' : 'Add Shop'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update shop details below'
              : 'Fill in the details to create a new shop'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={4} />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input id="address" {...register('address')} />
            {errors.address && (
              <p className="text-sm text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" {...register('city')} />
              {errors.city && (
                <p className="text-sm text-destructive">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode *</Label>
              <Input id="postcode" {...register('postcode')} />
              {errors.postcode && (
                <p className="text-sm text-destructive">
                  {errors.postcode.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="latitude">Latitude *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeocodeClick}
                disabled={geocoding || !address || !city || !postcode}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {geocoding ? 'Geocoding...' : 'Geocode from Address'}
              </Button>
            </div>
            <Input
              id="latitude"
              type="number"
              step="any"
              {...register('latitude')}
            />
            {errors.latitude && (
              <p className="text-sm text-destructive">
                {errors.latitude.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude *</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              {...register('longitude')}
            />
            {errors.longitude && (
              <p className="text-sm text-destructive">
                {errors.longitude.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input id="website" type="url" {...register('website')} />
            {errors.website && (
              <p className="text-sm text-destructive">
                {errors.website.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...register('phone')} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input id="source" {...register('source')} />
            {errors.source && (
              <p className="text-sm text-destructive">
                {errors.source.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? 'Saving...'
                : isEditing
                  ? 'Update Shop'
                  : 'Create Shop'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
