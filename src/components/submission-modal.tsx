'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Calendar, MapPin } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const eventSubmissionSchema = z.object({
  entityType: z.literal('Event'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  location: z.string().min(1, 'Location is required').max(200),
  address: z.string().min(1, 'Address is required').max(500),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  submitterEmail: z.string().email().optional().or(z.literal('')),
  submitterName: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  honeypot: z.string().optional(),
});

const shopSubmissionSchema = z.object({
  entityType: z.literal('Shop'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  postcode: z
    .string()
    .regex(
      /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
      'Invalid UK postcode format',
    ),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  submitterEmail: z.string().email().optional().or(z.literal('')),
  submitterName: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  honeypot: z.string().optional(),
});

type EventSubmissionData = z.infer<typeof eventSubmissionSchema>;
type ShopSubmissionData = z.infer<typeof shopSubmissionSchema>;
type SubmissionData = EventSubmissionData | ShopSubmissionData;

interface SubmissionModalProps {
  entityType?: 'Event' | 'Shop';
  open: boolean;
  onClose: () => void;
}

export function SubmissionModal({
  entityType: initialEntityType,
  open,
  onClose,
}: SubmissionModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<
    'Event' | 'Shop'
  >(initialEntityType || 'Shop');

  const isEvent = selectedEntityType === 'Event';

  // Use separate form hooks for each type to avoid TypeScript issues with discriminated unions
  const eventForm = useForm<EventSubmissionData>({
    resolver: zodResolver(eventSubmissionSchema),
    defaultValues: {
      entityType: 'Event',
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      address: '',
      latitude: '',
      longitude: '',
      website: '',
      submitterEmail: '',
      submitterName: '',
      notes: '',
      honeypot: '',
    },
  });

  const shopForm = useForm<ShopSubmissionData>({
    resolver: zodResolver(shopSubmissionSchema),
    defaultValues: {
      entityType: 'Shop',
      name: '',
      description: '',
      address: '',
      city: '',
      postcode: '',
      latitude: '',
      longitude: '',
      website: '',
      phone: '',
      submitterEmail: '',
      submitterName: '',
      notes: '',
      honeypot: '',
    },
  });

  // Use the appropriate form based on entity type
  const form = isEvent ? eventForm : shopForm;
  const handleSubmit = form.handleSubmit;

  // Update selectedEntityType and reset form when initialEntityType prop changes or modal opens
  useEffect(() => {
    if (initialEntityType && initialEntityType !== selectedEntityType) {
      setSelectedEntityType(initialEntityType);
      if (initialEntityType === 'Event') {
        eventForm.reset({
          entityType: 'Event' as const,
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          location: '',
          address: '',
          latitude: '',
          longitude: '',
          website: '',
          submitterEmail: '',
          submitterName: '',
          notes: '',
          honeypot: '',
        });
      } else {
        shopForm.reset({
          entityType: 'Shop' as const,
          name: '',
          description: '',
          address: '',
          city: '',
          postcode: '',
          latitude: '',
          longitude: '',
          website: '',
          phone: '',
          submitterEmail: '',
          submitterName: '',
          notes: '',
          honeypot: '',
        });
      }
    } else if (open && !initialEntityType) {
      // Reset to Shop if no entityType specified
      setSelectedEntityType('Shop');
      shopForm.reset({
        entityType: 'Shop' as const,
        name: '',
        description: '',
        address: '',
        city: '',
        postcode: '',
        latitude: '',
        longitude: '',
        website: '',
        phone: '',
        submitterEmail: '',
        submitterName: '',
        notes: '',
        honeypot: '',
      });
    }
  }, [initialEntityType, open, selectedEntityType, eventForm, shopForm]);

  const onSubmit = async (data: EventSubmissionData | ShopSubmissionData) => {
    // Check honeypot
    if (data.honeypot) {
      return;
    }

    // Ensure entityType is set correctly
    const submissionData = {
      ...data,
      entityType: selectedEntityType,
    } as SubmissionData;

    setSubmitting(true);
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.status === 429) {
        toast.error('Too many requests. Please try again later.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Submission error:', errorData);
        if (errorData.details && Array.isArray(errorData.details)) {
          const firstError = errorData.details[0];
          toast.error(firstError.message || 'Validation error');
        } else {
          toast.error(
            errorData.error ||
              'Failed to submit. Please check your input and try again.',
          );
        }
        return;
      }

      toast.success(
        'Thank you for your submission! We will review it and add it to the directory soon.',
      );
      if (isEvent) {
        eventForm.reset();
      } else {
        shopForm.reset();
      }
      onClose();
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEntityTypeChange = (value: 'Event' | 'Shop') => {
    setSelectedEntityType(value);
    if (value === 'Event') {
      eventForm.reset({
        entityType: 'Event' as const,
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        address: '',
        latitude: '',
        longitude: '',
        website: '',
        submitterEmail: '',
        submitterName: '',
        notes: '',
        honeypot: '',
      });
    } else {
      shopForm.reset({
        entityType: 'Shop' as const,
        name: '',
        description: '',
        address: '',
        city: '',
        postcode: '',
        latitude: '',
        longitude: '',
        website: '',
        phone: '',
        submitterEmail: '',
        submitterName: '',
        notes: '',
        honeypot: '',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        key={selectedEntityType}
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            Submit {selectedEntityType === 'Event' ? 'an Event' : 'a Shop'}
          </DialogTitle>
          <DialogDescription>
            Help us grow the directory by submitting{' '}
            {selectedEntityType === 'Event' ? 'an event' : 'a yarn shop'}. We'll
            review your submission and add it to the directory.
          </DialogDescription>
        </DialogHeader>

        <form
          key={selectedEntityType}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {!initialEntityType && (
            <div className="space-y-2">
              <Label htmlFor="entityType">What are you submitting? *</Label>
              <Select
                value={selectedEntityType}
                onValueChange={handleEntityTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shop">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Yarn Shop
                    </div>
                  </SelectItem>
                  <SelectItem value="Event">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Event
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              {selectedEntityType === 'Event' ? 'Event' : 'Shop'} Name *
            </Label>
            <Input
              id="name"
              {...(isEvent
                ? eventForm.register('name')
                : shopForm.register('name'))}
            />
            {(isEvent
              ? eventForm.formState.errors.name
              : shopForm.formState.errors.name) && (
              <p className="text-sm text-destructive">
                {
                  (isEvent
                    ? eventForm.formState.errors.name
                    : shopForm.formState.errors.name
                  )?.message
                }
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...(isEvent
                ? eventForm.register('description')
                : shopForm.register('description'))}
              rows={3}
              maxLength={2000}
            />
            {(isEvent
              ? eventForm.formState.errors.description
              : shopForm.formState.errors.description) && (
              <p className="text-sm text-destructive">
                {
                  (isEvent
                    ? eventForm.formState.errors.description
                    : shopForm.formState.errors.description
                  )?.message
                }
              </p>
            )}
          </div>

          {isEvent ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    {...eventForm.register('startDate')}
                  />
                  {eventForm.formState.errors.startDate && (
                    <p className="text-sm text-destructive">
                      {eventForm.formState.errors.startDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...eventForm.register('endDate')}
                  />
                  {eventForm.formState.errors.endDate && (
                    <p className="text-sm text-destructive">
                      {eventForm.formState.errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" {...eventForm.register('location')} />
                {eventForm.formState.errors.location && (
                  <p className="text-sm text-destructive">
                    {eventForm.formState.errors.location.message}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" {...shopForm.register('city')} />
                {shopForm.formState.errors.city && (
                  <p className="text-sm text-destructive">
                    {shopForm.formState.errors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode *</Label>
                <Input id="postcode" {...shopForm.register('postcode')} />
                {shopForm.formState.errors.postcode && (
                  <p className="text-sm text-destructive">
                    {shopForm.formState.errors.postcode.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              {...(isEvent
                ? eventForm.register('address')
                : shopForm.register('address'))}
            />
            {(isEvent
              ? eventForm.formState.errors.address
              : shopForm.formState.errors.address) && (
              <p className="text-sm text-destructive">
                {
                  (isEvent
                    ? eventForm.formState.errors.address
                    : shopForm.formState.errors.address
                  )?.message
                }
              </p>
            )}
          </div>

          {!isEvent && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" type="tel" {...shopForm.register('phone')} />
              {shopForm.formState.errors.phone && (
                <p className="text-sm text-destructive">
                  {shopForm.formState.errors.phone.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              {...(isEvent
                ? eventForm.register('website')
                : shopForm.register('website'))}
            />
            {(isEvent
              ? eventForm.formState.errors.website
              : shopForm.formState.errors.website) && (
              <p className="text-sm text-destructive">
                {
                  (isEvent
                    ? eventForm.formState.errors.website
                    : shopForm.formState.errors.website
                  )?.message
                }
              </p>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-semibold">
              Your Contact Info (Optional)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submitterName">Your Name</Label>
                <Input
                  id="submitterName"
                  {...(isEvent
                    ? eventForm.register('submitterName')
                    : shopForm.register('submitterName'))}
                />
                {(isEvent
                  ? eventForm.formState.errors.submitterName
                  : shopForm.formState.errors.submitterName) && (
                  <p className="text-sm text-destructive">
                    {
                      (isEvent
                        ? eventForm.formState.errors.submitterName
                        : shopForm.formState.errors.submitterName
                      )?.message
                    }
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="submitterEmail">Your Email</Label>
                <Input
                  id="submitterEmail"
                  type="email"
                  {...(isEvent
                    ? eventForm.register('submitterEmail')
                    : shopForm.register('submitterEmail'))}
                />
                {(isEvent
                  ? eventForm.formState.errors.submitterEmail
                  : shopForm.formState.errors.submitterEmail) && (
                  <p className="text-sm text-destructive">
                    {
                      (isEvent
                        ? eventForm.formState.errors.submitterEmail
                        : shopForm.formState.errors.submitterEmail
                      )?.message
                    }
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  We may contact you for more information
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              {...(isEvent
                ? eventForm.register('notes')
                : shopForm.register('notes'))}
              rows={2}
              placeholder="Any additional information that might be helpful..."
              maxLength={1000}
            />
            {(isEvent
              ? eventForm.formState.errors.notes
              : shopForm.formState.errors.notes) && (
              <p className="text-sm text-destructive">
                {
                  (isEvent
                    ? eventForm.formState.errors.notes
                    : shopForm.formState.errors.notes
                  )?.message
                }
              </p>
            )}
          </div>

          {/* Honeypot field - hidden from users */}
          <input
            type="text"
            {...(isEvent
              ? eventForm.register('honeypot')
              : shopForm.register('honeypot'))}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
