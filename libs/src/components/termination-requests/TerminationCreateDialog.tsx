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

export type TerminationCreateFormState = {
  employeeId: string;
  terminationDate: string;
  terminationReason: string;
  document: string;
};

export type TerminationCreateFormErrors = Partial<
  Record<keyof TerminationCreateFormState, string>
>;

interface TerminationCreateDialogProps {
  open: boolean;
  onClose: () => void;
  form: TerminationCreateFormState;
  errors: TerminationCreateFormErrors;
  employees: EmployeeResponse[];
  loading?: boolean;
  onChange: (field: keyof TerminationCreateFormState, value: string) => void;
  onSubmit: () => void;
}

export default function TerminationCreateDialog({
  open,
  onClose,
  form,
  errors,
  employees,
  loading = false,
  onChange,
  onSubmit,
}: TerminationCreateDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo yêu cầu sa thải</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Nhân viên"
            value={form.employeeId}
            onChange={(event) => onChange('employeeId', event.target.value)}
            error={Boolean(errors.employeeId)}
            helperText={errors.employeeId || 'Bắt buộc'}
            SelectProps={{ native: true }}
            fullWidth
          >
            <option value="">Chọn nhân viên</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.fullName} ({employee.employeeCode})
              </option>
            ))}
          </TextField>

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
        <Button onClick={onSubmit} variant="contained" disabled={loading}>
          Tạo yêu cầu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
