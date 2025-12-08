import { render, screen } from '@testing-library/react';
import HomePage from '../page';

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

describe('HomePage', () => {
  it('should render the main heading', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', {
        name: /find fiber arts events and yarn shops across the uk/i,
      }),
    ).toBeInTheDocument();
  });

  it('should render the description paragraph', () => {
    render(<HomePage />);
    expect(
      screen.getByText(
        /discover knitting circles, crochet workshops, yarn festivals/i,
      ),
    ).toBeInTheDocument();
  });

  it('should render Browse Events button with correct link', () => {
    render(<HomePage />);
    const eventsButton = screen.getByRole('link', { name: /browse events/i });
    expect(eventsButton).toBeInTheDocument();
    expect(eventsButton).toHaveAttribute('href', '/events');
  });

  it('should render Find Yarn Shops button with correct link', () => {
    render(<HomePage />);
    const shopsButton = screen.getByRole('link', {
      name: /find yarn shops/i,
    });
    expect(shopsButton).toBeInTheDocument();
    expect(shopsButton).toHaveAttribute('href', '/shops');
  });

  it('should render Events Directory feature card', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: /events directory/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /find knitting circles, crochet workshops, yarn festivals/i,
      ),
    ).toBeInTheDocument();
  });

  it('should render Shop Directory feature card', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: /shop directory/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /discover independent yarn shops, their locations, contact information/i,
      ),
    ).toBeInTheDocument();
  });
});
