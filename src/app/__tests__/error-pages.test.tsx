import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotFound from '../not-found';
import ErrorComponent from '../error';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Frown: () => <div data-testid="frown-icon" />,
  AlertTriangle: () => <div data-testid="alert-icon" />,
  RotateCcw: () => <div data-testid="rotate-icon" />,
  Home: () => <div data-testid="home-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Map: () => <div data-testid="map-icon" />,
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Error Pages', () => {
  describe('NotFound Page', () => {
    it('should render 404 message and navigation links', () => {
      render(<NotFound />);
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(screen.getByText('Back to Home')).toBeInTheDocument();
      expect(screen.getByText('Find Events')).toBeInTheDocument();
      expect(screen.getByText('Find Shops')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Page (500)', () => {
    it('should render error message and reset button', () => {
      const mockReset = jest.fn();
      const mockError = new Error('Test error') as Error & { digest?: string };
      mockError.digest = 'test-digest';

      render(<ErrorComponent error={mockError} reset={mockReset} />);
      expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
      const resetButton = screen.getByText('Try Again');
      expect(resetButton).toBeInTheDocument();

      fireEvent.click(resetButton);
      expect(mockReset).toHaveBeenCalled();
    });
  });
});
