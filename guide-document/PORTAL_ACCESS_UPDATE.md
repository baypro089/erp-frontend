# Portal Access Management System

## Tổng Quan Cập Nhật

Hệ thống quản lý role đã được cập nhật để sử dụng **portal access permissions** thay vì thuộc tính `AdminSiteAccess` cũ.

## Các Thay Đổi Chính

### 1. Portal Permissions
Hệ thống giờ đây xác định quyền truy cập site dựa trên 4 permissions sau:

- **ACCESS_ADMIN_PORTAL**: Quyền vào site Admin
- **ACCESS_HR_PORTAL**: Quyền vào site Nhân sự  
- **ACCESS_SALE_PORTAL**: Quyền vào site Bán hàng (tương lai)
- **ACCESS_WAREHOUSE_PORTAL**: Quyền vào site Kho (tương lai)

### 2. Permission Matrix - Nhóm theo Type
Khi tạo hoặc chỉnh sửa role, permissions giờ được nhóm và hiển thị theo **type**:

- **PORTAL_ACCESS**: Các quyền truy cập site (bắt buộc chọn ít nhất 1)
- **Các type khác**: Permissions được nhóm theo type của chúng

**Validation**: 
- ✅ Bắt buộc phải chọn ít nhất 1 portal access permission
- ⚠️ Không thể lưu role nếu không có quyền truy cập site nào

### 3. Portal Selection Page
Sau khi đăng nhập, hệ thống tự động điều hướng dựa theo số lượng portal permissions:

#### Trường hợp 1: Chỉ có 1 portal access
→ **Tự động redirect** đến portal tương ứng

#### Trường hợp 2: Có 2+ portal access  
→ **Hiển thị trang chọn portal** (`/portal-selection`)
- Giao diện đẹp mắt với card cho mỗi portal
- Hiển thị icon, tên, và mô tả của từng portal
- Chỉ cho phép chọn các portal đang available
- Các portal "Coming Soon" được hiển thị nhưng disabled

#### Trường hợp 3: Không có portal access
→ **Hiển thị lỗi** không có quyền truy cập

### 4. Roles Management Page
Cột **"Admin Access"** đã được thay thế bằng cột **"Portal Access"**:

- Hiển thị tất cả portal permissions của role
- Chip với màu sắc phân biệt
- Tooltip hiển thị tên đầy đủ của permissions

### 5. Profile Page
Phần **"Admin Site Access"** đã được thay thế:

- Hiển thị tất cả **Portal Access Permissions** của user
- Dạng chips với màu primary
- Nếu không có quyền → hiển thị chip màu đỏ "No Portal Access"

## Files Đã Tạo/Sửa Đổi

### Files Mới Tạo:
1. **`libs/shared/constants/portal-permissions.constant.ts`**
   - Định nghĩa các portal permission constants
   - Thông tin chi tiết về từng portal (name, path, icon, description)

2. **`libs/src/pages/portal-selection/index.tsx`**
   - Trang chọn portal cho user có nhiều quyền truy cập
   - Giao diện responsive, đẹp mắt

3. **`app/portal-selection/page.tsx`**
   - Route wrapper cho portal selection page

### Files Đã Sửa Đổi:
1. **`libs/src/components/roles/PermissionMatrix.tsx`**
   - Nhóm permissions theo type
   - Validation bắt buộc chọn portal access
   - Accordion UI cho từng nhóm type

2. **`libs/src/components/roles/RoleFormDialog.tsx`**
   - Loại bỏ AdminSiteAccess toggle
   - Cập nhật form data structure

3. **`libs/src/pages/admin/roles/index.tsx`**
   - Cột mới "Portal Access" thay AdminSiteAccess
   - Hiển thị portal permissions dạng chips

4. **`libs/src/pages/login/index.tsx`**
   - Logic redirect dựa vào portal permissions
   - Tự động điều hướng sau login

5. **`libs/src/components/profile/ProfileAccountTab.tsx`**
   - Hiển thị portal access thay AdminSiteAccess
   - UI chips cho permissions

6. **`libs/src/pages/admin/profile/index.tsx`**
   - Loại bỏ check AdminSiteAccess

## Hướng Dẫn Sử Dụng

### Tạo Role Mới:
1. Vào **Admin → Roles → Add Role**
2. Nhập Role Code và Role Name
3. Click **Select Permissions**
4. **Bắt buộc**: Chọn ít nhất 1 portal access từ section "🔐 Quyền Truy Cập Site/Portal"
5. Chọn các permissions khác theo nhu cầu từ các section type khác
6. Click **Confirm** và **Save**

### Quản Lý Portal Access:
- Portal access được quản lý thông qua permissions
- Admin có thể assign nhiều portal access cho 1 role
- User với role đó sẽ có quyền truy cập vào các portal tương ứng

### Database Setup:
Đảm bảo database có 4 permissions sau với type = "PORTAL_ACCESS":
```sql
INSERT INTO permissions (permission_code, permission_name, type)
VALUES 
  ('ACCESS_ADMIN_PORTAL', 'Truy cập Admin Portal', 'PORTAL_ACCESS'),
  ('ACCESS_HR_PORTAL', 'Truy cập HR Portal', 'PORTAL_ACCESS'),
  ('ACCESS_SALE_PORTAL', 'Truy cập Sales Portal', 'PORTAL_ACCESS'),
  ('ACCESS_WAREHOUSE_PORTAL', 'Truy cập Warehouse Portal', 'PORTAL_ACCESS');
```

## Migration Notes

### Breaking Changes:
- ❌ Thuộc tính `AdminSiteAccess` trong `CreateRoleDTO` đã bị loại bỏ
- ❌ Không còn sử dụng `AdminSiteAccess` để xác định quyền vào admin panel

### Backward Compatibility:
- ⚠️ Backend có thể vẫn trả về `AdminSiteAccess` nhưng frontend sẽ không sử dụng
- ✅ Permissions-based access control thay thế hoàn toàn

## Testing Checklist

- [ ] Tạo role mới với 1 portal access
- [ ] Tạo role với nhiều portal access  
- [ ] Kiểm tra validation: không cho lưu role không có portal access
- [ ] Test login với user có 1 portal → auto redirect
- [ ] Test login với user có 2+ portals → hiển thị portal selection
- [ ] Test portal selection page UI
- [ ] Kiểm tra hiển thị portal access trong roles list
- [ ] Kiểm tra profile page hiển thị đúng permissions

## Support

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Database có đủ 4 portal permissions với type = "PORTAL_ACCESS"
2. Roles đã được assign ít nhất 1 portal permission
3. Backend API trả về đầy đủ permissions trong role object
