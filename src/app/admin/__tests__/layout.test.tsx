import { render, screen } from '@testing-library/react';
import AdminLayout from '../layout';

describe('AdminLayout', () => {
  it('should render admin dashboard header', async () => {
    const layout = await AdminLayout({
      children: <div>Dashboard content</div>,
    });

    render(layout);

    expect(
      screen.getByRole('heading', { name: /admin dashboard/i }),
    ).toBeInTheDocument();
  });

  it('should render children in main element', async () => {
    const layout = await AdminLayout({
      children: <div>Dashboard content</div>,
    });

    render(layout);

    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
    const main = screen.getByText('Dashboard content').closest('main');
    expect(main).toBeInTheDocument();
  });
});
