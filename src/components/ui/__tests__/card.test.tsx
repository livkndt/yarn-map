import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card';

describe('Card component', () => {
  it('should render a card', () => {
    const { container } = render(<Card>Card content</Card>);
    const card = container.querySelector('.rounded-lg');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Card content');
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('should render CardHeader with content', () => {
    render(
      <Card>
        <CardHeader>Header content</CardHeader>
      </Card>,
    );
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should render CardTitle with text', () => {
    render(
      <Card>
        <CardTitle>Card Title</CardTitle>
      </Card>,
    );
    const title = screen.getByText('Card Title');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H3');
  });

  it('should render CardDescription with text', () => {
    render(
      <Card>
        <CardDescription>Card description</CardDescription>
      </Card>,
    );
    expect(screen.getByText('Card description')).toBeInTheDocument();
  });

  it('should render CardContent with content', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>,
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should render CardFooter with content', () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>,
    );
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should render a complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });
});
