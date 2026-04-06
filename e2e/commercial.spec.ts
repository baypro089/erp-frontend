import { test, expect } from '@playwright/test';

// All tests use the saved admin auth state

test.describe('Commercial Portal', () => {
    test('navigates to commercial dashboards', async ({ page }) => {
        await page.goto('/commercial/dashboards');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Orders page', async ({ page }) => {
        await page.goto('/commercial/orders');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/commercial\/orders/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Inventory page', async ({ page }) => {
        await page.goto('/commercial/inventory');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/commercial\/inventory/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Customers page', async ({ page }) => {
        await page.goto('/commercial/customers');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/commercial\/customers/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Suppliers page', async ({ page }) => {
        await page.goto('/commercial/suppliers');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/commercial\/suppliers/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Warehouses page', async ({ page }) => {
        await page.goto('/commercial/warehouses');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/commercial\/warehouses/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Returns page', async ({ page }) => {
        await page.goto('/commercial/returns');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/commercial\/returns/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Sales page', async ({ page }) => {
        await page.goto('/commercial/sales');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/commercial\/sales/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('navigates to Reports page', async ({ page }) => {
        await page.goto('/commercial/reports');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await expect(page).toHaveURL(/\/commercial\/reports/);
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('Orders page renders a data grid', async ({ page }) => {
        await page.goto('/commercial/orders');
        await expect(page).not.toHaveURL(/\/auth\/login/);

        // Custom DataTable wraps MUI Table, not DataGrid
        const table = page.locator('.MuiTableContainer-root').first();
        await expect(table).toBeVisible({ timeout: 20_000 });
    });

    test('Customers page shows a data table', async ({ page }) => {
        await page.goto('/commercial/customers');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        const table = page.locator('.MuiTableContainer-root').first();
        await expect(table).toBeVisible({ timeout: 20_000 });
    });

    test('Suppliers page shows a data table', async ({ page }) => {
        await page.goto('/commercial/suppliers');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        const table = page.locator('.MuiTableContainer-root').first();
        await expect(table).toBeVisible({ timeout: 20_000 });
    });

    test('Inventory page shows warehouse selector and prompts to select a warehouse', async ({ page }) => {
        await page.goto('/commercial/inventory');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        // Inventory requires a warehouse to be selected first; validate the prompt/header renders
        await expect(
            page.getByText('Vui lòng chọn kho').or(page.getByText('Quản lý Tồn kho')).first()
        ).toBeVisible({ timeout: 20_000 });
    });
});

// ---------------------------------------------------------------------------
// CRUD flow – Commercial Customers page
// ---------------------------------------------------------------------------
test.describe('Commercial CRUD – Customers', () => {
    // Unique data per run so tests remain idempotent
    const timestamp = Date.now();
    const customerName = `E2E Customer ${timestamp}`;
    const customerPhone = `09${String(timestamp).slice(-8)}`; // 10-digit phone

    /** Navigate to customers and wait until loading is complete */
    async function gotoCustomersReady(page: import('@playwright/test').Page) {
        await page.goto('/commercial/customers');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('.MuiTableContainer-root').first()).toBeVisible({ timeout: 20_000 });
    }

    test('opens Add Customer dialog via button', async ({ page }) => {
        await gotoCustomersReady(page);
        await page.getByRole('button', { name: 'Thêm KH' }).click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });
        await expect(page.getByRole('heading', { name: 'Thêm Khách Hàng Mới' })).toBeVisible();
    });

    test('shows validation error when submitting without required fields', async ({ page }) => {
        await gotoCustomersReady(page);
        await page.getByRole('button', { name: 'Thêm KH' }).click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });

        await page.getByRole('button', { name: 'Thêm mới' }).click();
        await expect(page.getByText('Họ và tên là bắt buộc')).toBeVisible({ timeout: 5_000 });
        await expect(page.locator('[role="dialog"]')).toBeVisible();
    });

    test('Cancel button closes the dialog without creating', async ({ page }) => {
        await gotoCustomersReady(page);
        await page.getByRole('button', { name: 'Thêm KH' }).click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });

        await page.getByRole('button', { name: 'Hủy' }).click();
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5_000 });
    });

    test('creates a new customer successfully', async ({ page }) => {
        await gotoCustomersReady(page);
        await page.getByRole('button', { name: 'Thêm KH' }).click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });

        const dialog = page.locator('[role="dialog"]');
        await dialog.getByRole('textbox', { name: 'Họ và tên' }).fill(customerName);
        await dialog.getByRole('textbox', { name: 'Số điện thoại' }).fill(customerPhone);

        await page.getByRole('button', { name: 'Thêm mới' }).click();

        // Dialog closes on success
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 15_000 });
        // New customer appears in the table
        await expect(page.getByText(customerName)).toBeVisible({ timeout: 15_000 });
    });
});

