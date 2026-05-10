# Quy trình chuẩn kiểm tra thủ công

Mục tiêu: trải nghiệm toàn diện các chức năng của hệ thống, bao phủ các luồng quan trọng và các vai trò chính. Tài liệu này mô tả trình tự thực hiện, tiêu chí hoàn thành, và ghi nhận kết quả.

## 1. Chuẩn bị

- Tài khoản theo vai trò: Admin, Thương mại (Commercial), Nhân sự (HR), Cá nhân (Personal Page).
- Dữ liệu mẫu có sẵn: khách hàng, nhà cung cấp, sản phẩm, nhân viên, đơn hàng, phiếu kho.
- Trình duyệt hỗ trợ và màn hình kích thước thông dụng.

## 2. Quy trình chung

1. Đăng nhập vào hệ thống.
2. Chọn portal phù hợp (Admin, Commercial, HR, Personal Page).
3. Thực hiện các luồng chính theo danh sách bên dưới.
4. Ghi nhận kết quả: thành công/thất bại, thông báo lỗi, thời gian thao tác.
5. Đăng xuất hoàn tất lượt kiểm tra.

## 3. Flow kiểm tra theo portal

### 3.1 Admin

- Dashboards: xem tổng quan chỉ số, kiểm tra bộ lọc thời gian.
- Người dùng: tạo mới, sửa, vô hiệu hóa, gán vai trò.
- Vai trò và quyền: tạo vai trò, gán quyền, kiểm tra cho phép truy cập.
- Danh mục: phòng ban, chức vụ, thương hiệu, danh mục sản phẩm.
- Sản phẩm: tạo mới, cập nhật, tìm kiếm, kiểm tra trạng thái.
- Cấu hình: thông tin hệ thống, tham số chung.

### 3.2 Commercial

- Khách hàng: tạo mới, sửa, tìm kiếm, kiểm tra thông tin liên hệ.
- Nhà cung cấp: tạo mới, sửa, tìm kiếm.
- Đơn hàng bán: tạo đơn, cập nhật trạng thái, in/ xuất file.
- Kho hàng: nhập kho, xuất kho, đối chiếu tồn kho.
- Báo cáo: xem, bộ lọc, tải/xuất báo cáo.

### 3.3 HR

- Nhân viên: tạo mới, sửa, tìm kiếm.
- Phòng ban và Chức vụ: cập nhật, kiểm tra phân quyền.
- Đơn nghỉ phép: tạo mới, phê duyệt, từ chối.
- Lương: xem phiếu lương, xuất file.
- Báo cáo HR: bộ lọc, tải/xuất báo cáo.

### 3.4 Personal Page

- Hồ sơ cá nhân: cập nhật thông tin, đổi mật khẩu.
- Nghỉ phép của tôi: tạo mới, theo dõi trạng thái.
- Phiếu lương của tôi: xem, tải về.
- Đơn nghỉ việc: tạo mới, theo dõi xử lý.

## 4. Tiêu chí hoàn thành

- Tất cả luồng chính chạy thành công không lỗi.
- Dữ liệu hiển thị đúng, trạng thái cập nhật hợp lệ.
- Phân quyền đúng theo vai trò.
- Thao tác có thông báo rõ ràng.

## 5. Ghi nhận kết quả

- Ghi rõ bước đã thực hiện.
- Đính kèm ảnh màn hình nếu có lỗi.
- Ghi chú môi trường, trình duyệt, thời gian.

## 6. Template ghi nhận kết quả

Thông tin chung

- Ngày kiểm tra:
- Người kiểm tra:
- Môi trường (dev/staging/prod):
- Trình duyệt + phiên bản:
- Thiết bị/màn hình:

Chi tiết bước

- Portal:
- Chức năng:
- Bước thực hiện:
- Dữ liệu đầu vào:
- Kết quả mong đợi:
- Kết quả thực tế:
- Trạng thái (Pass/Fail):
- Ảnh màn hình/Video:
- Ghi chú:

## 7. Checklist chi tiết theo chức năng

### 7.1 Admin

- Dashboards: tải trang, số liệu, bộ lọc thời gian, biểu đồ.
- Users: tạo/sửa/vô hiệu hóa, gán vai trò, tìm kiếm.
- Roles/Permissions: tạo vai trò, gán quyền, kiểm tra truy cập.
- Catalog: phòng ban, chức vụ, thương hiệu, danh mục.
- Products: tạo/sửa/tìm kiếm, trạng thái, tồn kho.
- Settings: cập nhật tham số, lưu và tải lại.

### 7.2 Commercial

- Customers: tạo/sửa, tìm kiếm, thông tin liên hệ.
- Suppliers: tạo/sửa, tìm kiếm.
- Sales Orders: tạo đơn, cập nhật trạng thái, xuất file.
- Inventory: nhập/xuất kho, đối chiếu tồn kho.
- Reports: bộ lọc, xem, tải/xuất.

### 7.3 HR

- Employees: tạo/sửa, tìm kiếm, trạng thái làm việc.
- Departments/Positions: cập nhật, phân quyền truy cập.
- Leave Approvals: tạo mới, phê duyệt, từ chối.
- Payroll: xem phiếu lương, tải/xuất.
- Reports: bộ lọc, xem, tải/xuất.

### 7.4 Personal Page

- Profile: cập nhật thông tin, đổi mật khẩu.
- My Leaves: tạo mới, theo dõi trạng thái, hủy đơn.
- My Payslips: xem, tải về.
- My Resignation: tạo mới, theo dõi xử lý.
