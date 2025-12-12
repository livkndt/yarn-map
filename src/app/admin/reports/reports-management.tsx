'use client';

import { useState, useEffect } from 'react';
import { Flag, ExternalLink, Trash2 } from 'lucide-react';
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

interface Report {
  id: string;
  entityType: string;
  entityId: string;
  issueType: string;
  description: string | null;
  reporterEmail: string | null;
  status: string;
  createdAt: string;
}

interface EntityDetails {
  name: string;
  type: 'Event' | 'Shop';
}

export function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [entityDetails, setEntityDetails] = useState<
    Record<string, EntityDetails>
  >({});

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (entityTypeFilter !== 'all') {
        params.append('entityType', entityTypeFilter);
      }

      const response = await fetch(`/api/reports?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setReports(data.reports);
        // Fetch entity details for each report
        fetchEntityDetails(data.reports);
      } else {
        toast.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntityDetails = async (reports: Report[]) => {
    const details: Record<string, EntityDetails> = {};
    for (const report of reports) {
      try {
        const response = await fetch(
          `/api/${report.entityType.toLowerCase()}s/${report.entityId}`,
        );
        if (response.ok) {
          const entity = await response.json();
          details[report.id] = {
            name: entity.name,
            type: report.entityType as 'Event' | 'Shop',
          };
        }
      } catch (error) {
        console.error('Error fetching entity details:', error);
      }
    }
    setEntityDetails(details);
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, entityTypeFilter]);

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Report status updated');
        fetchReports();
      } else {
        toast.error('Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report status');
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    // Note: DELETE endpoint not implemented, but structure is here
    toast.info('Delete functionality not yet implemented');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Reports Management
        </h1>
        <p className="mt-2 text-muted-foreground">
          Review and manage user-submitted reports
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={entityTypeFilter}
              onValueChange={setEntityTypeFilter}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Event">Events</SelectItem>
                <SelectItem value="Shop">Shops</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Reports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center">
              <Flag className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No reports found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            report.status,
                          )}`}
                        >
                          {report.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(report.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="font-medium">
                          {entityDetails[report.id]?.name || 'Loading...'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {report.entityType} • {report.issueType}
                        </div>
                        {expandedReport === report.id && (
                          <div className="mt-3 space-y-2 rounded bg-muted p-3 text-sm">
                            {report.description && (
                              <div>
                                <span className="font-medium">
                                  Description:
                                </span>{' '}
                                {report.description}
                              </div>
                            )}
                            {report.reporterEmail && (
                              <div>
                                <span className="font-medium">Reporter:</span>{' '}
                                {report.reporterEmail}
                              </div>
                            )}
                            <div className="mt-2">
                              <Button asChild variant="outline" size="sm">
                                <a
                                  href={`/${report.entityType.toLowerCase()}s/${report.entityId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View {report.entityType}
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <Select
                        value={report.status}
                        onValueChange={(value) =>
                          handleStatusChange(report.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedReport(
                              expandedReport === report.id ? null : report.id,
                            )
                          }
                        >
                          {expandedReport === report.id
                            ? 'Collapse'
                            : 'View Details'}
                        </Button>
                        {(report.status === 'resolved' ||
                          report.issueType === 'Spam') && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(report.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
