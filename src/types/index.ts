export type EntityType = 'event' | 'shop';

export type IssueType = 'incorrect_info' | 'duplicate' | 'closed' | 'other';

export interface Event {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  entityType: EntityType;
  entityId: string;
  issueType: IssueType;
  description: string | null;
  reporterEmail: string | null;
  status: string;
  createdAt: Date;
}
