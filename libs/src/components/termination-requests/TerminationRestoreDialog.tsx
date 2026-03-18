import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

export type TerminationRestoreFormState = {
  forceRestore: boolean;
  restoreReason: string;
};

interface TerminationRestoreDialogProps {
  open: boolean;
  form: TerminationRestoreFormState;
  canRestoreWithoutForce: boolean;
  loading?: boolean;
  onClose: () => void;
  onForceRestoreChange: (value: boolean) => void;
  onRestoreReasonChange: (value: string) => void;
  onConfirm: () => void;
}

export default function TerminationRestoreDialog({
  open,
  form,
  canRestoreWithoutForce,
  loading = false,
  onClose,
  onForceRestoreChange,
  onRestoreReasonChange,
  onConfirm,
}: TerminationRestoreDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Restore nhân viên</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity={canRestoreWithoutForce ? 'success' : 'warning'}>
            {canRestoreWithoutForce
              ? 'Nhân viên đã hoàn thành bàn giao, có thể restore bình thường.'
              : 'Nhân viên chưa hoàn tất bàn giao. Cần bật force restore nếu đây là trường hợp sa thải nhầm.'}
          </Alert>

          <FormControlLabel
            control={
              <Switch
                checked={form.forceRestore}
                onChange={(event) => onForceRestoreChange(event.target.checked)}
              />
            }
            label="Force restore (sa thải nhầm)"
          />

          <TextField
            label="Lý do restore"
            value={form.restoreReason}
            onChange={(event) => onRestoreReasonChange(event.target.value)}
            required={form.forceRestore}
            error={form.forceRestore && !form.restoreReason.trim()}
            helperText={
              form.forceRestore
                ? 'Bắt buộc nhập lý do khi bật force restore'
                : 'Không bắt buộc nếu restore thông thường'
            }
            multiline
            minRows={3}
          />

          <Divider />
          <Typography variant="body2" color="text.secondary">
            Sau khi restore thành công, trạng thái nhân viên sẽ về ACTIVE và tài khoản sẽ được mở truy cập lại.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onConfirm} variant="contained" color="warning" disabled={loading}>
          Xác nhận restore
        </Button>
      </DialogActions>
    </Dialog>
  );
}
