import { test, expect } from '@playwright/test';

type Permission = { permission_code: string };

function buildPermissions(permissionCodes: string[]): Permission[] {
  return permissionCodes.map((code) => ({ permission_code: code }));
}

async function mockEmployeeAuthContext(page: import('@playwright/test').Page) {
  const roleCode = 'EMPLOYEE';
  const permissions = ['PAYSLIP_VIEW'];

  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'user-payslip-1', role: roleCode }),
    });
  });

  await page.route('**/users/user-payslip-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'user-payslip-1',
          username: 'EMP-0037',
          email: 'emp0037@example.com',
          role: {
            role_code: roleCode,
            role_name: 'Employee',
            permissions: buildPermissions(permissions),
          },
          employee: {
            id: 'emp-0037',
            employeeCode: 'EMP-0037',
            fullName: 'Employee 0037',
          },
        },
      }),
    });
  });

  await page.route(`**/roles/${roleCode}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          role_code: roleCode,
          role_name: 'Employee',
          is_active: true,
          permissions: buildPermissions(permissions),
        },
      }),
    });
  });

  await page.route('**/payslips/my-payslips/yearly?*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          details: [],
          totalSalary: 0,
          totalBaseSalary: 0,
        },
      }),
    });
  });
}

test.describe('Personal Payslip - Display Reasonableness', () => {
  test('Hiển thị card tổng quan và bảng lương hợp lý với dữ liệu trả về', async ({ page }) => {
    await mockEmployeeAuthContext(page);

    await page.route('**/payslips/my-payslips?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              {
                id: 'ps-latest',
                employee: {
                  id: 'emp-0037',
                  employeeCode: 'EMP-0037',
                  fullName: 'Employee 0037',
                },
                baseSalary: 15000000,
                actualWorkDays: 20,
                standardWorkDays: 26,
                finalSalary: 12000000,
                isPaid: true,
              },
              {
                id: 'ps-old',
                employee: {
                  id: 'emp-0037',
                  employeeCode: 'EMP-0037',
                  fullName: 'Employee 0037',
                },
                baseSalary: 15000000,
                actualWorkDays: 18,
                standardWorkDays: 26,
                finalSalary: 11000000,
                isPaid: false,
              },
            ],
            totalCount: 2,
            totalPages: 1,
          },
        }),
      });
    });

    await page.goto('/personal-page/my-payslips');
    await expect(page).not.toHaveURL(/\/auth\/login/);

    const employeeCodeCard = page.locator('.MuiCard-root').filter({ has: page.getByText('Mã nhân viên') }).first();
    await expect(employeeCodeCard).toBeVisible();
    await expect(employeeCodeCard.getByText('EMP-0037')).toBeVisible();

    const monthlySalaryCard = page.locator('.MuiCard-root').filter({ has: page.getByText('Lương tháng này') }).first();
    await expect(monthlySalaryCard).toBeVisible();
    await expect(monthlySalaryCard.getByText('12.000.000')).toBeVisible();

    const workdayCard = page.locator('.MuiCard-root').filter({ has: page.getByText('Ngày công tháng này') }).first();
    await expect(workdayCard).toBeVisible();
    await expect(workdayCard.getByText('20/26')).toBeVisible();

    await expect(page.getByText(/^Tổng:\s*2\s*phiếu lương$/)).toBeVisible();

    await expect(page.getByText('Đã trả')).toBeVisible();
    await expect(page.getByText('Chưa trả')).toBeVisible();
  });

  test('Payslip thường không hiển thị nội dung dành riêng cho thai sản', async ({ page }) => {
    await mockEmployeeAuthContext(page);

    await page.route('**/payslips/my-payslips?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              {
                id: 'ps-normal-1',
                employee: {
                  id: 'emp-0037',
                  employeeCode: 'EMP-0037',
                  fullName: 'Employee 0037',
                },
                baseSalary: 15000000,
                actualWorkDays: 22,
                standardWorkDays: 26,
                finalSalary: 13000000,
                isPaid: true,
              },
            ],
            totalCount: 1,
            totalPages: 1,
          },
        }),
      });
    });

    await page.route('**/payslips/ps-normal-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'ps-normal-1',
            employee: {
              id: 'emp-0037',
              employeeCode: 'EMP-0037',
              fullName: 'Employee 0037',
              department: { name: 'IT' },
              currentPosition: { name: 'Developer' },
            },
            month: 3,
            year: 2026,
            baseSalary: 15000000,
            standardWorkDays: 26,
            actualWorkDays: 22,
            unpaidLeaveDays: 0,
            finalSalary: 13000000,
            details: {
              BONUS: 2000000,
              BHXH: 1200000,
              BHYT: 500000,
            },
            isPaid: true,
            note: 'Lương tháng thông thường',
            createdAt: '2026-03-01T00:00:00.000Z',
          },
        }),
      });
    });

    await page.route('**/system-settings/salary-components', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 1, name: 'Thưởng', code: 'BONUS', type: 'EARNING' },
            { id: 2, name: 'BHXH bắt buộc', code: 'BHXH', type: 'DEDUCTION' },
            { id: 3, name: 'BHYT', code: 'BHYT', type: 'DEDUCTION' },
          ],
        }),
      });
    });

    await page.goto('/personal-page/my-payslips');
    await expect(page).not.toHaveURL(/\/auth\/login/);

    const detailResponse = page.waitForResponse(
      (response) => response.request().method() === 'GET' && response.url().includes('/payslips/ps-normal-1')
    );
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    await firstRow.locator('button').first().click();
    await detailResponse;

    await expect(page.getByText('PHIẾU LƯƠNG THÁNG 03/2026')).toBeVisible();
    const dialog = page.locator('.MuiDialog-paper').filter({ hasText: 'PHIẾU LƯƠNG THÁNG 03/2026' }).first();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Kỳ lương nghỉ thai sản')).toHaveCount(0);
    await expect(dialog.getByText('Thu nhập hưởng từ quỹ Bảo hiểm xã hội')).toHaveCount(0);
  });

  test('Payslip thai sản hiển thị đúng thông tin minh bạch BHXH', async ({ page }) => {
    await mockEmployeeAuthContext(page);

    await page.route('**/payslips/my-payslips?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              {
                id: 'ps-maternity-1',
                employee: {
                  id: 'emp-0037',
                  employeeCode: 'EMP-0037',
                  fullName: 'Employee 0037',
                },
                baseSalary: 15000000,
                actualWorkDays: 0,
                standardWorkDays: 26,
                finalSalary: 9000000,
                isPaid: false,
              },
            ],
            totalCount: 1,
            totalPages: 1,
          },
        }),
      });
    });

    await page.route('**/payslips/ps-maternity-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'ps-maternity-1',
            employee: {
              id: 'emp-0037',
              employeeCode: 'EMP-0037',
              fullName: 'Employee 0037',
              department: { name: 'HR' },
              currentPosition: { name: 'Specialist' },
            },
            month: 3,
            year: 2026,
            baseSalary: 15000000,
            standardWorkDays: 26,
            actualWorkDays: 0,
            unpaidLeaveDays: 0,
            finalSalary: 9000000,
            details: {
              MATERNITY_BHXH: 9000000,
            },
            isPaid: false,
            note: 'Nghỉ thai sản',
            createdAt: '2026-03-01T00:00:00.000Z',
          },
        }),
      });
    });

    await page.route('**/system-settings/salary-components', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 1, name: 'Thai sản BHXH', code: 'MATERNITY_BHXH', type: 'EARNING' },
          ],
        }),
      });
    });

    await page.goto('/personal-page/my-payslips');
    await expect(page).not.toHaveURL(/\/auth\/login/);

    const detailResponse = page.waitForResponse(
      (response) => response.request().method() === 'GET' && response.url().includes('/payslips/ps-maternity-1')
    );
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    await firstRow.locator('button').first().click();
    await detailResponse;

    const dialog = page.locator('.MuiDialog-paper').filter({ hasText: 'PHIẾU LƯƠNG THÁNG 03/2026' }).first();
    await expect(dialog).toBeVisible();

    await expect(dialog.getByText('Kỳ lương nghỉ thai sản')).toBeVisible();
    await expect(dialog.getByText('Thu nhập hưởng từ quỹ Bảo hiểm xã hội').first()).toBeVisible();
    await expect(dialog.getByText('Lương thực lĩnh')).toBeVisible();
  });
});
