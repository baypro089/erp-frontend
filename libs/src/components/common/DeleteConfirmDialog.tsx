'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';

export interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  loading?: boolean;
  variant?: 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message,
  itemName,
  loading = false,
  variant = 'warning',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  maxWidth = 'xs',
}: DeleteConfirmDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const defaultMessage = itemName
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : 'Are you sure you want to delete this item? This action cannot be undone.';

  const Icon = variant === 'error' ? ErrorIcon : WarningIcon;
  const iconColor = variant === 'error' ? 'error' : 'warning';

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 2,
        }}
      >
        <Icon color={iconColor} />
        <Typography variant="h6" component="div" fontWeight={600}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity={variant} sx={{ mb: 2 }}>
          <Typography variant="body2">
            {message || defaultMessage}
          </Typography>
        </Alert>

        <Typography variant="body2" color="text.secondary">
          This action is permanent and cannot be reversed. Please confirm that you
          want to proceed.
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          color="inherit"
          fullWidth={isMobile}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          fullWidth={isMobile}
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Deleting...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
