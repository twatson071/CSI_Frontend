import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load dashboard within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Verify critical elements are visible
    await expect(page.getByRole('heading', { name: /device status/i })).toBeVisible();
    await expect(page.locator('.device-status-card').first()).toBeVisible();
  });

  test('should handle 50+ devices efficiently', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Measure initial render time
    const startTime = Date.now();
    await page.waitForSelector('.device-status-card');
    const renderTime = Date.now() - startTime;
    
    // Should render device list quickly
    expect(renderTime).toBeLessThan(2000);
    
    // Verify scrolling performance
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // No significant lag should occur
    const scrollTime = await page.evaluate(() => {
      const start = performance.now();
      window.scrollTo(0, document.body.scrollHeight);
      window.scrollTo(0, 0);
      return performance.now() - start;
    });
    
    expect(scrollTime).toBeLessThan(100);
  });

  test('should update metrics without UI freeze', async ({ page }) => {
    // Navigate to device details
    await page.goto('/device/1');
    
    // Wait for initial metrics
    await expect(page.locator('.metric-card').first()).toBeVisible();
    
    // Measure UI responsiveness during updates
    const measurements = await page.evaluate(async () => {
      const results = [];
      
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        
        // Simulate user interaction
        document.body.click();
        
        // Measure time to next frame
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        results.push(performance.now() - start);
        
        // Wait for next metric update cycle
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      return results;
    });
    
    // All interactions should be responsive (< 50ms)
    measurements.forEach(time => {
      expect(time).toBeLessThan(50);
    });
  });

  test('should efficiently filter large alert lists', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Open alerts panel
    const alertsPanel = page.locator('[data-testid="alerts-panel"]');
    await expect(alertsPanel).toBeVisible();
    
    // Measure filter performance
    const filterTime = await page.evaluate(async () => {
      const start = performance.now();
      
      // Trigger filter
      const filterInput = document.querySelector('input[placeholder*="search"]') as HTMLInputElement;
      if (filterInput) {
        filterInput.value = 'CPU';
        filterInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Wait for filter to apply
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return performance.now() - start;
    });
    
    // Filter should apply quickly
    expect(filterTime).toBeLessThan(200);
  });

  test('should handle rapid navigation efficiently', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/sites',
      '/manage/devices',
      '/manage/users',
      '/dashboard'
    ];
    
    const navigationTimes = [];
    
    for (const route of routes) {
      const startTime = Date.now();
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      navigationTimes.push(Date.now() - startTime);
    }
    
    // Average navigation time should be under 1 second
    const avgTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
    expect(avgTime).toBeLessThan(1000);
    
    // No single navigation should take over 2 seconds
    navigationTimes.forEach(time => {
      expect(time).toBeLessThan(2000);
    });
  });

  test('should maintain 60fps during animations', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Measure animation performance
    const fps = await page.evaluate(async () => {
      let frames = 0;
      let lastTime = performance.now();
      const frameRates: number[] = [];
      
      const measureFPS = () => {
        frames++;
        const currentTime = performance.now();
        const delta = currentTime - lastTime;
        
        if (delta >= 1000) {
          frameRates.push(frames);
          frames = 0;
          lastTime = currentTime;
        }
        
        if (frameRates.length < 3) {
          requestAnimationFrame(measureFPS);
        }
      };
      
      // Trigger animations
      requestAnimationFrame(measureFPS);
      
      // Simulate UI animations
      const elements = document.querySelectorAll('.device-status-card');
      elements.forEach((el, i) => {
        (el as HTMLElement).style.transform = `translateY(${i * 2}px)`;
        (el as HTMLElement).style.transition = 'transform 0.3s ease';
      });
      
      // Wait for measurements
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      return frameRates;
    });
    
    // Average FPS should be close to 60
    const avgFPS = fps.reduce((a, b) => a + b, 0) / fps.length;
    expect(avgFPS).toBeGreaterThan(50);
  });

  test('should handle large data exports efficiently', async ({ page }) => {
    // Navigate to device with metrics
    await page.goto('/device/1');
    
    // Look for export button
    const exportButton = page.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible()) {
      const startTime = Date.now();
      
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      // Complete export dialog if needed
      const downloadButton = page.getByRole('button', { name: /download/i });
      if (await downloadButton.isVisible()) {
        await downloadButton.click();
      }
      
      const download = await downloadPromise;
      const exportTime = Date.now() - startTime;
      
      // Export should complete within 5 seconds
      expect(exportTime).toBeLessThan(5000);
      
      // Verify download size is reasonable
      const path = await download.path();
      if (path) {
        const stats = await page.evaluate(async (p) => {
          const fs = (window as any).require?.('fs');
          return fs ? fs.statSync(p).size : 0;
        }, path);
        
        // File should exist and have content
        expect(stats).toBeGreaterThan(0);
      }
    }
  });
});