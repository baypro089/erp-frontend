import { test, expect } from '@playwright/test';

// All tests use the saved admin auth state (authenticated project)

test.describe('Personal Page Portal', () => {
    test('navigates to personal-page home', async ({ page }) => {
        await page.goto('/personal-page');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/personal-page/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('personal-page home shows "Trang cá nhân" heading', async ({ page }) => {
        await page.goto('/personal-page');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page.getByText('Trang cá nhân').first()).toBeVisible({ timeout: 10_000 });
    });

    test('personal-page home shows the 4 navigation cards', async ({ page }) => {
        await page.goto('/personal-page');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        // "Hồ sơ cá nhân" appears in sidebar AND card heading; target the card h6 heading specifically
        await expect(page.getByRole('heading', { name: 'Hồ sơ cá nhân' })).toBeVisible({ timeout: 10_000 });
        await expect(page.getByRole('heading', { name: 'Phiếu lương' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Nghỉ phép' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Đơn từ chức' })).toBeVisible();
    });

    test('clicking profile card navigates to profile page', async ({ page }) => {
        await page.goto('/personal-page');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        // Click the card h6 heading (not the sidebar ListItemButton)
        await page.getByRole('heading', { name: 'Hồ sơ cá nhân' }).click();
        await expect(page).toHaveURL(/\/personal-page\/profile/, { timeout: 10_000 });
    });

    test('navigates to profile page directly', async ({ page }) => {
        await page.goto('/personal-page/profile');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/personal-page\/profile/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to my-leaves page', async ({ page }) => {
        await page.goto('/personal-page/my-leaves');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/personal-page\/my-leaves/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to my-payslips page', async ({ page }) => {
        await page.goto('/personal-page/my-payslips');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/personal-page\/my-payslips/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to my-resignation page', async ({ page }) => {
        await page.goto('/personal-page/my-resignation');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/personal-page\/my-resignation/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('my-leaves page shows a data table', async ({ page }) => {
        await page.goto('/personal-page/my-leaves');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        const table = page.locator('.MuiTableContainer-root').first();
        await expect(table).toBeVisible({ timeout: 20_000 });
    });

    test('my-payslips page shows a data table', async ({ page }) => {
        await page.goto('/personal-page/my-payslips');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        const table = page.locator('.MuiTableContainer-root').first();
        await expect(table).toBeVisible({ timeout: 20_000 });
    });
});

// ---------------------------------------------------------------------------
// Business Logic – Leave Balance Card
// The LeaveBalanceCard shows remaining/total annual leave and a progress bar.
// Low balance (< 30%) shows "Sắp hết phép" warning chip.
// ---------------------------------------------------------------------------
test.describe('Personal Page Business Logic – Leave Balance Card', () => {
    async function gotoMyLeavesReady(page: import('@playwright/test').Page) {
        await page.goto('/personal-page/my-leaves');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('.MuiTableContainer-root').first()).toBeVisible({ timeout: 20_000 });
    }

    test('leave balance card renders on my-leaves page', async ({ page }) => {
        await gotoMyLeavesReady(page);
        await expect(page.getByText('Quỹ Phép Năm')).toBeVisible({ timeout: 10_000 });
    });

    test('balance card shows "Số ngày phép còn lại" label', async ({ page }) => {
        await gotoMyLeavesReady(page);
        await expect(page.getByText('Số ngày phép còn lại')).toBeVisible({ timeout: 10_000 });
    });

    test('balance card displays a numeric remaining / total value', async ({ page }) => {
        await gotoMyLeavesReady(page);
        // The card renders: <h2>{remaining}</h2> / <h5>{total}</h5>
        // At minimum, the total separator "/" must appear inside the card region
        const balanceCard = page.locator('text=Quỹ Phép Năm').locator('../..');
        await expect(balanceCard.getByText('/')).toBeVisible({ timeout: 10_000 });
    });
});

// ---------------------------------------------------------------------------
// Business Logic – Leave Request Form Validation
// Validation rules enforced client-side before the API call:
//   - startDate required
//   - endDate required
//   - endDate must be >= startDate
//   - reason required
//   - valid date range triggers working-days API call
// ---------------------------------------------------------------------------
test.describe('Personal Page Business Logic – Leave Request Form Validation', () => {
    async function openLeaveForm(page: import('@playwright/test').Page) {
        await page.goto('/personal-page/my-leaves');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('.MuiTableContainer-root').first()).toBeVisible({ timeout: 20_000 });
        await page.getByRole('button', { name: 'Xin nghỉ phép' }).click();
        // Scope to the leave-request dialog specifically (the sidebar drawer also carries
        // role="dialog", so we avoid strict mode by targeting the accessible name)
        await expect(page.getByRole('dialog', { name: 'Xin Nghỉ Phép' })).toBeVisible({ timeout: 10_000 });
    }

    test('dialog title is "Xin Nghỉ Phép"', async ({ page }) => {
        await openLeaveForm(page);
        const dialog = page.getByRole('dialog', { name: 'Xin Nghỉ Phép' });
        await expect(dialog.getByText('Xin Nghỉ Phép')).toBeVisible();
    });

    test('submitting empty form shows all three required-field errors', async ({ page }) => {
        await openLeaveForm(page);
        const dialog = page.getByRole('dialog', { name: 'Xin Nghỉ Phép' });
        await dialog.getByRole('button', { name: 'Gửi đơn' }).click();
        await expect(dialog.getByText('Ngày bắt đầu là bắt buộc')).toBeVisible({ timeout: 5_000 });
        await expect(dialog.getByText('Ngày kết thúc là bắt buộc')).toBeVisible();
        await expect(dialog.getByText('Lý do là bắt buộc')).toBeVisible();
    });

    test('end date earlier than start date shows date-order validation error', async ({ page }) => {
        await openLeaveForm(page);
        const dialog = page.getByRole('dialog', { name: 'Xin Nghỉ Phép' });
        const dateInputs = dialog.locator('input[type="date"]');
        // Fill start later than end
        await dateInputs.nth(0).fill('2026-05-15'); // start date
        await dateInputs.nth(1).fill('2026-05-10'); // end date BEFORE start
        await dialog.getByRole('button', { name: 'Gửi đơn' }).click();
        await expect(dialog.getByText('Ngày kết thúc phải sau ngày bắt đầu')).toBeVisible({ timeout: 5_000 });
    });

    test('valid date range triggers working-days calculation and shows result', async ({ page }) => {
        await openLeaveForm(page);
        const dialog = page.getByRole('dialog', { name: 'Xin Nghỉ Phép' });
        const dateInputs = dialog.locator('input[type="date"]');
        // Monday → Wednesday (3 calendar days, ~2 working days excluding weekend)
        await dateInputs.nth(0).fill('2026-05-11'); // Monday
        await dateInputs.nth(1).fill('2026-05-13'); // Wednesday
        // Working-days API responds with a count; the form shows an alert with "Tổng cộng:"
        await expect(dialog.getByText('Tổng cộng:')).toBeVisible({ timeout: 10_000 });
    });

    test('Cancel (Hủy) button closes the leave request dialog', async ({ page }) => {
        await openLeaveForm(page);
        const dialog = page.getByRole('dialog', { name: 'Xin Nghỉ Phép' });
        await dialog.getByRole('button', { name: 'Hủy' }).click();
        await expect(dialog).not.toBeVisible({ timeout: 5_000 });
    });
});
