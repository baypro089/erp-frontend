# Hướng Dẫn ERP Siêu Chi Tiết Theo Chức Năng (54 bước, không tính dashboard)

Tài liệu này được dựng từ flow Playwright chạy trực tiếp trên hệ thống thật, mở rộng thêm nhiều chức năng nghiệp vụ ngoài dashboard.

## 1. Mục tiêu

1. Cung cấp SOP thao tác chi tiết theo từng chức năng lớn.
2. Tăng phạm vi nghiệp vụ thực tế (Admin, Commercial, HR) thay vì chỉ dừng ở điều hướng cơ bản.
3. Mỗi bước có ảnh minh họa, hành động và kỳ vọng rõ ràng.

## 2. Cấu trúc chức năng lớn

1. Chức năng 1: Xác thực và chọn portal.
2. Chức năng 2: Admin - Quản lý người dùng.
3. Chức năng 3: Admin - Quản lý vai trò.
4. Chức năng 4: Admin - Quản lý danh mục.
5. Chức năng 5: Admin - Quản lý sản phẩm và thương hiệu.
6. Chức năng 6: Commercial - Đơn hàng, khách hàng, nhà cung cấp, kho hàng, trả hàng, tồn kho.
7. Chức năng 7: HR - Nhân sự, bảng lương, duyệt nghỉ, nghỉ việc, sa thải.

## 3. Tiền điều kiện

1. Frontend chạy tại http://localhost:4000.
2. Backend/API và database hoạt động bình thường.
3. Tài khoản test có quyền đầy đủ cho cả 3 portal.
4. Có thể override tài khoản qua biến môi trường:
   - E2E_USERNAME
   - E2E_PASSWORD

## 4. Quy trình theo chức năng lớn

## 4.1 Chức năng 1: Xác thực và chọn portal

### Bước 1.1: Đăng nhập thành công
- Hành động: nhập thông tin đăng nhập hợp lệ và bấm Đăng nhập.
- Kỳ vọng: hệ thống rời trang login.

![Step 01](./ui-pages/step-01-login-success.png)

### Bước 1.2: Màn hình chọn portal
- Hành động: quan sát danh sách portal được phân quyền.
- Kỳ vọng: hiển thị đầy đủ portal có thể truy cập.

![Step 02](./ui-pages/step-02-portal-selection.png)

## 4.2 Chức năng 2: Admin - Quản lý người dùng

### Bước 2.1: Mở danh sách người dùng
- Hành động: vào menu Người dùng.
- Kỳ vọng: hiển thị bảng user.

![Step 03](./ui-pages/step-03-admin-users-list.png)

### Bước 2.2: Mở bộ lọc người dùng
- Hành động: bấm Bộ lọc.
- Kỳ vọng: panel filter/search hiển thị.

![Step 04](./ui-pages/step-04-admin-users-filters-open.png)

### Bước 2.3: Lọc theo username
- Hành động: nhập từ khóa vào ô tìm tên đăng nhập.
- Kỳ vọng: danh sách được thu hẹp đúng điều kiện.

![Step 05](./ui-pages/step-05-admin-users-filtered-by-username.png)

### Bước 2.4: Mở form tạo tài khoản
- Hành động: bấm Tạo tài khoản.
- Kỳ vọng: popup Tạo tài khoản mới xuất hiện.

![Step 06](./ui-pages/step-06-admin-users-create-dialog.png)

### Bước 2.5: Đóng form tạo tài khoản
- Hành động: bấm Hủy.
- Kỳ vọng: popup đóng, quay lại danh sách user.

![Step 07](./ui-pages/step-07-admin-users-create-dialog-closed.png)

## 4.3 Chức năng 3: Admin - Quản lý vai trò

### Bước 3.1: Mở danh sách vai trò
- Hành động: vào menu Vai trò.
- Kỳ vọng: hiển thị bảng vai trò hệ thống.

![Step 08](./ui-pages/step-08-admin-roles-list.png)

### Bước 3.2: Mở bộ lọc vai trò
- Hành động: bấm Bộ lọc.
- Kỳ vọng: hiển thị bộ lọc mã/tên/trạng thái vai trò.

![Step 09](./ui-pages/step-09-admin-roles-filters-open.png)

### Bước 3.3: Lọc vai trò theo tên
- Hành động: nhập từ khóa tên vai trò.
- Kỳ vọng: bảng vai trò chỉ còn dữ liệu phù hợp.

