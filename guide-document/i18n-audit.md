# i18n Audit — English UI Text → Vietnamese Translations

> **Scope:** `libs/src/components/`, `libs/src/pages/`, `app/`  
> **Status:** FILES ALREADY FULLY IN VIETNAMESE are omitted (e.g. login page, portal-selection, warehouse/stock dialogs, HR reports page, settings page, etc.)

---

## 1. `libs/src/components/common/DeleteConfirmDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `'Confirm Delete'` (default title) | `'Xác nhận xóa'` |
| `'Delete'` (default confirmText) | `'Xóa'` |
| `'Cancel'` (default cancelText) | `'Hủy'` |
| `'Are you sure you want to delete "${itemName}"? This action cannot be undone.'` | `'Bạn có chắc chắn muốn xóa "${itemName}"? Hành động này không thể hoàn tác.'` |
| `'Are you sure you want to delete this item? This action cannot be undone.'` | `'Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.'` |
| `'This action is permanent and cannot be reversed. Please confirm that you want to proceed.'` | `'Hành động này là vĩnh viễn và không thể đảo ngược. Vui lòng xác nhận bạn muốn tiếp tục.'` |
| `'Deleting...'` | `'Đang xóa...'` |

---

## 2. `libs/src/components/common/EmptyState.tsx`

| English | Vietnamese |
|---------|------------|
| `'No data available'` (default title) | `'Không có dữ liệu'` |
| `'There are no items to display at the moment.'` | `'Hiện tại không có mục nào để hiển thị.'` |
| `'No results found'` | `'Không tìm thấy kết quả'` |
| `'Try adjusting your search or filter to find what you are looking for.'` | `'Thử điều chỉnh tìm kiếm hoặc bộ lọc để tìm thấy những gì bạn cần.'` |
| `'Something went wrong'` | `'Đã xảy ra lỗi'` |
| `'An error occurred while loading data. Please try again.'` | `'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.'` |

---

## 3. `libs/src/components/common/DataTable.tsx`

| English | Vietnamese |
|---------|------------|
| `emptyMessage = 'No data available'` (default prop) | `'Không có dữ liệu'` |

---

## 4. `libs/src/components/common/FilterBar.tsx`

| English | Vietnamese |
|---------|------------|
| `'Filters'` (button label) | `'Bộ lọc'` |
| `'Clear All'` (button label) | `'Xóa tất cả'` |
| `placeholder = 'Search ${field.label.toLowerCase()}...'` | `'Tìm kiếm ${field.label.toLowerCase()}...'` |

---

## 5. `libs/src/components/common/FormDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `submitText = 'Save'` (default prop) | `'Lưu'` |
| `cancelText = 'Cancel'` (default prop) | `'Hủy'` |
| `'Saving...'` | `'Đang lưu...'` |

---

## 6. `libs/src/components/common/LoadingOverlay.tsx`

| English | Vietnamese |
|---------|------------|
| `message = 'Loading...'` (default prop) | `'Đang tải...'` |

---

## 7. `libs/src/components/common/PageHeader.tsx`

| English | Vietnamese |
|---------|------------|
| `'Home'` (breadcrumb root label) | `'Trang chủ'` |

---

## 8. `libs/src/components/layout/AdminSidebar.tsx`

| English | Vietnamese |
|---------|------------|
| `'Dashboard'` | `'Bảng điều khiển'` |
| `'Departments'` | `'Phòng ban'` |
| `'Positions'` | `'Chức vụ'` |
| `'Roles'` | `'Vai trò'` |
| `'Users'` | `'Người dùng'` |
| `'Holidays'` | `'Ngày nghỉ lễ'` |
| `'Categories'` | `'Danh mục'` |
| `'Brands'` | `'Thương hiệu'` |
| `'Products'` | `'Sản phẩm'` |
| `'Reports'` | `'Báo cáo'` |

---

## 9. `libs/src/components/layout/HRSidebar.tsx`

| English | Vietnamese |
|---------|------------|
| `'Dashboard'` | `'Bảng điều khiển'` |
| `'Employees'` | `'Nhân viên'` |
| `'Leave Approvals'` | `'Duyệt đơn nghỉ phép'` |
| `'Resignations'` | `'Đơn nghỉ việc'` |
| `'Payroll'` | `'Bảng lương'` |
| `'Departments'` | `'Phòng ban'` |
| `'Positions'` | `'Chức vụ'` |
| `'Reports & Analytics'` | `'Báo cáo & Phân tích'` |

