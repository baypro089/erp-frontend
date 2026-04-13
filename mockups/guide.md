# Hướng Dẫn ERP Siêu Chi Tiết Theo Chức Năng (98 bước, không tính dashboard)

Tài liệu này hướng dẫn thao tác sử dụng hệ thống ERP theo từng chức năng nghiệp vụ, dựa trên flow Playwright chạy trực tiếp trên môi trường thật.

## 1. Mục tiêu

1. Hướng dẫn người dùng thao tác từng bước theo từng nhóm chức năng lớn.
2. Bao quát nghiệp vụ thực tế ở cả 3 portal: Admin, Commercial, HR và Personal.
3. Mỗi bước đều có ảnh minh họa, thao tác thực hiện và kết quả mong đợi rõ ràng.

## 2. Cấu trúc chức năng lớn

1. Chức năng 1: Xác thực và chọn portal.
2. Chức năng 2: Admin - Quản lý người dùng.
3. Chức năng 3: Admin - Quản lý vai trò.
4. Chức năng 4: Admin - Quản lý danh mục.
5. Chức năng 5: Admin - Quản lý sản phẩm và thương hiệu.
6. Chức năng 6: Commercial - Đơn hàng, khách hàng, nhà cung cấp, kho hàng, trả hàng, tồn kho.
7. Chức năng 7: HR - Nhân sự, bảng lương, duyệt nghỉ, nghỉ việc, sa thải.
8. Chức năng 8: Commercial nâng cao - Tạo đơn hàng, xuất kho, nhập kho.
9. Chức năng 9: Admin nâng cao - CRUD sản phẩm.
10. Chức năng 10: Personal Portal - Hồ sơ cá nhân, nghỉ phép, phiếu lương, thôi việc.

## 3. Điều kiện trước khi thực hiện

1. Frontend chạy tại http://localhost:4000.
2. Backend/API và database hoạt động bình thường.
3. Tài khoản test có quyền đầy đủ cho cả 3 portal.
4. Có thể thay đổi tài khoản đăng nhập qua biến môi trường:
   - E2E_USERNAME
   - E2E_PASSWORD

## 4. Hướng dẫn thao tác theo chức năng lớn

## 4.1 Chức năng 1: Xác thực và chọn portal

### Bước 1: Đăng nhập thành công
- Thao tác thực hiện: nhập thông tin đăng nhập hợp lệ và bấm Đăng nhập.
- Kết quả mong đợi: hệ thống rời trang login.

![Hình 3.1. Kết quả bước 1 - Đăng nhập thành công](./ui-pages/step-01-login-success.png)


### Bước 2: Màn hình chọn portal
- Thao tác thực hiện: quan sát danh sách portal được phân quyền.
- Kết quả mong đợi: hiển thị đầy đủ portal có thể truy cập.

![Hình 3.2. Kết quả bước 2 - Màn hình chọn portal](./ui-pages/step-02-portal-selection.png)


## 4.2 Chức năng 2: Admin - Quản lý người dùng

### Bước 1: Mở danh sách người dùng
- Thao tác thực hiện: vào menu Người dùng.
- Kết quả mong đợi: hiển thị bảng user.

![Hình 3.3. Kết quả bước 1 - Mở danh sách người dùng](./ui-pages/step-03-admin-users-list.png)


### Bước 2: Mở bộ lọc người dùng
- Thao tác thực hiện: bấm Bộ lọc.
- Kết quả mong đợi: panel filter/search hiển thị.

![Hình 3.4. Kết quả bước 2 - Mở bộ lọc người dùng](./ui-pages/step-04-admin-users-filters-open.png)


### Bước 3: Lọc theo username
- Thao tác thực hiện: nhập từ khóa vào ô tìm tên đăng nhập.
- Kết quả mong đợi: danh sách được thu hẹp đúng điều kiện.

![Hình 3.5. Kết quả bước 3 - Lọc theo username](./ui-pages/step-05-admin-users-filtered-by-username.png)


### Bước 4: Mở form tạo tài khoản
- Thao tác thực hiện: bấm Tạo tài khoản.
- Kết quả mong đợi: popup Tạo tài khoản mới xuất hiện.

![Hình 3.6. Kết quả bước 4 - Mở form tạo tài khoản](./ui-pages/step-06-admin-users-create-dialog.png)


### Bước 5: Đóng form tạo tài khoản
- Thao tác thực hiện: bấm Hủy.
- Kết quả mong đợi: popup đóng, quay lại danh sách user.

![Hình 3.7. Kết quả bước 5 - Đóng form tạo tài khoản](./ui-pages/step-07-admin-users-create-dialog-closed.png)


## 4.3 Chức năng 3: Admin - Quản lý vai trò

### Bước 1: Mở danh sách vai trò
- Thao tác thực hiện: vào menu Vai trò.
- Kết quả mong đợi: hiển thị bảng vai trò hệ thống.

![Hình 3.8. Kết quả bước 1 - Mở danh sách vai trò](./ui-pages/step-08-admin-roles-list.png)


