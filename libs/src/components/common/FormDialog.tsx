'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  submitText?: string;
  cancelText?: string;
  hideActions?: boolean;
  disableSubmit?: boolean;
  fullWidth?: boolean;
  subtitle?: string;
}

export default function FormDialog({
  open,
  onClose,
  onSubmit,
  title,
  children,
  loading = false,
  maxWidth = 'sm',
  submitText = 'Save',
  cancelText = 'Cancel',
  hideActions = false,
  disableSubmit = false,
  fullWidth = true,
  subtitle,
}: FormDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={isMobile}
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
        sx: {
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: subtitle ? 1 : 2,
        }}
      >
        <Box>
          <Typography variant="h6" component="div" fontWeight={600}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          disabled={loading}
          aria-label="close"
          sx={{ ml: 2 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          pt: 3,
          pb: 2,
        }}
      >
        {children}
      </DialogContent>

      {!hideActions && (
        <>
          <Divider />
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
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || disableSubmit}
              sx={{ minWidth: 100 }}
            >
              {loading ? 'Saving...' : submitText}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
