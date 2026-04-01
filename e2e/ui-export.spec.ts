import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { loginAs } from './helpers/auth';

const OUTPUT_DIR = path.join(process.cwd(), 'mockups', 'ui-pages');

const AUTHENTICATED_ROUTES: string[] = [
  '/',
  '/portal-selection',
  '/admin',
  '/admin/brands',
  '/admin/categories',
  '/admin/dashboard',
  '/admin/departments',
  '/admin/holidays',
  '/admin/positions',
  '/admin/products',
  '/admin/products/create',
  '/admin/products/1',
  '/admin/products/1/edit',
  '/admin/roles',
  '/admin/settings',
  '/admin/users',
  '/commercial/customers',
  '/commercial/dashboards',
  '/commercial/inventory',
  '/commercial/inventory/imports',
  '/commercial/inventory/imports/create',
  '/commercial/inventory/imports/1',
  '/commercial/inventory/products',
  '/commercial/inventory/products/create',
  '/commercial/inventory/products/1',
  '/commercial/inventory/products/1/edit',
  '/commercial/inventory/tracking',
  '/commercial/orders',
  '/commercial/orders/1',
  '/commercial/reports/customers',
  '/commercial/reports/inventory',
  '/commercial/reports/sales',
  '/commercial/returns',
  '/commercial/returns/create',
  '/commercial/returns/initiate',
  '/commercial/returns/1',
  '/commercial/sales/create',
  '/commercial/suppliers',
  '/commercial/warehouse/fulfillment',
  '/commercial/warehouses',
  '/hr',
  '/hr/departments',
  '/hr/employees',
  '/hr/employees/1',
  '/hr/leave-approvals',
  '/hr/payroll',
  '/hr/positions',
  '/hr/reports',
  '/hr/resignations',
  '/hr/terminations',
  '/personal-page',
  '/personal-page/my-leaves',
  '/personal-page/my-payslips',
  '/personal-page/my-resignation',
  '/personal-page/profile',
];

const PUBLIC_ROUTES: string[] = ['/auth/login'];

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function routeToFileName(route: string): string {
  if (route === '/') {
    return 'root.png';
  }

  return `${route
    .replace(/^\//, '')
    .replaceAll('/', '__')
    .replace(/[^a-zA-Z0-9_.-]/g, '_')}.png`;
}

async function captureRoute(page: import('@playwright/test').Page, route: string) {
  await page.goto(route, { waitUntil: 'networkidle', timeout: 45_000 });

  await page.waitForTimeout(700);

  const fileName = routeToFileName(route);
  const outputPath = path.join(OUTPUT_DIR, fileName);
  await page.screenshot({ path: outputPath, fullPage: true });
}

test.describe('Export all app UIs as PNG', () => {
  test.setTimeout(8 * 60_000);

  test('capture authenticated routes', async ({ page }) => {
    ensureOutputDir();

    const username = process.env.E2E_USERNAME ?? 'admin';
    const password = process.env.E2E_PASSWORD ?? '123456';
    await loginAs(page, username, password);

    const failures: string[] = [];
    for (const route of AUTHENTICATED_ROUTES) {
      try {
        await captureRoute(page, route);
      } catch (error) {
        failures.push(`${route}: ${String(error)}`);
      }
    }

    expect(failures, `Failed routes:\n${failures.join('\n')}`).toEqual([]);
  });

  test('capture public routes', async ({ browser }) => {
    ensureOutputDir();

    const context = await browser.newContext();
    const page = await context.newPage();

    const failures: string[] = [];
    for (const route of PUBLIC_ROUTES) {
      try {
        await captureRoute(page, route);
      } catch (error) {
        failures.push(`${route}: ${String(error)}`);
      }
    }

    await context.close();

    expect(failures, `Failed routes:\n${failures.join('\n')}`).toEqual([]);
  });
});
