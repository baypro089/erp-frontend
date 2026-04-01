# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG HỆ THỐNG ERP

## 1. Mục đích và phạm vi

Tài liệu hướng dẫn người dùng cuối thao tác trên hệ thống ERP theo đúng vai trò.
Phạm vi bao gồm các portal:
- Admin
- Commercial
- HR
- Personal Page

Sơ đồ chức năng tổng quát:

![Sơ đồ chức năng hệ thống](../../BFD.png)

## 2. Đối tượng sử dụng

- Quản trị hệ thống (Admin).
- Nhân sự/tiền lương (HR).
- Kinh doanh, kho vận (Commercial).
- Nhân viên nội bộ (Personal Page).

## 3. Điều kiện trước khi sử dụng

1. Có tài khoản hợp lệ.
2. Được gán đúng vai trò và quyền.
3. Truy cập đúng địa chỉ frontend.
4. Trình duyệt đề xuất: Chrome/Edge phiên bản mới.

## 4. Quy trình đăng nhập và chọn cổng làm việc

### 4.1. Đăng nhập

Bước thực hiện:
1. Mở trang `/auth/login`.
2. Nhập tên đăng nhập và mật khẩu.
3. Bấm nút đăng nhập.

Kết quả:
- Thành công: chuyển qua màn hình chọn portal.
- Thất bại: hiển thị thông báo lỗi thông tin đăng nhập.

### 4.2. Chọn portal

Bước thực hiện:
1. Truy cập trang `/portal-selection` (sau đăng nhập).
2. Chọn portal theo công việc.
3. Hệ thống điều hướng đến trang chính của portal.

Lưu ý:
- Nếu không có quyền, portal sẽ không hiển thị hoặc bị chặn truy cập.

## 5. Hướng dẫn sử dụng theo portal

## 5.1. Portal Admin

Các phân hệ chính:
- Users: `/admin/users`
- Roles: `/admin/roles`
- Categories: `/admin/categories`
- Brands: `/admin/brands`
- Departments: `/admin/departments`
- Positions: `/admin/positions`
- Holidays: `/admin/holidays`
- Products: `/admin/products`
- Settings: `/admin/settings`

### 5.1.1. Quản lý thương hiệu (Brands)

Mục tiêu: thêm, sửa thông tin thương hiệu.

Các bước:
1. Vào `/admin/brands`.
2. Bấm `Thêm mới`.
3. Nhập tên thương hiệu.
4. Bấm `Lưu`.
5. Kiểm tra bản ghi mới hiển thị trên danh sách.

Tình huống lỗi thường gặp:
- Trùng tên thương hiệu: hệ thống báo lỗi validate.
- Thiếu dữ liệu bắt buộc: không cho lưu.

### 5.1.2. Quản lý sản phẩm (Products)

Các màn hình:
- Danh sách: `/admin/products`
- Tạo mới: `/admin/products/create`
- Chi tiết: `/admin/products/[id]`
- Chỉnh sửa: `/admin/products/[id]/edit`

Quy trình tạo sản phẩm:
1. Vào màn hình tạo mới.
2. Nhập SKU, tên, category, brand, giá bán.
3. Bổ sung thông số kỹ thuật và ảnh (nếu có).
4. Lưu và kiểm tra tại danh sách sản phẩm.

## 5.2. Portal Commercial

Các phân hệ chính:
- Orders: `/commercial/orders`
- Inventory: `/commercial/inventory`
- Customers: `/commercial/customers`
- Suppliers: `/commercial/suppliers`
- Warehouses: `/commercial/warehouses`
- Returns: `/commercial/returns`
- Sales create: `/commercial/sales/create`
- Reports: `/commercial/reports/sales`, `/commercial/reports/inventory`, `/commercial/reports/customers`

### 5.2.1. Quản lý khách hàng (Customers)

Các bước:
1. Vào `/commercial/customers`.
2. Bấm `Thêm mới`.
3. Nhập thông tin khách hàng (bắt buộc).
4. Bấm `Lưu`.

Validate nghiệp vụ:
- Số điện thoại sai định dạng: hệ thống từ chối.
- Thiếu trường bắt buộc: hệ thống báo lỗi.

