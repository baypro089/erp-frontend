# PermissionGuard Component - Quick Reference

## Giới thiệu nhanh

`PermissionGuard` là component wrapper để kiểm tra quyền VIEW của user trước khi hiển thị nội dung. Nếu không có quyền, hiển thị thông báo lỗi.

## Cài đặt & Sử dụng

### Import
```tsx
import { PermissionGuard } from '@libs/src/components/common';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';
```

### Cú pháp cơ bản
```tsx
export default function MyPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.RESOURCE.VIEW}>
      <MyPageContent />
    </PermissionGuard>
  );
}
```

## Props API

| Prop | Type | Bắt buộc | Mô tả |
|------|------|----------|-------|
| `permission` | `PermissionCode \| string \| Array` | ✅ | Quyền cần kiểm tra |
| `requireAll` | `boolean` | ❌ | `true` = cần tất cả quyền, `false` = cần 1 quyền (default) |
| `children` | `ReactNode` | ✅ | Nội dung hiển thị khi có quyền |
| `fallback` | `ReactNode` | ❌ | UI tùy chỉnh khi không có quyền |
| `fallbackPath` | `string` | ❌ | Path để navigate về (trong default fallback) |

## Các trường hợp sử dụng

### 1️⃣ Single Permission
```tsx
<PermissionGuard permission={PERMISSIONS.PRODUCT.VIEW}>
  <ProductList />
</PermissionGuard>
```

### 2️⃣ Multiple Permissions (ANY - OR)
```tsx
<PermissionGuard permission={[PERMISSIONS.ORDER.VIEW, PERMISSIONS.ORDER.FULFILL]}>
  <OrderPage />
</PermissionGuard>
```

### 3️⃣ Multiple Permissions (ALL - AND)
```tsx
<PermissionGuard 
  permission={[PERMISSIONS.SETTING.VIEW, PERMISSIONS.SETTING.UPDATE]}
  requireAll
>
  <SettingsPage />
</PermissionGuard>
```

### 4️⃣ With Fallback Path
```tsx
<PermissionGuard 
  permission={PERMISSIONS.CUSTOMER.VIEW}
  fallbackPath="/commercial/dashboard"
>
  <CustomerPage />
</PermissionGuard>
```

### 5️⃣ Custom Fallback UI
```tsx
<PermissionGuard 
  permission={PERMISSIONS.REPORT.VIEW}
  fallback={<CustomAccessDenied />}
>
  <ReportPage />
</PermissionGuard>
```

## Kết hợp với usePermissionGuard

`PermissionGuard` kiểm tra **VIEW**, `usePermissionGuard` kiểm tra **ACTIONS**.

```tsx
export default function ProductsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.PRODUCT.VIEW}>
      <ProductsPageContent />
    </PermissionGuard>
  );
}

function ProductsPageContent() {
  const { guardAction, guardFn, permissionDialogProps } = usePermissionGuard();
  
  return (
    <>
      <PageHeader
        actions={[{
          label: 'Thêm mới',
          onClick: guardAction(PERMISSIONS.PRODUCT.CREATE, handleCreate),
        }]}
      />
      
      <DataTable
        onEdit={guardFn(PERMISSIONS.PRODUCT.UPDATE, handleEdit)}
        onDelete={guardFn(PERMISSIONS.PRODUCT.DELETE, handleDelete)}
      />
      
      <PermissionDeniedDialog {...permissionDialogProps} />
    </>
  );
}
```

## Danh sách Permissions thường dùng

### Admin Portal
- `PERMISSIONS.USER.VIEW`
- `PERMISSIONS.ROLE.VIEW`
- `PERMISSIONS.EMPLOYEE.VIEW`
- `PERMISSIONS.DEPARTMENT.VIEW`
- `PERMISSIONS.POSITION.VIEW`
- `PERMISSIONS.BRAND.VIEW`
- `PERMISSIONS.CATEGORY.VIEW`
- `PERMISSIONS.PRODUCT.VIEW`
- `PERMISSIONS.HOLIDAY.VIEW`
- `PERMISSIONS.SYSTEM_SETTING.VIEW`

### Commercial Portal
- `PERMISSIONS.CUSTOMER.VIEW`
- `PERMISSIONS.SUPPLIER.VIEW`
- `PERMISSIONS.ORDER.VIEW`
- `PERMISSIONS.WAREHOUSE.VIEW`
- `PERMISSIONS.PRODUCT_STOCK.VIEW`
- `PERMISSIONS.IMPORT_RECEIPT.VIEW`
- `PERMISSIONS.RETURN_REQUEST.VIEW`
- `PERMISSIONS.SALES_REPORT.VIEW`
- `PERMISSIONS.WAREHOUSE_REPORT.VIEW`

