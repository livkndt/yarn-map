import { render, screen } from '@testing-library/react';
import AdminLoginPage from '../page';

// Mock LoginForm component
jest.mock('../login-form', () => ({
  LoginForm: () => <div>LoginForm</div>,
}));

// Mock auth and redirect
const mockAuth = jest.fn();
const mockRedirect = jest.fn();

jest.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}));

jest.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}));

describe('AdminLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render LoginForm when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const page = await AdminLoginPage();
    render(page);

    expect(screen.getByText('LoginForm')).toBeInTheDocument();
  });

  it('should redirect to dashboard when already authenticated', async () => {
    mockAuth.mockResolvedValue({
      user: { email: 'admin@example.com' },
    });

    await AdminLoginPage();

    expect(mockRedirect).toHaveBeenCalledWith('/admin/dashboard');
  });
});
