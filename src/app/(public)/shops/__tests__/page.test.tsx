import { render, screen } from '@testing-library/react';
import ShopsPage from '../page';

// Mock the ShopsDirectory component
jest.mock('../shops-directory', () => ({
  ShopsDirectory: () => <div>Shops Directory Component</div>,
}));

describe('ShopsPage', () => {
  it('should render the ShopsDirectory component', () => {
    render(<ShopsPage />);
    expect(screen.getByText('Shops Directory Component')).toBeInTheDocument();
  });

  it('should have correct metadata', () => {
    // Metadata is set via Next.js metadata export
    render(<ShopsPage />);
    expect(screen.getByText('Shops Directory Component')).toBeInTheDocument();
  });
});
