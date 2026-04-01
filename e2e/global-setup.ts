import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '.auth', 'user.json');

setup('authenticate as admin', async ({ page }) => {
    // Ensure the .auth directory exists
    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    const username = process.env.E2E_USERNAME ?? 'EMP-0037';
    const password = process.env.E2E_PASSWORD ?? '123456aA@';

    await page.goto('/auth/login');

    // Fill in credentials
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait until we're redirected away from login
    await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 15_000 });

    // Persist the authenticated session for all other tests
    await page.context().storageState({ path: authFile });
});
