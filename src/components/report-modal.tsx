'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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

const reportSchema = z.object({
  issueType: z.enum([
    'Incorrect information',
    'Event/shop no longer exists',
    'Duplicate entry',
    'Spam',
    'Other',
  ]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  reporterEmail: z.string().email().optional().or(z.literal('')),
  honeypot: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportModalProps {
  entityType: 'Event' | 'Shop';
  entityId: string;
  open: boolean;
  onClose: () => void;
}

export function ReportModal({
  entityType,
  entityId,
  open,
  onClose,
}: ReportModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      issueType: 'Incorrect information',
      description: '',
      reporterEmail: '',
      honeypot: '',
    },
  });

  const issueType = watch('issueType');

  const onSubmit = async (data: ReportFormData) => {
    // Check honeypot
    if (data.honeypot) {
      // Silently ignore spam
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          entityId,
          issueType: data.issueType,
          description: data.description,
          reporterEmail: data.reporterEmail || null,
          honeypot: data.honeypot || '',
        }),
      });

      if (response.status === 429) {
        const errorData = await response.json();
        toast.error('Too many requests. Please try again later.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit report');
        return;
      }

      toast.success("Thanks for reporting! We'll review this shortly.");
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Help us keep the directory accurate by reporting issues with this{' '}
            {entityType.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issueType">Issue Type</Label>
            <Select
              value={issueType}
              onValueChange={(value) =>
                setValue('issueType', value as ReportFormData['issueType'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Incorrect information">
                  Incorrect information
                </SelectItem>
                <SelectItem value="Event/shop no longer exists">
                  {entityType} no longer exists
                </SelectItem>
                <SelectItem value="Duplicate entry">Duplicate entry</SelectItem>
                <SelectItem value="Spam">Spam</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.issueType && (
              <p className="text-sm text-destructive">
                {errors.issueType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Please provide details about the issue..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporterEmail">Your Email (Optional)</Label>
            <Input
              id="reporterEmail"
              type="email"
              {...register('reporterEmail')}
              placeholder="your@email.com"
            />
            {errors.reporterEmail && (
              <p className="text-sm text-destructive">
                {errors.reporterEmail.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              We may contact you for more information
            </p>
          </div>

          {/* Honeypot field - hidden from users */}
          <input
            type="text"
            {...register('honeypot')}
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
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
