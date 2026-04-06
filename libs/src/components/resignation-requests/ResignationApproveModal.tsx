'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';
import type { ResignationRequestResponse } from '@libs/shared/types/resignation-request.type';

interface ResignationApproveModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (approvedLastDay: Date, hrNote?: string) => Promise<void>;
  resignation: ResignationRequestResponse | null;
  loading?: boolean;
}

export default function ResignationApproveModal({
  open,
  onClose,
  onConfirm,
  resignation,
  loading = false,
}: ResignationApproveModalProps) {
  const [approvedLastDay, setApprovedLastDay] = useState('');
  const [hrNote, setHrNote] = useState('');
  const [error, setError] = useState('');

  // Reset form when dialog opens or resignation changes
  useEffect(() => {
    if (open && resignation) {
      // Set default to desired last day
      const desiredDate = new Date(resignation.desiredLastDay);
      setApprovedLastDay(desiredDate.toISOString().split('T')[0]);
      setHrNote('');
      setError('');
    }
  }, [open, resignation]);

  const handleSubmit = async () => {
    // Validate approved last day
    if (!approvedLastDay) {
      setError('Ngày chốt là bắt buộc');
      return;
    }

    const selectedDate = new Date(approvedLastDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Ngày chốt phải là ngày trong tương lai');
      return;
    }

    await onConfirm(selectedDate, hrNote || undefined);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const getMonthEndDate = (date: Date): string => {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.toISOString().split('T')[0];
  };

  const suggestMonthEnd = () => {
    if (resignation) {
      const desiredDate = new Date(resignation.desiredLastDay);
      const monthEnd = getMonthEndDate(desiredDate);
      setApprovedLastDay(monthEnd);
      setError('');
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
      <DialogTitle
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'success.50',
        }}
      >
        <CheckCircle color="success" />
        <Typography variant="h6" component="span">
          Duyệt đơn nghỉ việc
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        {resignation && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                Nhân viên: {resignation.employee.fullName}
              </Typography>
              <Typography variant="body2">
                Ngày mong muốn: {new Date(resignation.desiredLastDay).toLocaleDateString('vi-VN')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Lý do: {resignation.reason}
              </Typography>
              {resignation.handoverNote && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Link bàn giao:{' '}
                  <a
                    href={resignation.handoverNote}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit' }}
                  >
                    {resignation.handoverNote}
                  </a>
                </Typography>
              )}
            </Alert>

            <Box sx={{ mb: 3 }}>
              <TextField
                label="Ngày làm việc cuối (Ngày chốt)"
                type="date"
                value={approvedLastDay}
                onChange={(e) => {
                  setApprovedLastDay(e.target.value);
                  setError('');
                }}
                error={!!error}
                helperText={
                  error ||
                  'HR có thể điều chỉnh ngày khác với ngày nhân viên mong muốn (thường chẵn tháng để dễ tính lương)'
                }
                fullWidth
                required
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0],
                }}
              />
              <Button
                size="small"
                onClick={suggestMonthEnd}
                sx={{ mt: 1 }}
                disabled={loading}
              >
                Gợi ý: Cuối tháng
              </Button>
            </Box>

            <TextField
              label="Ghi chú phỏng vấn / Tài sản cần thu hồi"
              value={hrNote}
              onChange={(e) => setHrNote(e.target.value)}
              fullWidth
              multiline
              rows={4}
              disabled={loading}
              placeholder="Ví dụ: Cần thu hồi laptop, điện thoại công ty, thẻ từ. Nhân viên đã hoàn thành bàn giao công việc."
              helperText="Ghi chú này sẽ hiển thị cho nhân viên"
            />

            <Alert severity="warning" icon={<Warning />} sx={{ mt: 3 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Xác nhận duyệt
              </Typography>
              <Typography variant="body2">
                Bạn đang xác nhận cho nhân viên{' '}
                <strong>{resignation.employee.fullName}</strong> nghỉ việc vào ngày{' '}
                <strong>
                  {approvedLastDay
                    ? new Date(approvedLastDay).toLocaleDateString('vi-VN')
                    : '___'}
                </strong>
                . Tài khoản sẽ tự động khóa vào ngày này.
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !approvedLastDay}
          variant="contained"
          color="success"
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận duyệt'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