---

## 10. `libs/src/components/layout/AdminHeader.tsx`

| English | Vietnamese |
|---------|------------|
| `title = 'Admin Dashboard'` (default prop) | `'Quản trị hệ thống'` |
| `'System Control Panel'` (subtitle caption) | `'Bảng điều khiển hệ thống'` |
| `'Profile'` (user menu item) | `'Hồ sơ cá nhân'` |
| `'Settings'` (user menu item) | `'Cài đặt'` |
| `'Logout'` (user menu item) | `'Đăng xuất'` |

---

## 11. `libs/src/components/layout/HRHeader.tsx`

| English | Vietnamese |
|---------|------------|
| `title = 'HR Dashboard'` (default prop) | `'Quản lý nhân sự'` |
| `'People Management System'` (caption) | `'Hệ thống quản lý nhân sự'` |

---

## 12. `libs/src/components/layout/CommercialHeader.tsx`

| English | Vietnamese |
|---------|------------|
| `title = 'Commercial Dashboard'` (default prop) | `'Thương mại'` |

---

## 13. `libs/src/components/employees/BasicInformationCard.tsx`

| English | Vietnamese |
|---------|------------|
| `'Basic Information'` (card title) | `'Thông tin cơ bản'` |
| `'Employee Code'` | `'Mã nhân viên'` |
| `'Gender'` | `'Giới tính'` |
| `'Date of Birth'` | `'Ngày sinh'` |
| `'Nationality'` | `'Quốc tịch'` |
| `'N/A'` | `'Không có'` |
| `'Select country'` (placeholder) | `'Chọn quốc gia'` |
| Date locale `'en-US'` | `'vi-VN'` |

---

## 14. `libs/src/components/employees/WorkInformationCard.tsx`

| English | Vietnamese |
|---------|------------|
| `'Work Information'` | `'Thông tin công việc'` |
| `'Department'` | `'Phòng ban'` |
| `'Position'` | `'Chức vụ'` |
| `'Start Date'` | `'Ngày bắt đầu'` |
| `'Level'` | `'Cấp bậc'` |
| `'Status'` | `'Trạng thái'` |
| `'N/A'` | `'Không có'` |
| Date locale `'en-US'` | `'vi-VN'` |

---

## 15. `libs/src/components/employees/ContactInformationCard.tsx`

| English | Vietnamese |
|---------|------------|
| `'Contact Information'` | `'Thông tin liên hệ'` |
| `'Phone Number'` | `'Số điện thoại'` |
| `'Permanent Address'` | `'Địa chỉ thường trú'` |
| `'Current Address'` | `'Địa chỉ hiện tại'` |

---

## 16. `libs/src/components/employees/SystemInformationCard.tsx`

| English | Vietnamese |
|---------|------------|
| `'System Information'` | `'Thông tin hệ thống'` |
| `'Created At'` | `'Ngày tạo'` |
| `'Last Updated'` | `'Cập nhật lần cuối'` |

---

## 17. `libs/src/components/employees/IdentificationCard.tsx`

| English | Vietnamese |
|---------|------------|
| `'Identification'` | `'Giấy tờ tùy thân'` |
| `'Identity Number'` | `'Số CCCD/CMND'` |
| `'Issued Date'` | `'Ngày cấp'` |
| `'Issued Place'` | `'Nơi cấp'` |

---

## 18. `libs/src/components/employees/DocumentsCard.tsx`

| English | Vietnamese |
|---------|------------|
| `'Documents & CV'` (card title) | `'Tài liệu & CV'` |
| `'Uploading...'` | `'Đang tải lên...'` |
| `'Upload CV'` (button) | `'Tải lên CV'` |
| `'Please upload a PDF or Word document'` | `'Vui lòng tải lên file PDF hoặc Word'` |
| `'File size must be less than 10MB'` | `'Kích thước file phải nhỏ hơn 10MB'` |
| `'Failed to upload file. Please try again.'` | `'Tải lên thất bại. Vui lòng thử lại.'` |
| `'No CV uploaded yet'` | `'Chưa có CV nào được tải lên'` |
| `'Click "Upload CV" to add a document'` | `'Nhấn "Tải lên CV" để thêm tài liệu'` |

