import { test, expect, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const README_PATH = path.join(process.cwd(), 'mockups', 'README.md');
const OUTPUT_DIR = path.join(process.cwd(), 'mockups', 'ui-pages');
const CAPTURE_VIEWPORT = { width: 1920, height: 1080 };

type LoginCredentials = {
  username: string;
  password: string;
};

type PortalName = 'Admin Portal' | 'Commercial Portal' | 'HR Portal';

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function cleanStepScreenshots() {
  if (!fs.existsSync(OUTPUT_DIR)) return;

  const files = fs.readdirSync(OUTPUT_DIR);
  for (const fileName of files) {
    if (fileName.startsWith('step-') && fileName.endsWith('.png')) {
      fs.unlinkSync(path.join(OUTPUT_DIR, fileName));
    }
  }
}

function readCredentialsFromReadme(): LoginCredentials {
  const readme = fs.readFileSync(README_PATH, 'utf-8');
  const match = readme.match(/defaults:\s*`([^`]+)`\s*\/\s*`([^`]+)`/i);

  if (!match) {
    throw new Error('Khong tim thay thong tin tai khoan mac dinh trong mockups/README.md');
  }

  return {
    username: match[1].trim(),
    password: match[2].trim(),
  };
}

function getStepFileName(step: number, slug: string): string {
  return `step-${String(step).padStart(2, '0')}-${slug}.png`;
}

async function captureStep(page: Page, step: number, slug: string) {
  const filePath = path.join(OUTPUT_DIR, getStepFileName(step, slug));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(650);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[guide-flow] captured step ${String(step).padStart(2, '0')}: ${slug}`);
}

async function waitForDataTable(page: Page) {
  await expect(page.locator('.MuiTableContainer-root').first()).toBeVisible({ timeout: 20_000 });
}

async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(350);
}

async function loginToPortalSelection(page: Page, credentials: LoginCredentials) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto('/auth/login', { waitUntil: 'networkidle' });
    await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('input[name="password"]')).toBeVisible({ timeout: 10_000 });

    await page.fill('input[name="username"]', credentials.username);
    await page.fill('input[name="password"]', credentials.password);
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    const movedAwayFromLogin = await page
      .waitForURL((url) => !url.pathname.startsWith('/auth/login'), { timeout: 12_000 })
      .then(() => true)
      .catch(() => false);

    if (movedAwayFromLogin) {
      return;
    }

    await page.waitForTimeout(500);
  }

  throw new Error('Dang nhap that bai sau 3 lan thu. Kiem tra lai thong tin tai khoan hoac trang thai backend auth.');
}

async function openPortalFromSelection(
  page: Page,
  portalName: PortalName,
  expectedPath: RegExp
) {
  await expect(page).toHaveURL(/\/portal-selection/, { timeout: 10_000 });
  await page.getByRole('heading', { name: portalName }).click();
  await expect(page).toHaveURL(expectedPath, { timeout: 15_000 });
}

async function clickSidebarMenu(page: Page, label: string | RegExp) {
  const menu = page.getByRole('button', { name: label }).first();
  await expect(menu).toBeVisible({ timeout: 15_000 });
  await menu.click();
}

async function openFilterPanel(page: Page) {
  const filterButtons = page.getByRole('button', { name: /Filters|Bộ lọc/i });
  const total = await filterButtons.count();

  for (let i = 0; i < total; i++) {
    const candidate = filterButtons.nth(i);
    if (await candidate.isVisible()) {
      await candidate.click();
      await page.waitForTimeout(350);
      return;
    }
  }

  throw new Error('Khong tim thay nut bo loc dang hien thi tren man hinh');
}

async function clickFirstVisible(locator: ReturnType<Page['locator']>) {
  const count = await locator.count();
  for (let i = 0; i < count; i++) {
    const candidate = locator.nth(i);
    if (await candidate.isVisible()) {
      await candidate.click();
      return true;
    }
  }

  return false;
}

async function getBrandSeedName(page: Page, fallbackSeed: string): Promise<string> {
  const tableCells = page.locator('.MuiTableBody-root tr td');
  const totalCells = await tableCells.count();

  for (let index = 0; index < totalCells; index++) {
    const text = (await tableCells.nth(index).innerText()).trim();
    if (text.length > 0) {
      return text;
    }
  }

  return fallbackSeed;
}

test.describe('Guide flow with real data and screenshots', () => {
  test.setTimeout(70 * 60_000);

  test('capture ultra detailed real usage flow across portals', async ({ browser }) => {
    ensureOutputDir();
    cleanStepScreenshots();

    const fromReadme = readCredentialsFromReadme();
    const username = process.env.E2E_USERNAME ?? fromReadme.username;
    const password = process.env.E2E_PASSWORD ?? fromReadme.password;
    const credentials: LoginCredentials = { username, password };

    let step = 1;
    const timestamp = Date.now();

    const adminContext = await browser.newContext({
      baseURL: 'http://localhost:4000',
      viewport: CAPTURE_VIEWPORT,
    });
    const adminPage = await adminContext.newPage();

    await loginToPortalSelection(adminPage, credentials);
    await waitForPageReady(adminPage);
    await captureStep(adminPage, step++, 'login-success');

    await expect(adminPage).toHaveURL(/\/portal-selection/, { timeout: 10_000 });
    await captureStep(adminPage, step++, 'portal-selection');

    await openPortalFromSelection(adminPage, 'Admin Portal', /\/admin\//);
    await waitForPageReady(adminPage);

    await clickSidebarMenu(adminPage, 'Người dùng');
    await expect(adminPage).toHaveURL(/\/admin\/users/, { timeout: 15_000 });
    await waitForDataTable(adminPage);
    await captureStep(adminPage, step++, 'admin-users-list');

    await openFilterPanel(adminPage);
    await captureStep(adminPage, step++, 'admin-users-filters-open');

    const userSeed = await getBrandSeedName(adminPage, credentials.username);
    const usernameSearch = userSeed.slice(0, 8);
    await adminPage.locator('input[placeholder="Tìm theo tên đăng nhập..."]').fill(usernameSearch);
    await waitForPageReady(adminPage);
    await captureStep(adminPage, step++, 'admin-users-filtered-by-username');

    await adminPage.getByRole('button', { name: 'Tạo tài khoản' }).click();
    const createUserDialog = adminPage.getByRole('dialog').filter({ hasText: 'Tạo tài khoản mới' });
    await expect(createUserDialog).toBeVisible({ timeout: 10_000 });
    await captureStep(adminPage, step++, 'admin-users-create-dialog');

    await createUserDialog.getByRole('button', { name: 'Hủy' }).click();
    await expect(createUserDialog).not.toBeVisible({ timeout: 10_000 });
    await captureStep(adminPage, step++, 'admin-users-create-dialog-closed');

    await clickSidebarMenu(adminPage, 'Vai trò');
    await expect(adminPage).toHaveURL(/\/admin\/roles/, { timeout: 15_000 });
    await waitForDataTable(adminPage);
    await captureStep(adminPage, step++, 'admin-roles-list');

    await openFilterPanel(adminPage);
    await captureStep(adminPage, step++, 'admin-roles-filters-open');

    const roleSeed = await getBrandSeedName(adminPage, credentials.username);
    const roleSearch = roleSeed.slice(0, 8);
    await adminPage.locator('input[placeholder="Tìm theo tên vai trò..."]').fill(roleSearch);
    await waitForPageReady(adminPage);
    await captureStep(adminPage, step++, 'admin-roles-filtered-by-name');

    await clickSidebarMenu(adminPage, 'Danh mục');
    await expect(adminPage).toHaveURL(/\/admin\/categories/, { timeout: 15_000 });
    await waitForDataTable(adminPage);
    await captureStep(adminPage, step++, 'admin-categories-list');

    const categorySeed = await getBrandSeedName(adminPage, credentials.username);
    const categorySearch = categorySeed.slice(0, 8);
    await adminPage.locator('input[placeholder="Tìm theo tên danh mục..."]').fill(categorySearch);
    await waitForPageReady(adminPage);
    await captureStep(adminPage, step++, 'admin-categories-search-applied');

    await clickSidebarMenu(adminPage, 'Sản phẩm');
    await expect(adminPage).toHaveURL(/\/admin\/products/, { timeout: 15_000 });
    await waitForDataTable(adminPage);
    await captureStep(adminPage, step++, 'admin-products-list');

    await openFilterPanel(adminPage);
    await captureStep(adminPage, step++, 'admin-products-filters-open');

    const productSeed = await getBrandSeedName(adminPage, credentials.username);
    const productSearch = productSeed.slice(0, 10);
    await adminPage.locator('input[placeholder="Tìm theo tên sản phẩm..."]').fill(productSearch);
    await waitForPageReady(adminPage);
    await captureStep(adminPage, step++, 'admin-products-filtered-by-name');

    await clickSidebarMenu(adminPage, 'Thương hiệu');
    await expect(adminPage).toHaveURL(/\/admin\/brands/, { timeout: 15_000 });
    await waitForDataTable(adminPage);
    await captureStep(adminPage, step++, 'admin-brands-list');

    // Use an existing value from DB as the base to avoid hardcoded fake data.
    const sourceBrandName = await getBrandSeedName(adminPage, credentials.username);
    const createdBrandName = `${sourceBrandName} ${timestamp}`;
    const updatedBrandName = `${createdBrandName} cap-nhat`;

    await adminPage.getByRole('button', { name: 'Thêm thương hiệu' }).click();
    const createDialog = adminPage.getByRole('dialog').filter({ hasText: 'Thêm thương hiệu mới' });
    await expect(createDialog).toBeVisible({ timeout: 10_000 });
    await captureStep(adminPage, step++, 'brand-create-dialog');

    await createDialog.getByRole('textbox', { name: 'Tên thương hiệu' }).fill(createdBrandName);
    await createDialog.getByRole('button', { name: 'Tạo mới' }).click();
    await expect(createDialog).not.toBeVisible({ timeout: 15_000 });
    await expect(adminPage.locator('.MuiTableBody-root tr').filter({ hasText: createdBrandName }).first()).toBeVisible({ timeout: 15_000 });
    await captureStep(adminPage, step++, 'brand-created');

    const createdRow = adminPage.locator('.MuiTableBody-root tr').filter({ hasText: createdBrandName }).first();
    await createdRow.locator('button').first().click();

    const editDialog = adminPage.getByRole('dialog').filter({ hasText: 'Chỉnh sửa thương hiệu' });
    await expect(editDialog).toBeVisible({ timeout: 10_000 });
    await captureStep(adminPage, step++, 'brand-edit-dialog');

    await editDialog.getByRole('textbox', { name: 'Tên thương hiệu' }).fill(updatedBrandName);
    await editDialog.getByRole('button', { name: 'Cập nhật' }).click();
    await expect(editDialog).not.toBeVisible({ timeout: 15_000 });
    await expect(adminPage.locator('.MuiTableBody-root tr').filter({ hasText: updatedBrandName }).first()).toBeVisible({ timeout: 15_000 });
    await captureStep(adminPage, step++, 'brand-updated');

    const updatedRow = adminPage.locator('.MuiTableBody-root tr').filter({ hasText: updatedBrandName }).first();
    await updatedRow.locator('button').nth(1).click();

    const deleteDialog = adminPage.getByRole('dialog').filter({ hasText: 'Xóa 1 thương hiệu' });
    await expect(deleteDialog).toBeVisible({ timeout: 10_000 });
    await captureStep(adminPage, step++, 'brand-delete-confirm');

    await deleteDialog.getByRole('button', { name: 'Xóa' }).click();
    await expect(deleteDialog).not.toBeVisible({ timeout: 15_000 });
    await expect(adminPage.locator('.MuiTableBody-root tr').filter({ hasText: updatedBrandName })).toHaveCount(0);
    await captureStep(adminPage, step++, 'brand-deleted');

    await adminContext.close();

    const commercialContext = await browser.newContext({
      baseURL: 'http://localhost:4000',
      viewport: CAPTURE_VIEWPORT,
    });
    const commercialPage = await commercialContext.newPage();

    await loginToPortalSelection(commercialPage, credentials);
    await waitForPageReady(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-portal-selection');

    await openPortalFromSelection(commercialPage, 'Commercial Portal', /\/commercial\//);
    await waitForPageReady(commercialPage);

    await clickSidebarMenu(commercialPage, 'Đơn hàng');
    await expect(commercialPage).toHaveURL(/\/commercial\/orders/, { timeout: 15_000 });
    await waitForDataTable(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-orders');

    await openFilterPanel(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-orders-filters');

    const orderStatusSelect = commercialPage
      .locator('.MuiFormControl-root')
      .filter({ has: commercialPage.locator('label', { hasText: 'Trạng thái' }) })
      .locator('[role="combobox"]')
      .first();
    await expect(orderStatusSelect).toBeVisible({ timeout: 10_000 });
    await orderStatusSelect.click();
    await captureStep(commercialPage, step++, 'commercial-orders-status-dropdown');
    await commercialPage.keyboard.press('Escape');

    await commercialPage.getByRole('button', { name: 'Tạo đơn hàng' }).click();
    await expect(commercialPage).toHaveURL(/\/commercial\/sales\/create/, { timeout: 15_000 });
    await waitForPageReady(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-sales-create-page');

    await clickSidebarMenu(commercialPage, 'Khách hàng');
    await expect(commercialPage).toHaveURL(/\/commercial\/customers/, { timeout: 15_000 });
    await waitForDataTable(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-customers-list');

    await openFilterPanel(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-customers-filters-open');

    const customerSeed = await getBrandSeedName(commercialPage, credentials.username);
    const customerSearch = customerSeed.slice(0, 8);
    const customerSearchBox = commercialPage.locator('input[placeholder="Tìm theo tên, số điện thoại hoặc email..."]');
    await customerSearchBox.fill(customerSearch);
    await waitForPageReady(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-customers-search-applied');

    await customerSearchBox.fill('');
    await waitForPageReady(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-customers-search-cleared');

    await clickSidebarMenu(commercialPage, 'Nhà cung cấp');
    await expect(commercialPage).toHaveURL(/\/commercial\/suppliers/, { timeout: 15_000 });
    await waitForDataTable(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-suppliers-list');

    await commercialPage.getByRole('button', { name: 'Thêm NCC' }).click();
    const supplierDialog = commercialPage.getByRole('dialog').filter({ hasText: 'Thêm Nhà Cung Cấp Mới' });
    await expect(supplierDialog).toBeVisible({ timeout: 10_000 });
    await captureStep(commercialPage, step++, 'commercial-supplier-create-dialog');

    await supplierDialog.getByRole('button', { name: 'Thêm' }).click();
    await expect(supplierDialog.getByText('Tên nhà cung cấp là bắt buộc')).toBeVisible({ timeout: 10_000 });
    await captureStep(commercialPage, step++, 'commercial-supplier-validation-errors');

    await supplierDialog.getByRole('button', { name: 'Hủy' }).click();
    await expect(supplierDialog).not.toBeVisible({ timeout: 10_000 });
    await captureStep(commercialPage, step++, 'commercial-supplier-dialog-closed');

    await clickSidebarMenu(commercialPage, 'Kho hàng');
    await expect(commercialPage).toHaveURL(/\/commercial\/warehouses/, { timeout: 15_000 });
    await waitForDataTable(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-warehouses-list');

    await openFilterPanel(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-warehouses-filters-open');

    const warehouseSearchBox = commercialPage.locator('input[placeholder="Tìm theo mã hoặc tên kho..."]');
    const warehouseSeed = await getBrandSeedName(commercialPage, credentials.username);
    await warehouseSearchBox.fill(warehouseSeed.slice(0, 6));
    await waitForPageReady(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-warehouses-search-applied');

    await clickSidebarMenu(commercialPage, 'Trả hàng / Bảo hành');
    await expect(commercialPage).toHaveURL(/\/commercial\/returns/, { timeout: 15_000 });
    await waitForDataTable(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-returns-list');

    await clickSidebarMenu(commercialPage, 'Tồn kho');
    await clickSidebarMenu(commercialPage, 'Tổng quan');
    await expect(commercialPage).toHaveURL(/\/commercial\/inventory/, { timeout: 15_000 });
    await waitForPageReady(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-inventory-overview');

    await clickSidebarMenu(commercialPage, 'Tồn kho');
    await clickSidebarMenu(commercialPage, /^Sản phẩm$/);
    await expect(commercialPage).toHaveURL(/\/commercial\/inventory\/products/, { timeout: 15_000 });
    await waitForDataTable(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-inventory-products-list');

    await openFilterPanel(commercialPage);
    await captureStep(commercialPage, step++, 'commercial-inventory-products-filters-open');

    await commercialContext.close();

    const hrContext = await browser.newContext({
      baseURL: 'http://localhost:4000',
      viewport: CAPTURE_VIEWPORT,
    });
    const hrPage = await hrContext.newPage();

    await loginToPortalSelection(hrPage, credentials);
    await waitForPageReady(hrPage);
    await captureStep(hrPage, step++, 'hr-portal-selection');

    await openPortalFromSelection(hrPage, 'HR Portal', /\/hr/);
    await waitForPageReady(hrPage);

    await clickSidebarMenu(hrPage, 'Nhân viên');
    await expect(hrPage).toHaveURL(/\/hr\/employees/, { timeout: 15_000 });
    await waitForDataTable(hrPage);
    await captureStep(hrPage, step++, 'hr-employees-list');

    await clickSidebarMenu(hrPage, 'Bảng lương');
    await expect(hrPage).toHaveURL(/\/hr\/payroll/, { timeout: 15_000 });
    await waitForDataTable(hrPage);
    await captureStep(hrPage, step++, 'hr-payroll-list');

    await hrPage.getByRole('button', { name: 'Tính lương tháng này' }).click();
    const payrollDialog = hrPage.getByRole('dialog').filter({ hasText: 'Tính lương hàng loạt' });
    await expect(payrollDialog).toBeVisible({ timeout: 10_000 });
    await captureStep(hrPage, step++, 'hr-payroll-generate-dialog');

    await payrollDialog.locator('[role="combobox"]').first().click();
    await captureStep(hrPage, step++, 'hr-payroll-month-options');
    await hrPage.keyboard.press('Escape');

    await payrollDialog.getByRole('button', { name: 'Hủy' }).click();
    await expect(payrollDialog).not.toBeVisible({ timeout: 10_000 });
    await captureStep(hrPage, step++, 'hr-payroll-dialog-closed');

    await clickSidebarMenu(hrPage, 'Duyệt đơn nghỉ');
    await expect(hrPage).toHaveURL(/\/hr\/leave-approvals/, { timeout: 15_000 });
    await waitForDataTable(hrPage);
    await captureStep(hrPage, step++, 'hr-leave-approvals');

    await hrPage.getByRole('tab', { name: 'Tất cả đơn' }).click();
    await captureStep(hrPage, step++, 'hr-leave-approvals-all-tab');

    await hrPage.getByRole('tab', { name: 'Chờ duyệt' }).click();
    await captureStep(hrPage, step++, 'hr-leave-approvals-pending-tab');

    await clickSidebarMenu(hrPage, 'Đơn nghỉ việc');
    await expect(hrPage).toHaveURL(/\/hr\/resignations/, { timeout: 15_000 });
    await waitForDataTable(hrPage);
    await captureStep(hrPage, step++, 'hr-resignations-list');

    await clickSidebarMenu(hrPage, 'Yêu cầu sa thải');
    await expect(hrPage).toHaveURL(/\/hr\/terminations/, { timeout: 15_000 });
    await waitForDataTable(hrPage);
    await captureStep(hrPage, step++, 'hr-terminations-list');

    const terminationStatusSelect = hrPage
      .locator('.MuiFormControl-root')
      .filter({ has: hrPage.locator('label', { hasText: 'Trạng thái' }) })
      .locator('[role="combobox"]');

    let openedTerminationStatus = await clickFirstVisible(terminationStatusSelect);
    if (!openedTerminationStatus) {
      await openFilterPanel(hrPage).catch(() => undefined);
      await hrPage.waitForTimeout(300);
      openedTerminationStatus = await clickFirstVisible(terminationStatusSelect);
    }

    if (openedTerminationStatus) {
      await captureStep(hrPage, step++, 'hr-terminations-status-dropdown');
      await hrPage.keyboard.press('Escape');
    }

    await hrContext.close();

    const deepCommercialContext = await browser.newContext({
      baseURL: 'http://localhost:4000',
      viewport: CAPTURE_VIEWPORT,
    });
    const deepCommercialPage = await deepCommercialContext.newPage();

    await loginToPortalSelection(deepCommercialPage, credentials);
    await waitForPageReady(deepCommercialPage);
    await openPortalFromSelection(deepCommercialPage, 'Commercial Portal', /\/commercial\//);
    await waitForPageReady(deepCommercialPage);

    await deepCommercialPage.goto('/commercial/sales/create', { waitUntil: 'networkidle' });
    await captureStep(deepCommercialPage, step++, 'commercial-sales-create-open');

    const warehouseSelect = deepCommercialPage.getByRole('combobox', { name: /Kho hiển thị sản phẩm/i }).first();
    if (await warehouseSelect.isVisible().catch(() => false)) {
      await warehouseSelect.click();
      await captureStep(deepCommercialPage, step++, 'commercial-sales-create-warehouse-dropdown');
      await deepCommercialPage.keyboard.press('Escape').catch(() => undefined);
    } else {
      await captureStep(deepCommercialPage, step++, 'commercial-sales-create-warehouse-dropdown');
    }

    const productSearchBox = deepCommercialPage.locator('input[placeholder="Tìm sản phẩm theo tên hoặc SKU..."]');
    if (await productSearchBox.isVisible().catch(() => false)) {
      await productSearchBox.fill('a').catch(() => undefined);
      await waitForPageReady(deepCommercialPage);
    }
    await captureStep(deepCommercialPage, step++, 'commercial-sales-create-product-search');

    const firstProductCard = deepCommercialPage.locator('.MuiCardActionArea-root').first();
    if (await firstProductCard.isVisible().catch(() => false)) {
      await firstProductCard.click().catch(() => undefined);
      await deepCommercialPage.waitForTimeout(300);
    }
    await captureStep(deepCommercialPage, step++, 'commercial-sales-create-product-added-to-cart');

    const customerPhoneBox = deepCommercialPage.locator('input[placeholder="Nhập số điện thoại khách hàng..."]');
    if (await customerPhoneBox.isVisible().catch(() => false)) {
      await customerPhoneBox.fill(`09${String(timestamp).slice(-8)}`).catch(() => undefined);
      const findCustomerBtn = deepCommercialPage.getByRole('button', { name: 'Tìm' }).first();
      if (await findCustomerBtn.isVisible().catch(() => false)) {
        await findCustomerBtn.click().catch(() => undefined);
      }
      await deepCommercialPage.waitForTimeout(400);
    }
    await captureStep(deepCommercialPage, step++, 'commercial-sales-create-customer-search');

    const newCustomerDialog = deepCommercialPage.getByRole('dialog').filter({ hasText: 'Khách hàng mới' });
    if (await newCustomerDialog.isVisible().catch(() => false)) {
      await newCustomerDialog.getByRole('textbox', { name: 'Tên khách hàng' }).fill(`Khach E2E ${timestamp}`).catch(() => undefined);
      await newCustomerDialog.getByRole('button', { name: 'Tạo khách hàng' }).click().catch(() => undefined);
      await deepCommercialPage.waitForTimeout(500);
    }

    const discountBox = deepCommercialPage.getByRole('textbox', { name: 'Chiết khấu' }).first();
    if (await discountBox.isVisible().catch(() => false)) {
      await discountBox.fill('5000').catch(() => undefined);
    }
    await deepCommercialPage.locator('textarea[placeholder="Ghi chú đơn hàng..."]').fill('Don hang tao tu guide flow').catch(() => undefined);
    await captureStep(deepCommercialPage, step++, 'commercial-sales-create-discount-note');

    const createOrderBtn = deepCommercialPage.getByRole('button', { name: 'TẠO ĐƠN HÀNG' }).first();
    const canCreateOrder = await createOrderBtn.isEnabled().catch(() => false);
    await captureStep(deepCommercialPage, step++, 'commercial-sales-create-submit');
    if (canCreateOrder) {
      await createOrderBtn.click().catch(() => undefined);
      await deepCommercialPage.waitForURL(/\/commercial\/orders/, { timeout: 20_000 }).catch(() => undefined);
    }

    if (!/\/commercial\/orders/.test(deepCommercialPage.url())) {
      await deepCommercialPage.goto('/commercial/orders', { waitUntil: 'networkidle' });
    }
    await waitForDataTable(deepCommercialPage);
    await captureStep(deepCommercialPage, step++, 'commercial-orders-post-create');

    const firstOrderActionBtn = deepCommercialPage.locator('.MuiTableBody-root tr button').first();
    if (await firstOrderActionBtn.isVisible().catch(() => false)) {
      await firstOrderActionBtn.click().catch(() => undefined);
      await deepCommercialPage.waitForTimeout(500);
    }
    if (!/\/commercial\/orders\/.+/.test(deepCommercialPage.url())) {
      await deepCommercialPage.goto('/commercial/orders', { waitUntil: 'networkidle' });
    }
    await captureStep(deepCommercialPage, step++, 'commercial-order-detail-open');

    if (!/\/commercial\/orders\/.+/.test(deepCommercialPage.url())) {
      await deepCommercialPage.goto('/commercial/orders', { waitUntil: 'networkidle' });
      await deepCommercialPage.getByRole('button', { name: 'Tạo đơn hàng' }).first().click().catch(() => undefined);
      await deepCommercialPage.goto('/commercial/warehouse/fulfillment', { waitUntil: 'networkidle' });
    } else {
      const goFulfillmentBtn = deepCommercialPage.getByRole('button', { name: 'Đi xuất kho' }).first();
      if (await goFulfillmentBtn.isVisible().catch(() => false)) {
        await goFulfillmentBtn.click().catch(() => undefined);
      } else {
        await deepCommercialPage.goto('/commercial/warehouse/fulfillment', { waitUntil: 'networkidle' });
      }
    }
    await captureStep(deepCommercialPage, step++, 'commercial-order-detail-go-fulfillment');

    await deepCommercialPage.waitForURL(/\/commercial\/warehouse\/fulfillment/, { timeout: 15_000 }).catch(() => undefined);
    await waitForPageReady(deepCommercialPage);
    await captureStep(deepCommercialPage, step++, 'commercial-fulfillment-pending-list');

    const fulfillBtn = deepCommercialPage.getByRole('button', { name: 'Xuất hàng' }).first();
    if (await fulfillBtn.isVisible().catch(() => false)) {
      await fulfillBtn.click().catch(() => undefined);
      await deepCommercialPage.waitForTimeout(400);
    }
    await captureStep(deepCommercialPage, step++, 'commercial-fulfillment-open-dialog');

    const fulfillDialogWarehouse = deepCommercialPage.getByRole('combobox', { name: /Chọn kho xuất hàng/i }).first();
    if (await fulfillDialogWarehouse.isVisible().catch(() => false)) {
      await fulfillDialogWarehouse.click().catch(() => undefined);
      const warehouseOptions = deepCommercialPage.getByRole('option');
      if ((await warehouseOptions.count().catch(() => 0)) > 0) {
        await warehouseOptions.first().click().catch(() => undefined);
      } else {
        await deepCommercialPage.keyboard.press('Escape').catch(() => undefined);
      }
    }
    await captureStep(deepCommercialPage, step++, 'commercial-fulfillment-warehouse-selected');

    const scanBtn = deepCommercialPage.getByRole('button', { name: /Quét Serial/i }).first();
    if (await scanBtn.isVisible().catch(() => false)) {
      await scanBtn.click().catch(() => undefined);
    } else {
      const confirmCheckbox = deepCommercialPage.getByRole('checkbox').first();
      if (await confirmCheckbox.isVisible().catch(() => false)) {
        await confirmCheckbox.check().catch(() => undefined);
      }
    }
    await captureStep(deepCommercialPage, step++, 'commercial-fulfillment-item-confirmation');

    const confirmFulfillBtn = deepCommercialPage.getByRole('button', { name: 'XÁC NHẬN XUẤT KHO' }).first();
    if (await confirmFulfillBtn.isEnabled().catch(() => false)) {
      await confirmFulfillBtn.click().catch(() => undefined);
      await deepCommercialPage.waitForTimeout(500);
    }
    await captureStep(deepCommercialPage, step++, 'commercial-fulfillment-post-check');

    await deepCommercialPage.goto('/commercial/inventory/imports', { waitUntil: 'networkidle' });
    await waitForDataTable(deepCommercialPage);
    await captureStep(deepCommercialPage, step++, 'commercial-imports-list');

    const createImportBtn = deepCommercialPage.getByRole('button', { name: 'Tạo phiếu nhập' }).first();
    if (await createImportBtn.isVisible().catch(() => false)) {
      await createImportBtn.click().catch(() => undefined);
    } else {
      await deepCommercialPage.goto('/commercial/inventory/imports/create', { waitUntil: 'networkidle' });
    }
    await deepCommercialPage.waitForURL(/\/commercial\/inventory\/imports\/create/, { timeout: 15_000 }).catch(() => undefined);
    await captureStep(deepCommercialPage, step++, 'commercial-import-create-page');

    const importWarehouse = deepCommercialPage.getByRole('combobox', { name: 'Chọn Kho' }).first();
    if (await importWarehouse.isVisible().catch(() => false)) {
      await importWarehouse.click().catch(() => undefined);
      const importWarehouseOption = deepCommercialPage.getByRole('option').first();
      if (await importWarehouseOption.isVisible().catch(() => false)) {
        await importWarehouseOption.click().catch(() => undefined);
      }
    }

    const supplierInput = deepCommercialPage.getByRole('textbox', { name: 'Nhà cung cấp' }).first();
    if (await supplierInput.isVisible().catch(() => false)) {
      await supplierInput.click().catch(() => undefined);
      await deepCommercialPage.waitForTimeout(300);
    }
    await captureStep(deepCommercialPage, step++, 'commercial-import-header-filled');

    const importSupplierDialog = deepCommercialPage.getByRole('dialog').filter({ hasText: 'Chọn Nhà Cung Cấp' });
    if (await importSupplierDialog.isVisible().catch(() => false)) {
      const selectSupplierBtn = importSupplierDialog.getByRole('button', { name: 'Chọn' }).first();
      if (await selectSupplierBtn.isVisible().catch(() => false)) {
        await selectSupplierBtn.click().catch(() => undefined);
      } else {
        await importSupplierDialog.getByRole('button', { name: 'Đóng' }).click().catch(() => undefined);
      }
      await deepCommercialPage.waitForTimeout(350);
    }

    await deepCommercialPage.getByRole('button', { name: 'Thêm sản phẩm' }).click().catch(() => undefined);
    await captureStep(deepCommercialPage, step++, 'commercial-import-add-item-row');

    const productPickerInput = deepCommercialPage.getByRole('textbox', { name: /Nhấn để chọn sản phẩm/i }).first();
    if (await productPickerInput.isVisible().catch(() => false)) {
      await productPickerInput.click().catch(() => undefined);
      await deepCommercialPage.waitForTimeout(300);
    }
    await captureStep(deepCommercialPage, step++, 'commercial-import-product-select-dialog');

    const productDialog = deepCommercialPage.getByRole('dialog').filter({ hasText: 'Chọn Sản Phẩm' });
    if (await productDialog.isVisible().catch(() => false)) {
      const selectProductBtn = productDialog.getByRole('button', { name: 'Chọn' }).first();
      if (await selectProductBtn.isVisible().catch(() => false)) {
        await selectProductBtn.click().catch(() => undefined);
        await deepCommercialPage.waitForTimeout(500);
      } else {
        await productDialog.getByRole('button', { name: 'Đóng' }).click().catch(() => undefined);
      }
    }

    const numberInputs = deepCommercialPage.locator('input[type="number"]');
    const numberInputCount = await numberInputs.count().catch(() => 0);
    if (numberInputCount >= 2) {
      await numberInputs.nth(numberInputCount - 2).fill('100000').catch(() => undefined);
      await numberInputs.nth(numberInputCount - 1).fill('1').catch(() => undefined);
    }
    await captureStep(deepCommercialPage, step++, 'commercial-import-item-filled');

    const saveImportBtn = deepCommercialPage.getByRole('button', { name: 'Lưu & Nhập kho' }).first();
    if (await saveImportBtn.isVisible().catch(() => false)) {
      await saveImportBtn.click().catch(() => undefined);
      await deepCommercialPage.waitForTimeout(500);
    }
    await captureStep(deepCommercialPage, step++, 'commercial-import-submit-attempt');

    await deepCommercialContext.close();

    const deepAdminContext = await browser.newContext({
      baseURL: 'http://localhost:4000',
      viewport: CAPTURE_VIEWPORT,
    });
    const deepAdminPage = await deepAdminContext.newPage();

    await loginToPortalSelection(deepAdminPage, credentials);
    await waitForPageReady(deepAdminPage);
    await openPortalFromSelection(deepAdminPage, 'Admin Portal', /\/admin\//);
    await waitForPageReady(deepAdminPage);

    await deepAdminPage.goto('/admin/products', { waitUntil: 'networkidle' });
    await waitForDataTable(deepAdminPage);
    await captureStep(deepAdminPage, step++, 'admin-products-list-crud');

    await deepAdminPage.getByRole('button', { name: 'Thêm sản phẩm' }).click().catch(() => undefined);
    await deepAdminPage.waitForURL(/\/admin\/products\/create/, { timeout: 15_000 }).catch(() => undefined);
    await captureStep(deepAdminPage, step++, 'admin-products-create-page');

    const createdProductName = `SP E2E ${timestamp}`;
    const nameInput = deepAdminPage.getByRole('textbox', { name: 'Tên sản phẩm' }).first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill(createdProductName).catch(() => undefined);
    }
    await captureStep(deepAdminPage, step++, 'admin-products-create-form-filled-basic');

    const createProductBtn = deepAdminPage.getByRole('button', { name: 'Tạo sản phẩm' }).first();
    if (await createProductBtn.isVisible().catch(() => false)) {
      await createProductBtn.click().catch(() => undefined);
      await deepAdminPage.waitForTimeout(400);
    }
    await captureStep(deepAdminPage, step++, 'admin-products-create-validation-errors');

    const brandSelect = deepAdminPage.getByRole('combobox', { name: 'Thương hiệu' }).first();
    if (await brandSelect.isVisible().catch(() => false)) {
      await brandSelect.click().catch(() => undefined);
      const brandOption = deepAdminPage.getByRole('option').first();
      if (await brandOption.isVisible().catch(() => false)) {
        await brandOption.click().catch(() => undefined);
      }
    }

    const categorySelect = deepAdminPage.getByRole('combobox', { name: 'Danh mục' }).first();
    if (await categorySelect.isVisible().catch(() => false)) {
      await categorySelect.click().catch(() => undefined);
      const categoryOption = deepAdminPage.getByRole('option').first();
      if (await categoryOption.isVisible().catch(() => false)) {
        await categoryOption.click().catch(() => undefined);
      }
    }

    const retailPriceInput = deepAdminPage.getByRole('spinbutton', { name: 'Giá bán lẻ' }).first();
    if (await retailPriceInput.isVisible().catch(() => false)) {
      await retailPriceInput.fill('1').catch(() => undefined);
    }
    await captureStep(deepAdminPage, step++, 'admin-products-create-filled-required');

    if (await createProductBtn.isVisible().catch(() => false)) {
      await createProductBtn.click().catch(() => undefined);
      await deepAdminPage.waitForURL(/\/admin\/products$/, { timeout: 20_000 }).catch(() => undefined);
      await waitForPageReady(deepAdminPage);
    }
    await captureStep(deepAdminPage, step++, 'admin-products-created-list');

    const searchNameInput = deepAdminPage.locator('input[placeholder="Tìm theo tên sản phẩm..."]').first();
    if (await searchNameInput.isVisible().catch(() => false)) {
      await searchNameInput.fill(createdProductName).catch(() => undefined);
      await deepAdminPage.waitForTimeout(500);
    }

    const createdProductRow = deepAdminPage.locator('.MuiTableBody-root tr').filter({ hasText: createdProductName }).first();
    if (await createdProductRow.isVisible().catch(() => false)) {
      await createdProductRow.locator('button').nth(1).click().catch(() => undefined);
      await deepAdminPage.waitForURL(/\/admin\/products\/.+\/edit/, { timeout: 15_000 }).catch(() => undefined);
    }
    await captureStep(deepAdminPage, step++, 'admin-products-edit-page');

    const editRetailPriceInput = deepAdminPage.getByRole('spinbutton', { name: 'Giá bán lẻ' }).first();
    if (await editRetailPriceInput.isVisible().catch(() => false)) {
      await editRetailPriceInput.fill('2').catch(() => undefined);
    }
    const saveChangesBtn = deepAdminPage.getByRole('button', { name: 'Lưu thay đổi' }).first();
    if (await saveChangesBtn.isVisible().catch(() => false)) {
      await saveChangesBtn.click().catch(() => undefined);
      await deepAdminPage.waitForURL(/\/admin\/products$/, { timeout: 20_000 }).catch(() => undefined);
      await deepAdminPage.waitForTimeout(400);
    }
    await captureStep(deepAdminPage, step++, 'admin-products-updated');

    if (await searchNameInput.isVisible().catch(() => false)) {
      await searchNameInput.fill(createdProductName).catch(() => undefined);
      await deepAdminPage.waitForTimeout(500);
    }
    const updatedProductRow = deepAdminPage.locator('.MuiTableBody-root tr').filter({ hasText: createdProductName }).first();
    if (await updatedProductRow.isVisible().catch(() => false)) {
      await updatedProductRow.locator('button').nth(2).click().catch(() => undefined);
      await deepAdminPage.waitForTimeout(300);
    }
    await captureStep(deepAdminPage, step++, 'admin-products-delete-confirm');

    const deleteConfirmBtn = deepAdminPage.getByRole('button', { name: 'Xóa' }).first();
    if (await deleteConfirmBtn.isVisible().catch(() => false)) {
      await deleteConfirmBtn.click().catch(() => undefined);
      await deepAdminPage.waitForTimeout(500);
    }
    await captureStep(deepAdminPage, step++, 'admin-products-deleted');

    await deepAdminContext.close();

    const personalContext = await browser.newContext({ baseURL: 'http://localhost:4000' });
    const personalPage = await personalContext.newPage();

    await loginToPortalSelection(personalPage, credentials);
    await waitForPageReady(personalPage);

    await personalPage.goto('/personal-page', { waitUntil: 'networkidle' });
    await captureStep(personalPage, step++, 'personal-home-page');

    await personalPage.waitForTimeout(300);
    await captureStep(personalPage, step++, 'personal-home-cards');

    await personalPage.goto('/personal-page/profile', { waitUntil: 'networkidle' });
    await captureStep(personalPage, step++, 'personal-profile-page');

    await personalPage.goto('/personal-page/my-leaves', { waitUntil: 'networkidle' });
    await waitForDataTable(personalPage);
    await captureStep(personalPage, step++, 'personal-my-leaves-page');

    const leaveRequestBtn = personalPage.getByRole('button', { name: 'Xin nghỉ phép' }).first();
    if (await leaveRequestBtn.isVisible().catch(() => false)) {
      await leaveRequestBtn.click().catch(() => undefined);
      await personalPage.waitForTimeout(350);
    }
    await captureStep(personalPage, step++, 'personal-leave-request-dialog');

    const leaveDialog = personalPage.getByRole('dialog').filter({ hasText: 'Xin Nghỉ Phép' });
    if (await leaveDialog.isVisible().catch(() => false)) {
      await leaveDialog.getByRole('button', { name: 'Gửi đơn' }).click().catch(() => undefined);
      await personalPage.waitForTimeout(350);
    }
    await captureStep(personalPage, step++, 'personal-leave-request-validation-errors');

    await personalPage.goto('/personal-page/my-payslips', { waitUntil: 'networkidle' });
    await waitForDataTable(personalPage);
    await captureStep(personalPage, step++, 'personal-payslips-page');

    const monthSelect = personalPage.getByRole('combobox', { name: 'Tháng' }).first();
    if (await monthSelect.isVisible().catch(() => false)) {
      await monthSelect.click().catch(() => undefined);
      await personalPage.keyboard.press('Escape').catch(() => undefined);
    }
    await captureStep(personalPage, step++, 'personal-payslips-filters');

    await personalPage.goto('/personal-page/my-resignation', { waitUntil: 'networkidle' });
    await waitForPageReady(personalPage);
    await captureStep(personalPage, step++, 'personal-resignation-page');

    const createResignationBtn = personalPage.getByRole('button', { name: 'Tạo đơn xin thôi việc' }).first();
    if (await createResignationBtn.isVisible().catch(() => false)) {
      await createResignationBtn.click().catch(() => undefined);
      await personalPage.waitForTimeout(350);
    }
    await captureStep(personalPage, step++, 'personal-resignation-form-dialog');

    const resignationDialog = personalPage.getByRole('dialog').filter({ hasText: 'Tạo đơn xin thôi việc' });
    if (await resignationDialog.isVisible().catch(() => false)) {
      await resignationDialog.getByRole('button', { name: 'Gửi đơn xin thôi việc' }).click().catch(() => undefined);
      await personalPage.waitForTimeout(350);
    }
    await captureStep(personalPage, step++, 'personal-resignation-form-validation');

    if (await resignationDialog.isVisible().catch(() => false)) {
      await resignationDialog.getByRole('button', { name: 'Hủy' }).click().catch(() => undefined);
      await personalPage.waitForTimeout(300);
    }
    await captureStep(personalPage, step++, 'personal-resignation-form-closed');

    await personalContext.close();
  });
});
