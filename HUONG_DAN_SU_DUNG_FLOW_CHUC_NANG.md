# HƯỚNG DẪN SỬ DỤNG ERP FRONTEND

Tài liệu này liệt kê đầy đủ flow sử dụng theo tất cả nhóm chức năng hiện có trong hệ thống.

## 1. Phạm vi chức năng

Hệ thống gồm 4 portal chính:
- Admin
- Commercial
- HR
- Personal Page

Ngoài ra có các flow dùng chung:
- Đăng nhập / xác thực
- Chọn portal
- Kiểm tra phân quyền truy cập trang và hành động

## 2. Điều kiện trước khi thao tác

1. Có tài khoản hợp lệ theo vai trò (Admin, Commercial, HR, Employee).
2. Tài khoản có quyền tương ứng chức năng cần dùng.
3. Truy cập đúng đường dẫn cổng làm việc (portal).

## 3. Flow dùng chung toàn hệ thống

### 3.1. Đăng nhập

1. Mở trang `/auth/login`.
2. Nhập tên đăng nhập và mật khẩu.
3. Bấm nút đăng nhập.
4. Kết quả:
   - Sai thông tin: hiển thị thông báo lỗi.
   - Đúng thông tin: chuyển hướng khỏi trang login.

### 3.2. Chọn portal

1. Truy cập `/portal-selection` sau khi đăng nhập.
2. Hệ thống xác định danh sách portal khả dụng theo quyền user.
3. Chọn portal mong muốn.
4. Hệ thống chuyển hướng đến trang chính của portal đó.

### 3.3. Guard xác thực (chưa đăng nhập)

1. Người dùng chưa đăng nhập truy cập trực tiếp trang nghiệp vụ.
2. Hệ thống tự động chuyển hướng về `/auth/login`.

### 3.4. Guard phân quyền (đã đăng nhập nhưng thiếu quyền)

1. Người dùng đã đăng nhập mở trang/chạy hành động không có quyền.
2. Hệ thống chặn hiển thị hoặc chặn action.
3. Hiển thị thông báo/điều hướng fallback theo cấu hình PermissionGuard.

## 4. Flow Admin Portal

### 4.1. Điều hướng chính

1. Vào `/admin` hoặc `/admin/dashboard`.
2. Dùng menu để mở các phân hệ:
   - Users: `/admin/users`
   - Roles: `/admin/roles`
   - Categories: `/admin/categories`
   - Brands: `/admin/brands`
   - Departments: `/admin/departments`
   - Positions: `/admin/positions`
   - Holidays: `/admin/holidays`
   - Products: `/admin/products`
   - Settings: `/admin/settings`

### 4.2. CRUD Brands (mẫu CRUD chuẩn)

1. Mở `/admin/brands`.
2. Bấm thêm mới để mở dialog.
3. Nhập dữ liệu hợp lệ và lưu.
4. Hệ thống tạo bản ghi và cập nhật danh sách.
5. Trường hợp validate:
   - Submit rỗng hiển thị lỗi bắt buộc.
   - Bấm hủy đóng dialog, không tạo dữ liệu.

### 4.3. Quản lý Products (đầy đủ list/create/detail/edit)

1. Danh sách: `/admin/products`.
2. Tạo mới: `/admin/products/create`.
3. Xem chi tiết: `/admin/products/[id]`.
4. Chỉnh sửa: `/admin/products/[id]/edit`.
5. Lưu ý route sản phẩm theo portal:
   - Admin base path: `/admin/products`

## 5. Flow Commercial Portal

### 5.1. Điều hướng chính

1. Vào `/commercial/dashboards`.
2. Mở các phân hệ:
   - Orders: `/commercial/orders`
   - Inventory: `/commercial/inventory`
   - Customers: `/commercial/customers`
   - Suppliers: `/commercial/suppliers`
   - Warehouses: `/commercial/warehouses`
   - Returns: `/commercial/returns`
   - Sales: `/commercial/sales/create`
   - Reports: `/commercial/reports/sales`, `/commercial/reports/inventory`, `/commercial/reports/customers`

### 5.2. Customers CRUD

