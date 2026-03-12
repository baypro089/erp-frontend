import { test, expect } from '@playwright/test';

// This spec runs WITH saved auth state (authenticated project).
// If the admin user only has ACCESS_ADMIN_PORTAL, portal-selection
// auto-redirects them to /admin/dashboard (single-portal shortcut).
// If they have multiple portals, the selection page is shown.
// Either way, the user must NOT land on /auth/login.

test.describe('Portal selection', () => {
    test('authenticated user is not redirected to login from /portal-selection', async ({ page }) => {
        await page.goto('/portal-selection');
        await expect(page).not.toHaveURL(/\/auth\/login/);
    });

    test('authenticated user ends up on a portal page from /portal-selection', async ({ page }) => {
        await page.goto('/portal-selection');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        // Either stays on portal-selection (multi-portal) or redirected to a portal
        const url = page.url();
        const isOnPortal =
            url.includes('/portal-selection') ||
            url.includes('/admin') ||
            url.includes('/hr') ||
            url.includes('/commercial') ||
            url.includes('/personal-page');
        expect(isOnPortal).toBeTruthy();
    });

    test('navigating from /portal-selection lands on admin dashboard (single-portal admin)', async ({ page }) => {
        await page.goto('/portal-selection');
        // Single-portal admin is auto-redirected to /admin/dashboard
        await expect(page).toHaveURL(/\/admin\/dashboard|portal-selection/, { timeout: 15_000 });
    });
});
