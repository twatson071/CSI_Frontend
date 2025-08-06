import { test, expect } from '@playwright/test';

test.describe('Device Monitoring', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display device status dashboard', async ({ page }) => {
    // Verify dashboard elements
    await expect(page.getByRole('heading', { name: /device status/i })).toBeVisible();
    
    // Check for status indicators
    const statusCards = page.locator('.device-status-card');
    await expect(statusCards.first()).toBeVisible();
    
    // Verify status categories
    await expect(page.getByText(/online/i)).toBeVisible();
    await expect(page.getByText(/offline/i)).toBeVisible();
  });

  test('should navigate to device details', async ({ page }) => {
    // Click on a device card
    const deviceCard = page.locator('.device-status-card').filter({ hasText: /server/i }).first();
    
    if (await deviceCard.count() > 0) {
      await deviceCard.click();
      
      // Verify navigation to device details
      await expect(page).toHaveURL(/\/device\/\d+/);
      
      // Verify device details page elements
      await expect(page.getByRole('heading', { level: 1 })).toContainText(/server/i);
      
      // Check for metric cards
      await expect(page.locator('.metric-card')).toHaveCount(4); // CPU, Memory, Disk, Network
    }
  });

  test('should display real-time metrics', async ({ page }) => {
    // Navigate to a server device
    await page.goto('/device/1'); // Assuming device ID 1 is a server
    
    // Wait for metrics to load
    await expect(page.locator('.metric-card').first()).toBeVisible();
    
    // Verify CPU metrics
    const cpuCard = page.locator('.metric-card').filter({ hasText: /cpu/i });
    await expect(cpuCard).toBeVisible();
    await expect(cpuCard.locator('.metric-value')).toBeVisible();
    
    // Verify Memory metrics
    const memoryCard = page.locator('.metric-card').filter({ hasText: /memory/i });
    await expect(memoryCard).toBeVisible();
    await expect(memoryCard.locator('.metric-value')).toBeVisible();
    
    // Check for charts
    const charts = page.locator('.metric-chart');
    await expect(charts).toHaveCount(await charts.count());
  });

  test('should update metrics in real-time', async ({ page }) => {
    // Navigate to device details
    await page.goto('/device/1');
    
    // Get initial CPU value
    const cpuCard = page.locator('.metric-card').filter({ hasText: /cpu/i });
    const cpuValue = cpuCard.locator('.metric-value');
    const initialValue = await cpuValue.textContent();
    
    // Wait for polling interval (5 seconds)
    await page.waitForTimeout(5500);
    
    // Check if value has updated
    const updatedValue = await cpuValue.textContent();
    
    // Values might be the same, but the chart should have new data points
    const chartDataPoints = page.locator('.metric-chart .data-point');
    await expect(chartDataPoints).toHaveCount(await chartDataPoints.count());
  });

  test('should show temperature heatmap for servers', async ({ page }) => {
    // Navigate to a server device
    await page.goto('/device/1');
    
    // Look for temperature section
    const tempSection = page.locator('.temperature-section');
    if (await tempSection.count() > 0) {
      await expect(tempSection).toBeVisible();
      
      // Check for heatmap
      const heatmap = tempSection.locator('.cpu-temp-heatmap');
      await expect(heatmap).toBeVisible();
      
      // Verify heatmap has data
      const heatmapCells = heatmap.locator('.heatmap-cell');
      await expect(heatmapCells).toHaveCount(await heatmapCells.count());
    }
  });

  test('should control PDU outlets', async ({ page }) => {
    // Find a PDU device
    const pduCard = page.locator('.device-status-card').filter({ hasText: /pdu/i }).first();
    
    if (await pduCard.count() > 0) {
      await pduCard.click();
      
      // Wait for PDU interface to load
      await expect(page.locator('.pdu-container')).toBeVisible();
      
      // Find an outlet
      const outlet = page.locator('.outlet-container').first();
      await expect(outlet).toBeVisible();
      
      // Click power toggle
      const powerButton = outlet.locator('button[aria-label*="power"]');
      await powerButton.click();
      
      // Confirm action if dialog appears
      const confirmButton = page.getByRole('button', { name: /confirm/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Verify status change
      await expect(page.getByText(/outlet.*updated/i)).toBeVisible();
    }
  });

  test('should display device connection errors', async ({ page }) => {
    // Look for offline devices
    const offlineDevice = page.locator('.device-status-card').filter({ hasText: /offline/i }).first();
    
    if (await offlineDevice.count() > 0) {
      await offlineDevice.click();
      
      // Verify error message is displayed
      await expect(page.getByText(/unable to connect/i)).toBeVisible();
      
      // Check for retry button
      const retryButton = page.getByRole('button', { name: /retry/i });
      await expect(retryButton).toBeVisible();
      
      // Click retry
      await retryButton.click();
      
      // Verify loading state
      await expect(page.getByText(/connecting/i)).toBeVisible();
    }
  });

  test('should export device metrics', async ({ page }) => {
    // Navigate to device details
    await page.goto('/device/1');
    
    // Look for export button
    const exportButton = page.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible()) {
      // Start waiting for download before clicking
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      // Select time range if dialog appears
      const timeRangeSelect = page.getByLabel(/time range/i);
      if (await timeRangeSelect.isVisible()) {
        await timeRangeSelect.selectOption('24h');
        await page.getByRole('button', { name: /download/i }).click();
      }
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toContain('metrics');
      expect(download.suggestedFilename()).toMatch(/\.(csv|json)$/);
    }
  });
});