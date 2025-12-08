import { render, screen } from '@testing-library/react';
import ShopsPage from '../page';

describe('ShopsPage', () => {
  it('should render the page heading', () => {
    render(<ShopsPage />);
    expect(
      screen.getByRole('heading', { name: /shop directory & map/i }),
    ).toBeInTheDocument();
  });

  it('should render the "Coming Soon" message', () => {
    render(<ShopsPage />);
    expect(
      screen.getByText(/coming soon - shop directory & map/i),
    ).toBeInTheDocument();
  });

  it('should render the description text', () => {
    render(<ShopsPage />);
    expect(
      screen.getByText(
        /we're building an interactive map and directory of yarn shops/i,
      ),
    ).toBeInTheDocument();
  });

  it('should render the MapPin icon', () => {
    const { container } = render(<ShopsPage />);
    // Check for MapPin icon (lucide-react icons render as SVGs)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
