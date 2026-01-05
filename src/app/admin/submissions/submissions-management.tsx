'use client';

import { useState, useEffect } from 'react';
import { Check, X, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

interface Submission {
  id: string;
  entityType: 'Event' | 'Shop';
  status: 'pending' | 'approved' | 'rejected';
  name: string;
  description: string | null;
  address: string;
  city: string | null;
  postcode: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  phone: string | null;
  submitterEmail: string | null;
  submitterName: string | null;
  notes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export function SubmissionsManagement() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (entityTypeFilter !== 'all') {
        params.append('entityType', entityTypeFilter);
      }

      const response = await fetch(`/api/submissions?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.submissions);
      } else {
        toast.error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, entityTypeFilter]);

  const handleApprove = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (response.ok) {
        toast.success('Submission approved and added to directory');
        fetchSubmissions();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to approve submission');
      }
    } catch (error) {
      console.error('Error approving submission:', error);
      toast.error('Failed to approve submission');
    }
  };

  const handleReject = async (submissionId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: reason || 'Not suitable for directory',
        }),
      });

      if (response.ok) {
        toast.success('Submission rejected');
        fetchSubmissions();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reject submission');
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast.error('Failed to reject submission');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'd MMM yyyy, HH:mm');
    } catch {
      return dateString;
    }
  };

  const formatEventDate = (
    startDate: string | null,
    endDate: string | null,
  ) => {
    if (!startDate) return 'N/A';
    try {
      const start = parseISO(startDate);
      if (endDate) {
        const end = parseISO(endDate);
        if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
          return format(start, 'd MMM yyyy');
        }
        return `${format(start, 'd')}-${format(end, 'd MMM yyyy')}`;
      }
      return format(start, 'd MMM yyyy');
    } catch {
      return startDate;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Submissions Management
        </h1>
        <p className="mt-2 text-muted-foreground">
          Review and manage user-submitted events and shops
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Type</label>
              <Select
                value={entityTypeFilter}
                onValueChange={setEntityTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Event">Events</SelectItem>
                  <SelectItem value="Shop">Shops</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No submissions found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {submission.entityType === 'Event' ? (
                        <Calendar className="h-5 w-5 text-primary" />
                      ) : (
                        <MapPin className="h-5 w-5 text-primary" />
                      )}
                      <CardTitle>{submission.name}</CardTitle>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          submission.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : submission.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {submission.entityType} • Submitted{' '}
                      {formatDate(submission.createdAt)}
                    </p>
                  </div>
                  {submission.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(submission.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(submission.id)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {submission.description && (
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.description}
                      </p>
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.address}
                      </p>
                    </div>
                    {submission.entityType === 'Shop' && (
                      <>
                        <div>
                          <p className="text-sm font-medium">City</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.city || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Postcode</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.postcode || 'N/A'}
                          </p>
                        </div>
                        {submission.phone && (
                          <div>
                            <p className="text-sm font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">
                              {submission.phone}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {submission.entityType === 'Event' && (
                      <>
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.location || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Date</p>
                          <p className="text-sm text-muted-foreground">
                            {formatEventDate(
                              submission.startDate,
                              submission.endDate,
                            )}
                          </p>
                        </div>
                      </>
                    )}
                    {submission.website && (
                      <div>
                        <p className="text-sm font-medium">Website</p>
                        <a
                          href={submission.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          {submission.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {submission.latitude && submission.longitude && (
                      <div>
                        <p className="text-sm font-medium">Coordinates</p>
                        <p className="text-sm text-muted-foreground">
                          {submission.latitude.toFixed(6)},{' '}
                          {submission.longitude.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>

                  {(submission.submitterName || submission.submitterEmail) && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium">Submitted by</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.submitterName || 'Anonymous'}
                        {submission.submitterEmail && (
                          <> ({submission.submitterEmail})</>
                        )}
                      </p>
                    </div>
                  )}

                  {submission.notes && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium">Additional Notes</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.notes}
                      </p>
                    </div>
                  )}

                  {submission.rejectionReason && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-destructive">
                        Rejection Reason
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {submission.rejectionReason}
                      </p>
                    </div>
                  )}

                  {submission.reviewedAt && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground">
                        Reviewed {formatDate(submission.reviewedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
