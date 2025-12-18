import { render, screen } from '@testing-library/react';
import AdminLayout from '../layout';

// Mock auth and signOut
const mockAuth = jest.fn();
const mockSignOut = jest.fn();

jest.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
  signOut: () => mockSignOut(),
}));

describe('AdminLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render admin header with branding', async () => {
    mockAuth.mockResolvedValue(null);
    const layout = await AdminLayout({
      children: <div>Dashboard content</div>,
    });

    render(layout);

    expect(
      screen.getByRole('heading', { name: /yarn map admin/i }),
    ).toBeInTheDocument();
  });

  it('should render sign out button when authenticated', async () => {
    mockAuth.mockResolvedValue({
      user: { email: 'admin@example.com' },
    });
    const layout = await AdminLayout({
      children: <div>Dashboard content</div>,
    });

    render(layout);

    expect(
      screen.getByRole('button', { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  it('should not render sign out button when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const layout = await AdminLayout({
      children: <div>Dashboard content</div>,
    });

    render(layout);

    expect(
      screen.queryByRole('button', { name: /sign out/i }),
    ).not.toBeInTheDocument();
  });

  it('should render navigation links when authenticated', async () => {
    mockAuth.mockResolvedValue({
      user: { email: 'admin@example.com' },
    });
    const layout = await AdminLayout({
      children: <div>Dashboard content</div>,
    });

    render(layout);

    expect(screen.getByRole('link', { name: /events/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shops/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reports/i })).toBeInTheDocument();
  });

  it('should render children in main element', async () => {
    mockAuth.mockResolvedValue(null);
    const layout = await AdminLayout({
      children: <div>Dashboard content</div>,
    });

    render(layout);

    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
    const main = screen.getByText('Dashboard content').closest('main');
    expect(main).toBeInTheDocument();
  });
});
