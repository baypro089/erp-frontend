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
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { LeaveRequestStatus } from '@libs/shared/enums/leave-request-status.enum';
import type { LeaveRequestResponse } from '@libs/shared/types/leave-requests.type';

interface ApproveRejectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (status: LeaveRequestStatus, reason?: string) => Promise<void>;
  action: 'approve' | 'reject';
  leaveRequest: LeaveRequestResponse | null;
  loading?: boolean;
}

export default function ApproveRejectDialog({
  open,
  onClose,
  onConfirm,
  action,
  leaveRequest,
  loading = false,
}: ApproveRejectDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const isApprove = action === 'approve';

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setReason('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    // Validate reason for rejection
    if (!isApprove && !reason.trim()) {
      setError('Lý do từ chối là bắt buộc');
      return;
    }

    const status = isApprove
      ? LeaveRequestStatus.APPROVED
      : LeaveRequestStatus.REJECTED;

    await onConfirm(status, reason || undefined);
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
      <DialogTitle
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: isApprove ? 'success.50' : 'error.50',
        }}
      >
        {isApprove ? (
          <CheckCircle color="success" />
        ) : (
          <Cancel color="error" />
        )}
        <Typography variant="h6" component="span">
          {isApprove ? 'Duyệt đơn nghỉ phép' : 'Từ chối đơn nghỉ phép'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        {leaveRequest && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                Nhân viên: {leaveRequest.employee.fullName}
              </Typography>
              <Typography variant="body2">
                Từ ngày: {new Date(leaveRequest.startDate).toLocaleDateString('vi-VN')}
              </Typography>
              <Typography variant="body2">
                Đến ngày: {new Date(leaveRequest.endDate).toLocaleDateString('vi-VN')}
              </Typography>
              <Typography variant="body2">
                Số ngày: {leaveRequest.duration} ngày
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Lý do: {leaveRequest.reason}
              </Typography>
            </Alert>
          </Box>
        )}

        {isApprove ? (
          <Typography>
            Bạn có chắc chắn muốn <strong>duyệt</strong> đơn nghỉ phép này?
          </Typography>
        ) : (
          <Box>
            <Typography sx={{ mb: 2 }}>
              Vui lòng nhập lý do từ chối:
            </Typography>
            <TextField
              label="Lý do từ chối"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error}
              fullWidth
              required
              multiline
              rows={4}
              disabled={loading}
              placeholder="Nhập lý do từ chối đơn nghỉ phép..."
              autoFocus
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={isApprove ? 'success' : 'error'}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} />
            ) : isApprove ? (
              <CheckCircle />
            ) : (
              <Cancel />
            )
          }
        >
          {loading ? 'Đang xử lý...' : isApprove ? 'Duyệt đơn' : 'Từ chối'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