![Step 10](./ui-pages/step-10-admin-roles-filtered-by-name.png)

## 4.4 Chức năng 4: Admin - Quản lý danh mục

### Bước 4.1: Mở danh sách danh mục
- Hành động: vào menu Danh mục.
- Kỳ vọng: hiển thị bảng danh mục.

![Step 11](./ui-pages/step-11-admin-categories-list.png)

### Bước 4.2: Tìm danh mục theo tên
- Hành động: nhập từ khóa trong ô Tên danh mục.
- Kỳ vọng: danh sách danh mục lọc đúng từ khóa.

![Step 12](./ui-pages/step-12-admin-categories-search-applied.png)

## 4.5 Chức năng 5: Admin - Quản lý sản phẩm và thương hiệu

### Bước 5.1: Mở danh sách sản phẩm
- Hành động: vào menu Sản phẩm.
- Kỳ vọng: hiển thị bảng sản phẩm.

![Step 13](./ui-pages/step-13-admin-products-list.png)

### Bước 5.2: Mở bộ lọc sản phẩm
- Hành động: bấm Bộ lọc.
- Kỳ vọng: hiển thị vùng lọc sản phẩm.

![Step 14](./ui-pages/step-14-admin-products-filters-open.png)

### Bước 5.3: Lọc sản phẩm theo tên
- Hành động: nhập từ khóa tên sản phẩm.
- Kỳ vọng: bảng sản phẩm lọc theo điều kiện.

![Step 15](./ui-pages/step-15-admin-products-filtered-by-name.png)

### Bước 5.4: Mở danh sách thương hiệu
- Hành động: vào menu Thương hiệu.
- Kỳ vọng: hiển thị bảng thương hiệu.

![Step 16](./ui-pages/step-16-admin-brands-list.png)

### Bước 5.5: Mở form thêm thương hiệu
- Hành động: bấm Thêm thương hiệu.
- Kỳ vọng: popup tạo thương hiệu mở ra.

![Step 17](./ui-pages/step-17-brand-create-dialog.png)

### Bước 5.6: Tạo thương hiệu mới
- Hành động: nhập tên và bấm Tạo mới.
- Kỳ vọng: thương hiệu mới xuất hiện trong bảng.

![Step 18](./ui-pages/step-18-brand-created.png)

### Bước 5.7: Mở form sửa thương hiệu
- Hành động: bấm nút sửa ở dòng vừa tạo.
- Kỳ vọng: popup chỉnh sửa hiển thị dữ liệu hiện tại.

![Step 19](./ui-pages/step-19-brand-edit-dialog.png)

### Bước 5.8: Cập nhật thương hiệu
- Hành động: đổi tên và bấm Cập nhật.
- Kỳ vọng: bảng phản ánh tên mới.

![Step 20](./ui-pages/step-20-brand-updated.png)

### Bước 5.9: Mở xác nhận xóa thương hiệu
- Hành động: bấm Xóa ở dòng vừa cập nhật.
- Kỳ vọng: popup xác nhận xóa hiển thị.

![Step 21](./ui-pages/step-21-brand-delete-confirm.png)

### Bước 5.10: Xóa thương hiệu
- Hành động: xác nhận Xóa.
- Kỳ vọng: bản ghi thương hiệu bị xóa khỏi bảng.

![Step 22](./ui-pages/step-22-brand-deleted.png)

## 4.6 Chức năng 6: Commercial - Vận hành bán hàng và kho

### Bước 6.1: Chọn portal Commercial
- Hành động: đăng nhập và vào trang chọn portal.
- Kỳ vọng: vào được portal Commercial.

![Step 23](./ui-pages/step-23-commercial-portal-selection.png)

### Bước 6.2: Mở danh sách đơn hàng
- Hành động: vào menu Đơn hàng.
- Kỳ vọng: hiển thị bảng orders.

![Step 24](./ui-pages/step-24-commercial-orders.png)

### Bước 6.3: Mở bộ lọc đơn hàng
- Hành động: bấm Bộ lọc.
- Kỳ vọng: panel lọc hiển thị.

![Step 25](./ui-pages/step-25-commercial-orders-filters.png)

### Bước 6.4: Mở dropdown trạng thái đơn
- Hành động: bấm combobox Trạng thái.
- Kỳ vọng: danh sách trạng thái xổ xuống.

