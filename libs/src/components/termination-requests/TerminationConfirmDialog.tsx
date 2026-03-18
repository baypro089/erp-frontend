import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

interface TerminationConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor?: 'success' | 'error' | 'warning' | 'primary';
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function TerminationConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmColor = 'primary',
  loading = false,
  onClose,
  onConfirm,
}: TerminationConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2">{description}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} disabled={loading}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