### Bước 2: Mở bộ lọc vai trò
- Thao tác thực hiện: bấm Bộ lọc.
- Kết quả mong đợi: hiển thị bộ lọc mã/tên/trạng thái vai trò.

![Hình 3.9. Kết quả bước 2 - Mở bộ lọc vai trò](./ui-pages/step-09-admin-roles-filters-open.png)


### Bước 3: Lọc vai trò theo tên
- Thao tác thực hiện: nhập từ khóa tên vai trò.
- Kết quả mong đợi: bảng vai trò chỉ còn dữ liệu phù hợp.

![Hình 3.10. Kết quả bước 3 - Lọc vai trò theo tên](./ui-pages/step-10-admin-roles-filtered-by-name.png)


## 4.4 Chức năng 4: Admin - Quản lý danh mục

### Bước 1: Mở danh sách danh mục
- Thao tác thực hiện: vào menu Danh mục.
- Kết quả mong đợi: hiển thị bảng danh mục.

![Hình 3.11. Kết quả bước 1 - Mở danh sách danh mục](./ui-pages/step-11-admin-categories-list.png)


### Bước 2: Tìm danh mục theo tên
- Thao tác thực hiện: nhập từ khóa trong ô Tên danh mục.
- Kết quả mong đợi: danh sách danh mục lọc đúng từ khóa.

![Hình 3.12. Kết quả bước 2 - Tìm danh mục theo tên](./ui-pages/step-12-admin-categories-search-applied.png)


## 4.5 Chức năng 5: Admin - Quản lý sản phẩm và thương hiệu

### Bước 1: Mở danh sách sản phẩm
- Thao tác thực hiện: vào menu Sản phẩm.
- Kết quả mong đợi: hiển thị bảng sản phẩm.

![Hình 3.13. Kết quả bước 1 - Mở danh sách sản phẩm](./ui-pages/step-13-admin-products-list.png)


### Bước 2: Mở bộ lọc sản phẩm
- Thao tác thực hiện: bấm Bộ lọc.
- Kết quả mong đợi: hiển thị vùng lọc sản phẩm.

![Hình 3.14. Kết quả bước 2 - Mở bộ lọc sản phẩm](./ui-pages/step-14-admin-products-filters-open.png)


### Bước 3: Lọc sản phẩm theo tên
- Thao tác thực hiện: nhập từ khóa tên sản phẩm.
- Kết quả mong đợi: bảng sản phẩm lọc theo điều kiện.

![Hình 3.15. Kết quả bước 3 - Lọc sản phẩm theo tên](./ui-pages/step-15-admin-products-filtered-by-name.png)


### Bước 4: Mở danh sách thương hiệu
- Thao tác thực hiện: vào menu Thương hiệu.
- Kết quả mong đợi: hiển thị bảng thương hiệu.

![Hình 3.16. Kết quả bước 4 - Mở danh sách thương hiệu](./ui-pages/step-16-admin-brands-list.png)


### Bước 5: Mở form thêm thương hiệu
- Thao tác thực hiện: bấm Thêm thương hiệu.
- Kết quả mong đợi: popup tạo thương hiệu mở ra.

![Hình 3.17. Kết quả bước 5 - Mở form thêm thương hiệu](./ui-pages/step-17-brand-create-dialog.png)


### Bước 6: Tạo thương hiệu mới
- Thao tác thực hiện: nhập tên và bấm Tạo mới.
- Kết quả mong đợi: thương hiệu mới xuất hiện trong bảng.

![Hình 3.18. Kết quả bước 6 - Tạo thương hiệu mới](./ui-pages/step-18-brand-created.png)


### Bước 7: Mở form sửa thương hiệu
- Thao tác thực hiện: bấm nút sửa ở dòng vừa tạo.
- Kết quả mong đợi: popup chỉnh sửa hiển thị dữ liệu hiện tại.

![Hình 3.19. Kết quả bước 7 - Mở form sửa thương hiệu](./ui-pages/step-19-brand-edit-dialog.png)


### Bước 8: Cập nhật thương hiệu
- Thao tác thực hiện: đổi tên và bấm Cập nhật.
- Kết quả mong đợi: bảng phản ánh tên mới.

![Hình 3.20. Kết quả bước 8 - Cập nhật thương hiệu](./ui-pages/step-20-brand-updated.png)


### Bước 9: Mở xác nhận xóa thương hiệu
- Thao tác thực hiện: bấm Xóa ở dòng vừa cập nhật.
- Kết quả mong đợi: popup xác nhận xóa hiển thị.

![Hình 3.21. Kết quả bước 9 - Mở xác nhận xóa thương hiệu](./ui-pages/step-21-brand-delete-confirm.png)


### Bước 10: Xóa thương hiệu
- Thao tác thực hiện: xác nhận Xóa.
- Kết quả mong đợi: bản ghi thương hiệu bị xóa khỏi bảng.

![Hình 3.22. Kết quả bước 10 - Xóa thương hiệu](./ui-pages/step-22-brand-deleted.png)


