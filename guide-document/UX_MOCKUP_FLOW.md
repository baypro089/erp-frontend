# UX Flow Theo Giao Diện Đã Xây Dựng (10 UI Nghiệp Vụ Chính)

## Mục tiêu tài liệu
- Chuyển từ danh sách mockup tổng quát sang UX Flow bám đúng các route đã có trong project.
- Tập trung vào 10 UI nghiệp vụ chính và nổi bật theo từng site (Admin, Commercial, HR, Personal Page).
- Làm tài liệu tham chiếu chung cho Product, Design, QA và Frontend khi refine hoặc viết test case.

## Nguyên tắc chọn UI nổi bật
- Đã có route/page thực tế trong thư mục `app`.
- Có thao tác nghiệp vụ cốt lõi (tạo, duyệt, theo dõi, cập nhật trạng thái).
- Có khả năng mở rộng e2e test hoặc permission guard.

## 1) Đăng nhập hệ thống
- Route chính: `/auth/login`
- UX Flow:
  1. Người dùng nhập tài khoản và mật khẩu.
  2. Bấm `Đăng nhập`, hệ thống kiểm tra thông tin và quyền truy cập.
  3. Thành công: chuyển sang trang chọn portal.
  4. Thất bại: hiển thị lỗi cụ thể (sai thông tin, khóa tài khoản, lỗi mạng).
- Điểm UX quan trọng:
  - Trạng thái loading rõ ràng để tránh bấm lặp.
  - Thông báo lỗi ngắn gọn, dễ hành động tiếp theo.

## 2) Chọn portal theo quyền
- Route chính: `/portal-selection`
- UX Flow:
  1. Hệ thống hiển thị danh sách portal user được phép truy cập.
  2. User chọn một portal phù hợp vai trò công việc.
  3. Điều hướng vào trang chính của portal đã chọn.
- Điểm UX quan trọng:
  - Portal không có quyền cần disabled rõ ràng.
  - Mỗi card portal có mô tả ngắn để giảm chọn nhầm.

## 3) Quản lý sản phẩm (Admin Products)
- Route chính: `/admin/products`, `/admin/products/create`, `/admin/products/[id]/edit`
- UX Flow:
  1. Admin mở danh sách sản phẩm để tìm kiếm và lọc theo danh mục/thương hiệu.
  2. Tạo mới sản phẩm hoặc mở sản phẩm hiện có để chỉnh sửa.
  3. Lưu thông tin, hệ thống kiểm tra hợp lệ và cập nhật danh sách.
  4. Theo dõi trạng thái hiển thị của sản phẩm sau cập nhật.
- Điểm UX quan trọng:
  - Form tạo/sửa cần chia nhóm thông tin rõ để giảm sai sót nhập liệu.
  - Cảnh báo validation phải đặt gần trường lỗi để sửa nhanh.

## 4) Quản lý người dùng (Admin Users)
- Route chính: `/admin/users`
- UX Flow:
  1. Admin mở danh sách user.
  2. Tìm kiếm/lọc theo email, role, trạng thái.
  3. Thực hiện thao tác: thêm mới, chỉnh role, khóa/mở khóa.
  4. Nhận phản hồi thành công/thất bại và table cập nhật.
- Điểm UX quan trọng:
  - Tối ưu thao tác hàng loạt, tránh mở nhiều màn hình con.
  - Xác nhận trước hành động nhạy cảm (khóa user).

## 5) Quản lý trả hàng (Commercial Returns)
- Route chính: `/commercial/returns`, `/commercial/returns/create`, `/commercial/returns/[id]`
- UX Flow:
  1. Nhân sự kinh doanh tạo phiếu trả hàng từ đơn đã phát sinh.
  2. Kiểm tra điều kiện trả hàng và số lượng hợp lệ.
  3. Gửi yêu cầu xử lý, theo dõi trạng thái tại danh sách trả hàng.
  4. Mở chi tiết phiếu để đối soát hàng trả và hoàn tất nghiệp vụ.