---

## 19. `libs/src/components/employees/EmployeeFormDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `'Full name is required'` | `'Họ và tên là bắt buộc'` |
| `'Employee code is required'` | `'Mã nhân viên là bắt buộc'` |
| `'Department is required'` | `'Phòng ban là bắt buộc'` |
| `'Position is required'` | `'Chức vụ là bắt buộc'` |
| `'Start date is required'` | `'Ngày bắt đầu là bắt buộc'` |
| `'Initial salary is required and must be greater than 0'` | `'Lương khởi điểm là bắt buộc và phải lớn hơn 0'` |
| `'Initial salary must be a number'` | `'Lương khởi điểm phải là số'` |
| `placeholder='e.g., EMP001'` | `placeholder='VD: NV001'` |

---

## 20. `libs/src/components/employees/EmployeeAvatarCard.tsx`

| English | Vietnamese |
|---------|------------|
| `'Uploading...'` | `'Đang tải lên...'` |
| `'Change Photo'` | `'Thay đổi ảnh'` |
| `label="Full Name"` | `label="Họ và tên"` |
| `'Account Status:'` | `'Trạng thái tài khoản:'` |
| `'Has Account'` | `'Có tài khoản'` |
| `'No Account'` | `'Chưa có tài khoản'` |

---

## 21. `libs/src/components/employees/DeletedEmployeesDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `'Deleted Employees'` (dialog title) | `'Nhân viên đã xóa'` |
| `'Employee Code'` (column) | `'Mã nhân viên'` |
| `'Full Name'` (column) | `'Họ và tên'` |
| `'Department'` (column) | `'Phòng ban'` |
| `'Position'` (column) | `'Chức vụ'` |
| `'Start Date'` (column) | `'Ngày bắt đầu'` |
| `'Status'` (column) | `'Trạng thái'` |
| `'Deleted At'` (column) | `'Ngày xóa'` |
| `'No deleted employees found'` | `'Không tìm thấy nhân viên đã xóa'` |
| Date locale `'en-US'` | `'vi-VN'` |

---

## 22. `libs/src/components/holidays/HolidayFormDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `'Edit Holiday'` | `'Sửa ngày nghỉ lễ'` |
| `'Add New Holiday'` | `'Thêm ngày nghỉ lễ mới'` |
| `'Holiday Name'` | `'Tên ngày lễ'` |
| `'Date'` | `'Ngày'` |
| `'Description'` | `'Mô tả'` |
| `'Holiday name is required'` | `'Tên ngày lễ là bắt buộc'` |
| `'Date is required'` | `'Ngày là bắt buộc'` |
| `'Cancel'` | `'Hủy'` |
| `'Update'` | `'Cập nhật'` |
| `'Create'` | `'Tạo mới'` |
| `placeholder='Enter holiday description (optional)'` | `placeholder='Nhập mô tả ngày lễ (không bắt buộc)'` |

---

## 23. `libs/src/components/holidays/SeedHolidaysDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `'Auto Seed Holidays'` (title) | `'Tự động thêm ngày lễ'` |
| `'This will automatically generate all Vietnamese national holidays for the selected year.'` | `'Hệ thống sẽ tự động tạo tất cả ngày nghỉ lễ quốc gia Việt Nam cho năm đã chọn.'` |
| `'Year'` (label) | `'Năm'` |
| `'Enter the year to seed holidays'` | `'Nhập năm để thêm ngày lễ'` |
| `'Please enter a valid year between 2000 and 2100'` | `'Vui lòng nhập năm hợp lệ từ 2000 đến 2100'` |
| `'This will add standard Vietnamese holidays including:'` | `'Các ngày lễ Việt Nam tiêu chuẩn sẽ được thêm bao gồm:'` |
| `'And other national holidays...'` | `'Và các ngày lễ quốc gia khác...'` |
| `'Cancel'` | `'Hủy'` |
| `'Seed Holidays'` (button) | `'Thêm ngày lễ'` |

---

## 24. `libs/src/components/holidays/HolidayCard.tsx`

| English | Vietnamese |
|---------|------------|
| `'Delete'` (Tooltip title on icon button) | `'Xóa'` |
| Date locale `'en-US'` | `'vi-VN'` |

---

