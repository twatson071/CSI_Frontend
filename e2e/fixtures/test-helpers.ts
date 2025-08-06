import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for toast notification and verify message
   */
  async expectToast(message: string | RegExp, type: 'success' | 'error' | 'warning' = 'success') {
    const toast = this.page.locator('.toast-notification').filter({ hasText: message });
    await expect(toast).toBeVisible({ timeout: 5000 });
    
    if (type === 'success') {
      await expect(toast).toHaveClass(/success/);
    } else if (type === 'error') {
      await expect(toast).toHaveClass(/error/);
    }
    
    // Wait for toast to disappear
    await expect(toast).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Wait for loading indicator to disappear
   */
  async waitForLoadingComplete() {
    const loader = this.page.locator('.loading-indicator, .spinner, [aria-busy="true"]');
    await expect(loader).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Navigate using the main navigation menu
   */
  async navigateTo(section: string, subsection?: string) {
    const navLink = this.page.getByRole('link', { name: section, exact: true });
    await navLink.click();
    
    if (subsection) {
      const subLink = this.page.getByRole('link', { name: subsection, exact: true });
      await subLink.click();
    }
    
    await this.waitForLoadingComplete();
  }

  /**
   * Fill form field with retry logic
   */
  async fillFormField(label: string, value: string) {
    const field = this.page.getByLabel(label);
    await field.waitFor({ state: 'visible' });
    await field.clear();
    await field.fill(value);
    
    // Verify value was set
    await expect(field).toHaveValue(value);
  }

  /**
   * Select option from dropdown with retry
   */
  async selectOption(label: string, value: string) {
    const select = this.page.getByLabel(label);
    await select.waitFor({ state: 'visible' });
    await select.selectOption(value);
    
    // Verify selection
    await expect(select).toHaveValue(value);
  }

  /**
   * Click button and wait for response
   */
  async clickAndWait(
    buttonText: string | RegExp,
    waitFor: 'navigation' | 'response' | 'toast' = 'response'
  ) {
    const button = this.page.getByRole('button', { name: buttonText });
    
    if (waitFor === 'navigation') {
      await Promise.all([
        this.page.waitForNavigation(),
        button.click()
      ]);
    } else if (waitFor === 'response') {
      await Promise.all([
        this.page.waitForResponse(resp => resp.status() === 200 || resp.status() === 201),
        button.click()
      ]);
    } else {
      await button.click();
    }
    
    await this.waitForLoadingComplete();
  }

  /**
   * Check if element exists without throwing
   */
  async elementExists(selector: string): Promise<boolean> {
    return await this.page.locator(selector).count() > 0;
  }

  /**
   * Wait for WebSocket connection
   */
  async waitForWebSocket(timeout = 5000) {
    await this.page.waitForFunction(
      () => {
        const sockets = (window as any).__sockets || [];
        return sockets.some((s: WebSocket) => s.readyState === WebSocket.OPEN);
      },
      { timeout }
    );
  }

  /**
   * Mock API response
   */
  async mockApiResponse(endpoint: string, response: any, status = 200) {
    await this.page.route(`**/api/${endpoint}`, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Take screenshot with descriptive name
   */
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `e2e/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }

  /**
   * Verify table has expected data
   */
  async verifyTableData(expectedData: Record<string, string>[]) {
    for (const rowData of expectedData) {
      const row = this.page.getByRole('row').filter({
        hasText: Object.values(rowData)[0]
      });
      
      for (const value of Object.values(rowData)) {
        await expect(row).toContainText(value);
      }
    }
  }

  /**
   * Wait for metric update
   */
  async waitForMetricUpdate(metricName: string, timeout = 10000) {
    const metricCard = this.page.locator('.metric-card').filter({ hasText: metricName });
    const valueElement = metricCard.locator('.metric-value');
    
    const initialValue = await valueElement.textContent();
    
    await this.page.waitForFunction(
      ([selector, initial]) => {
        const element = document.querySelector(selector);
        return element && element.textContent !== initial;
      },
      [valueElement, initialValue],
      { timeout }
    );
  }
}

/**
 * Create test data helpers
 */
export const testData = {
  generateDevice: (overrides = {}) => ({
    name: `Test Device ${Date.now()}`,
    type: 'Server',
    serviceUrl: 'http://test-device.local:8080',
    siteId: 1,
    ipAddress: '192.168.1.100',
    ...overrides
  }),

  generateUser: (overrides = {}) => ({
    name: `Test User ${Date.now()}`,
    email: `test.${Date.now()}@example.com`,
    password: 'SecurePass123!',
    role: 'operator',
    ...overrides
  }),

  generateSite: (overrides = {}) => ({
    name: `Test Site ${Date.now()}`,
    location: 'Test Building - Floor 1',
    description: 'Automated test site',
    ...overrides
  })
};