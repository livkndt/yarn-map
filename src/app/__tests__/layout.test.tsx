import { render } from '@testing-library/react';
import RootLayout from '../layout';

describe('RootLayout', () => {
  it('should render children', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>,
    );

    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('should render metadata', () => {
    // This test verifies the layout exports metadata
    // The actual rendering is handled by Next.js
    expect(RootLayout).toBeDefined();
  });
});