## 25. `libs/src/components/brands/BrandFormDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `'Edit Brand'` | `'Sửa thương hiệu'` |
| `'Add New Brand'` | `'Thêm thương hiệu mới'` |
| `'Brand Name'` | `'Tên thương hiệu'` |
| `'Active'` (Switch label) | `'Đang hoạt động'` |
| `'Brand name is required'` | `'Tên thương hiệu là bắt buộc'` |
| `'Cancel'` | `'Hủy'` |
| `'Update'` | `'Cập nhật'` |
| `'Create'` | `'Tạo mới'` |

---

## 26. `libs/src/components/categories/CategoryFormDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `'Edit Category'` | `'Sửa danh mục'` |
| `'Add New Category'` | `'Thêm danh mục mới'` |
| `'Category Name'` | `'Tên danh mục'` |
| `'Parent Category'` | `'Danh mục cha'` |
| `'Active'` (Switch label) | `'Đang hoạt động'` |
| `'Category name is required'` | `'Tên danh mục là bắt buộc'` |
| `'None (Top Level)'` | `'Không có (Cấp cao nhất)'` |
| `'Select a parent category to create a subcategory'` | `'Chọn danh mục cha để tạo danh mục con'` |
| `'Cancel'` | `'Hủy'` |
| `'Update'` | `'Cập nhật'` |
| `'Create'` | `'Tạo mới'` |

---

## 27. `libs/src/components/departments/DepartmentFormDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `'Edit Department'` | `'Sửa phòng ban'` |
| `'Add New Department'` | `'Thêm phòng ban mới'` |
| `'Department Name'` | `'Tên phòng ban'` |
| `'Description'` | `'Mô tả'` |
| `'Total Employees'` | `'Tổng số nhân viên'` |
| `'Department name is required'` | `'Tên phòng ban là bắt buộc'` |
| `'Enter department description (optional)'` | `'Nhập mô tả phòng ban (không bắt buộc)'` |
| `'Number of employees in this department'` | `'Số nhân viên trong phòng ban này'` |
| `'Cancel'` | `'Hủy'` |
| `'Update'` | `'Cập nhật'` |
| `'Create'` | `'Tạo mới'` |

---

## 28. `libs/src/components/positions/PositionFormDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `'Edit Position'` | `'Sửa chức vụ'` |
| `'Add New Position'` | `'Thêm chức vụ mới'` |
| `'Position Name'` | `'Tên chức vụ'` |
| `'Base Salary'` | `'Lương cơ bản'` |
| `'Description'` | `'Mô tả'` |
| `'Position name is required'` | `'Tên chức vụ là bắt buộc'` |
| `'Base salary must be greater than 0'` | `'Lương cơ bản phải lớn hơn 0'` |
| `placeholder='e.g., Software Engineer, Manager'` | `placeholder='VD: Kỹ sư phần mềm, Quản lý'` |
| `'Enter position description (optional)'` | `'Nhập mô tả chức vụ (không bắt buộc)'` |
| `'Cancel'` | `'Hủy'` |
| `'Update'` | `'Cập nhật'` |
| `'Create'` | `'Tạo mới'` |

---

## 29. `libs/src/components/roles/RoleFormDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `'Edit Role'` | `'Sửa vai trò'` |
| `'Add New Role'` | `'Thêm vai trò mới'` |
| `'Update role information and permissions'` | `'Cập nhật thông tin và quyền hạn của vai trò'` |
| `'Create a new role with permissions'` | `'Tạo vai trò mới với quyền hạn'` |
| `'Role Code'` | `'Mã vai trò'` |
| `'Role Name'` | `'Tên vai trò'` |
| `'Role code cannot be changed'` | `'Mã vai trò không thể thay đổi'` |
| `'Unique identifier'` | `'Mã định danh duy nhất'` |
| `'Permissions ({count})'` | `'Quyền hạn ({count})'` |
| `'Select Permissions'` (button) | `'Chọn quyền hạn'` |
| `'No permissions selected'` | `'Chưa chọn quyền hạn nào'` |

---

## 30. `libs/src/components/roles/PermissionMatrix.tsx`

