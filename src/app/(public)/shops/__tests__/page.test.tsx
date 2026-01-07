import { render, screen } from '@testing-library/react';
import ShopsPage from '../page';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    shop: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  },
}));

// Mock the ShopsDirectory component
jest.mock('../shops-directory', () => ({
  ShopsDirectory: ({
    initialShops,
    initialTotal,
  }: {
    initialShops?: any[];
    initialTotal?: number;
  }) => (
    <div>
      Shops Directory Component
      <div data-testid="shops-count">{initialShops?.length || 0}</div>
      <div data-testid="total-count">{initialTotal || 0}</div>
    </div>
  ),
}));

describe('ShopsPage', () => {
  it('should render the ShopsDirectory component with initial data', async () => {
    const page = await ShopsPage();
    render(page);
    expect(screen.getByText('Shops Directory Component')).toBeInTheDocument();
  });

  it('should pass initial data to ShopsDirectory', async () => {
    const { db } = require('@/lib/db');
    db.shop.findMany.mockResolvedValueOnce([
      {
        id: '1',
        name: 'Test Shop',
        description: 'Test Description',
        address: '123 Test St',
        city: 'London',
        postcode: 'SW1A 1AA',
        latitude: null,
        longitude: null,
        website: null,
        phone: null,
        source: null,
      },
    ]);
    db.shop.count.mockResolvedValueOnce(1);

    const page = await ShopsPage();
    render(page);
    expect(screen.getByTestId('shops-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total-count')).toHaveTextContent('1');
  });

  it('should handle empty initial data', async () => {
    const page = await ShopsPage();
    render(page);
    expect(screen.getByTestId('shops-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total-count')).toHaveTextContent('0');
  });
});
