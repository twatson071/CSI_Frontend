# E2E Testing Guide with Playwright

## Overview

This guide covers the End-to-End (E2E) testing setup using Playwright for the CSI Frontend project. E2E tests verify complete user workflows across the entire application stack.

## Setup

### Installation

```bash
# Install Playwright (already configured)
npm init playwright@latest

# Install browsers
npx playwright install
```

### Configuration

The Playwright configuration is in `playwright.config.ts`:
- Base URL: `http://localhost:3002`
- Test directory: `./e2e`
- Automatic server startup for tests
- Authentication state persistence
- Multiple browser testing (Chrome, Firefox, Mobile)

## Running E2E Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (recommended for development)
npm run test:e2e:ui

# Debug a specific test
npm run test:e2e:debug

# View test report
npm run test:e2e:report

# Generate test code by recording actions
npx playwright codegen http://localhost:3002
```

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test e2e/device-management.spec.ts

# Run tests matching a pattern
npx playwright test -g "should create a new device"

# Run tests in a specific browser
npx playwright test --project=chromium
```

## Test Structure

### Directory Organization

```
e2e/
├── auth.setup.ts              # Authentication setup
├── fixtures/
│   └── test-helpers.ts        # Shared test utilities
├── device-management.spec.ts  # Device CRUD operations
├── alert-workflow.spec.ts     # Alert management tests
├── device-monitoring.spec.ts  # Real-time monitoring tests
├── user-management.spec.ts    # User administration tests
├── site-management.spec.ts    # Site hierarchy tests
└── performance.spec.ts        # Performance benchmarks
```

### Test File Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/dashboard');
  });

  test('should perform action', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: 'Action' }).click();
    
    // Act
    await page.fill('#input', 'value');
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

## Authentication

Tests use a shared authentication state to avoid logging in for each test:

1. `auth.setup.ts` runs first and saves authentication
2. Other tests use the saved auth state
3. Auth state is stored in `playwright/.auth/user.json`

## Test Helpers

The `TestHelpers` class provides common utilities:

```typescript
const helpers = new TestHelpers(page);

// Wait for toast notification
await helpers.expectToast('Device created successfully', 'success');

// Navigate using menu
await helpers.navigateTo('Manage', 'Devices');

// Fill form with retry logic
await helpers.fillFormField('Device Name', 'Test Device');

// Wait for loading to complete
await helpers.waitForLoadingComplete();
```

## Writing E2E Tests

### Best Practices

1. **Use semantic locators**:
   ```typescript
   // Good
   await page.getByRole('button', { name: 'Submit' }).click();
   await page.getByLabel('Email').fill('user@example.com');
   
   // Avoid
   await page.locator('#submit-btn').click();
   await page.locator('.email-input').fill('user@example.com');
   ```

2. **Wait for elements properly**:
   ```typescript
   // Wait for element to be visible
   await expect(page.getByText('Loading')).toBeVisible();
   
   // Wait for element to disappear
   await expect(page.getByText('Loading')).not.toBeVisible();
   
   // Wait for specific condition
   await page.waitForSelector('.data-loaded');
   ```

3. **Handle dynamic content**:
   ```typescript
   // Wait for API response
   await page.waitForResponse(resp => 
     resp.url().includes('/api/devices') && resp.status() === 200
   );
   
   // Wait for WebSocket updates
   await page.waitForTimeout(1000); // Allow time for real-time updates
   ```

4. **Use Page Object Model for complex pages**:
   ```typescript
   class DevicePage {
     constructor(private page: Page) {}
     
     async createDevice(device: DeviceData) {
       await this.page.getByRole('button', { name: 'Add Device' }).click();
       await this.page.getByLabel('Name').fill(device.name);
       // ... more fields
       await this.page.getByRole('button', { name: 'Create' }).click();
     }
   }
   ```

### Common Patterns

#### Testing CRUD Operations
```typescript
test('should perform CRUD operations', async ({ page }) => {
  // Create
  await page.getByRole('button', { name: 'Add' }).click();
  await page.fill('[name="title"]', 'Test Item');
  await page.getByRole('button', { name: 'Save' }).click();
  
  // Read
  await expect(page.getByText('Test Item')).toBeVisible();
  
  // Update
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.fill('[name="title"]', 'Updated Item');
  await page.getByRole('button', { name: 'Save' }).click();
  
  // Delete
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
});
```

#### Testing Real-time Updates
```typescript
test('should show real-time updates', async ({ page }) => {
  // Open in two tabs
  const context = page.context();
  const page2 = await context.newPage();
  
  await page.goto('/dashboard');
  await page2.goto('/dashboard');
  
  // Make change in first tab
  await page.getByRole('button', { name: 'Update' }).click();
  
  // Verify update appears in second tab
  await expect(page2.getByText('Updated')).toBeVisible();
});
```

#### Testing File Downloads
```typescript
test('should download report', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export' }).click();
  
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('report.csv');
  
  // Optionally save file
  await download.saveAs('/path/to/save/report.csv');
});
```

## Performance Testing

Performance tests verify the application meets speed requirements:

```typescript
test('should load quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/dashboard');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

## Debugging Tests

### Visual Debugging
```bash
# Run with headed browser
npx playwright test --headed

# Use UI mode for step-by-step debugging
npm run test:e2e:ui

# Debug mode with breakpoints
npm run test:e2e:debug
```

### Screenshots and Videos
```typescript
// Take screenshot on failure (automatic in config)
await page.screenshot({ path: 'debug.png' });

// Record video (enable in config)
use: {
  video: 'on-first-retry'
}
```

### Trace Viewer
```bash
# View trace for failed tests
npx playwright show-trace trace.zip
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Common Issues

1. **Tests timeout**
   - Increase timeout in test: `test.setTimeout(60000)`
   - Check if services are running
   - Verify network conditions

2. **Element not found**
   - Use `page.waitForSelector()` before interaction
   - Check if element is in iframe or shadow DOM
   - Verify selector is correct

3. **Flaky tests**
   - Add proper waits for dynamic content
   - Use `waitForLoadState('networkidle')`
   - Avoid hard-coded timeouts

4. **Authentication fails**
   - Delete `playwright/.auth/` and re-run
   - Check if login credentials are correct
   - Verify auth endpoints are working

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Guide](https://playwright.dev/docs/ci)