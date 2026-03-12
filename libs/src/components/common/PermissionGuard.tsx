'use client';

import { ReactNode } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Lock as LockIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@libs/src/hooks';
import type { PermissionCode } from '@libs/shared/constants/permissions.constant';

interface PermissionGuardProps {
  /**
   * Required permission code(s) to view the content.
   * Can be a single permission or an array of permissions.
   */
  permission: PermissionCode | string | (PermissionCode | string)[];
  
  /**
   * If true, user needs ALL permissions in the array.
   * If false (default), user needs ANY ONE of the permissions.
   */
  requireAll?: boolean;
  
  /**
   * Content to render when permission is granted
   */
  children: ReactNode;
  
  /**
   * Optional custom fallback UI when permission is denied
   */
  fallback?: ReactNode;
  
  /**
   * URL path to navigate back to (shown in fallback)
   */
  fallbackPath?: string;
}

/**
 * PermissionGuard Component
 * 
 * Wraps content and only displays it if the user has the required permission(s).
 * Shows a permission denied message when access is not granted.
 * 
 * Usage:
 * ```tsx
 * // Single permission
 * <PermissionGuard permission={PERMISSIONS.ORDER.VIEW}>
 *   <OrderList />
 * </PermissionGuard>
 * 
 * // Multiple permissions (ANY)
 * <PermissionGuard permission={[PERMISSIONS.ORDER.VIEW, PERMISSIONS.ORDER.FULFILL]}>
 *   <OrderList />
 * </PermissionGuard>
 * 
 * // Multiple permissions (ALL)
 * <PermissionGuard 
 *   permission={[PERMISSIONS.ORDER.VIEW, PERMISSIONS.ORDER.FULFILL]} 
 *   requireAll
 * >
 *   <OrderList />
 * </PermissionGuard>
 * 
 * // With custom fallback
 * <PermissionGuard 
 *   permission={PERMISSIONS.ORDER.VIEW}
 *   fallback={<CustomDeniedMessage />}
 * >
 *   <OrderList />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  permission,
  requireAll = false,
  children,
  fallback,
  fallbackPath,
}: PermissionGuardProps) {
  const router = useRouter();
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Đang kiểm tra quyền truy cập...
        </Typography>
      </Box>
    );
  }

  // Check permissions
  const hasAccess = (() => {
    if (Array.isArray(permission)) {
      return requireAll 
        ? hasAllPermissions(permission) 
        : hasAnyPermission(permission);
    }
    return hasPermission(permission);
  })();

  // Grant access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default permission denied UI
  const permissionText = Array.isArray(permission) 
    ? permission.join(', ') 
    : permission;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: '500px',
          p: 4,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'error.light',
            color: 'error.main',
            mb: 3,
          }}
        >
          <LockIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography variant="h5" fontWeight={600} gutterBottom>
          Không có quyền truy cập
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Bạn không có quyền xem nội dung này.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Quyền yêu cầu: <strong>{permissionText}</strong>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {fallbackPath && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(fallbackPath)}
            >
              Quay lại
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => router.back()}
          >
            Trở về trang trước
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
