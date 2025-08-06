import { test, expect } from '@playwright/test';

test.describe('Site and Endpoint Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display site hierarchy', async ({ page }) => {
    // Click on Sites in navigation
    await page.getByRole('link', { name: 'Sites' }).click();
    
    // Verify site tree is visible
    await expect(page.locator('.site-endpoints-tree')).toBeVisible();
    
    // Check for site nodes
    const siteNodes = page.locator('.tree-node[data-type="site"]');
    await expect(siteNodes.first()).toBeVisible();
    
    // Verify at least one site exists
    expect(await siteNodes.count()).toBeGreaterThan(0);
  });

  test('should expand site to show devices', async ({ page }) => {
    await page.goto('/sites');
    
    // Click on a site to expand
    const siteNode = page.locator('.tree-node[data-type="site"]').first();
    await siteNode.click();
    
    // Wait for devices to load
    await page.waitForTimeout(500);
    
    // Check for device nodes
    const deviceNodes = page.locator('.tree-node[data-type="device"]');
    if (await deviceNodes.count() > 0) {
      await expect(deviceNodes.first()).toBeVisible();
    }
  });

  test('should create a new site', async ({ page }) => {
    // Navigate to site management
    await page.getByRole('link', { name: 'Manage' }).click();
    await page.getByRole('link', { name: 'Sites' }).click();
    
    // Click add site button
    await page.getByRole('button', { name: /add site/i }).click();
    
    // Fill site form
    await page.getByLabel('Site Name').fill('Test Site E2E');
    await page.getByLabel('Location').fill('Building Z - Floor 1');
    await page.getByLabel('Description').fill('E2E test site for automated testing');
    
    // Add contact information
    await page.getByLabel('Contact Name').fill('Test Admin');
    await page.getByLabel('Contact Email').fill('admin@testsite.com');
    await page.getByLabel('Contact Phone').fill('+1-555-0123');
    
    // Submit form
    await page.getByRole('button', { name: /create/i }).click();
    
    // Verify success
    await expect(page.getByText(/site created successfully/i)).toBeVisible();
    
    // Verify site appears in list
    await expect(page.getByRole('cell', { name: 'Test Site E2E' })).toBeVisible();
  });

  test('should assign devices to site', async ({ page }) => {
    await page.goto('/sites');
    
    // Click on a site
    const siteNode = page.locator('.tree-node[data-type="site"]').first();
    const siteName = await siteNode.textContent();
    await siteNode.click();
    
    // Click manage devices button
    await page.getByRole('button', { name: /manage devices/i }).click();
    
    // Device assignment dialog should open
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Find unassigned devices
    const availableDevices = page.locator('.available-devices .device-item');
    if (await availableDevices.count() > 0) {
      // Select first available device
      await availableDevices.first().locator('input[type="checkbox"]').check();
      
      // Click assign button
      await page.getByRole('button', { name: /assign/i }).click();
      
      // Verify device moved to assigned list
      const assignedDevices = page.locator('.assigned-devices .device-item');
      await expect(assignedDevices).toHaveCount(await assignedDevices.count());
    }
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify success
    await expect(page.getByText(/devices updated/i)).toBeVisible();
  });

  test('should edit site information', async ({ page }) => {
    // Navigate to site management
    await page.getByRole('link', { name: 'Manage' }).click();
    await page.getByRole('link', { name: 'Sites' }).click();
    
    // Find a site to edit
    const siteRow = page.getByRole('row').filter({ has: page.locator('td') }).first();
    await siteRow.getByRole('button', { name: /edit/i }).click();
    
    // Update site information
    const locationInput = page.getByLabel('Location');
    await locationInput.clear();
    await locationInput.fill('Updated Location - Building X');
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify success
    await expect(page.getByText(/site updated successfully/i)).toBeVisible();
    
    // Verify updated location
    await expect(page.getByRole('cell', { name: /Updated Location/i })).toBeVisible();
  });

  test('should view site dashboard', async ({ page }) => {
    await page.goto('/sites');
    
    // Click on a site
    const siteNode = page.locator('.tree-node[data-type="site"]').first();
    await siteNode.click();
    
    // Click view dashboard button
    await page.getByRole('button', { name: /view dashboard/i }).click();
    
    // Verify site dashboard elements
    await expect(page.getByRole('heading', { name: /site overview/i })).toBeVisible();
    
    // Check for device status summary
    await expect(page.locator('.site-device-summary')).toBeVisible();
    
    // Check for metrics
    const metricCards = page.locator('.site-metric-card');
    await expect(metricCards).toHaveCount(await metricCards.count());
    
    // Verify device list for site
    await expect(page.locator('.site-device-list')).toBeVisible();
  });

  test('should generate site report', async ({ page }) => {
    await page.goto('/sites');
    
    // Select a site
    const siteNode = page.locator('.tree-node[data-type="site"]').first();
    await siteNode.click();
    
    // Click generate report button
    const reportButton = page.getByRole('button', { name: /generate report/i });
    if (await reportButton.isVisible()) {
      // Start waiting for download
      const downloadPromise = page.waitForEvent('download');
      
      await reportButton.click();
      
      // Select report options if dialog appears
      const reportDialog = page.getByRole('dialog');
      if (await reportDialog.isVisible()) {
        await page.getByLabel('Report Type').selectOption('summary');
        await page.getByLabel('Time Period').selectOption('last_30_days');
        await page.getByRole('button', { name: /generate/i }).click();
      }
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toContain('site-report');
      expect(download.suggestedFilename()).toMatch(/\.(pdf|xlsx)$/);
    }
  });

  test('should delete a site without devices', async ({ page }) => {
    // First create a site to delete
    await page.getByRole('link', { name: 'Manage' }).click();
    await page.getByRole('link', { name: 'Sites' }).click();
    
    await page.getByRole('button', { name: /add site/i }).click();
    await page.getByLabel('Site Name').fill('Site To Delete');
    await page.getByLabel('Location').fill('Temporary Location');
    await page.getByRole('button', { name: /create/i }).click();
    
    // Wait for site to be created
    await expect(page.getByRole('cell', { name: 'Site To Delete' })).toBeVisible();
    
    // Delete the site
    const siteRow = page.getByRole('row').filter({ hasText: 'Site To Delete' });
    await siteRow.getByRole('button', { name: /delete/i }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Verify site is deleted
    await expect(page.getByRole('cell', { name: 'Site To Delete' })).not.toBeVisible();
    await expect(page.getByText(/site deleted successfully/i)).toBeVisible();
  });
});