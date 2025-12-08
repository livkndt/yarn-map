import { render, screen } from '@testing-library/react';
import { Footer } from '../footer';

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Footer component', () => {
  it('should render the footer', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('should render the Yarn Map heading', () => {
    render(<Footer />);
    expect(screen.getByText('Yarn Map')).toBeInTheDocument();
  });

  it('should render the description text', () => {
    render(<Footer />);
    expect(
      screen.getByText(/find fiber arts events and yarn shops across the uk/i),
    ).toBeInTheDocument();
  });

  it('should render Directory section with links', () => {
    render(<Footer />);
    expect(screen.getByText('Directory')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /events/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shops/i })).toBeInTheDocument();
  });

  it('should render Support section with Report an Issue link', () => {
    render(<Footer />);
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /report an issue/i }),
    ).toBeInTheDocument();
  });

  it('should have correct hrefs for footer links', () => {
    render(<Footer />);
    const eventsLink = screen.getByRole('link', { name: /events/i });
    const shopsLink = screen.getByRole('link', { name: /shops/i });
    const reportLink = screen.getByRole('link', { name: /report an issue/i });

    expect(eventsLink).toHaveAttribute('href', '/events');
    expect(shopsLink).toHaveAttribute('href', '/shops');
    expect(reportLink).toHaveAttribute('href', '/report');
  });

  it('should render copyright with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${currentYear} Yarn Map`)),
    ).toBeInTheDocument();
  });
});