![Step 26](./ui-pages/step-26-commercial-orders-status-dropdown.png)

### Bước 6.5: Điều hướng sang Tạo đơn hàng
- Hành động: bấm Tạo đơn hàng.
- Kỳ vọng: vào màn hình /commercial/sales/create.

![Step 27](./ui-pages/step-27-commercial-sales-create-page.png)

### Bước 6.6: Mở danh sách khách hàng
- Hành động: vào menu Khách hàng.
- Kỳ vọng: hiển thị bảng khách hàng.

![Step 28](./ui-pages/step-28-commercial-customers-list.png)

### Bước 6.7: Mở bộ lọc khách hàng
- Hành động: bấm Bộ lọc.
- Kỳ vọng: hiển thị lọc hạng/trạng thái.

![Step 29](./ui-pages/step-29-commercial-customers-filters-open.png)

### Bước 6.8: Tìm kiếm khách hàng
- Hành động: nhập từ khóa tìm tên/số điện thoại/email.
- Kỳ vọng: danh sách khách hàng lọc đúng.

![Step 30](./ui-pages/step-30-commercial-customers-search-applied.png)

### Bước 6.9: Xóa điều kiện tìm kiếm
- Hành động: xóa từ khóa tìm kiếm.
- Kỳ vọng: danh sách quay về trạng thái đầy đủ.

![Step 31](./ui-pages/step-31-commercial-customers-search-cleared.png)

### Bước 6.10: Mở danh sách nhà cung cấp
- Hành động: vào menu Nhà cung cấp.
- Kỳ vọng: hiển thị bảng NCC.

![Step 32](./ui-pages/step-32-commercial-suppliers-list.png)

### Bước 6.11: Mở form thêm NCC
- Hành động: bấm Thêm NCC.
- Kỳ vọng: popup tạo NCC hiển thị.

![Step 33](./ui-pages/step-33-commercial-supplier-create-dialog.png)

### Bước 6.12: Kiểm tra validation bắt buộc NCC
- Hành động: bấm Thêm khi chưa nhập dữ liệu.
- Kỳ vọng: hiển thị lỗi bắt buộc.

![Step 34](./ui-pages/step-34-commercial-supplier-validation-errors.png)

### Bước 6.13: Đóng form NCC
- Hành động: bấm Hủy.
- Kỳ vọng: đóng popup, quay lại danh sách.

![Step 35](./ui-pages/step-35-commercial-supplier-dialog-closed.png)

### Bước 6.14: Mở danh sách kho hàng
- Hành động: vào menu Kho hàng.
- Kỳ vọng: hiển thị bảng kho.

![Step 36](./ui-pages/step-36-commercial-warehouses-list.png)

### Bước 6.15: Mở bộ lọc kho hàng
- Hành động: bấm Bộ lọc.
- Kỳ vọng: hiển thị bộ lọc loại kho/trạng thái.

![Step 37](./ui-pages/step-37-commercial-warehouses-filters-open.png)

### Bước 6.16: Tìm kiếm kho hàng
- Hành động: nhập từ khóa mã/tên kho.
- Kỳ vọng: bảng kho lọc theo điều kiện.

![Step 38](./ui-pages/step-38-commercial-warehouses-search-applied.png)

### Bước 6.17: Mở danh sách trả hàng/bảo hành
- Hành động: vào menu Trả hàng / Bảo hành.
- Kỳ vọng: hiển thị bảng phiếu trả.

![Step 39](./ui-pages/step-39-commercial-returns-list.png)

### Bước 6.18: Mở tổng quan tồn kho
- Hành động: vào Tồn kho > Tổng quan.
- Kỳ vọng: hiển thị màn hình tồn kho tổng quan.

![Step 40](./ui-pages/step-40-commercial-inventory-overview.png)

### Bước 6.19: Mở danh sách sản phẩm trong tồn kho
- Hành động: vào Tồn kho > Sản phẩm.
- Kỳ vọng: hiển thị bảng sản phẩm theo ngữ cảnh Commercial.

![Step 41](./ui-pages/step-41-commercial-inventory-products-list.png)

### Bước 6.20: Mở bộ lọc sản phẩm trong tồn kho
- Hành động: bấm Bộ lọc.
- Kỳ vọng: hiển thị bộ lọc sản phẩm để tra cứu nhanh.

![Step 42](./ui-pages/step-42-commercial-inventory-products-filters-open.png)

