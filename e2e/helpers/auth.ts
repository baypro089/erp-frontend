import { Page } from '@playwright/test';

/**
 * Logs in to the ERP application with the given credentials.
 * Waits for the page to redirect away from the login URL.
 */
export async function loginAs(page: Page, username: string, password: string) {
    await page.goto('/auth/login');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait until we navigated away from the login page
    await page.waitForURL((url) => !url.pathname.includes('/auth/login'), {
        timeout: 15_000,
    });
}
