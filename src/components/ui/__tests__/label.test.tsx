import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label component', () => {
  it('should render a label element', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should associate label with input using htmlFor', () => {
    render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" />
      </div>,
    );
    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('should apply custom className', () => {
    const { container } = render(<Label className="custom-label">Label</Label>);
    const label = container.querySelector('.custom-label');
    expect(label).toBeInTheDocument();
  });

  it('should render with different text content', () => {
    render(<Label>Email Address</Label>);
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('should handle required prop', () => {
    render(<Label required>Required Field</Label>);
    expect(screen.getByText('Required Field')).toBeInTheDocument();
  });
});