| English | Vietnamese |
|---------|------------|
| `title = 'Select Permissions'` (default prop) | `'Chọn quyền hạn'` |
| `'Select permissions to assign to this role'` | `'Chọn quyền hạn để gán cho vai trò này'` |
| `'Select All Permissions'` (checkbox label) | `'Chọn tất cả quyền hạn'` |
| `'{n} permissions'` (per-group caption) | `'{n} quyền hạn'` |

---

## 31. `libs/src/components/profile/ProfileAccountTab.tsx`

| English | Vietnamese |
|---------|------------|
| `'Account Information'` | `'Thông tin tài khoản'` |
| `'Change Password'` (button) | `'Đổi mật khẩu'` |
| `'Username'` | `'Tên đăng nhập'` |
| `'Role'` | `'Vai trò'` |
| `'Account Status'` | `'Trạng thái tài khoản'` |
| `'Employee Name'` | `'Tên nhân viên'` |
| `'System Information'` | `'Thông tin hệ thống'` |
| `'Created At'` | `'Ngày tạo'` |
| `'Updated At'` | `'Ngày cập nhật'` |
| `'Last Login'` | `'Lần đăng nhập cuối'` |
| `'Never logged in'` | `'Chưa từng đăng nhập'` |

---

## 32. `libs/src/components/profile/ChangePasswordDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `'Change Password'` (dialog title) | `'Đổi mật khẩu'` |
| `'OTP Code'` (field label) | `'Mã OTP'` |
| `'New Password'` | `'Mật khẩu mới'` |
| `'Confirm Password'` | `'Xác nhận mật khẩu'` |
| `'Send OTP'` (button) | `'Gửi OTP'` |
| `'OTP will be sent to this email'` (helper text) | `'Mã OTP sẽ được gửi đến email này'` |
| `'Enter 6-digit OTP'` (placeholder) | `'Nhập mã OTP 6 chữ số'` |
| `'Enter the 6-digit code sent to your email'` (helper text) | `'Nhập mã 6 chữ số đã gửi đến email của bạn'` |
| `'Click "Send OTP" to receive a verification code via email. The code will expire in 5 minutes.'` | `'Nhấn "Gửi OTP" để nhận mã xác minh qua email. Mã sẽ hết hạn sau 5 phút.'` |
| `'Please enter your email address'` (validation) | `'Vui lòng nhập địa chỉ email'` |
| `'Please enter a valid 6-digit OTP'` (validation) | `'Vui lòng nhập mã OTP 6 chữ số hợp lệ'` |
| `'Password must be at least 6 characters'` | `'Mật khẩu phải có ít nhất 6 ký tự'` |
| `'Passwords do not match'` | `'Mật khẩu không khớp'` |
| `'Failed to send OTP. Please try again.'` | `'Gửi OTP thất bại. Vui lòng thử lại.'` |
| `'Failed to reset password. Please try again.'` | `'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'` |
| `'Password changed successfully'` | `'Đổi mật khẩu thành công'` |

---

## 33. `libs/src/components/profile/ProfileEmployeeTab.tsx`

| English | Vietnamese |
|---------|------------|
| `'Please select an image file'` | `'Vui lòng chọn file hình ảnh'` |
| `'Please select a PDF or Word document'` | `'Vui lòng chọn file PDF hoặc Word'` |
| `'File size must be less than 10MB'` | `'Kích thước file phải nhỏ hơn 10MB'` |

---

## 34. `libs/src/components/users/UserFormDialog.tsx`

