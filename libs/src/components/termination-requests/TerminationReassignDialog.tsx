import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';

interface TerminationReassignDialogProps {
  open: boolean;
  value: boolean;
  loading?: boolean;
  onClose: () => void;
  onValueChange: (value: boolean) => void;
  onConfirm: () => void;
}

export default function TerminationReassignDialog({
  open,
  value,
  loading = false,
  onClose,
  onValueChange,
  onConfirm,
}: TerminationReassignDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Cập nhật nghĩa vụ bàn giao</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          Xác nhận cập nhật trạng thái bàn giao để tránh thao tác nhầm.
        </Typography>
        <FormControlLabel
          control={<Switch checked={value} onChange={(event) => onValueChange(event.target.checked)} />}
          label={value ? 'Đã bàn giao tài sản' : 'Chưa bàn giao tài sản'}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onConfirm} variant="contained" disabled={loading}>
          Xác nhận cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}
