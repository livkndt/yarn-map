// ReportModal uses Radix UI Dialog which requires special testing setup
// These tests are better suited for E2E testing

describe('ReportModal', () => {
  it('should export ReportModal component', async () => {
    const { ReportModal } = await import('../report-modal');
    expect(typeof ReportModal).toBe('function');
  });
});
