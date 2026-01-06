# Lighthouse CI Reports

This directory contains Lighthouse CI reports generated from automated performance testing.

## Running Lighthouse

### Quick Test (Local Dev Server)

```bash
# Make sure your dev server is running first
npm run dev

# In another terminal, run Lighthouse
npm run lighthouse
```

This will:

- Test `http://localhost:3000`
- Generate an HTML report
- Open it automatically in your browser

### Test Production URL

```bash
# Test your production site
npx lighthouse https://your-site.netlify.app --output html --output-path ./lighthouse-report.html --view
```

### Automated CI Testing

```bash
# Runs Lighthouse CI with assertions
npm run lighthouse:ci
```

This will:

- Start your dev server automatically
- Run Lighthouse 3 times
- Check against performance thresholds
- Save reports to `./lighthouse-reports`

## Performance Thresholds

Current thresholds (can be adjusted in `lighthouserc.js`):

- Performance: ≥ 80
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

## Next.js Built-in Tools

You already have `@next/bundle-analyzer` installed. To analyze bundle size:

```bash
npm run analyze
```

This will show you:

- Bundle size breakdown
- Which packages are taking up space
- Opportunities for code splitting
