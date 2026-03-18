import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import type { EmployeeResponse } from '@libs/shared/types/employees.type';

export type TerminationFromEmployeeForm = {
  terminationDate: string;
  terminationReason: string;
  document: string;
};

export type TerminationFromEmployeeErrors = Partial<
  Record<keyof TerminationFromEmployeeForm, string>
>;

interface TerminationRequestFromEmployeeDialogProps {
  open: boolean;
  employee: EmployeeResponse | null;
  form: TerminationFromEmployeeForm;
  errors: TerminationFromEmployeeErrors;
  loading?: boolean;
  onClose: () => void;
  onChange: (field: keyof TerminationFromEmployeeForm, value: string) => void;
  onSubmit: () => void;
}

export default function TerminationRequestFromEmployeeDialog({
  open,
  employee,
  form,
  errors,
  loading = false,
  onClose,
  onChange,
  onSubmit,
}: TerminationRequestFromEmployeeDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo yêu cầu sa thải</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Nhân viên"
            value={employee?.fullName || ''}
            fullWidth
            disabled
          />

          <TextField
            label="Ngày sa thải"
            type="date"
            value={form.terminationDate}
            onChange={(event) => onChange('terminationDate', event.target.value)}
            error={Boolean(errors.terminationDate)}
            helperText={errors.terminationDate || 'Bắt buộc'}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Lý do sa thải"
            value={form.terminationReason}
            onChange={(event) => onChange('terminationReason', event.target.value)}
            error={Boolean(errors.terminationReason)}
            helperText={errors.terminationReason || 'Bắt buộc (10-1000 ký tự)'}
            multiline
            minRows={3}
            fullWidth
          />

          <TextField
            label="Tài liệu đính kèm / đường dẫn"
            value={form.document}
            onChange={(event) => onChange('document', event.target.value)}
            error={Boolean(errors.document)}
            helperText={errors.document || 'Tùy chọn'}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onSubmit} variant="contained" color="error" disabled={loading}>
          Xác nhận sa thải
        </Button>
      </DialogActions>
    </Dialog>
  );
}