// ---------------------------------------------------------------------------
// Business Logic – Customer Phone Number Validation
// The form enforces: fullName required, phoneNumber required & 10-11 digits
// ---------------------------------------------------------------------------
test.describe('Commercial Business Logic – Customer Phone Validation', () => {
    async function openAddCustomerDialog(page: import('@playwright/test').Page) {
        await page.goto('/commercial/customers');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('.MuiTableContainer-root').first()).toBeVisible({ timeout: 20_000 });
        await page.getByRole('button', { name: 'Thêm KH' }).click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10_000 });
    }

    test('phone with only 5 digits is rejected as invalid format', async ({ page }) => {
        await openAddCustomerDialog(page);
        const dialog = page.locator('[role="dialog"]');
        await dialog.getByRole('textbox', { name: 'Họ và tên' }).fill('Test Customer');
        await dialog.getByRole('textbox', { name: 'Số điện thoại' }).fill('12345'); // too short
        await dialog.getByRole('button', { name: 'Thêm mới' }).click();
        await expect(dialog.getByText('Số điện thoại không hợp lệ (10-11 chữ số)')).toBeVisible({ timeout: 5_000 });
        // Dialog stays open
        await expect(dialog).toBeVisible();
    });

    test('submitting name with empty phone shows phone-required error', async ({ page }) => {
        await openAddCustomerDialog(page);
        const dialog = page.locator('[role="dialog"]');
        await dialog.getByRole('textbox', { name: 'Họ và tên' }).fill('Test Customer');
        // Leave phone blank
        await dialog.getByRole('button', { name: 'Thêm mới' }).click();
        await expect(dialog.getByText('Số điện thoại là bắt buộc')).toBeVisible({ timeout: 5_000 });
    });

    test('submitting empty form shows both name and phone required errors', async ({ page }) => {
        await openAddCustomerDialog(page);
        const dialog = page.locator('[role="dialog"]');
        await dialog.getByRole('button', { name: 'Thêm mới' }).click();
        await expect(dialog.getByText('Họ và tên là bắt buộc')).toBeVisible({ timeout: 5_000 });
        await expect(dialog.getByText('Số điện thoại là bắt buộc')).toBeVisible();
    });
});

// ---------------------------------------------------------------------------
// Business Logic – Order Management UI
// Tests: filter bar options, "Tạo đơn hàng" navigation, table column headings
// ---------------------------------------------------------------------------
test.describe('Commercial Business Logic – Order Management', () => {
    async function gotoOrdersReady(page: import('@playwright/test').Page) {
        await page.goto('/commercial/orders');
        await expect(page).not.toHaveURL(/\/auth\/login/);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('.MuiTableContainer-root').first()).toBeVisible({ timeout: 20_000 });
    }

    async function expandFilters(page: import('@playwright/test').Page) {
        // FilterBar collapses filter options by default; click "Filters" to expand
        const filtersBtn = page.getByRole('button', { name: /Filters|Bộ lọc/i });
        await filtersBtn.click();
        await page.waitForTimeout(350); // wait for Collapse animation
    }

    test('orders table shows key business columns (Tổng tiền, Trạng thái)', async ({ page }) => {
        await gotoOrdersReady(page);
        // "Tổng tiền" appears only once; use columnheader for "Trạng thái" to avoid
        // strict-mode violation (filter label + column header + sort button all share the text)
        await expect(page.getByText('Tổng tiền')).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Trạng thái' })).toBeVisible();
    });

    test('status filter dropdown contains all order status options', async ({ page }) => {
        await gotoOrdersReady(page);
        await expandFilters(page);
        // Locate the MUI Select for "Trạng thái" via its enclosing FormControl
        const statusSelect = page.locator('.MuiFormControl-root')
            .filter({ has: page.locator('label', { hasText: 'Trạng thái' }) })
            .locator('[role="combobox"]');
        await statusSelect.click();
        // The listbox should contain the known statuses (localized or raw enum labels)
        await expect(page.getByRole('option', { name: /Chờ xuất|Pending/i })).toBeVisible({ timeout: 5_000 });
        await expect(page.getByRole('option', { name: /Đã xuất|Completed/i })).toBeVisible();
        await expect(page.getByRole('option', { name: /Đã hủy|Cancelled/i })).toBeVisible();
        // Close menu
        await page.keyboard.press('Escape');
    });

    test('selecting "Chờ xuất" status filter sends filtered request and reloads table', async ({ page }) => {
        await gotoOrdersReady(page);
        await expandFilters(page);
        const statusSelect = page.locator('.MuiFormControl-root')
            .filter({ has: page.locator('label', { hasText: 'Trạng thái' }) })
            .locator('[role="combobox"]');
        await statusSelect.click();
        await page.getByRole('option', { name: /Chờ xuất|Pending/i }).first().click();
        // After selection, the page fires a new API request → wait for it
        await page.waitForLoadState('networkidle');
        // Table must still be visible after filter is applied
        await expect(page.locator('.MuiTableContainer-root').first()).toBeVisible({ timeout: 10_000 });
    });

    test('"Tạo đơn hàng" button navigates to the sales/create route', async ({ page }) => {
        await gotoOrdersReady(page);
        await page.getByRole('button', { name: 'Tạo đơn hàng' }).click();
        // The action calls router.push('/commercial/sales/create')
        await expect(page).toHaveURL(/\/commercial\/sales\/create/, { timeout: 10_000 });
    });
});
