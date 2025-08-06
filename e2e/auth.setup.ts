import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Go to the login page
  await page.goto('/');
  
  // Wait for login form to be visible
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  
  // Fill in login credentials
  await page.getByLabel('Email').fill('dev@localhost.com');
  await page.getByLabel('Password').fill('password123'); // Update with actual test password
  
  // Click login button
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard');
  
  // Verify we're logged in by checking for user menu or dashboard elements
  await expect(page.getByRole('navigation')).toBeVisible();
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});