## 4.6 Chức năng 6: Commercial - Vận hành bán hàng và kho

### Bước 1: Chọn portal Commercial
- Thao tác thực hiện: đăng nhập và vào trang chọn portal.
- Kết quả mong đợi: vào được portal Commercial.

![Hình 3.23. Kết quả bước 1 - Chọn portal Commercial](./ui-pages/step-23-commercial-portal-selection.png)


### Bước 2: Mở danh sách đơn hàng
- Thao tác thực hiện: vào menu Đơn hàng.
- Kết quả mong đợi: hiển thị bảng orders.

![Hình 3.24. Kết quả bước 2 - Mở danh sách đơn hàng](./ui-pages/step-24-commercial-orders.png)


### Bước 3: Mở bộ lọc đơn hàng
- Thao tác thực hiện: bấm Bộ lọc.
- Kết quả mong đợi: panel lọc hiển thị.

![Hình 3.25. Kết quả bước 3 - Mở bộ lọc đơn hàng](./ui-pages/step-25-commercial-orders-filters.png)


### Bước 4: Mở dropdown trạng thái đơn
- Thao tác thực hiện: bấm combobox Trạng thái.
- Kết quả mong đợi: danh sách trạng thái xổ xuống.

![Hình 3.26. Kết quả bước 4 - Mở dropdown trạng thái đơn](./ui-pages/step-26-commercial-orders-status-dropdown.png)


### Bước 5: Điều hướng sang Tạo đơn hàng
- Thao tác thực hiện: bấm Tạo đơn hàng.
- Kết quả mong đợi: vào màn hình /commercial/sales/create.

![Hình 3.27. Kết quả bước 5 - Điều hướng sang Tạo đơn hàng](./ui-pages/step-27-commercial-sales-create-page.png)


### Bước 6: Mở danh sách khách hàng
- Thao tác thực hiện: vào menu Khách hàng.
- Kết quả mong đợi: hiển thị bảng khách hàng.

![Hình 3.28. Kết quả bước 6 - Mở danh sách khách hàng](./ui-pages/step-28-commercial-customers-list.png)


### Bước 7: Mở bộ lọc khách hàng
- Thao tác thực hiện: bấm Bộ lọc.
- Kết quả mong đợi: hiển thị lọc hạng/trạng thái.

![Hình 3.29. Kết quả bước 7 - Mở bộ lọc khách hàng](./ui-pages/step-29-commercial-customers-filters-open.png)


### Bước 8: Tìm kiếm khách hàng
- Thao tác thực hiện: nhập từ khóa tìm tên/số điện thoại/email.
- Kết quả mong đợi: danh sách khách hàng lọc đúng.

![Hình 3.30. Kết quả bước 8 - Tìm kiếm khách hàng](./ui-pages/step-30-commercial-customers-search-applied.png)


### Bước 9: Xóa điều kiện tìm kiếm
- Thao tác thực hiện: xóa từ khóa tìm kiếm.
- Kết quả mong đợi: danh sách quay về trạng thái đầy đủ.

![Hình 3.31. Kết quả bước 9 - Xóa điều kiện tìm kiếm](./ui-pages/step-31-commercial-customers-search-cleared.png)


### Bước 10: Mở danh sách nhà cung cấp
- Thao tác thực hiện: vào menu Nhà cung cấp.
- Kết quả mong đợi: hiển thị bảng NCC.

![Hình 3.32. Kết quả bước 10 - Mở danh sách nhà cung cấp](./ui-pages/step-32-commercial-suppliers-list.png)


### Bước 11: Mở form thêm NCC
- Thao tác thực hiện: bấm Thêm NCC.
- Kết quả mong đợi: popup tạo NCC hiển thị.

![Hình 3.33. Kết quả bước 11 - Mở form thêm NCC](./ui-pages/step-33-commercial-supplier-create-dialog.png)


### Bước 12: Kiểm tra validation bắt buộc NCC
- Thao tác thực hiện: bấm Thêm khi chưa nhập dữ liệu.
- Kết quả mong đợi: hiển thị lỗi bắt buộc.

![Hình 3.34. Kết quả bước 12 - Kiểm tra validation bắt buộc NCC](./ui-pages/step-34-commercial-supplier-validation-errors.png)


### Bước 13: Đóng form NCC
- Thao tác thực hiện: bấm Hủy.
- Kết quả mong đợi: đóng popup, quay lại danh sách.

![Hình 3.35. Kết quả bước 13 - Đóng form NCC](./ui-pages/step-35-commercial-supplier-dialog-closed.png)


### Bước 14: Mở danh sách kho hàng
- Thao tác thực hiện: vào menu Kho hàng.
- Kết quả mong đợi: hiển thị bảng kho.

![Hình 3.36. Kết quả bước 14 - Mở danh sách kho hàng](./ui-pages/step-36-commercial-warehouses-list.png)


