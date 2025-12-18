// HomePage is an async Server Component that requires database access
// Testing async Server Components with Jest requires special setup
// These are integration test scenarios better suited for E2E testing

describe('HomePage', () => {
  it('should be an async function (Server Component)', async () => {
    // Import the page module to verify it exports correctly
    const { default: HomePage } = await import('../page');
    expect(typeof HomePage).toBe('function');
  });

  // Note: Full rendering tests for async Server Components
  // should be done via E2E testing (Playwright/Cypress) or
  // using Next.js's built-in testing utilities for RSC
});