| English | Vietnamese |
|---------|------------|
| `'Edit User Account'` (dialog title) | `'Sửa tài khoản người dùng'` |
| `'Create New User Account'` | `'Tạo tài khoản người dùng mới'` |
| `'Employee Information'` (section heading) | `'Thông tin nhân viên'` |
| `'Employee'` (select field label) | `'Nhân viên'` |
| `'Select an employee to create account'` (helper) | `'Chọn nhân viên để tạo tài khoản'` |
| `'No employees available'` (empty option) | `'Không có nhân viên nào'` |
| `'Account Information'` (section heading) | `'Thông tin tài khoản'` |
| `'Username'` | `'Tên đăng nhập'` |
| `'Username cannot be changed'` (helper) | `'Tên đăng nhập không thể thay đổi'` |
| `'Auto-filled from employee code'` (helper) | `'Tự động điền từ mã nhân viên'` |
| `'Password'` | `'Mật khẩu'` |
| `'Default: 123456'` (helper) | `'Mặc định: 123456'` |
| `'Role & Permissions'` (section heading) | `'Vai trò & Phân quyền'` |
| `'Role'` (select label) | `'Vai trò'` |
| `'Status'` (select label) | `'Trạng thái'` |
| `'Active'` (MenuItem) | `'Đang hoạt động'` |
| `'Banned'` (MenuItem) | `'Bị khóa'` |
| `'System Information'` (section heading) | `'Thông tin hệ thống'` |
| `'Created At'` | `'Ngày tạo'` |
| `'Account creation date'` (helper) | `'Ngày tạo tài khoản'` |
| `'Updated At'` | `'Ngày cập nhật'` |
| `'Last modification date'` (helper) | `'Ngày chỉnh sửa lần cuối'` |
| `'Last Login'` | `'Lần đăng nhập cuối'` |
| `'Last login timestamp'` (helper) | `'Thời điểm đăng nhập lần cuối'` |
| `'Never logged in'` | `'Chưa từng đăng nhập'` |
| `'Cancel'` | `'Hủy'` |
| `'Updating...'` | `'Đang cập nhật...'` |
| `'Creating...'` | `'Đang tạo...'` |
| `'Update User'` | `'Cập nhật người dùng'` |
| `'Create User'` | `'Tạo người dùng'` |

---

## 35. `libs/src/components/products/ProductForm.tsx`

| English | Vietnamese |
|---------|------------|
| `'1. Basic Information'` (section title) | `'1. Thông tin cơ bản'` |
| `'SKU'` (field label) | `'Mã SKU'` |
| `'Product Name'` | `'Tên sản phẩm'` |
| `'Brand'` | `'Thương hiệu'` |
| `'Category'` | `'Danh mục'` |
| `'Has Serial Number'` (switch label) | `'Có số serial'` |
| `'Enable if you need to manage IMEI/Serial numbers for each unit'` | `'Bật nếu cần quản lý số IMEI/Serial cho từng đơn vị'` |
| `'2. Technical Specifications'` (section title) | `'2. Thông số kỹ thuật'` |
| `'No specifications available'` | `'Không có thông số kỹ thuật'` |
| `'Add key-value pairs for product specifications (e.g., RAM: 16GB, Color: Blue)'` | `'Thêm các cặp giá trị cho thông số kỹ thuật (VD: RAM: 16GB, Màu: Xanh)'` |
| `'Key'` (spec field) | `'Tên thông số'` |
| `'Value'` (spec field) | `'Giá trị'` |
| `'e.g., RAM, Color'` (placeholder) | `'VD: RAM, Màu sắc'` |
| `'e.g., 16GB, Blue'` (placeholder) | `'VD: 16GB, Xanh'` |
| `'Add Specification'` (button) | `'Thêm thông số'` |
| `'3. Price & Image'` (section title) | `'3. Giá & Hình ảnh'` |
| `'Retail Price'` | `'Giá bán lẻ'` |
| `'Retail price must be greater than 0'` (validation) | `'Giá bán lẻ phải lớn hơn 0'` |
| `'Warranty Period'` | `'Thời hạn bảo hành'` |
| `'e.g., 12, 24'` (placeholder) | `'VD: 12, 24'` |
| `'Warranty period in months'` (helper) | `'Thời hạn bảo hành tính theo tháng'` |
| `'Product Thumbnail'` (section label) | `'Ảnh sản phẩm'` |
| `'Status'` | `'Trạng thái'` |
| `'Active'` | `'Đang hoạt động'` |
| `'Inactive'` | `'Ngừng kinh doanh'` |
| `'Product name is required'` (validation) | `'Tên sản phẩm là bắt buộc'` |
| `'Category is required'` (validation) | `'Danh mục là bắt buộc'` |
| `'Brand is required'` (validation) | `'Thương hiệu là bắt buộc'` |
| `'Yes'` / `'No'` (serial number chip) | `'Có'` / `'Không'` |
| `placeholder='e.g., CPU-INTEL-I9-14900K'` | `placeholder='VD: SP-INTEL-I9-14900K'` |
| `placeholder='e.g., CPU Intel Core i9 14900K'` | `placeholder='VD: CPU Intel Core i9 14900K'` |

---

## 36. `libs/src/components/products/ProductFormDrawer.tsx`

