import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

// NOTE: This spec runs WITHOUT the saved auth state (unauthenticated project)

test.describe('Authentication flows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/auth/login');
    });

    test('login page renders username and password fields', async ({ page }) => {
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('login page shows the ERP heading', async ({ page }) => {
        // The auth layout h1 shows "Hệ thống ERP".
        // The MUI Typography component also renders as h1 ("Đăng nhập"),
        // so we target the layout-level h1 (the first one) explicitly.
        await expect(page.locator('h1').first()).toContainText('ERP');
    });

    test('shows error message with wrong credentials', async ({ page }) => {
        await page.fill('input[name="username"]', 'wronguser');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // An error message should appear (Redux state.auth.error rendered by Typography)
        // Use text matching to avoid conflicting with Next.js's route announcer [role="alert"]
        await expect(
            page.getByText('Invalid credentials').or(page.getByText('Sai tên đăng nhập hoặc mật khẩu'))
        ).toBeVisible({ timeout: 15_000 });
        // Still on the login page
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('password visibility toggle works', async ({ page }) => {
        const passwordInput = page.locator('input[name="password"]');
        await passwordInput.fill('mypassword');

        // Initially the field should be type="password"
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // Click the eye icon button (InputAdornment IconButton)
        await page.click('button[tabindex="-1"]');
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Click again to hide
        await page.click('button[tabindex="-1"]');
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('login with correct credentials redirects away from login page', async ({ page }) => {
        await loginAs(page, 'admin', '123456');

        // Should no longer be on the login page
        await expect(page).not.toHaveURL(/\/auth\/login/);
    });

    test('forgot password link opens the change-password dialog', async ({ page }) => {
        await page.getByText('Quên mật khẩu?').click();

        // ChangePasswordDialog should become visible
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5_000 });
    });
});

// NOTE: These tests run WITHOUT auth state — they verify unauthenticated guard redirects
test.describe('Unauthenticated guard redirects', () => {
    test('accessing /admin/dashboard without auth redirects to login', async ({ page }) => {
        await page.goto('/admin/dashboard');
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
    });

    test('accessing /hr/employees without auth redirects to login', async ({ page }) => {
        await page.goto('/hr/employees');
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
    });

    // NOTE: /personal-page home does not have a per-component auth guard.
    // Use /personal-page/my-leaves which does redirect to login when unauthenticated.
    test('accessing /personal-page without auth redirects to login', async ({ page }) => {
        await page.goto('/personal-page');
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
    });

    test('accessing /commercial/orders without auth redirects to login', async ({ page }) => {
        await page.goto('/commercial/orders');
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
    });
});
