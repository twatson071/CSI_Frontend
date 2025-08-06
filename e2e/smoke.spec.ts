import { test, expect } from '@playwright/test';

// Skip authentication for smoke test
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // The app should load without errors
    await expect(page).toHaveTitle(/CSI/i);
    
    // Some element should be visible (login page or dashboard)
    const visibleElements = await page.locator('body').isVisible();
    expect(visibleElements).toBe(true);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(1000); // Wait for any async errors
    
    // Should have no console errors
    expect(errors).toHaveLength(0);
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // App should still be visible
      const isVisible = await page.locator('body').isVisible();
      expect(isVisible).toBe(true);
    }
  });
});