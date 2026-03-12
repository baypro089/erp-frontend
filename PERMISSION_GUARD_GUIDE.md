# Hướng dẫn sử dụng PermissionGuard

## Tổng quan

`PermissionGuard` là một component wrapper dùng để kiểm tra quyền truy cập VIEW của người dùng trước khi hiển thị nội dung. Nếu người dùng không có quyền, sẽ hiển thị thông báo lỗi thay vì nội dung.

## Cách sử dụng cơ bản

### 1. Import component

```tsx
import { PermissionGuard } from '@libs/src/components/common';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';
```

### 2. Wrap page content với PermissionGuard

```tsx
export default function MyPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.CATEGORY.VIEW}>
      <MyPageContent />
    </PermissionGuard>
  );
}

function MyPageContent() {
  // Page logic và UI ở đây
  return <div>...</div>;
}
```

## Ví dụ chi tiết

### Ví dụ 1: Single Permission

```tsx
// pages/admin/brands/index.tsx
export default function BrandsPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.BRAND.VIEW}
      fallbackPath="/admin"
    >
      <BrandsPageContent />
    </PermissionGuard>
  );
}

function BrandsPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { guardAction, guardFn, permissionDialogProps } = usePermissionGuard();
  // ... rest of page logic
}
```

### Ví dụ 2: Multiple Permissions (ANY)

```tsx
// Người dùng cần có ít nhất 1 trong các quyền
export default function OrdersPage() {
  return (
    <PermissionGuard 
      permission={[PERMISSIONS.ORDER.VIEW, PERMISSIONS.ORDER.FULFILL]}
    >
      <OrdersPageContent />
    </PermissionGuard>
  );
}
```

### Ví dụ 3: Multiple Permissions (ALL)

```tsx
// Người dụng cần có TẤT CẢ các quyền
export default function AdminSettingsPage() {
  return (
    <PermissionGuard 
      permission={[PERMISSIONS.SYSTEM_SETTING.VIEW, PERMISSIONS.SYSTEM_SETTING.UPDATE]}
      requireAll
    >
      <SettingsPageContent />
    </PermissionGuard>
  );
}
```

### Ví dụ 4: Custom Fallback UI

```tsx
export default function CustomersPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.CUSTOMER.VIEW}
      fallback={
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">
            Bạn cần có quyền xem khách hàng để truy cập trang này.
            Vui lòng liên hệ quản trị viên.
          </Alert>
        </Box>
      }
    >
      <CustomersPageContent />
    </PermissionGuard>
  );
}
```

## Kết hợp với usePermissionGuard

`PermissionGuard` chỉ kiểm tra quyền VIEW để hiển thị trang. Bạn vẫn cần sử dụng `usePermissionGuard` để kiểm tra quyền cho các actions (CREATE, UPDATE, DELETE):

```tsx
export default function BrandsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.BRAND.VIEW}>
      <BrandsPageContent />
    </PermissionGuard>
  );
}

function BrandsPageContent() {
  const { guardAction, guardFn, permissionDialogProps } = usePermissionGuard();
  
  return (
    <>
      <PageHeader
        title="Quản lý thương hiệu"
        actions={[
          {
            label: 'Thêm mới',
            // Kiểm tra CREATE permission
            onClick: guardAction(PERMISSIONS.BRAND.CREATE, handleAdd),
            icon: <AddIcon />,
          },
        ]}
      />
      
      <DataTable
        // Kiểm tra UPDATE permission
        onEdit={guardFn(PERMISSIONS.BRAND.UPDATE, handleEdit)}
        // Kiểm tra DELETE permission
        onDelete={guardFn(PERMISSIONS.BRAND.DELETE, handleDelete)}
      />
      
      <PermissionDeniedDialog {...permissionDialogProps} />
    </>
  );
}
```

## Danh sách các trang cần cập nhật

### Admin Portal
- [x] `/admin/brands` - BRAND.VIEW
- [ ] `/admin/categories` - CATEGORY.VIEW
- [ ] `/admin/departments` - DEPARTMENT.VIEW
- [x] `/admin/employees` - EMPLOYEE.VIEW
- [ ] `/admin/holidays` - HOLIDAY.VIEW
- [ ] `/admin/positions` - POSITION.VIEW
- [ ] `/admin/products` - PRODUCT.VIEW
- [ ] `/admin/roles` - ROLE.VIEW
- [ ] `/admin/settings` - SYSTEM_SETTING.VIEW
- [ ] `/admin/users` - USER.VIEW

