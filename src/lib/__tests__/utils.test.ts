import { cn } from '../utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('foo', 'bar');
    expect(result).toContain('foo');
    expect(result).toContain('bar');
  });

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz');
    expect(result).toContain('foo');
    expect(result).not.toContain('bar');
    expect(result).toContain('baz');
  });

  it('should merge Tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    // Tailwind merge should keep px-4 and remove px-2
    expect(result).toContain('px-4');
    expect(result).toContain('py-1');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
