'use client';

import { useState, useCallback } from 'react';
import { usePermissions } from './usePermissions';
import type { PermissionCode } from '@libs/shared/constants/permissions.constant';

export interface PermissionDialogState {
  open: boolean;
  onClose: () => void;
  requiredPermission?: string;
}

/**
 * Wraps actions with a permission check. If the user lacks the required
 * permission the action is blocked and a warning dialog is shown instead.
 *
 * Usage:
 * ```tsx
 * const { guardAction, permissionDialogProps } = usePermissionGuard();
 *
 * <Button onClick={guardAction(PERMISSIONS.DEPARTMENT.CREATE, handleCreate)}>
 *   Thêm mới
 * </Button>
 * <PermissionDeniedDialog {...permissionDialogProps} />
 * ```
 */
export function usePermissionGuard() {
  const { hasPermission, hasAnyPermission, loading } = usePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deniedPermission, setDeniedPermission] = useState<string | undefined>();

  const closeDialog = useCallback(() => setDialogOpen(false), []);

  /**
   * Returns a wrapped handler that only executes `action` when the user
   * has `permission`. Otherwise opens the warning dialog.
   */
  const guardAction = useCallback(
    (permission: PermissionCode | string, action: () => void) =>
      () => {
        if (hasPermission(permission)) {
          action();
        } else {
          setDeniedPermission(permission);
          setDialogOpen(true);
        }
      },
    [hasPermission],
  );

  /**
   * Like `guardAction` but passes if the user holds ANY one of `permissions`.
   */
  const guardAnyAction = useCallback(
    (permissions: (PermissionCode | string)[], action: () => void) =>
      () => {
        if (hasAnyPermission(permissions)) {
          action();
        } else {
          setDeniedPermission(permissions.join(', '));
          setDialogOpen(true);
        }
      },
    [hasAnyPermission],
  );

  /**
   * Like `guardAction` but the wrapped action accepts a single typed argument.
   * Designed for DataTable `onEdit` / `onDelete` callbacks that receive a row.
   *
   * ```tsx
   * <DataTable
   *   onEdit={guardFn(PERMISSIONS.BRAND.UPDATE, handleEdit)}
   *   onDelete={guardFn(PERMISSIONS.BRAND.DELETE, handleDelete)}
   * />
   * ```
   */
  const guardFn = useCallback(
    <T>(permission: PermissionCode | string, action: (arg: T) => void) =>
      (arg: T) => {
        if (hasPermission(permission)) {
          action(arg);
        } else {
          setDeniedPermission(permission);
          setDialogOpen(true);
        }
      },
    [hasPermission],
  );

  const permissionDialogProps: PermissionDialogState = {
    open: dialogOpen,
    onClose: closeDialog,
    requiredPermission: deniedPermission,
  };

  return { guardAction, guardAnyAction, guardFn, permissionDialogProps, loading };
}
