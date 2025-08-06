import { test, expect } from '@playwright/test';

test.describe('Device Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to device management page
    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'Manage' }).click();
    await page.getByRole('link', { name: 'Devices' }).click();
    await expect(page.getByRole('heading', { name: 'Device Management' })).toBeVisible();
  });

  test('should display list of devices', async ({ page }) => {
    // Verify devices table is visible
    await expect(page.getByRole('table')).toBeVisible();
    
    // Check for device entries
    const deviceRows = page.getByRole('row');
    await expect(deviceRows).toHaveCount(await deviceRows.count());
    
    // Verify table headers
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Type' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Site' })).toBeVisible();
  });

  test('should create a new device', async ({ page }) => {
    // Click add device button
    await page.getByRole('button', { name: /add device/i }).click();
    
    // Fill in device form
    await page.getByLabel('Name').fill('Test Server E2E');
    await page.getByLabel('Type').selectOption('Server');
    await page.getByLabel('Service URL').fill('http://test-server.local:8080');
    await page.getByLabel('Site').selectOption('1'); // Select first site
    
    // Submit form
    await page.getByRole('button', { name: /create/i }).click();
    
    // Verify success message
    await expect(page.getByText(/device created successfully/i)).toBeVisible();
    
    // Verify device appears in list
    await expect(page.getByRole('cell', { name: 'Test Server E2E' })).toBeVisible();
  });

  test('should edit an existing device', async ({ page }) => {
    // Find a device to edit
    const firstDeviceRow = page.getByRole('row').filter({ hasText: /Server/ }).first();
    await firstDeviceRow.getByRole('button', { name: /edit/i }).click();
    
    // Update device name
    const nameInput = page.getByLabel('Name');
    await nameInput.clear();
    await nameInput.fill('Updated Device Name');
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify success message
    await expect(page.getByText(/device updated successfully/i)).toBeVisible();
    
    // Verify updated name in list
    await expect(page.getByRole('cell', { name: 'Updated Device Name' })).toBeVisible();
  });

  test('should delete a device', async ({ page }) => {
    // Create a device to delete
    await page.getByRole('button', { name: /add device/i }).click();
    await page.getByLabel('Name').fill('Device To Delete');
    await page.getByLabel('Type').selectOption('PDU');
    await page.getByLabel('Service URL').fill('http://delete-me.local');
    await page.getByRole('button', { name: /create/i }).click();
    
    // Wait for device to appear
    await expect(page.getByRole('cell', { name: 'Device To Delete' })).toBeVisible();
    
    // Delete the device
    const deviceRow = page.getByRole('row').filter({ hasText: 'Device To Delete' });
    await deviceRow.getByRole('button', { name: /delete/i }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Verify device is removed
    await expect(page.getByRole('cell', { name: 'Device To Delete' })).not.toBeVisible();
    await expect(page.getByText(/device deleted successfully/i)).toBeVisible();
  });

  test('should filter devices by type', async ({ page }) => {
    // Apply filter
    await page.getByLabel('Filter by type').selectOption('Server');
    
    // Verify only servers are shown
    const deviceRows = page.getByRole('row').filter({ hasText: /Server/ });
    const allRows = page.getByRole('row');
    
    // All visible data rows should be servers
    for (let i = 1; i < await allRows.count(); i++) {
      const row = allRows.nth(i);
      await expect(row).toContainText('Server');
    }
  });

  test('should search devices by name', async ({ page }) => {
    // Enter search term
    await page.getByPlaceholder('Search devices...').fill('Server');
    
    // Wait for filtered results
    await page.waitForTimeout(500); // Debounce delay
    
    // Verify search results
    const deviceRows = page.getByRole('row');
    for (let i = 1; i < await deviceRows.count(); i++) {
      const row = deviceRows.nth(i);
      const text = await row.textContent();
      expect(text?.toLowerCase()).toContain('server');
    }
  });
});