import { render, screen } from '@testing-library/react';
import EventsPage from '../page';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    event: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  },
}));

// Mock the EventsDirectory component
jest.mock('../events-directory', () => ({
  EventsDirectory: ({
    initialEvents,
    initialTotal,
  }: {
    initialEvents?: any[];
    initialTotal?: number;
  }) => (
    <div>
      Events Directory Component
      <div data-testid="events-count">{initialEvents?.length || 0}</div>
      <div data-testid="total-count">{initialTotal || 0}</div>
    </div>
  ),
}));

describe('EventsPage', () => {
  it('should render the EventsDirectory component with initial data', async () => {
    const page = await EventsPage();
    render(page);
    expect(screen.getByText('Events Directory Component')).toBeInTheDocument();
  });

  it('should pass initial data to EventsDirectory', async () => {
    const { db } = require('@/lib/db');
    db.event.findMany.mockResolvedValueOnce([
      {
        id: '1',
        name: 'Test Event',
        description: 'Test Description',
        startDate: new Date('2026-01-01'),
        endDate: null,
        location: 'London',
        address: '123 Test St',
        latitude: null,
        longitude: null,
        website: null,
        source: null,
      },
    ]);
    db.event.count.mockResolvedValueOnce(1);

    const page = await EventsPage();
    render(page);
    expect(screen.getByTestId('events-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total-count')).toHaveTextContent('1');
  });

  it('should handle empty initial data', async () => {
    const page = await EventsPage();
    render(page);
    expect(screen.getByTestId('events-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total-count')).toHaveTextContent('0');
  });
});
