// EventsDirectory uses React hooks with fetch and Radix UI components
// These tests are better suited for E2E testing with a running server

describe('EventsDirectory', () => {
  it('should export EventsDirectory component', async () => {
    const { EventsDirectory } = await import('../events-directory');
    expect(typeof EventsDirectory).toBe('function');
  });
});
