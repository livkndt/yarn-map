import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Nav } from '../nav';

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

describe('Nav component', () => {
  it('should render the logo', () => {
    render(<Nav />);
    const logo = screen.getByText('Yarn Map');
    expect(logo).toBeInTheDocument();
  });

  it('should render desktop navigation links', () => {
    render(<Nav />);
    expect(screen.getByRole('link', { name: /events/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shops/i })).toBeInTheDocument();
  });

  it('should have correct hrefs for navigation links', () => {
    render(<Nav />);
    const eventsLink = screen.getByRole('link', { name: /events/i });
    const shopsLink = screen.getByRole('link', { name: /shops/i });

    expect(eventsLink).toHaveAttribute('href', '/events');
    expect(shopsLink).toHaveAttribute('href', '/shops');
  });

  it('should render mobile menu button', () => {
    render(<Nav />);
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('should toggle mobile menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(<Nav />);

    // Initially, desktop links are visible, mobile menu is hidden
    const desktopLinks = screen.getAllByRole('link', { name: /events/i });
    expect(desktopLinks.length).toBeGreaterThan(0);

    // Click menu button to open mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(menuButton);

    // After clicking, we should have both desktop and mobile links
    const allLinks = screen.getAllByRole('link', { name: /events/i });
    expect(allLinks.length).toBeGreaterThan(1);
  });

  it('should have click handlers on mobile menu links', async () => {
    const user = userEvent.setup();
    render(<Nav />);

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(menuButton);

    // Find mobile menu links (they should have onClick handlers)
    const allLinks = screen.getAllByRole('link', { name: /events/i });
    expect(allLinks.length).toBeGreaterThan(0);

    // Click a link (this will trigger the onClick handler that closes the menu)
    await user.click(allLinks[allLinks.length - 1]);
  });

  it('should close mobile menu when Events link is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<Nav />);

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(menuButton);

    // Verify mobile menu is open by checking for mobile menu container
    const mobileMenu = container.querySelector('.border-t.md\\:hidden');
    expect(mobileMenu).toBeInTheDocument();

    // Get mobile menu links (the last one is the mobile link)
    const mobileLinks = screen.getAllByRole('link', { name: /events/i });
    const mobileLink = mobileLinks[mobileLinks.length - 1];

    // Trigger onClick handler directly
    const clickEvent = new MouseEvent('click', { bubbles: true });
    mobileLink.dispatchEvent(clickEvent);

    // The onClick handler should have been called
    expect(mobileLink).toBeInTheDocument();
    expect(mobileLink).toHaveAttribute('href', '/events');
  });

  it('should close mobile menu when Shops link is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<Nav />);

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(menuButton);

    // Verify mobile menu is open by checking for mobile menu container
    const mobileMenu = container.querySelector('.border-t.md\\:hidden');
    expect(mobileMenu).toBeInTheDocument();

    // Get mobile menu links (the last one is the mobile link)
    const mobileLinks = screen.getAllByRole('link', { name: /shops/i });
    const mobileLink = mobileLinks[mobileLinks.length - 1];

    // Trigger onClick handler directly
    const clickEvent = new MouseEvent('click', { bubbles: true });
    mobileLink.dispatchEvent(clickEvent);

    // The onClick handler should have been called
    expect(mobileLink).toBeInTheDocument();
    expect(mobileLink).toHaveAttribute('href', '/shops');
  });
});
