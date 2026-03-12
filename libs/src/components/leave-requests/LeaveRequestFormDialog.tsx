'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { calculateWorkingDays, resetWorkingDays } from '@libs/src/features/leave-request/leave-request.slice';
import type { AppDispatch, RootState } from '@libs/src/store';

interface LeaveRequestFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveRequestCreateDto) => Promise<void>;
  loading?: boolean;
  employeeId?: string;
  leaveBalance?: number;
}

export default function LeaveRequestFormDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  employeeId,
  leaveBalance = 0,
}: LeaveRequestFormDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { workingDays, calculatingDays } = useSelector((state: RootState) => state.leaveRequest);

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

  // Calculate working days using Redux action
  useEffect(() => {
    const fetchWorkingDays = async () => {
      if (!formData.startDate || !formData.endDate) {
        dispatch(resetWorkingDays());
        return;
      }

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate > endDate) {
        dispatch(resetWorkingDays());
        return;
      }

      dispatch(calculateWorkingDays({
        startDate: formData.startDate,
        endDate: formData.endDate,
      }));
    };

    fetchWorkingDays();
  }, [formData.startDate, formData.endDate, dispatch]);

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
      dispatch(resetWorkingDays());
    }
  }, [open, dispatch]);

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
      autoSplitIfInsufficient: formData.type === LeaveRequestType.ANNUAL && workingDays > leaveBalance,
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
          {(workingDays > 0 || calculatingDays) && (
            <Box>
              <Alert severity="info" icon={false}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    Tổng cộng:
                  </Typography>
                  {calculatingDays ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Chip
                      label={`${workingDays} ngày công`}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>
              </Alert>
              {!calculatingDays && formData.type === LeaveRequestType.ANNUAL && workingDays > leaveBalance && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block', fontWeight: 500 }}>
                  * Số ngày nghỉ vượt quá quỹ phép ({leaveBalance} ngày). Hệ thống sẽ tự động tách đơn.
                </Typography>
              )}
            </Box>
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
