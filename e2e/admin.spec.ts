import { test, expect } from '@playwright/test';

// All tests in this file use the saved admin auth state (from global-setup.ts)

test.describe('Admin Portal', () => {
    test('navigates to admin dashboard', async ({ page }) => {
        await page.goto('/admin/dashboard');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/admin\/dashboard/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Users page and shows data table', async ({ page }) => {
        await page.goto('/admin/users');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/admin\/users/);

        // Custom DataTable wraps MUI Table (not DataGrid).
        // TableContainer is visible immediately even while loading skeleton rows.
        const table = page.locator('.MuiTableContainer-root').first();
        await expect(table).toBeVisible({ timeout: 20_000 });
    });

    test('navigates to Roles page', async ({ page }) => {
        await page.goto('/admin/roles');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/admin\/roles/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Categories page', async ({ page }) => {
        await page.goto('/admin/categories');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/admin\/categories/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Brands page', async ({ page }) => {
        await page.goto('/admin/brands');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/admin\/brands/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Departments page', async ({ page }) => {
        await page.goto('/admin/departments');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/admin\/departments/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Positions page', async ({ page }) => {
        await page.goto('/admin/positions');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/admin\/positions/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Holidays page', async ({ page }) => {
        await page.goto('/admin/holidays');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/admin\/holidays/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Products page', async ({ page }) => {
        await page.goto('/admin/products');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/admin\/products/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Settings page', async ({ page }) => {
        await page.goto('/admin/settings');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/admin\/settings/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('Roles page shows a data table', async ({ page }) => {
        await page.goto('/admin/roles');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        const table = page.locator('.MuiTableContainer-root').first();
        await expect(table).toBeVisible({ timeout: 20_000 });
    });

    test('Departments page shows a data table', async ({ page }) => {
        await page.goto('/admin/departments');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        const table = page.locator('.MuiTableContainer-root').first();
        await expect(table).toBeVisible({ timeout: 20_000 });
    });

    test('Products page shows a data table', async ({ page }) => {
        await page.goto('/admin/products');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        const table = page.locator('.MuiTableContainer-root').first();
        await expect(table).toBeVisible({ timeout: 20_000 });
    });
});

// ---------------------------------------------------------------------------
// CRUD flow – Brands page (simplest form: one required text field)
// ---------------------------------------------------------------------------
test.describe('Admin CRUD – Brands', () => {
    // Unique name per run so tests are idempotent even if cleanup is skipped
    const brandName = `E2E Brand ${Date.now()}`;

    /** Helper: go to brands page and wait until the loading overlay is gone */
    async function gotoBrandsReady(page: import('@playwright/test').Page) {
        await page.goto('/admin/brands');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        // networkidle ensures the brands API has responded and the LoadingOverlay (Backdrop) is dismissed
        await page.waitForLoadState('networkidle');
        await expect(page.locator('.MuiTableContainer-root').first()).toBeVisible({ timeout: 20_000 });
    }

    test('opens Add Brand dialog via button', async ({ page }) => {
        await gotoBrandsReady(page);

        await page.getByRole('button', { name: 'Add Brand' }).click();

        // Dialog with title "Add New Brand" must appear
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });
        await expect(page.getByRole('heading', { name: 'Add New Brand' })).toBeVisible();
    });

    test('shows validation error when submitting empty brand name', async ({ page }) => {
        await gotoBrandsReady(page);

        await page.getByRole('button', { name: 'Add Brand' }).click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });

        // Submit without filling the name field
        await page.getByRole('button', { name: 'Create' }).click();

        // Inline validation error should appear
        await expect(page.getByText('Brand name is required')).toBeVisible({ timeout: 5_000 });

        // Dialog stays open
        await expect(page.locator('[role="dialog"]')).toBeVisible();
    });

    test('Cancel button closes the dialog without creating', async ({ page }) => {
        await gotoBrandsReady(page);

        await page.getByRole('button', { name: 'Add Brand' }).click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });

        await page.getByRole('button', { name: 'Cancel' }).click();

        // Dialog must be gone
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5_000 });
    });

    test('creates a new brand successfully', async ({ page }) => {
        await gotoBrandsReady(page);

        await page.getByRole('button', { name: 'Add Brand' }).click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });

        // Fill in the brand name (scope to dialog to avoid matching the filter bar input)
        await page.locator('[role="dialog"]').getByRole('textbox', { name: 'Brand Name' }).fill(brandName);

        // Submit
        await page.getByRole('button', { name: 'Create' }).click();

        // Dialog must close after successful creation
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 15_000 });

        // The new brand must appear in the table
        await expect(page.getByText(brandName)).toBeVisible({ timeout: 15_000 });
    });
});