### HR Portal
- `PERMISSIONS.EMPLOYEE.VIEW`
- `PERMISSIONS.LEAVE_REQUEST.VIEW`
- `PERMISSIONS.PAYSLIP.VIEW`
- `PERMISSIONS.RESIGNATION_REQUEST.VIEW`
- `PERMISSIONS.HR_REPORT.VIEW`

## Best Practices ✅

1. **Tách component riêng**
   ```tsx
   // ✅ Good
   export default function Page() {
     return <PermissionGuard><Content /></PermissionGuard>;
   }
   
   // ❌ Bad
   export default function Page() {
     const [state] = useState();
     // 100 lines...
     return <PermissionGuard>...</PermissionGuard>;
   }
   ```

2. **Guard ở level cao nhất**
   ```tsx
   // ✅ Good - Guard cả page
   <PermissionGuard>
     <PageContent />
   </PermissionGuard>
   
   // ❌ Bad - Guard nhiều lần
   <div>
     <PermissionGuard><Section1 /></PermissionGuard>
     <PermissionGuard><Section2 /></PermissionGuard>
   </div>
   ```

3. **Đặt tên component rõ ràng**
   ```tsx
   // ✅ Good
   function ProductsPageContent() { }
   
   // ❌ Bad
   function Content() { }
   function Comp() { }
   ```

4. **Luôn set fallbackPath**
   ```tsx
   // ✅ Good
   <PermissionGuard 
     permission={PERMISSIONS.X.VIEW}
     fallbackPath="/dashboard"
   >
   
   // ⚠️ Acceptable nhưng kém UX hơn
   <PermissionGuard permission={PERMISSIONS.X.VIEW}>
   ```

## Anti-Patterns ❌

### ❌ Guard trong loops
```tsx
// BAD
{items.map(item => (
  <PermissionGuard permission={PERMISSIONS.VIEW}>
    <Card item={item} />
  </PermissionGuard>
))}

// GOOD
<PermissionGuard permission={PERMISSIONS.VIEW}>
  {items.map(item => <Card item={item} />)}
</PermissionGuard>
```

### ❌ Nested guards không cần thiết
```tsx
// BAD
<PermissionGuard permission={PERMISSIONS.ORDER.VIEW}>
  <PermissionGuard permission={PERMISSIONS.ORDER.VIEW}>
    <Order />
  </PermissionGuard>
</PermissionGuard>

// GOOD
<PermissionGuard permission={PERMISSIONS.ORDER.VIEW}>
  <Order />
</PermissionGuard>
```

### ❌ Logic phức tạp trong guard
```tsx
// BAD
<PermissionGuard permission={PERMISSIONS.VIEW}>
  {/* 500 lines of complex logic and UI */}
</PermissionGuard>

// GOOD
<PermissionGuard permission={PERMISSIONS.VIEW}>
  <WellOrganizedComponent />
</PermissionGuard>
```

## Testing

### Test với user có quyền
```tsx
// User có PRODUCT.VIEW permission
✅ Trang hiển thị bình thường
✅ Tất cả chức năng hoạt động
```

### Test với user không có quyền
```tsx
// User KHÔNG có PRODUCT.VIEW permission
✅ Hiển thị permission denied UI
✅ Có nút "Quay lại" và "Trở về trang trước"
✅ Click fallback path navigate đúng
✅ Không thể access trang qua URL
```

### Test với multiple permissions
```tsx
// requireAll = false
✅ Có 1 trong các quyền → Cho phép truy cập
❌ Không có quyền nào → Denied

// requireAll = true
✅ Có tất cả quyền → Cho phép truy cập
❌ Thiếu 1 quyền → Denied
```

## Files tham khảo

- 📖 **Hướng dẫn chi tiết:** `PERMISSION_GUARD_GUIDE.md`
- 📋 **Báo cáo triển khai:** `PERMISSION_GUARD_IMPLEMENTATION.md`
- 💡 **Ví dụ & Use Cases:** `PERMISSION_GUARD_EXAMPLES.tsx`
- 🔧 **Component Source:** `libs/src/components/common/PermissionGuard.tsx`

## Migration Checklist

Khi migrate một trang sang dùng PermissionGuard:

- [ ] Import `PermissionGuard` và `PERMISSIONS`
- [ ] Tách logic ra `PageContent` component riêng
- [ ] Wrap `PageContent` với `PermissionGuard`
- [ ] Xác định đúng permission code
- [ ] Thêm `fallbackPath`
- [ ] Test với user có quyền
- [ ] Test với user không có quyền
- [ ] Đảm bảo `usePermissionGuard` vẫn hoạt động
- [ ] Update documentation nếu cần

## Support

Có thắc mắc? Tham khảo:
- File examples: `PERMISSION_GUARD_EXAMPLES.tsx`
- File guide: `PERMISSION_GUARD_GUIDE.md`
- Hoặc hỏi team lead

---

**Version:** 1.0  
**Last Updated:** 2025-01-13  
**Author:** Development Team