### Bước 15: Mở bộ lọc kho hàng
- Thao tác thực hiện: bấm Bộ lọc.
- Kết quả mong đợi: hiển thị bộ lọc loại kho/trạng thái.

![Hình 3.37. Kết quả bước 15 - Mở bộ lọc kho hàng](./ui-pages/step-37-commercial-warehouses-filters-open.png)


### Bước 16: Tìm kiếm kho hàng
- Thao tác thực hiện: nhập từ khóa mã/tên kho.
- Kết quả mong đợi: bảng kho lọc theo điều kiện.

![Hình 3.38. Kết quả bước 16 - Tìm kiếm kho hàng](./ui-pages/step-38-commercial-warehouses-search-applied.png)


### Bước 17: Mở danh sách trả hàng/bảo hành
- Thao tác thực hiện: vào menu Trả hàng / Bảo hành.
- Kết quả mong đợi: hiển thị bảng phiếu trả.

![Hình 3.39. Kết quả bước 17 - Mở danh sách trả hàng/bảo hành](./ui-pages/step-39-commercial-returns-list.png)


### Bước 18: Mở tổng quan tồn kho
- Thao tác thực hiện: vào Tồn kho > Tổng quan.
- Kết quả mong đợi: hiển thị màn hình tồn kho tổng quan.

![Hình 3.40. Kết quả bước 18 - Mở tổng quan tồn kho](./ui-pages/step-40-commercial-inventory-overview.png)


### Bước 19: Mở danh sách sản phẩm trong tồn kho
- Thao tác thực hiện: vào Tồn kho > Sản phẩm.
- Kết quả mong đợi: hiển thị bảng sản phẩm theo ngữ cảnh Commercial.

![Hình 3.41. Kết quả bước 19 - Mở danh sách sản phẩm trong tồn kho](./ui-pages/step-41-commercial-inventory-products-list.png)


### Bước 20: Mở bộ lọc sản phẩm trong tồn kho
- Thao tác thực hiện: bấm Bộ lọc.
- Kết quả mong đợi: hiển thị bộ lọc sản phẩm để tra cứu nhanh.

![Hình 3.42. Kết quả bước 20 - Mở bộ lọc sản phẩm trong tồn kho](./ui-pages/step-42-commercial-inventory-products-filters-open.png)


## 4.7 Chức năng 7: HR - Nhân sự, bảng lương, nghỉ việc, sa thải

### Bước 1: Chọn portal HR
- Thao tác thực hiện: đăng nhập và chọn HR Portal.
- Kết quả mong đợi: vào được khu vực HR.

![Hình 3.43. Kết quả bước 1 - Chọn portal HR](./ui-pages/step-43-hr-portal-selection.png)


### Bước 2: Mở danh sách nhân viên
- Thao tác thực hiện: vào menu Nhân viên.
- Kết quả mong đợi: hiển thị bảng nhân sự.

![Hình 3.44. Kết quả bước 2 - Mở danh sách nhân viên](./ui-pages/step-44-hr-employees-list.png)


### Bước 3: Mở danh sách bảng lương
- Thao tác thực hiện: vào menu Bảng lương.
- Kết quả mong đợi: hiển thị danh sách phiếu lương.

![Hình 3.45. Kết quả bước 3 - Mở danh sách bảng lương](./ui-pages/step-45-hr-payroll-list.png)


### Bước 4: Mở dialog tính lương hàng loạt
- Thao tác thực hiện: bấm Tính lương tháng này.
- Kết quả mong đợi: popup Tính lương hàng loạt xuất hiện.

![Hình 3.46. Kết quả bước 4 - Mở dialog tính lương hàng loạt](./ui-pages/step-46-hr-payroll-generate-dialog.png)


### Bước 5: Mở danh sách chọn tháng lương
- Thao tác thực hiện: bấm combobox Tháng trong popup.
- Kết quả mong đợi: dropdown tháng hiển thị.

![Hình 3.47. Kết quả bước 5 - Mở danh sách chọn tháng lương](./ui-pages/step-47-hr-payroll-month-options.png)


### Bước 6: Đóng dialog tính lương
- Thao tác thực hiện: bấm Hủy.
- Kết quả mong đợi: popup đóng về màn hình bảng lương.

![Hình 3.48. Kết quả bước 6 - Đóng dialog tính lương](./ui-pages/step-48-hr-payroll-dialog-closed.png)


### Bước 7: Mở trang duyệt đơn nghỉ
- Thao tác thực hiện: vào menu Duyệt đơn nghỉ.
- Kết quả mong đợi: hiển thị danh sách đơn nghỉ phép.

![Hình 3.49. Kết quả bước 7 - Mở trang duyệt đơn nghỉ](./ui-pages/step-49-hr-leave-approvals.png)


### Bước 8: Chuyển tab Tất cả đơn
- Thao tác thực hiện: bấm tab Tất cả đơn.
- Kết quả mong đợi: hiển thị toàn bộ đơn theo điều kiện hiện tại.

