import { test, expect } from '@playwright/test';

test.describe('Alert Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for alerts panel to be visible
    await expect(page.getByRole('heading', { name: /alerts/i })).toBeVisible();
  });

  test('should display critical alerts', async ({ page }) => {
    // Check for alert indicators
    const alertPanel = page.locator('[data-testid="alerts-panel"]');
    await expect(alertPanel).toBeVisible();
    
    // Look for critical alert badge
    const criticalBadge = page.locator('.critical-alert-badge');
    if (await criticalBadge.count() > 0) {
      await expect(criticalBadge.first()).toBeVisible();
    }
  });

  test('should acknowledge an alert', async ({ page }) => {
    // Find an active alert
    const activeAlert = page.locator('.alert-item').filter({ hasText: /active/i }).first();
    
    if (await activeAlert.count() > 0) {
      // Click acknowledge button
      await activeAlert.getByRole('button', { name: /acknowledge/i }).click();
      
      // Verify alert status changed
      await expect(activeAlert).toContainText(/acknowledged/i);
      
      // Verify acknowledge button is disabled
      const ackButton = activeAlert.getByRole('button', { name: /acknowledged/i });
      await expect(ackButton).toBeDisabled();
    }
  });

  test('should resolve an alert', async ({ page }) => {
    // Find an acknowledged alert (or create one)
    let alert = page.locator('.alert-item').filter({ hasText: /acknowledged/i }).first();
    
    if (await alert.count() === 0) {
      // Acknowledge an active alert first
      const activeAlert = page.locator('.alert-item').filter({ hasText: /active/i }).first();
      if (await activeAlert.count() > 0) {
        await activeAlert.getByRole('button', { name: /acknowledge/i }).click();
        alert = activeAlert;
      }
    }
    
    if (await alert.count() > 0) {
      // Click resolve button
      await alert.getByRole('button', { name: /resolve/i }).click();
      
      // Confirm resolution if dialog appears
      const confirmButton = page.getByRole('button', { name: /confirm/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Verify alert is resolved or removed
      await expect(alert).not.toBeVisible();
    }
  });

  test('should filter alerts by severity', async ({ page }) => {
    // Open filter options
    const filterButton = page.getByRole('button', { name: /filter/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
    }
    
    // Select critical severity
    await page.getByLabel(/severity/i).selectOption('CRITICAL');
    
    // Apply filter
    const applyButton = page.getByRole('button', { name: /apply/i });
    if (await applyButton.isVisible()) {
      await applyButton.click();
    }
    
    // Verify only critical alerts are shown
    const alerts = page.locator('.alert-item');
    const alertCount = await alerts.count();
    
    for (let i = 0; i < alertCount; i++) {
      await expect(alerts.nth(i)).toContainText(/critical/i);
    }
  });

  test('should bulk acknowledge multiple alerts', async ({ page }) => {
    // Select multiple alerts
    const checkboxes = page.locator('.alert-item input[type="checkbox"]');
    const checkboxCount = Math.min(await checkboxes.count(), 3);
    
    if (checkboxCount > 0) {
      // Check first few alerts
      for (let i = 0; i < checkboxCount; i++) {
        await checkboxes.nth(i).check();
      }
      
      // Click bulk acknowledge
      await page.getByRole('button', { name: /acknowledge selected/i }).click();
      
      // Confirm action
      const confirmButton = page.getByRole('button', { name: /confirm/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Verify success message
      await expect(page.getByText(/alerts acknowledged/i)).toBeVisible();
    }
  });

  test('should search alerts by keyword', async ({ page }) => {
    // Enter search term
    const searchInput = page.getByPlaceholder(/search alerts/i);
    await searchInput.fill('CPU');
    await searchInput.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify search results contain keyword
    const alerts = page.locator('.alert-item');
    const alertCount = await alerts.count();
    
    if (alertCount > 0) {
      for (let i = 0; i < alertCount; i++) {
        const alertText = await alerts.nth(i).textContent();
        expect(alertText?.toLowerCase()).toContain('cpu');
      }
    }
  });

  test('should show alert details on click', async ({ page }) => {
    // Click on an alert
    const alert = page.locator('.alert-item').first();
    
    if (await alert.count() > 0) {
      await alert.click();
      
      // Verify details panel opens
      const detailsPanel = page.locator('[data-testid="alert-details"]');
      await expect(detailsPanel).toBeVisible();
      
      // Verify details content
      await expect(detailsPanel).toContainText(/device/i);
      await expect(detailsPanel).toContainText(/timestamp/i);
      await expect(detailsPanel).toContainText(/severity/i);
      
      // Close details
      const closeButton = detailsPanel.getByRole('button', { name: /close/i });
      await closeButton.click();
      await expect(detailsPanel).not.toBeVisible();
    }
  });
});