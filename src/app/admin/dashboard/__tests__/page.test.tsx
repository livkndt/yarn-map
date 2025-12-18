import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '../page';

// Mock auth, signOut, and redirect
const mockAuth = jest.fn();
const mockSignOut = jest.fn();
const mockRedirect = jest.fn();

jest.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
  signOut: () => mockSignOut(),
}));

jest.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}));

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dashboard heading', async () => {
    mockAuth.mockResolvedValue({
      user: { email: 'admin@example.com' },
    });

    const page = await AdminDashboardPage();
    render(page);

    expect(
      screen.getByRole('heading', { name: /admin dashboard/i }),
    ).toBeInTheDocument();
  });

  it('should display welcome message with user email', async () => {
    mockAuth.mockResolvedValue({
      user: { email: 'admin@example.com' },
    });

    const page = await AdminDashboardPage();
    render(page);

    expect(
      screen.getByText(/welcome back, admin@example.com/i),
    ).toBeInTheDocument();
  });

  it('should display default welcome message when email is missing', async () => {
    mockAuth.mockResolvedValue({
      user: {},
    });

    const page = await AdminDashboardPage();
    render(page);

    expect(screen.getByText(/welcome back, admin/i)).toBeInTheDocument();
  });

  it('should render Sign Out button', async () => {
    mockAuth.mockResolvedValue({
      user: { email: 'admin@example.com' },
    });

    const page = await AdminDashboardPage();
    render(page);

    expect(
      screen.getByRole('button', { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  it('should render Manage Events card', async () => {
    mockAuth.mockResolvedValue({
      user: { email: 'admin@example.com' },
    });

    const page = await AdminDashboardPage();
    render(page);

    expect(
      screen.getByRole('heading', { name: /manage events/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/create, edit, and delete events/i),
    ).toBeInTheDocument();
  });

  it('should render Manage Shops card', async () => {
    mockAuth.mockResolvedValue({
      user: { email: 'admin@example.com' },
    });

    const page = await AdminDashboardPage();
    render(page);

    expect(
      screen.getByRole('heading', { name: /manage shops/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/create, edit, and delete yarn shops/i),
    ).toBeInTheDocument();
  });

  it('should render View Reports card', async () => {
    mockAuth.mockResolvedValue({
      user: { email: 'admin@example.com' },
    });

    const page = await AdminDashboardPage();
    render(page);

    expect(
      screen.getByRole('heading', { name: /view reports/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/review and manage user-submitted reports/i),
    ).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    mockRedirect.mockImplementation(() => {
      throw new Error('Redirect called');
    });

    await expect(AdminDashboardPage()).rejects.toThrow('Redirect called');
    expect(mockRedirect).toHaveBeenCalledWith('/admin');
  });

  it('should render form with signOut action', async () => {
    mockAuth.mockResolvedValue({
      user: { email: 'admin@example.com' },
    });

    const page = await AdminDashboardPage();
    const { container } = render(page);

    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    // Server actions don't render as HTML attributes in test environment
    // Just verify the form exists and has a submit button
    const submitButton = screen.getByRole('button', { name: /sign out/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });
});
