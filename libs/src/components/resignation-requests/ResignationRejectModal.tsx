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
import { Cancel } from '@mui/icons-material';
import type { ResignationRequestResponse } from '@libs/shared/types/resignation-request.type';

interface ResignationRejectModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (hrNote: string) => Promise<void>;
  resignation: ResignationRequestResponse | null;
  loading?: boolean;
}

export default function ResignationRejectModal({
  open,
  onClose,
  onConfirm,
  resignation,
  loading = false,
}: ResignationRejectModalProps) {
  const [hrNote, setHrNote] = useState('');
  const [error, setError] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setHrNote('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    // Validate reason
    if (!hrNote.trim()) {
      setError('Lý do từ chối là bắt buộc');
      return;
    }

    if (hrNote.trim().length < 10) {
      setError('Lý do phải có ít nhất 10 ký tự');
      return;
    }

    await onConfirm(hrNote);
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
          bgcolor: 'error.50',
        }}
      >
        <Cancel color="error" />
        <Typography variant="h6" component="span">
          Từ chối đơn nghỉ việc
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
            </Alert>

            <Typography variant="body2" sx={{ mb: 2 }}>
              Vui lòng nhập lý do từ chối đơn xin thôi việc. Lý do này sẽ được gửi đến nhân viên.
            </Typography>

            <TextField
              label="Lý do từ chối"
              value={hrNote}
              onChange={(e) => {
                setHrNote(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error || 'Tối thiểu 10 ký tự'}
              fullWidth
              required
              multiline
              rows={5}
              disabled={loading}
              placeholder="Ví dụ: Công ty rất trân trọng đóng góp của bạn và mong muốn giữ chân bạn. Chúng tôi sẵn sàng thảo luận về cơ hội phát triển và điều chỉnh chế độ làm việc phù hợp hơn..."
              autoFocus
            />

            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="body2">
                Sau khi từ chối, nhân viên có thể nộp đơn mới hoặc liên hệ với HR để thảo luận thêm.
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
          disabled={loading || !hrNote.trim()}
          variant="contained"
          color="error"
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