![Hình 3.50. Kết quả bước 8 - Chuyển tab Tất cả đơn](./ui-pages/step-50-hr-leave-approvals-all-tab.png)


### Bước 9: Chuyển tab Chờ duyệt
- Thao tác thực hiện: bấm tab Chờ duyệt.
- Kết quả mong đợi: hiển thị các đơn đang chờ xử lý.

![Hình 3.51. Kết quả bước 9 - Chuyển tab Chờ duyệt](./ui-pages/step-51-hr-leave-approvals-pending-tab.png)


### Bước 10: Mở danh sách đơn nghỉ việc
- Thao tác thực hiện: vào menu Đơn nghỉ việc.
- Kết quả mong đợi: hiển thị bảng yêu cầu nghỉ việc.

![Hình 3.52. Kết quả bước 10 - Mở danh sách đơn nghỉ việc](./ui-pages/step-52-hr-resignations-list.png)


### Bước 11: Mở danh sách yêu cầu sa thải
- Thao tác thực hiện: vào menu Yêu cầu sa thải.
- Kết quả mong đợi: hiển thị bảng yêu cầu sa thải.

![Hình 3.53. Kết quả bước 11 - Mở danh sách yêu cầu sa thải](./ui-pages/step-53-hr-terminations-list.png)


### Bước 12: Mở dropdown trạng thái yêu cầu sa thải
- Thao tác thực hiện: mở bộ lọc trạng thái tại trang sa thải.
- Kết quả mong đợi: dropdown trạng thái hiển thị để lọc dữ liệu.

![Hình 3.54. Kết quả bước 12 - Mở dropdown trạng thái yêu cầu sa thải](./ui-pages/step-54-hr-terminations-status-dropdown.png)


## 4.8 Chức năng 8: Commercial nâng cao - Tạo đơn hàng, xuất kho, nhập kho

### Bước 1: Mở trang tạo đơn hàng
- Thao tác thực hiện: truy cập trực tiếp màn hình tạo đơn hàng Commercial.
- Kết quả mong đợi: hiển thị giao diện tạo đơn đầy đủ.

![Hình 3.55. Kết quả bước 1 - Mở trang tạo đơn hàng](./ui-pages/step-55-commercial-sales-create-open.png)


### Bước 2: Mở dropdown kho hiển thị sản phẩm
- Thao tác thực hiện: bấm combobox kho hiển thị sản phẩm.
- Kết quả mong đợi: danh sách kho hiển thị để chọn.

![Hình 3.56. Kết quả bước 2 - Mở dropdown kho hiển thị sản phẩm](./ui-pages/step-56-commercial-sales-create-warehouse-dropdown.png)


### Bước 3: Tìm sản phẩm theo từ khóa
- Thao tác thực hiện: nhập từ khóa vào ô tìm sản phẩm.
- Kết quả mong đợi: danh sách sản phẩm được lọc.

![Hình 3.57. Kết quả bước 3 - Tìm sản phẩm theo từ khóa](./ui-pages/step-57-commercial-sales-create-product-search.png)


### Bước 4: Thêm sản phẩm vào giỏ
- Thao tác thực hiện: chọn một thẻ sản phẩm từ danh sách.
- Kết quả mong đợi: sản phẩm được đưa vào giỏ hàng.

![Hình 3.58. Kết quả bước 4 - Thêm sản phẩm vào giỏ](./ui-pages/step-58-commercial-sales-create-product-added-to-cart.png)


### Bước 5: Tìm khách hàng theo số điện thoại
- Thao tác thực hiện: nhập số điện thoại và bấm tìm.
- Kết quả mong đợi: hệ thống thực hiện tra cứu khách hàng.

![Hình 3.59. Kết quả bước 5 - Tìm khách hàng theo số điện thoại](./ui-pages/step-59-commercial-sales-create-customer-search.png)


### Bước 6: Nhập chiết khấu và ghi chú đơn
- Thao tác thực hiện: điền chiết khấu và ghi chú đơn hàng.
- Kết quả mong đợi: thông tin đơn hàng được cập nhật trên form.

![Hình 3.60. Kết quả bước 6 - Nhập chiết khấu và ghi chú đơn](./ui-pages/step-60-commercial-sales-create-discount-note.png)


### Bước 7: Sẵn sàng gửi tạo đơn hàng
- Thao tác thực hiện: kiểm tra trạng thái nút Tạo đơn hàng.
- Kết quả mong đợi: form sẵn sàng cho thao tác tạo đơn.

![Hình 3.61. Kết quả bước 7 - Sẵn sàng gửi tạo đơn hàng](./ui-pages/step-61-commercial-sales-create-submit.png)


### Bước 8: Quay về danh sách đơn sau tạo
- Thao tác thực hiện: tạo đơn và điều hướng về trang đơn hàng.
- Kết quả mong đợi: danh sách đơn hàng được hiển thị.

![Hình 3.62. Kết quả bước 8 - Quay về danh sách đơn sau tạo](./ui-pages/step-62-commercial-orders-post-create.png)


