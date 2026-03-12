'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
} from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import type { PermissionDialogState } from '@libs/src/hooks/usePermissionGuard';

export type PermissionDeniedDialogProps = PermissionDialogState;

/**
 * Warning dialog displayed when the current user attempts an action they
 * do not have permission to perform.
 *
 * Spread `permissionDialogProps` from `usePermissionGuard()` directly onto
 * this component:
 *
 * ```tsx
 * const { guardAction, permissionDialogProps } = usePermissionGuard();
 * // ...
 * <PermissionDeniedDialog {...permissionDialogProps} />
 * ```
 */
export default function PermissionDeniedDialog({
  open,
  onClose,
  requiredPermission,
}: PermissionDeniedDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <BlockIcon />
          <Typography variant="h6" component="span" fontWeight={700}>
            Không có quyền thực hiện
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Bạn không có quyền thực hiện thao tác này.
        </Typography>
        {requiredPermission && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Quyền yêu cầu:{' '}
            <Box
              component="code"
              sx={{
                fontFamily: 'monospace',
                bgcolor: 'action.hover',
                px: 0.75,
                py: 0.25,
                borderRadius: 0.5,
                fontSize: '0.8125rem',
              }}
            >
              {requiredPermission}
            </Box>
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Vui lòng liên hệ quản trị viên để được cấp quyền.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" autoFocus>
          Đã hiểu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