### Commercial Portal
- [ ] `/commercial/customers` - CUSTOMER.VIEW
- [ ] `/commercial/inventory` - PRODUCT_STOCK.VIEW
- [ ] `/commercial/imports` - IMPORT_RECEIPT.VIEW
- [ ] `/commercial/orders` - ORDER.VIEW
- [ ] `/commercial/returns` - RETURN_REQUEST.VIEW
- [ ] `/commercial/suppliers` - SUPPLIER.VIEW
- [x] `/commercial/warehouse/fulfillment` - ORDER.VIEW
- [ ] `/commercial/warehouses` - WAREHOUSE.VIEW
- [ ] `/commercial/reports/sales-report` - SALES_REPORT.VIEW
- [ ] `/commercial/reports/inventory-report` - WAREHOUSE_REPORT.VIEW

### HR Portal
- [ ] `/hr/employees` - EMPLOYEE.VIEW
- [ ] `/hr/leave-approvals` - LEAVE_REQUEST.VIEW
- [ ] `/hr/payroll` - PAYSLIP.VIEW
- [ ] `/hr/resignations` - RESIGNATION_REQUEST.VIEW
- [ ] `/hr/reports` - HR_REPORT.VIEW

### Personal Pages
- Personal pages thường không cần permission guard vì người dùng xem thông tin của chính mình

## Checklist khi cập nhật trang

1. [ ] Import `PermissionGuard` và `PERMISSIONS`
2. [ ] Tách logic ra component riêng (e.g., `MyPageContent`)
3. [ ] Wrap `MyPageContent` với `PermissionGuard`
4. [ ] Xác định đúng permission code cần kiểm tra
5. [ ] Thêm `fallbackPath` nếu cần
6. [ ] Test với user có và không có quyền
7. [ ] Đảm bảo `usePermissionGuard` vẫn hoạt động cho actions

## Props của PermissionGuard

| Prop | Type | Bắt buộc | Mô tả |
|------|------|----------|-------|
| `permission` | `PermissionCode \| string \| (PermissionCode \| string)[]` | ✅ | Permission code cần kiểm tra |
| `requireAll` | `boolean` | ❌ | Nếu `true`, cần TẤT CẢ permissions. Mặc định `false` (chỉ cần 1) |
| `children` | `ReactNode` | ✅ | Nội dung hiển thị khi có quyền |
| `fallback` | `ReactNode` | ❌ | UI tùy chỉnh khi không có quyền |
| `fallbackPath` | `string` | ❌ | Đường dẫn để quay lại (hiển thị trong fallback mặc định) |

## Lưu ý quan trọng

1. **Phân tách component**: Luôn tách logic ra component riêng để tránh re-render không cần thiết
2. **Permissions đúng**: Đảm bảo sử dụng đúng permission code từ `PERMISSIONS` constant
3. **Fallback path**: Thêm `fallbackPath` để cải thiện UX khi người dùng bị từ chối quyền
4. **Kết hợp hooks**: `PermissionGuard` cho VIEW, `usePermissionGuard` cho actions
5. **Loading state**: Component tự động hiển thị loading khi đang kiểm tra quyền
6. **Caching**: Hook `usePermissions` tự động cache kết quả kiểm tra quyền

## Migration Pattern

**Trước:**
```tsx
export default function MyPage() {
  const { data, loading } = useSelector(...);
  // Logic ở đây
  return <div>...</div>;
}
```

**Sau:**
```tsx
export default function MyPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.MY_RESOURCE.VIEW}>
      <MyPageContent />
    </PermissionGuard>
  );
}

function MyPageContent() {
  const { data, loading } = useSelector(...);
  // Logic không thay đổi
  return <div>...</div>;
}
```

## Support

Nếu có thắc mắc hoặc gặp vấn đề, vui lòng liên hệ team development hoặc tạo issue trên repository.