1. Mở `/commercial/customers`.
2. Bấm thêm mới để mở form/dialog.
3. Nhập thông tin bắt buộc và lưu.
4. Validate nghiệp vụ:
   - Thiếu thông tin bắt buộc hiển thị lỗi.
   - Số điện thoại sai định dạng bị từ chối.
   - Bấm hủy đóng form, không tạo bản ghi.

### 5.3. Orders workflow

1. Mở `/commercial/orders`.
2. Xem danh sách đơn với các cột nghiệp vụ (tổng tiền, trạng thái, ...).
3. Lọc trạng thái đơn hàng từ dropdown.
4. Hệ thống gọi dữ liệu theo trạng thái và reload bảng.
5. Mở chi tiết đơn tại `/commercial/orders/[id]`.
6. Tạo đơn mới qua nút tạo đơn, điều hướng tới `/commercial/sales/create`.

### 5.4. Inventory workflow

1. Mở `/commercial/inventory`.
2. Chọn kho để xem tồn kho theo ngữ cảnh kho.
3. Sản phẩm tồn kho:
   - Danh sách: `/commercial/inventory/products`
   - Tạo mới: `/commercial/inventory/products/create`
   - Chi tiết: `/commercial/inventory/products/[id]`
   - Chỉnh sửa: `/commercial/inventory/products/[id]/edit`
4. Phiếu nhập:
   - Danh sách: `/commercial/inventory/imports`
   - Tạo mới: `/commercial/inventory/imports/create`
   - Chi tiết: `/commercial/inventory/imports/[id]`
5. Theo dõi tồn kho: `/commercial/inventory/tracking`.
6. Lưu ý route sản phẩm theo portal:
   - Commercial base path: `/commercial/inventory/products`

### 5.5. Returns workflow

1. Danh sách trả hàng: `/commercial/returns`.
2. Khởi tạo trả hàng: `/commercial/returns/initiate`.
3. Tạo yêu cầu trả hàng: `/commercial/returns/create`.
4. Xem chi tiết yêu cầu: `/commercial/returns/[id]`.

### 5.6. Warehouse fulfillment

1. Mở màn hình fulfillment tại `/commercial/warehouse/fulfillment`.
2. Thực hiện xử lý xuất/đóng gói/giao theo quy trình kho nội bộ.

## 6. Flow HR Portal

### 6.1. Điều hướng chính

1. Vào `/hr`.
2. Mở các phân hệ:
   - Employees: `/hr/employees`
   - Departments: `/hr/departments`
   - Positions: `/hr/positions`
   - Payroll: `/hr/payroll`
   - Leave Approvals: `/hr/leave-approvals`
   - Resignations: `/hr/resignations`
   - Reports: `/hr/reports`

### 6.2. Employees

1. Mở danh sách nhân sự tại `/hr/employees`.
2. Chọn một nhân sự để xem chi tiết tại `/hr/employees/[id]`.

### 6.3. Payroll generation

1. Vào `/hr/payroll`.
2. Bấm nút tính lương tháng hiện tại.
3. Hệ thống mở dialog xác nhận tính lương hàng loạt.
4. Chọn:
   - Tính lương: chạy quy trình tính lương.
   - Hủy: đóng dialog, không chạy.

### 6.4. Leave Approvals workflow

1. Mở `/hr/leave-approvals`.
2. Chuyển tab giữa:
   - Tất cả đơn
   - Chờ duyệt
3. Ở tab Tất cả đơn: có bộ lọc trạng thái.
4. Ở tab Chờ duyệt: tập trung xử lý đơn PENDING.
5. Duyệt đơn:
   - Bấm Duyệt ở dòng phù hợp.
   - Xác nhận để cập nhật trạng thái.
6. Từ chối đơn:
   - Bấm Từ chối.
   - Nhập lý do bắt buộc.
   - Submit để cập nhật trạng thái.

### 6.5. Luồng BHXH cho nghỉ thai sản

1. Đơn nghỉ thai sản đã ở trạng thái được duyệt.
2. User có đúng quyền (ví dụ ADMIN) thấy nút xác nhận hồ sơ BHXH.
3. Bấm xác nhận để claim BHXH thành công.
4. User không đủ quyền (ví dụ HR_STAFF) không thấy nút này.

## 7. Flow Personal Page

### 7.1. Điều hướng chính

