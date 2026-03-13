import { test, expect } from '@playwright/test';

async function openLeaveDialog(page: import('@playwright/test').Page) {
  await page.goto('/personal-page/my-leaves');
  await expect(page).not.toHaveURL(/\/auth\/login/);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Xin nghỉ phép' }).click();
  await expect(page.getByRole('dialog', { name: 'Xin Nghỉ Phép' })).toBeVisible({ timeout: 10_000 });
  return page.getByRole('dialog', { name: 'Xin Nghỉ Phép' });
}

test.describe('Leave Request - Document Options', () => {
  test('SICK: bắt buộc hồ sơ khi chọn Upload file', async ({ page }) => {
    const dialog = await openLeaveDialog(page);

    await dialog.getByLabel('Loại nghỉ').click();
    await page.getByRole('option', { name: 'Nghỉ ốm' }).click();

    await expect(dialog.getByText('Tài liệu đính kèm bắt buộc')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Upload file' })).toHaveAttribute('aria-pressed', 'true');

    await dialog.getByRole('button', { name: 'Gửi đơn' }).click();
    await expect(dialog.getByText('Bạn cần upload hồ sơ cho loại nghỉ này')).toBeVisible();
  });

  test('SICK: validate URL khi chọn mode Nhập URL', async ({ page }) => {
    const dialog = await openLeaveDialog(page);

    await dialog.getByLabel('Loại nghỉ').click();
    await page.getByRole('option', { name: 'Nghỉ ốm' }).click();

    await dialog.getByRole('button', { name: 'Nhập URL' }).click();
    await expect(dialog.getByRole('button', { name: 'Nhập URL' })).toHaveAttribute('aria-pressed', 'true');

    await dialog.getByLabel('URL tài liệu').fill('invalid-url');
    await dialog.getByRole('button', { name: 'Gửi đơn' }).click();
    await expect(dialog.getByText('URL tài liệu không hợp lệ')).toBeVisible();
  });

  test('SICK: submit mode URL gửi multipart chứa documentUrl', async ({ page }) => {
    let capturedBody = '';
    let capturedContentType = '';

    await page.route('**/leave-requests', async (route) => {
      const req = route.request();
      if (req.method() !== 'POST') {
        await route.continue();
        return;
      }

      capturedBody = req.postData() || '';
      capturedContentType = req.headers()['content-type'] || '';

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'test-leave-1',
            employee: {
              id: 'emp-1',
              employeeCode: 'EMP-0037',
              fullName: 'E2E User',
            },
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            duration: 1,
            reason: 'Test URL mode',
            isBhxhClaimed: false,
            status: 'PENDING',
            type: 'SICK',
            approverId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    });

    const dialog = await openLeaveDialog(page);

    await dialog.getByLabel('Loại nghỉ').click();
    await page.getByRole('option', { name: 'Nghỉ ốm' }).click();

    await dialog.getByLabel('Ngày bắt đầu').fill('2026-05-12');
    await dialog.getByLabel('Ngày kết thúc').fill('2026-05-13');
    await dialog.getByLabel('Lý do').fill('Nghỉ ốm có URL chứng từ');

    await dialog.getByRole('button', { name: 'Nhập URL' }).click();
    await dialog.getByLabel('URL tài liệu').fill('https://example.com/medical-proof.pdf');

    await dialog.getByRole('button', { name: 'Gửi đơn' }).click();

    await expect(page.getByText('Gửi đơn nghỉ phép thành công')).toBeVisible({ timeout: 10_000 });
    expect(capturedContentType).toContain('multipart/form-data');
    expect(capturedBody).toContain('name="documentUrl"');
    expect(capturedBody).toContain('https://example.com/medical-proof.pdf');
    expect(capturedBody).not.toContain('name="document"');
  });

  test('SICK: submit mode Upload gửi multipart chứa file document', async ({ page }) => {
    let capturedBody = '';

    await page.route('**/leave-requests', async (route) => {
      const req = route.request();
      if (req.method() !== 'POST') {
        await route.continue();
        return;
      }

      capturedBody = req.postData() || '';

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'test-leave-2',
            employee: {
              id: 'emp-1',
              employeeCode: 'EMP-0037',
              fullName: 'E2E User',
            },
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            duration: 1,
            reason: 'Test Upload mode',
            isBhxhClaimed: false,
            status: 'PENDING',
            type: 'SICK',
            approverId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    });

    const dialog = await openLeaveDialog(page);

    await dialog.getByLabel('Loại nghỉ').click();
    await page.getByRole('option', { name: 'Nghỉ ốm' }).click();

    await dialog.getByLabel('Ngày bắt đầu').fill('2026-05-12');
    await dialog.getByLabel('Ngày kết thúc').fill('2026-05-13');
    await dialog.getByLabel('Lý do').fill('Nghỉ ốm có upload chứng từ');

    await dialog.locator('input[type="file"]').setInputFiles({
      name: 'medical-proof.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n%mock pdf file\n'),
    });

    await expect(dialog.getByText('medical-proof.pdf')).toBeVisible();

    await dialog.getByRole('button', { name: 'Gửi đơn' }).click();

    await expect(page.getByText('Gửi đơn nghỉ phép thành công')).toBeVisible({ timeout: 10_000 });
    expect(capturedBody).toContain('name="document"');
    expect(capturedBody).toContain('filename="medical-proof.pdf"');
  });

  test('MATERNITY: endDate tự động +6 tháng và bị khóa', async ({ page }) => {
    const dialog = await openLeaveDialog(page);

    await dialog.getByLabel('Loại nghỉ').click();
    await page.getByRole('option', { name: 'Nghỉ thai sản' }).click();

    const endDateInput = dialog.getByLabel('Ngày kết thúc');
    await expect(endDateInput).toBeDisabled();

    await dialog.getByLabel('Ngày bắt đầu').fill('2026-01-15');
    await expect(endDateInput).toHaveValue('2026-07-15');

    await expect(dialog.getByText('Đơn thai sản tự động tính 6 tháng kể từ ngày bắt đầu')).toBeVisible();
  });

  test('MATERNITY: bắt buộc có hồ sơ (mode URL)', async ({ page }) => {
    const dialog = await openLeaveDialog(page);

    await dialog.getByLabel('Loại nghỉ').click();
    await page.getByRole('option', { name: 'Nghỉ thai sản' }).click();

    await dialog.getByLabel('Ngày bắt đầu').fill('2026-02-01');
    await dialog.getByLabel('Lý do').fill('Nghỉ thai sản theo quy định');

    await dialog.getByRole('button', { name: 'Nhập URL' }).click();
    await dialog.getByRole('button', { name: 'Gửi đơn' }).click();

    await expect(dialog.getByText('Bạn cần nhập URL tài liệu')).toBeVisible();
  });
});
