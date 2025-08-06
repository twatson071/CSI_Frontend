import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to user management
    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'Manage' }).click();
    await page.getByRole('link', { name: 'Users' }).click();
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
  });

  test('should display list of users', async ({ page }) => {
    // Verify user table is visible
    await expect(page.getByRole('table')).toBeVisible();
    
    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Sites' })).toBeVisible();
    
    // Verify at least one user exists
    const userRows = page.getByRole('row');
    await expect(userRows).toHaveCount(await userRows.count());
    expect(await userRows.count()).toBeGreaterThan(1); // Header + at least one user
  });

  test('should create a new user', async ({ page }) => {
    // Click add user button
    await page.getByRole('button', { name: /add user/i }).click();
    
    // Fill user form
    await page.getByLabel('Name').fill('Test User E2E');
    await page.getByLabel('Email').fill('e2e.test@example.com');
    await page.getByLabel('Password').fill('SecurePassword123!');
    await page.getByLabel('Role').selectOption('operator');
    
    // Select sites
    const siteCheckboxes = page.locator('input[type="checkbox"][name*="site"]');
    if (await siteCheckboxes.count() > 0) {
      await siteCheckboxes.first().check();
    }
    
    // Submit form
    await page.getByRole('button', { name: /create/i }).click();
    
    // Verify success
    await expect(page.getByText(/user created successfully/i)).toBeVisible();
    
    // Verify user appears in list
    await expect(page.getByRole('cell', { name: 'Test User E2E' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'e2e.test@example.com' })).toBeVisible();
  });

  test('should edit user permissions', async ({ page }) => {
    // Find a user to edit
    const userRow = page.getByRole('row').filter({ hasText: /@/ }).first();
    await userRow.getByRole('button', { name: /edit/i }).click();
    
    // Change role
    await page.getByLabel('Role').selectOption('admin');
    
    // Update site access
    const siteCheckboxes = page.locator('input[type="checkbox"][name*="site"]');
    if (await siteCheckboxes.count() > 1) {
      // Toggle second site
      await siteCheckboxes.nth(1).click();
    }
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify success
    await expect(page.getByText(/user updated successfully/i)).toBeVisible();
  });

  test('should deactivate a user', async ({ page }) => {
    // Find a non-admin user
    const userRow = page.getByRole('row').filter({ 
      hasNot: page.locator('td:has-text("admin")') 
    }).first();
    
    if (await userRow.count() > 0) {
      // Click deactivate button
      await userRow.getByRole('button', { name: /deactivate/i }).click();
      
      // Confirm deactivation
      await page.getByRole('button', { name: /confirm/i }).click();
      
      // Verify user is deactivated
      await expect(userRow).toContainText(/inactive/i);
      await expect(page.getByText(/user deactivated/i)).toBeVisible();
    }
  });

  test('should filter users by role', async ({ page }) => {
    // Apply role filter
    await page.getByLabel('Filter by role').selectOption('operator');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Verify filtered results
    const userRows = page.getByRole('row').filter({ has: page.locator('td') });
    const rowCount = await userRows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const row = userRows.nth(i);
      await expect(row).toContainText('operator');
    }
  });

  test('should search users by name or email', async ({ page }) => {
    // Search by email domain
    await page.getByPlaceholder(/search users/i).fill('@localhost');
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify search results
    const userRows = page.getByRole('row').filter({ has: page.locator('td') });
    const rowCount = await userRows.count();
    
    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        const row = userRows.nth(i);
        const rowText = await row.textContent();
        expect(rowText?.toLowerCase()).toContain('@localhost');
      }
    }
  });

  test('should manage user site access', async ({ page }) => {
    // Find a user
    const userRow = page.getByRole('row').filter({ hasText: /@/ }).first();
    await userRow.getByRole('button', { name: /manage sites/i }).click();
    
    // Site management dialog should open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /site access/i })).toBeVisible();
    
    // Toggle site access
    const siteToggles = page.locator('[role="switch"]');
    const toggleCount = await siteToggles.count();
    
    if (toggleCount > 0) {
      // Toggle first site
      await siteToggles.first().click();
      
      // Save changes
      await page.getByRole('button', { name: /save/i }).click();
      
      // Verify success
      await expect(page.getByText(/site access updated/i)).toBeVisible();
    }
  });

  test('should reset user password', async ({ page }) => {
    // Find a user
    const userRow = page.getByRole('row').filter({ hasText: /@/ }).nth(1); // Skip admin
    
    if (await userRow.count() > 0) {
      // Click more options
      await userRow.getByRole('button', { name: /more|options/i }).click();
      
      // Click reset password
      await page.getByRole('menuitem', { name: /reset password/i }).click();
      
      // Fill new password
      await page.getByLabel('New Password').fill('NewSecurePass123!');
      await page.getByLabel('Confirm Password').fill('NewSecurePass123!');
      
      // Submit
      await page.getByRole('button', { name: /reset/i }).click();
      
      // Verify success
      await expect(page.getByText(/password reset successfully/i)).toBeVisible();
    }
  });
});