### 5.2.2. Xử lý đơn hàng (Orders)

Các bước:
1. Vào `/commercial/orders`.
2. Dùng bộ lọc trạng thái để tìm đơn hàng.
3. Chọn 1 đơn để xem chi tiết tại `/commercial/orders/[id]`.
4. Tạo đơn mới qua `/commercial/sales/create`.

Lưu ý:
- Luôn kiểm tra trạng thái đơn trước khi thao tác tiếp (giao hàng/thanh toán/hủy).

### 5.2.3. Quản lý kho (Inventory)

Các màn hình quan trọng:
- Tổng quan kho: `/commercial/inventory`
- Sản phẩm kho: `/commercial/inventory/products`
- Nhập kho: `/commercial/inventory/imports`
- Theo dõi tồn kho: `/commercial/inventory/tracking`

Quy trình nhập kho cơ bản:
1. Tạo phiếu nhập.
2. Chọn nhà cung cấp và danh sách hàng.
3. Xác nhận số lượng thực nhận.
4. Hoàn tất phiếu, hệ thống cập nhật tồn kho.

### 5.2.4. Quản lý trả hàng (Returns)

Các màn hình:
- Danh sách: `/commercial/returns`
- Khởi tạo: `/commercial/returns/initiate`
- Tạo yêu cầu: `/commercial/returns/create`
- Chi tiết: `/commercial/returns/[id]`

Quy trình:
1. Tiếp nhận yêu cầu trả hàng.
2. Kiểm tra điều kiện đổi/trả.
3. Tạo phiếu trả hàng.
4. Xử lý hoàn tiền/bù trừ theo quy định.

## 5.3. Portal HR

Các phân hệ chính:
- Employees: `/hr/employees`
- Departments: `/hr/departments`
- Positions: `/hr/positions`
- Payroll: `/hr/payroll`
- Leave Approvals: `/hr/leave-approvals`
- Resignations: `/hr/resignations`
- Reports: `/hr/reports`

### 5.3.1. Quản lý nhân sự (Employees)

Các bước:
1. Vào `/hr/employees`.
2. Tìm nhân sự bằng bộ lọc/mã nhân viên.
3. Mở chi tiết tại `/hr/employees/[id]`.
4. Cập nhật thông tin theo quyền được cấp.

### 5.3.2. Duyệt nghỉ phép (Leave Approvals)

Các bước:
1. Vào `/hr/leave-approvals`.
2. Chọn tab `Chờ duyệt`.
3. Mở chi tiết đơn.
4. Chọn `Duyệt` hoặc `Từ chối`.
5. Nếu từ chối, nhập lý do bắt buộc.

### 5.3.3. Tính lương (Payroll)

Các bước:
1. Vào `/hr/payroll`.
2. Chọn kỳ lương.
3. Bấm `Tính lương`.
4. Xác nhận chạy tính lương hàng loạt.
5. Kiểm tra kết quả danh sách phiếu lương.

## 5.4. Portal Personal Page

Các phân hệ cá nhân:
- Hồ sơ cá nhân: `/personal-page/profile`
- Đơn nghỉ phép của tôi: `/personal-page/my-leaves`
- Phiếu lương của tôi: `/personal-page/my-payslips`
- Đơn nghỉ việc của tôi: `/personal-page/my-resignation`

### 5.4.1. Cập nhật hồ sơ cá nhân

Các bước:
1. Vào `/personal-page/profile`.
2. Chỉnh sửa thông tin được phép.
3. Bấm `Lưu`.

### 5.4.2. Tạo đơn nghỉ phép

Các bước:
1. Vào `/personal-page/my-leaves`.
2. Bấm `Xin nghỉ phép`.
3. Chọn loại nghỉ, ngày bắt đầu, ngày kết thúc, lý do.
4. Bấm `Gửi đơn`.

Rule quan trọng:
- Ngày kết thúc không được nhỏ hơn ngày bắt đầu.
- Trường bắt buộc không được bỏ trống.

### 5.4.3. Đính kèm hồ sơ cho loại nghỉ đặc biệt

