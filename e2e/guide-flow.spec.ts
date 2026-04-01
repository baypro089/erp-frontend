import { test, expect, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const README_PATH = path.join(process.cwd(), 'mockups', 'README.md');
const OUTPUT_DIR = path.join(process.cwd(), 'mockups', 'ui-pages');

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
  await page.waitForTimeout(400);
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
  test.setTimeout(35 * 60_000);

  test('capture ultra detailed real usage flow across portals', async ({ browser }) => {
    ensureOutputDir();
    cleanStepScreenshots();

    const fromReadme = readCredentialsFromReadme();
    const username = process.env.E2E_USERNAME ?? fromReadme.username;
    const password = process.env.E2E_PASSWORD ?? fromReadme.password;
    const credentials: LoginCredentials = { username, password };

    let step = 1;
    const timestamp = Date.now();

    const adminContext = await browser.newContext({ baseURL: 'http://localhost:4000' });
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

    const commercialContext = await browser.newContext({ baseURL: 'http://localhost:4000' });
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

    const hrContext = await browser.newContext({ baseURL: 'http://localhost:4000' });
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
  });
});
