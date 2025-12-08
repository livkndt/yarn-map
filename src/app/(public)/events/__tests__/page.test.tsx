import { render, screen } from '@testing-library/react';
import EventsPage from '../page';

describe('EventsPage', () => {
  it('should render the page heading', () => {
    render(<EventsPage />);
    expect(
      screen.getByRole('heading', { name: /events directory/i }),
    ).toBeInTheDocument();
  });

  it('should render the "Coming Soon" message', () => {
    render(<EventsPage />);
    expect(
      screen.getByText(/coming soon - events directory/i),
    ).toBeInTheDocument();
  });

  it('should render the description text', () => {
    render(<EventsPage />);
    expect(
      screen.getByText(
        /we're building a comprehensive directory of fiber arts events/i,
      ),
    ).toBeInTheDocument();
  });

  it('should render the Calendar icon', () => {
    const { container } = render(<EventsPage />);
    // Check for Calendar icon (lucide-react icons render as SVGs)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