- Điểm UX quan trọng:
  - Luồng kiểm tra điều kiện trả hàng phải rõ để tránh sai chính sách.
  - Trạng thái xử lý trả hàng cần nhất quán giữa list và trang chi tiết.

## 6) Quản lý đơn hàng bán (Sales + Orders)
- Route chính: `/commercial/sales/create`, `/commercial/orders`, `/commercial/orders/[id]`
- UX Flow:
  1. Tạo đơn bán từ màn `sales/create`.
  2. Kiểm tra đơn trong danh sách `orders`.
  3. Mở chi tiết đơn để theo dõi timeline trạng thái.
  4. Cập nhật trạng thái đúng quy trình nghiệp vụ.
- Điểm UX quan trọng:
  - Form tạo đơn cần validation sớm để giảm lỗi cuối luồng.
  - Trạng thái đơn cần dễ đọc, tránh chuyển sai bước.

## 7) Quản lý tồn kho (Inventory)
- Route chính: `/commercial/inventory`, `/commercial/inventory/products`, `/commercial/inventory/imports`
- UX Flow:
  1. User kiểm tra tổng quan tồn kho.
  2. Vào danh sách sản phẩm tồn để xem số lượng và cảnh báo.
  3. Thực hiện nhập kho qua luồng imports khi cần bổ sung.
  4. Đối soát lại số lượng sau nhập.
- Điểm UX quan trọng:
  - Cảnh báo low-stock/out-of-stock cần nổi bật.
  - Luồng nhập kho nên rõ theo từng bước để tránh sai số liệu.

## 8) Quản lý nhân sự (HR Employees)
- Route chính: `/hr/employees`, `/hr/employees/[id]`
- UX Flow:
  1. HR mở danh sách nhân sự và lọc theo phòng ban/trạng thái.
  2. Truy cập hồ sơ chi tiết từng nhân viên.
  3. Cập nhật thông tin cần thiết theo quyền.
- Điểm UX quan trọng:
  - Tìm kiếm theo tên/mã nhân viên phải nhanh và ổn định.
  - Tránh quá tải thông tin trên màn chi tiết, nên nhóm theo tab khối dữ liệu.

## 9) Quản lý bảng lương (HR Payroll)
- Route chính: `/hr/payroll`
- UX Flow:
  1. HR chọn kỳ lương cần xử lý.
  2. Kiểm tra dữ liệu lương theo phòng ban/nhân viên.
  3. Đối soát thu nhập, khấu trừ, thực lĩnh và chốt kỳ lương.
  4. Công bố bảng lương để nhân viên tra cứu tại Personal Page.
- Điểm UX quan trọng:
  - Cần phân tách rõ trạng thái nháp và đã công bố để tránh công bố nhầm.
  - Các khoản thu nhập/khấu trừ phải đọc nhanh và dễ phát hiện bất thường.

## 10) Self-service nhân viên (My Leaves + My Payslips + Profile)
- Route chính: `/personal-page/my-leaves`, `/personal-page/my-payslips`, `/personal-page/profile`
- UX Flow:
  1. Nhân viên theo dõi phép còn lại và lịch sử nghỉ tại `my-leaves`.
  2. Nhân viên xem hoặc tải phiếu lương tại `my-payslips`.
  3. Khi cần, cập nhật thông tin cá nhân tại `profile`.
- Điểm UX quan trọng:
  - Trạng thái tải file và hiển thị phiếu lương cần phản hồi tức thì.
  - Ưu tiên trải nghiệm mobile vì nhóm người dùng tự phục vụ truy cập linh hoạt.

## Đề xuất ưu tiên cải tiến tiếp
1. Chuẩn hóa trạng thái UX cho toàn bộ 10 UI: `default`, `loading`, `empty`, `error`, `success`.
2. Bổ sung flow cảnh báo quyền truy cập khi điều hướng trực tiếp URL không đủ quyền.
3. Gắn acceptance criteria cho từng flow để đồng bộ với e2e test hiện có, ưu tiên các flow nghiệp vụ chính theo từng site.