### Bước 9: Mở chi tiết đơn hàng
- Thao tác thực hiện: chọn đơn hàng từ danh sách.
- Kết quả mong đợi: màn hình chi tiết đơn hàng mở thành công.

![Hình 3.63. Kết quả bước 9 - Mở chi tiết đơn hàng](./ui-pages/step-63-commercial-order-detail-open.png)


### Bước 10: Điều hướng sang nghiệp vụ xuất kho
- Thao tác thực hiện: bấm Đi xuất kho từ chi tiết đơn.
- Kết quả mong đợi: chuyển sang module xử lý xuất kho.

![Hình 3.64. Kết quả bước 10 - Điều hướng sang nghiệp vụ xuất kho](./ui-pages/step-64-commercial-order-detail-go-fulfillment.png)


### Bước 11: Xem danh sách đơn chờ xuất
- Thao tác thực hiện: mở trang fulfillment.
- Kết quả mong đợi: hiển thị danh sách đơn chờ xử lý xuất kho.

![Hình 3.65. Kết quả bước 11 - Xem danh sách đơn chờ xuất](./ui-pages/step-65-commercial-fulfillment-pending-list.png)


### Bước 12: Mở dialog xuất hàng
- Thao tác thực hiện: bấm Xuất hàng.
- Kết quả mong đợi: popup xuất kho hiển thị.

![Hình 3.66. Kết quả bước 12 - Mở dialog xuất hàng](./ui-pages/step-66-commercial-fulfillment-open-dialog.png)


### Bước 13: Chọn kho xuất hàng trong dialog
- Thao tác thực hiện: mở combobox kho và chọn kho.
- Kết quả mong đợi: kho xuất hàng được gán cho phiếu xuất.

![Hình 3.67. Kết quả bước 13 - Chọn kho xuất hàng trong dialog](./ui-pages/step-67-commercial-fulfillment-warehouse-selected.png)


### Bước 14: Xác nhận item xuất kho
- Thao tác thực hiện: quét serial hoặc tick xác nhận item.
- Kết quả mong đợi: item được đánh dấu đủ điều kiện xuất.

![Hình 3.68. Kết quả bước 14 - Xác nhận item xuất kho](./ui-pages/step-68-commercial-fulfillment-item-confirmation.png)


### Bước 15: Kiểm tra trạng thái sau xác nhận xuất kho
- Thao tác thực hiện: bấm xác nhận xuất kho.
- Kết quả mong đợi: hệ thống phản hồi trạng thái sau xử lý.

![Hình 3.69. Kết quả bước 15 - Kiểm tra trạng thái sau xác nhận xuất kho](./ui-pages/step-69-commercial-fulfillment-post-check.png)


### Bước 16: Mở danh sách phiếu nhập kho
- Thao tác thực hiện: vào module nhập kho.
- Kết quả mong đợi: hiển thị bảng phiếu nhập hiện có.

![Hình 3.70. Kết quả bước 16 - Mở danh sách phiếu nhập kho](./ui-pages/step-70-commercial-imports-list.png)


### Bước 17: Mở trang tạo phiếu nhập
- Thao tác thực hiện: bấm Tạo phiếu nhập.
- Kết quả mong đợi: vào màn hình tạo phiếu nhập kho.

![Hình 3.71. Kết quả bước 17 - Mở trang tạo phiếu nhập](./ui-pages/step-71-commercial-import-create-page.png)


### Bước 18: Điền thông tin đầu phiếu nhập
- Thao tác thực hiện: chọn kho và thao tác trường nhà cung cấp.
- Kết quả mong đợi: phần header phiếu nhập có dữ liệu.

![Hình 3.72. Kết quả bước 18 - Điền thông tin đầu phiếu nhập](./ui-pages/step-72-commercial-import-header-filled.png)


### Bước 19: Thêm dòng sản phẩm nhập
- Thao tác thực hiện: bấm Thêm sản phẩm.
- Kết quả mong đợi: xuất hiện dòng item mới để khai báo.

![Hình 3.73. Kết quả bước 19 - Thêm dòng sản phẩm nhập](./ui-pages/step-73-commercial-import-add-item-row.png)


### Bước 20: Mở dialog chọn sản phẩm nhập
- Thao tác thực hiện: bấm vào trường chọn sản phẩm.
- Kết quả mong đợi: popup chọn sản phẩm hiển thị.

![Hình 3.74. Kết quả bước 20 - Mở dialog chọn sản phẩm nhập](./ui-pages/step-74-commercial-import-product-select-dialog.png)


### Bước 21: Điền giá và số lượng nhập
- Thao tác thực hiện: nhập đơn giá và số lượng cho item.
- Kết quả mong đợi: dòng sản phẩm đủ dữ liệu để lưu.

![Hình 3.75. Kết quả bước 21 - Điền giá và số lượng nhập](./ui-pages/step-75-commercial-import-item-filled.png)


### Bước 22: Thử lưu và nhập kho
- Thao tác thực hiện: bấm Lưu và Nhập kho.
- Kết quả mong đợi: hệ thống tiếp nhận thao tác lưu phiếu nhập.

