import { test, expect } from '@playwright/test';

type Permission = { permission_code: string };

function buildPermissions(permissionCodes: string[]): Permission[] {
  return permissionCodes.map((code) => ({ permission_code: code }));
}

async function mockAuthAndRole(
  page: import('@playwright/test').Page,
  roleCode: string,
  permissions: string[],
) {
  const roleName = roleCode === 'ADMIN' ? 'Admin' : roleCode;

  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'user-e2e-1', role: roleCode }),
    });
  });

  await page.route('**/users/user-e2e-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'user-e2e-1',
          username: 'EMP-0037',
          email: 'emp0037@example.com',
          role: {
            role_code: roleCode,
            role_name: roleName,
            permissions: buildPermissions(permissions),
          },
          employee: {
            id: 'emp-0037',
            employeeCode: 'EMP-0037',
            fullName: 'Employee 0037',
            photoUrl: '',
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
          role_name: roleName,
          is_active: true,
          permissions: buildPermissions(permissions),
        },
      }),
    });
  });
}

test.describe('Leave Approval - BHXH Claim', () => {
  test('ADMIN thấy nút BHXH và claim thành công cho đơn thai sản đã duyệt', async ({ page }) => {
    const permissions = [
      'ACCESS_HR_PORTAL',
      'LEAVE_REQUEST_VIEW',
      'LEAVE_REQUEST_APPROVE',
    ];

    await mockAuthAndRole(page, 'ADMIN', permissions);

    let bhxhClaimCalled = false;

    await page.route('**/leave-requests?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              {
                id: 'lr-maternity-1',
                employee: {
                  id: 'emp-01',
                  employeeCode: 'EMP-0001',
                  fullName: 'Nguyen Thi A',
                },
                startDate: '2026-01-10T00:00:00.000Z',
                endDate: '2026-07-10T00:00:00.000Z',
                duration: 180,
                reason: 'Nghỉ thai sản',
                isBhxhClaimed: false,
                status: 'APPROVED',
                type: 'MATERNITY',
                approverId: 'manager-1',
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
              },
            ],
            totalCount: 1,
            totalPages: 1,
          },
        }),
      });
    });

    await page.route('**/leave-requests/lr-maternity-1/bhxh-claim', async (route) => {
      bhxhClaimCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'lr-maternity-1',
            employee: {
              id: 'emp-01',
              employeeCode: 'EMP-0001',
              fullName: 'Nguyen Thi A',
            },
            startDate: '2026-01-10T00:00:00.000Z',
            endDate: '2026-07-10T00:00:00.000Z',
            duration: 180,
            reason: 'Nghỉ thai sản',
            isBhxhClaimed: true,
            status: 'APPROVED',
            type: 'MATERNITY',
            approverId: 'manager-1',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        }),
      });
    });

    await page.goto('/hr/leave-approvals');
    await expect(page).not.toHaveURL(/\/auth\/login/);
    await expect(page.locator('.MuiTableContainer-root').first()).toBeVisible({ timeout: 15_000 });

    const bhxhButton = page.locator('button:has(svg[data-testid="AssignmentTurnedInIcon"])').first();
    await expect(bhxhButton).toBeVisible();
    await bhxhButton.click();

    await expect(page.getByText('Đã xác nhận quyết toán BHXH')).toBeVisible({ timeout: 10_000 });
    expect(bhxhClaimCalled).toBeTruthy();
  });

  test('HR_STAFF không thấy nút Xác nhận hồ sơ BHXH', async ({ page }) => {
    const permissions = [
      'ACCESS_HR_PORTAL',
      'LEAVE_REQUEST_VIEW',
      'LEAVE_REQUEST_APPROVE',
    ];

    await mockAuthAndRole(page, 'HR_STAFF', permissions);

    await page.route('**/leave-requests?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              {
                id: 'lr-maternity-2',
                employee: {
                  id: 'emp-02',
                  employeeCode: 'EMP-0002',
                  fullName: 'Tran Thi B',
                },
                startDate: '2026-02-01T00:00:00.000Z',
                endDate: '2026-08-01T00:00:00.000Z',
                duration: 180,
                reason: 'Nghỉ thai sản',
                isBhxhClaimed: false,
                status: 'APPROVED',
                type: 'MATERNITY',
                approverId: 'manager-1',
                createdAt: '2026-01-15T00:00:00.000Z',
                updatedAt: '2026-01-15T00:00:00.000Z',
              },
            ],
            totalCount: 1,
            totalPages: 1,
          },
        }),
      });
    });

    await page.goto('/hr/leave-approvals');
    await expect(page).not.toHaveURL(/\/auth\/login/);
    await expect(page.locator('.MuiTableContainer-root').first()).toBeVisible({ timeout: 15_000 });

    const bhxhButton = page.locator('button:has(svg[data-testid="AssignmentTurnedInIcon"])');
    await expect(bhxhButton).toHaveCount(0);
  });
});

test.describe('Payslip - MATERNITY UI', () => {
  test('chi tiết payslip thai sản hiển thị dòng BHXH minh bạch', async ({ page }) => {
    const permissions = [
      'ACCESS_HR_PORTAL',
      'PAYSLIP_VIEW',
      'PAYSLIP_MARK_PAID',
    ];

    await mockAuthAndRole(page, 'ADMIN', permissions);

    await page.route('**/payslips?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              {
                id: 'ps-maternity-1',
                employee: {
                  id: 'emp-03',
                  employeeCode: 'EMP-0003',
                  fullName: 'Le Thi C',
                },
                baseSalary: 20000000,
                actualWorkDays: 0,
                standardWorkDays: 26,
                finalSalary: 12000000,
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
              id: 'emp-03',
              employeeCode: 'EMP-0003',
              fullName: 'Le Thi C',
              department: { name: 'HR' },
              currentPosition: { name: 'Specialist' },
            },
            month: 3,
            year: 2026,
            baseSalary: 20000000,
            standardWorkDays: 26,
            actualWorkDays: 0,
            unpaidLeaveDays: 26,
            finalSalary: 12000000,
            details: {
              MATERNITY_BHXH: 12000000,
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
            { id: 2, name: 'BHYT', code: 'BHYT', type: 'DEDUCTION' },
          ],
        }),
      });
    });

    await page.goto('/hr/payroll');
    await expect(page).not.toHaveURL(/\/auth\/login/);
    await expect(page.locator('.MuiTableContainer-root').first()).toBeVisible({ timeout: 15_000 });

    const viewButton = page.locator('button:has(svg[data-testid="VisibilityIcon"])').first();
    await expect(viewButton).toBeVisible();
    await viewButton.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(dialog.getByText('Kỳ lương nghỉ thai sản')).toBeVisible();
    await expect(dialog.getByText('Thu nhập hưởng từ quỹ Bảo hiểm xã hội').first()).toBeVisible();
    await expect(dialog.getByText('Lương thực lĩnh')).toBeVisible();
  });
});
