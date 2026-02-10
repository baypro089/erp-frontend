'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  MenuItem,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import type { LeaveRequestCreateDto } from '@libs/shared/types/leave-requests.type';
import { LeaveRequestType } from '@libs/shared/enums/leave-request-status.enum';

interface LeaveRequestFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveRequestCreateDto) => Promise<void>;
  loading?: boolean;
  employeeId?: string;
}

export default function LeaveRequestFormDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  employeeId,
}: LeaveRequestFormDialogProps) {
  const [formData, setFormData] = useState<{
    startDate: string;
    endDate: string;
    type: LeaveRequestType;
    reason: string;
  }>({
    startDate: '',
    endDate: '',
    type: LeaveRequestType.ANNUAL,
    reason: '',
  });

  const [errors, setErrors] = useState<{
    startDate?: string;
    endDate?: string;
    reason?: string;
  }>({});

  // Calculate working days (excluding weekends)
  const calculateWorkingDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate > endDate) return 0;

    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  const workingDays = formData.startDate && formData.endDate
    ? calculateWorkingDays(formData.startDate, formData.endDate)
    : 0;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        startDate: '',
        endDate: '',
        type: LeaveRequestType.ANNUAL,
        reason: '',
      });
      setErrors({});
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Lý do là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!formData.startDate || !formData.endDate) return;

    if (!employeeId) {
      console.error('Employee ID is required');
      return;
    }

    const dto: LeaveRequestCreateDto = {
      employeeId: employeeId,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      type: formData.type,
      reason: formData.reason,
    };

    await onSubmit(dto);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        Xin Nghỉ Phép
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          {/* Leave Type */}
          <TextField
            select
            label="Loại nghỉ"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as LeaveRequestType })
            }
            fullWidth
            required
            disabled={loading}
          >
            <MenuItem value={LeaveRequestType.ANNUAL}>Phép năm</MenuItem>
            <MenuItem value={LeaveRequestType.SICK}>Nghỉ ốm</MenuItem>
            <MenuItem value={LeaveRequestType.UNPAID}>Không lương</MenuItem>
            <MenuItem value={LeaveRequestType.OTHER}>Khác</MenuItem>
          </TextField>

          {/* Start Date */}
          <TextField
            label="Ngày bắt đầu"
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
            required
            error={!!errors.startDate}
            helperText={errors.startDate}
            fullWidth
            disabled={loading}
          />

          {/* End Date */}
          <TextField
            label="Ngày kết thúc"
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: formData.startDate || undefined,
            }}
            required
            error={!!errors.endDate}
            helperText={errors.endDate}
            fullWidth
            disabled={loading}
          />

          {/* Duration Display */}
          {workingDays > 0 && (
            <Alert severity="info" icon={false}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  Tổng cộng:
                </Typography>
                <Chip
                  label={`${workingDays} ngày công`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Alert>
          )}

          {/* Reason */}
          <TextField
            label="Lý do"
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            error={!!errors.reason}
            helperText={errors.reason}
            fullWidth
            required
            multiline
            rows={3}
            disabled={loading}
            placeholder="Nhập lý do xin nghỉ phép..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Đang gửi...' : 'Gửi đơn'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