## 4.7 Chức năng 7: HR - Nhân sự, bảng lương, nghỉ việc, sa thải

### Bước 7.1: Chọn portal HR
- Hành động: đăng nhập và chọn HR Portal.
- Kỳ vọng: vào được khu vực HR.

![Step 43](./ui-pages/step-43-hr-portal-selection.png)

### Bước 7.2: Mở danh sách nhân viên
- Hành động: vào menu Nhân viên.
- Kỳ vọng: hiển thị bảng nhân sự.

![Step 44](./ui-pages/step-44-hr-employees-list.png)

### Bước 7.3: Mở danh sách bảng lương
- Hành động: vào menu Bảng lương.
- Kỳ vọng: hiển thị danh sách phiếu lương.

![Step 45](./ui-pages/step-45-hr-payroll-list.png)

### Bước 7.4: Mở dialog tính lương hàng loạt
- Hành động: bấm Tính lương tháng này.
- Kỳ vọng: popup Tính lương hàng loạt xuất hiện.

![Step 46](./ui-pages/step-46-hr-payroll-generate-dialog.png)

### Bước 7.5: Mở danh sách chọn tháng lương
- Hành động: bấm combobox Tháng trong popup.
- Kỳ vọng: dropdown tháng hiển thị.

![Step 47](./ui-pages/step-47-hr-payroll-month-options.png)

### Bước 7.6: Đóng dialog tính lương
- Hành động: bấm Hủy.
- Kỳ vọng: popup đóng về màn hình bảng lương.

![Step 48](./ui-pages/step-48-hr-payroll-dialog-closed.png)

### Bước 7.7: Mở trang duyệt đơn nghỉ
- Hành động: vào menu Duyệt đơn nghỉ.
- Kỳ vọng: hiển thị danh sách đơn nghỉ phép.

![Step 49](./ui-pages/step-49-hr-leave-approvals.png)

### Bước 7.8: Chuyển tab Tất cả đơn
- Hành động: bấm tab Tất cả đơn.
- Kỳ vọng: hiển thị toàn bộ đơn theo điều kiện hiện tại.

![Step 50](./ui-pages/step-50-hr-leave-approvals-all-tab.png)

### Bước 7.9: Chuyển tab Chờ duyệt
- Hành động: bấm tab Chờ duyệt.
- Kỳ vọng: hiển thị các đơn đang chờ xử lý.

![Step 51](./ui-pages/step-51-hr-leave-approvals-pending-tab.png)

### Bước 7.10: Mở danh sách đơn nghỉ việc
- Hành động: vào menu Đơn nghỉ việc.
- Kỳ vọng: hiển thị bảng yêu cầu nghỉ việc.

![Step 52](./ui-pages/step-52-hr-resignations-list.png)

### Bước 7.11: Mở danh sách yêu cầu sa thải
- Hành động: vào menu Yêu cầu sa thải.
- Kỳ vọng: hiển thị bảng yêu cầu sa thải.

![Step 53](./ui-pages/step-53-hr-terminations-list.png)

### Bước 7.12: Mở dropdown trạng thái yêu cầu sa thải
- Hành động: mở bộ lọc trạng thái tại trang sa thải.
- Kỳ vọng: dropdown trạng thái hiển thị để lọc dữ liệu.

![Step 54](./ui-pages/step-54-hr-terminations-status-dropdown.png)

## 5. Cách chạy lại để tái tạo tài liệu

### Bước 1: chạy frontend

```bash
npm run export:ui:serve
```

### Bước 2: chạy flow chụp ảnh

Mở terminal khác:

```bash
npx playwright test e2e/guide-flow.spec.ts --config=playwright.export.config.ts
```

### Bước 3: xác nhận kết quả

1. Có đủ ảnh từ step-01 đến step-54 trong mockups/ui-pages.
2. Ảnh step cũ được dọn trước mỗi lần chạy.
3. Tài liệu này bám trực tiếp vào các ảnh vừa tạo.

## 6. Checklist hậu kiểm

1. Không có ảnh bị trắng màn hình hoặc loading treo.
2. Không còn bước dashboard trong danh mục chức năng.
3. Các chức năng mới (Vai trò, Danh mục, Kho hàng, Sa thải) đều có ảnh minh họa.
4. Nếu fail, kiểm tra test-results để xác định đúng step lỗi.
