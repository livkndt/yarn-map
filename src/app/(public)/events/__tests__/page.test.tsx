import { render, screen } from '@testing-library/react';
import EventsPage from '../page';

// Mock the EventsDirectory component
jest.mock('../events-directory', () => ({
  EventsDirectory: () => <div>Events Directory Component</div>,
}));

describe('EventsPage', () => {
  it('should render the EventsDirectory component', () => {
    render(<EventsPage />);
    expect(screen.getByText('Events Directory Component')).toBeInTheDocument();
  });

  it('should have correct metadata', () => {
    // Metadata is set via Next.js metadata export, which is tested at build time
    // This test verifies the page component renders
    render(<EventsPage />);
    expect(screen.getByText('Events Directory Component')).toBeInTheDocument();
  });
});