1. Vào `/personal-page`.
2. Chọn 1 trong 4 nhóm chức năng:
   - Hồ sơ cá nhân: `/personal-page/profile`
   - Đơn nghỉ phép của tôi: `/personal-page/my-leaves`
   - Phiếu lương của tôi: `/personal-page/my-payslips`
   - Đơn nghỉ việc của tôi: `/personal-page/my-resignation`

### 7.2. Profile

1. Mở `/personal-page/profile`.
2. Xem/cập nhật thông tin theo quyền được cấp.

### 7.3. My Leaves

1. Mở `/personal-page/my-leaves`.
2. Xem bảng lịch sử đơn nghỉ.
3. Xem thẻ số ngày phép còn lại.
4. Tạo đơn nghỉ mới (dialog Xin Nghỉ Phép):
   - Chọn loại nghỉ.
   - Chọn ngày bắt đầu/kết thúc.
   - Nhập lý do.
   - Submit.
5. Validate:
   - Thiếu trường bắt buộc báo lỗi.
   - Ngày kết thúc nhỏ hơn ngày bắt đầu báo lỗi.
   - Khoảng ngày hợp lệ sẽ tính số ngày làm việc.
   - Bấm Hủy sẽ đóng dialog.

### 7.4. My Leaves nâng cao: tài liệu đính kèm theo loại đơn

#### 7.4.1. Đơn SICK

1. Mở form xin nghỉ và chọn loại SICK.
2. Chọn phương thức nộp hồ sơ:
   - Upload file
   - Nhập URL
3. Rule:
   - Bắt buộc có hồ sơ.
   - Nếu mode URL thì phải đúng định dạng URL.
4. Submit mode URL: request gửi `documentUrl`.
5. Submit mode Upload: request gửi file `document`.

#### 7.4.2. Đơn MATERNITY

1. Chọn loại nghỉ MATERNITY.
2. Hệ thống tự động tính ngày kết thúc +6 tháng và khóa trường end date.
3. Bắt buộc có hồ sơ minh chứng (có thể qua URL theo rule).

### 7.5. My Payslips

1. Mở `/personal-page/my-payslips`.
2. Xem bảng danh sách phiếu lương.
3. Mở chi tiết phiếu lương.
4. Hiển thị minh bạch theo loại payslip:
   - Payslip thường: không hiển thị phần dành riêng thai sản.
   - Payslip thai sản: hiển thị rõ dòng BHXH và các thông tin liên quan.

### 7.6. My Resignation

1. Mở `/personal-page/my-resignation`.
2. Tạo/theo dõi đơn nghỉ việc cá nhân theo trạng thái xử lý.

## 8. Danh sách route chức năng đầy đủ

### 8.1. Auth & Shared
- `/`
- `/auth/login`
- `/portal-selection`

### 8.2. Admin
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

### 8.3. Commercial
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

### 8.4. HR
- `/hr`
- `/hr/employees`
- `/hr/employees/[id]`
- `/hr/departments`
- `/hr/positions`
- `/hr/payroll`
- `/hr/leave-approvals`
- `/hr/resignations`
- `/hr/reports`

### 8.5. Personal Page
- `/personal-page`
- `/personal-page/profile`
- `/personal-page/my-leaves`
- `/personal-page/my-payslips`
- `/personal-page/my-resignation`

## 9. Checklist smoke test nhanh theo vai trò

### 9.1. Admin
1. Login thành công.
2. Vào được dashboard.
3. Mở được tất cả menu admin.
4. Tạo thử 1 bản ghi Brands thành công.

### 9.2. Commercial
1. Login thành công.
2. Vào được dashboards.
3. Tạo thử 1 customer với dữ liệu hợp lệ.
4. Lọc trạng thái ở Orders hoạt động đúng.

### 9.3. HR
1. Login thành công.
2. Mở được Payroll và bật dialog tính lương.
3. Duyệt/từ chối đơn nghỉ với rule hợp lệ.
4. Kiểm tra hiển thị nút BHXH theo đúng quyền.

### 9.4. Employee (Personal)
1. Login thành công.
2. Mở đủ 4 nhóm chức năng trang cá nhân.
3. Tạo đơn nghỉ với validate đầy đủ.
4. Kiểm tra hiển thị payslip thường và payslip thai sản đúng quy tắc.
