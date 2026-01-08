export interface Shop {
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

export interface Event {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string;
  address: string;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  source: string | null;
}

export interface Report {
  id: string;
  entityType: 'Event' | 'Shop';
  entityId: string;
  issueType: string;
  description: string;
  reporterEmail: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}
