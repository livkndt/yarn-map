import { render, screen } from '@testing-library/react';
import PublicLayout from '../layout';

// Mock components
jest.mock('@/components/nav', () => ({
  Nav: () => <nav>Nav Component</nav>,
}));

jest.mock('@/components/footer', () => ({
  Footer: () => <footer>Footer Component</footer>,
}));

describe('PublicLayout', () => {
  it('should render Nav component', () => {
    render(
      <PublicLayout>
        <div>Page content</div>
      </PublicLayout>,
    );

    expect(screen.getByText('Nav Component')).toBeInTheDocument();
  });

  it('should render Footer component', () => {
    render(
      <PublicLayout>
        <div>Page content</div>
      </PublicLayout>,
    );

    expect(screen.getByText('Footer Component')).toBeInTheDocument();
  });

  it('should render children in main element', () => {
    render(
      <PublicLayout>
        <div>Page content</div>
      </PublicLayout>,
    );

    expect(screen.getByText('Page content')).toBeInTheDocument();
    const main = screen.getByText('Page content').closest('main');
    expect(main).toBeInTheDocument();
  });
});
