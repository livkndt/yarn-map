import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../textarea';

describe('Textarea Component', () => {
  it('should render textarea', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should accept user input', async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Enter text" />);

    const textarea = screen.getByPlaceholderText('Enter text');
    await user.type(textarea, 'Hello World');

    expect(textarea).toHaveValue('Hello World');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Textarea placeholder="Enter text" disabled />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<Textarea className="custom-class" placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toHaveClass('custom-class');
  });

  it('should handle rows attribute', () => {
    render(<Textarea placeholder="Enter text" rows={5} />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('should handle onChange event', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Textarea placeholder="Enter text" onChange={handleChange} />);

    const textarea = screen.getByPlaceholderText('Enter text');
    await user.type(textarea, 'Test');

    expect(handleChange).toHaveBeenCalled();
  });
});