*(Same strings as ProductForm.tsx — both components share the product editing UI.)*

| English | Vietnamese |
|---------|------------|
| `'Edit Product'` (drawer title) | `'Sửa sản phẩm'` |
| `'Add New Product'` | `'Thêm sản phẩm mới'` |
| `'1. Basic Information'` | `'1. Thông tin cơ bản'` |
| `'Product SKU for internal management'` (helper) | `'Mã SKU nội bộ dùng để quản lý sản phẩm'` |
| `'Has Serial Number'` | `'Có số serial'` |
| `'Enable if you need to manage IMEI/Serial numbers for each unit'` | `'Bật nếu cần quản lý số IMEI/Serial cho từng đơn vị'` |
| `'2. Technical Specifications'` | `'2. Thông số kỹ thuật'` |
| `'Add key-value pairs for product specifications (e.g., RAM: 16GB, Color: Blue)'` | `'Thêm các cặp giá trị cho thông số kỹ thuật (VD: RAM: 16GB, Màu: Xanh)'` |
| `'Add Specification'` | `'Thêm thông số'` |
| `'3. Price & Image'` | `'3. Giá & Hình ảnh'` |
| `'Retail Price'` | `'Giá bán lẻ'` |
| `'Retail price must be greater than 0'` | `'Giá bán lẻ phải lớn hơn 0'` |
| `'Product name is required'` | `'Tên sản phẩm là bắt buộc'` |
| `'Category is required'` | `'Danh mục là bắt buộc'` |
| `'Brand is required'` | `'Thương hiệu là bắt buộc'` |

---

## 37. `libs/src/pages/admin/products/index.tsx`

| English | Vietnamese |
|---------|------------|
| `'Product Management'` (page title) | `'Quản lý sản phẩm'` |
| `'Manage products, inventory, and specifications'` (subtitle) | `'Quản lý sản phẩm, tồn kho và thông số kỹ thuật'` |
| `'Products'` (breadcrumb) | `'Sản phẩm'` |
| `'Refresh'` (action button) | `'Làm mới'` |
| `'Delete Selected'` (action button) | `'Xóa đã chọn'` |
| `'Add Product'` (action button) | `'Thêm sản phẩm'` |
| `'Product Name'` (search field label) | `'Tên sản phẩm'` |
| `'Search by SKU...'` (placeholder) | `'Tìm kiếm theo mã SKU...'` |
| `'Search by product name...'` (placeholder) | `'Tìm kiếm theo tên sản phẩm...'` |
| `'Brand'` (filter label) | `'Thương hiệu'` |
| `'Category'` (filter label) | `'Danh mục'` |
| `'Product Name'` (column header) | `'Tên sản phẩm'` |
| `'Brand'` (column header) | `'Thương hiệu'` |
| `'Category'` (column header) | `'Danh mục'` |
| `'Price'` (column header) | `'Giá bán'` |
| `'Stock'` (column header) | `'Tồn kho'` |
| `'Status'` (column header) | `'Trạng thái'` |
| `'Active'` / `'Inactive'` (status chip) | `'Hoạt động'` / `'Ngừng'` |
| `'No products found'` (emptyMessage) | `'Không tìm thấy sản phẩm'` |
| `'Delete ${n} Product(s)'` (dialog title) | `'Xóa ${n} sản phẩm'` |
| `'Are you sure you want to delete product "${name}"?'` | `'Bạn có chắc chắn muốn xóa sản phẩm "${name}"?'` |
| `'Are you sure you want to delete ${n} products?'` | `'Bạn có chắc chắn muốn xóa ${n} sản phẩm?'` |
| `'Loading products...'` | `'Đang tải sản phẩm...'` |
| `'${n} product(s) deleted successfully'` | `'Đã xóa ${n} sản phẩm thành công'` |
| `'Data refreshed'` | `'Đã làm mới dữ liệu'` |
| `'${n} Total'` (tag) | `'Tổng: ${n}'` |
| `'An error occurred'` | `'Đã xảy ra lỗi'` |

---

## 38. `libs/src/pages/admin/products/form.tsx`