![Hình 3.76. Kết quả bước 22 - Thử lưu và nhập kho](./ui-pages/step-76-commercial-import-submit-attempt.png)


## 4.9 Chức năng 9: Admin nâng cao - CRUD sản phẩm

### Bước 1: Mở danh sách sản phẩm cho CRUD
- Thao tác thực hiện: vào trang quản lý sản phẩm Admin.
- Kết quả mong đợi: hiển thị bảng sản phẩm để thao tác CRUD.

![Hình 3.77. Kết quả bước 1 - Mở danh sách sản phẩm cho CRUD](./ui-pages/step-77-admin-products-list-crud.png)


### Bước 2: Mở trang tạo sản phẩm
- Thao tác thực hiện: bấm Thêm sản phẩm.
- Kết quả mong đợi: điều hướng tới form tạo sản phẩm.

![Hình 3.78. Kết quả bước 2 - Mở trang tạo sản phẩm](./ui-pages/step-78-admin-products-create-page.png)


### Bước 3: Điền thông tin cơ bản sản phẩm
- Thao tác thực hiện: nhập tên sản phẩm mới.
- Kết quả mong đợi: trường thông tin cơ bản đã có dữ liệu.

![Hình 3.79. Kết quả bước 3 - Điền thông tin cơ bản sản phẩm](./ui-pages/step-79-admin-products-create-form-filled-basic.png)


### Bước 4: Kiểm tra validation khi thiếu dữ liệu bắt buộc
- Thao tác thực hiện: bấm Tạo sản phẩm khi chưa điền đủ.
- Kết quả mong đợi: hiển thị lỗi validation bắt buộc.

![Hình 3.80. Kết quả bước 4 - Kiểm tra validation khi thiếu dữ liệu bắt buộc](./ui-pages/step-80-admin-products-create-validation-errors.png)


### Bước 5: Bổ sung đủ trường bắt buộc
- Thao tác thực hiện: chọn thương hiệu, danh mục và giá bán lẻ.
- Kết quả mong đợi: form đạt điều kiện tạo sản phẩm.

![Hình 3.81. Kết quả bước 5 - Bổ sung đủ trường bắt buộc](./ui-pages/step-81-admin-products-create-filled-required.png)


### Bước 6: Xác nhận sản phẩm đã tạo trong danh sách
- Thao tác thực hiện: tạo sản phẩm và quay về bảng.
- Kết quả mong đợi: bản ghi sản phẩm mới xuất hiện.

![Hình 3.82. Kết quả bước 6 - Xác nhận sản phẩm đã tạo trong danh sách](./ui-pages/step-82-admin-products-created-list.png)


### Bước 7: Mở trang chỉnh sửa sản phẩm
- Thao tác thực hiện: tìm sản phẩm vừa tạo và bấm Sửa.
- Kết quả mong đợi: mở form edit của sản phẩm đó.

![Hình 3.83. Kết quả bước 7 - Mở trang chỉnh sửa sản phẩm](./ui-pages/step-83-admin-products-edit-page.png)


### Bước 8: Cập nhật thông tin sản phẩm
- Thao tác thực hiện: chỉnh sửa giá bán lẻ và lưu.
- Kết quả mong đợi: danh sách phản ánh dữ liệu đã cập nhật.

![Hình 3.84. Kết quả bước 8 - Cập nhật thông tin sản phẩm](./ui-pages/step-84-admin-products-updated.png)


### Bước 9: Mở xác nhận xóa sản phẩm
- Thao tác thực hiện: chọn sản phẩm và bấm Xóa.
- Kết quả mong đợi: popup xác nhận xóa hiển thị.

![Hình 3.85. Kết quả bước 9 - Mở xác nhận xóa sản phẩm](./ui-pages/step-85-admin-products-delete-confirm.png)


### Bước 10: Xóa sản phẩm khỏi danh sách
- Thao tác thực hiện: xác nhận xóa trên popup.
- Kết quả mong đợi: sản phẩm không còn trong danh sách.

![Hình 3.86. Kết quả bước 10 - Xóa sản phẩm khỏi danh sách](./ui-pages/step-86-admin-products-deleted.png)


## 4.10 Chức năng 10: Personal Portal - Hồ sơ cá nhân, nghỉ phép, phiếu lương, thôi việc

### Bước 1: Mở trang chủ Personal Portal
- Thao tác thực hiện: truy cập portal cá nhân.
- Kết quả mong đợi: hiển thị màn hình tổng quan cá nhân.

![Hình 3.87. Kết quả bước 1 - Mở trang chủ Personal Portal](./ui-pages/step-87-personal-home-page.png)


### Bước 2: Quan sát các thẻ thông tin nhanh
- Thao tác thực hiện: kiểm tra khu vực card thông tin.
- Kết quả mong đợi: card hiển thị đúng ngữ cảnh người dùng.