Đơn SICK:
- Bắt buộc có hồ sơ đính kèm.
- Có thể nộp bằng upload file hoặc URL.

Đơn MATERNITY:
- Hệ thống tự tính ngày kết thúc theo quy tắc nghỉ thai sản.
- Bắt buộc có hồ sơ minh chứng.

### 5.4.4. Xem phiếu lương cá nhân

Các bước:
1. Vào `/personal-page/my-payslips`.
2. Chọn kỳ lương cần xem.
3. Mở chi tiết phiếu lương.
4. Đối chiếu các khoản lương, phụ cấp, khấu trừ.

## 6. Quy tắc phân quyền và an toàn thao tác

1. Không chia sẻ tài khoản cho người khác.
2. Chỉ thao tác đúng phạm vi quyền được cấp.
3. Đăng xuất sau khi dùng trên máy dùng chung.
4. Không tải dữ liệu nhạy cảm ra ngoài nếu chưa được phê duyệt.

## 7. Các lỗi thường gặp và cách xử lý

1. Không đăng nhập được:
- Kiểm tra lại username/password.
- Kiểm tra trạng thái tài khoản.
- Liên hệ quản trị để reset mật khẩu.

2. Không thấy menu chức năng:
- Có thể thiếu quyền truy cập.
- Liên hệ Admin để cấp role/permission phù hợp.

3. Lưu dữ liệu thất bại:
- Kiểm tra trường bắt buộc.
- Kiểm tra định dạng ngày, số điện thoại, email.
- Thử tải lại trang và thao tác lại.

4. Trang tải chậm:
- Kiểm tra mạng nội bộ.
- Giảm điều kiện lọc dữ liệu quá rộng.
- Báo IT nếu tình trạng kéo dài.

## 8. Quy trình hỗ trợ người dùng

Khi cần hỗ trợ, cung cấp tối thiểu:
1. Vai trò người dùng.
2. Chức năng gặp lỗi.
3. Thời điểm xảy ra.
4. Các bước đã thao tác.
5. Ảnh chụp màn hình (nếu có).

Kênh hỗ trợ:
- Helpdesk nội bộ (email/ticket/chat nội bộ theo quy định đơn vị).

## 9. Phụ lục: danh sách route tham khảo nhanh

### 9.1. Dùng chung
- `/`
- `/auth/login`
- `/portal-selection`

### 9.2. Admin
- `/admin`
- `/admin/dashboard`
- `/admin/users`
- `/admin/roles`
- `/admin/categories`
- `/admin/brands`
- `/admin/departments`
- `/admin/positions`
- `/admin/holidays`
- `/admin/products`
- `/admin/products/create`
- `/admin/products/[id]`
- `/admin/products/[id]/edit`
- `/admin/settings`

### 9.3. Commercial
- `/commercial/dashboards`
- `/commercial/orders`
- `/commercial/orders/[id]`
- `/commercial/inventory`
- `/commercial/inventory/products`
- `/commercial/inventory/products/create`
- `/commercial/inventory/products/[id]`
- `/commercial/inventory/products/[id]/edit`
- `/commercial/inventory/imports`
- `/commercial/inventory/imports/create`
- `/commercial/inventory/imports/[id]`
- `/commercial/inventory/tracking`
- `/commercial/customers`
- `/commercial/suppliers`
- `/commercial/warehouses`
- `/commercial/warehouse/fulfillment`
- `/commercial/returns`
- `/commercial/returns/initiate`
- `/commercial/returns/create`
- `/commercial/returns/[id]`
- `/commercial/sales/create`
- `/commercial/reports/sales`
- `/commercial/reports/inventory`
- `/commercial/reports/customers`

### 9.4. HR
- `/hr`
- `/hr/employees`
- `/hr/employees/[id]`
- `/hr/departments`
- `/hr/positions`
- `/hr/payroll`
- `/hr/leave-approvals`
- `/hr/resignations`
- `/hr/reports`

### 9.5. Personal Page
- `/personal-page`
- `/personal-page/profile`
- `/personal-page/my-leaves`
- `/personal-page/my-payslips`
- `/personal-page/my-resignation`