| English | Vietnamese |
|---------|------------|
| `'Edit Product'` (page title) | `'Sửa sản phẩm'` |
| `'Create Product'` (page title) | `'Tạo sản phẩm'` |
| `'Editing: ${name}'` (subtitle) | `'Đang sửa: ${name}'` |
| `'Add a new product to inventory'` (subtitle) | `'Thêm sản phẩm mới vào kho'` |
| `'Products'` (breadcrumb) | `'Sản phẩm'` |
| `'Edit'` (breadcrumb) | `'Sửa'` |
| `'Create'` (breadcrumb) | `'Tạo mới'` |
| `'Product updated successfully'` | `'Cập nhật sản phẩm thành công'` |
| `'Product created successfully'` | `'Tạo sản phẩm thành công'` |
| `'Loading product...'` | `'Đang tải sản phẩm...'` |
| `'Product not found'` | `'Không tìm thấy sản phẩm'` |
| `'An error occurred'` | `'Đã xảy ra lỗi'` |

---

## 39. `libs/src/pages/admin/users/index.tsx`

| English | Vietnamese |
|---------|------------|
| `'User Management'` (page title) | `'Quản lý người dùng'` |
| `'Manage system user accounts'` (subtitle) | `'Quản lý tài khoản người dùng hệ thống'` |
| `'Users'` (breadcrumb) | `'Người dùng'` |
| `'Refresh'` | `'Làm mới'` |
| `'Ban Selected'` | `'Khóa đã chọn'` |
| `'Create Account'` | `'Tạo tài khoản'` |
| `'Username / Employee Code'` (column) | `'Tên đăng nhập / Mã nhân viên'` |
| `'Employee Name'` (column) | `'Tên nhân viên'` |
| `'Role'` (column) | `'Vai trò'` |
| `'Status'` (column) | `'Trạng thái'` |
| `'Username'` (search field) | `'Tên đăng nhập'` |
| `'Search by username...'` | `'Tìm kiếm theo tên đăng nhập...'` |
| `'Search by email...'` | `'Tìm kiếm theo email...'` |
| `'Search by employee name...'` | `'Tìm kiếm theo tên nhân viên...'` |
| `'Employee Name'` (search field label) | `'Tên nhân viên'` |
| `'Role'` (filter label) | `'Vai trò'` |
| `'${n} Total'` (tag) | `'Tổng: ${n}'` |
| `'Ban User'` (dialog title) | `'Khóa người dùng'` |
| `'Are you sure you want to ban user "${username}"? This action will prevent the user from accessing the system.'` | `'Bạn có chắc chắn muốn khóa người dùng "${username}"? Hành động này sẽ ngăn người dùng truy cập hệ thống.'` |
| `'Cancel'` | `'Hủy'` |
| `'Banning...'` | `'Đang khóa...'` |
| `'Ban User'` (confirm button) | `'Khóa người dùng'` |

---

## 40. `libs/src/pages/admin/dashboard/index.tsx`

| English | Vietnamese |
|---------|------------|
| `'Admin Dashboard'` (Typography heading) | `'Bảng điều khiển Admin'` |

*(Note: the rest of this page is already in Vietnamese.)*

---

## Summary of Files NOT Requiring Changes (already fully in Vietnamese)

The following files were reviewed and found to be **already fully in Vietnamese** or contain no user-visible English strings:

- `libs/src/components/warehouses/WarehouseFormDialog.tsx` ✅
- `libs/src/components/inventory/StockAdjustmentDialog.tsx` ✅
- `libs/src/components/inventory/StockHistoryDialog.tsx` ✅
- `libs/src/components/import-receipts/ProductSelectDialog.tsx` ✅
- `libs/src/components/import-receipts/SerialInputModal.tsx` ✅
- `libs/src/components/import-receipts/SerialListModal.tsx` ✅
- `libs/src/components/import-receipts/SupplierSelectDialog.tsx` ✅
- `libs/src/components/dialogs/UpdateOrderStatusDialog.tsx` ✅
- `libs/src/pages/login/index.tsx` ✅
- `libs/src/pages/portal-selection/index.tsx` ✅
- `libs/src/pages/admin/settings/index.tsx` ✅
- `libs/src/pages/hr/reports/index.tsx` ✅
- `libs/src/pages/commercial/reports/sales-report/index.tsx` ✅
- All commercial inventory/warehouse/order/supplier pages ✅ (already Vietnamese)
- All HR leave/resignation/payroll pages ✅ (already Vietnamese)
- All personal-page pages ✅ (already Vietnamese)