![Hình 3.88. Kết quả bước 2 - Quan sát các thẻ thông tin nhanh](./ui-pages/step-88-personal-home-cards.png)


### Bước 3: Mở trang hồ sơ cá nhân
- Thao tác thực hiện: vào mục Hồ sơ.
- Kết quả mong đợi: hiển thị thông tin hồ sơ người dùng.

![Hình 3.89. Kết quả bước 3 - Mở trang hồ sơ cá nhân](./ui-pages/step-89-personal-profile-page.png)


### Bước 4: Mở trang nghỉ phép của tôi
- Thao tác thực hiện: vào mục Nghỉ phép của tôi.
- Kết quả mong đợi: hiển thị danh sách đơn nghỉ phép cá nhân.

![Hình 3.90. Kết quả bước 4 - Mở trang nghỉ phép của tôi](./ui-pages/step-90-personal-my-leaves-page.png)


### Bước 5: Mở dialog xin nghỉ phép
- Thao tác thực hiện: bấm Xin nghỉ phép.
- Kết quả mong đợi: popup tạo đơn nghỉ phép xuất hiện.

![Hình 3.91. Kết quả bước 5 - Mở dialog xin nghỉ phép](./ui-pages/step-91-personal-leave-request-dialog.png)


### Bước 6: Kiểm tra validation đơn nghỉ phép
- Thao tác thực hiện: gửi đơn khi chưa nhập đủ dữ liệu.
- Kết quả mong đợi: hiển thị lỗi bắt buộc trên form.

![Hình 3.92. Kết quả bước 6 - Kiểm tra validation đơn nghỉ phép](./ui-pages/step-92-personal-leave-request-validation-errors.png)


### Bước 7: Mở trang phiếu lương của tôi
- Thao tác thực hiện: truy cập mục Phiếu lương.
- Kết quả mong đợi: hiển thị danh sách phiếu lương cá nhân.

![Hình 3.93. Kết quả bước 7 - Mở trang phiếu lương của tôi](./ui-pages/step-93-personal-payslips-page.png)


### Bước 8: Mở bộ lọc phiếu lương theo tháng
- Thao tác thực hiện: bấm combobox Tháng.
- Kết quả mong đợi: bộ lọc tháng được mở để chọn.

![Hình 3.94. Kết quả bước 8 - Mở bộ lọc phiếu lương theo tháng](./ui-pages/step-94-personal-payslips-filters.png)


### Bước 9: Mở trang đơn xin thôi việc
- Thao tác thực hiện: vào mục Đơn xin thôi việc.
- Kết quả mong đợi: hiển thị danh sách đơn thôi việc của cá nhân.

![Hình 3.95. Kết quả bước 9 - Mở trang đơn xin thôi việc](./ui-pages/step-95-personal-resignation-page.png)


### Bước 10: Mở form tạo đơn xin thôi việc
- Thao tác thực hiện: bấm Tạo đơn xin thôi việc.
- Kết quả mong đợi: popup tạo đơn thôi việc xuất hiện.

![Hình 3.96. Kết quả bước 10 - Mở form tạo đơn xin thôi việc](./ui-pages/step-96-personal-resignation-form-dialog.png)


### Bước 11: Kiểm tra validation đơn thôi việc
- Thao tác thực hiện: gửi đơn khi thiếu dữ liệu bắt buộc.
- Kết quả mong đợi: hệ thống hiển thị lỗi validation.

![Hình 3.97. Kết quả bước 11 - Kiểm tra validation đơn thôi việc](./ui-pages/step-97-personal-resignation-form-validation.png)


### Bước 12: Đóng form đơn thôi việc
- Thao tác thực hiện: bấm Hủy trên dialog.
- Kết quả mong đợi: dialog đóng và quay lại màn hình danh sách.

![Hình 3.98. Kết quả bước 12 - Đóng form đơn thôi việc](./ui-pages/step-98-personal-resignation-form-closed.png)


## 5. Hướng dẫn chạy lại để tái tạo tài liệu

### Bước 1: chạy frontend

```bash
npm run export:ui:serve
```

### Bước 2: chạy flow chụp ảnh

Mở terminal khác:

```bash
npx playwright test e2e/guide-flow.spec.ts --config=playwright.export.config.ts
```

### Bước 3: kiểm tra kết quả

1. Có đủ ảnh từ step-01 đến step-98 trong mockups/ui-pages.
2. Ảnh step cũ được dọn trước mỗi lần chạy.
3. Tài liệu này bám trực tiếp vào các ảnh vừa tạo.

## 6. Kiểm tra sau khi thực hiện

1. Đảm bảo không có ảnh bị trắng màn hình hoặc bị treo loading.
2. Đảm bảo tài liệu không còn bước dashboard trong danh mục chức năng.
3. Đảm bảo các chức năng mở rộng (Fulfillment, Nhập kho, CRUD sản phẩm nâng cao, Personal Portal) đều có ảnh minh họa.
4. Nếu có lỗi, kiểm tra thư mục test-results để xác định đúng bước bị fail.
