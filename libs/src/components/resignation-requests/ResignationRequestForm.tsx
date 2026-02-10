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
  Typography,
  Alert,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import type { CreateResignationRequest } from '@libs/shared/types/resignation-request.type';

interface ResignationRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateResignationRequest) => Promise<void>;
  loading?: boolean;
  employeeId?: string;
}

export default function ResignationRequestForm({
  open,
  onClose,
  onSubmit,
  loading = false,
  employeeId,
}: ResignationRequestFormProps) {
  const [formData, setFormData] = useState<{
    desiredLastDay: string;
    reason: string;
    handoverNote: string;
  }>({
    desiredLastDay: '',
    reason: '',
    handoverNote: '',
  });

  const [errors, setErrors] = useState<{
    desiredLastDay?: string;
    reason?: string;
    handoverNote?: string;
  }>({});

  const [showWarning, setShowWarning] = useState(true);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        desiredLastDay: '',
        reason: '',
        handoverNote: '',
      });
      setErrors({});
      setShowWarning(true);
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.desiredLastDay) {
      newErrors.desiredLastDay = 'Ngày làm việc cuối mong muốn là bắt buộc';
    } else {
      const selectedDate = new Date(formData.desiredLastDay);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.desiredLastDay = 'Ngày làm việc cuối phải là ngày trong tương lai';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Lý do là bắt buộc';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Lý do phải có ít nhất 10 ký tự';
    }

    if (!formData.handoverNote.trim()) {
      newErrors.handoverNote = 'Link bàn giao là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!employeeId) {
      console.error('Employee ID is required');
      return;
    }

    const dto: CreateResignationRequest = {
      employeeId: employeeId,
      desiredLastDay: new Date(formData.desiredLastDay),
      reason: formData.reason,
      handoverNote: formData.handoverNote,
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" component="span">
          Tạo đơn xin thôi việc
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        {showWarning && (
          <Alert
            severity="warning"
            icon={<WarningIcon />}
            sx={{ mb: 3 }}
            onClose={() => setShowWarning(false)}
          >
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Quyết định quan trọng!
            </Typography>
            <Typography variant="body2">
              Việc xin thôi việc là quyết định quan trọng ảnh hưởng đến sự nghiệp của bạn. 
              Vui lòng trao đổi với quản lý trực tiếp trước khi gửi đơn. 
              Hãy chắc chắn rằng bạn đã cân nhắc kỹ lưỡng và có kế hoạch rõ ràng cho tương lai.
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Ngày làm việc cuối mong muốn"
            type="date"
            value={formData.desiredLastDay}
            onChange={(e) => {
              setFormData({ ...formData, desiredLastDay: e.target.value });
              setErrors({ ...errors, desiredLastDay: undefined });
            }}
            error={!!errors.desiredLastDay}
            helperText={errors.desiredLastDay || 'Chọn ngày làm việc cuối cùng bạn mong muốn'}
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

          <TextField
            label="Lý do xin thôi việc"
            value={formData.reason}
            onChange={(e) => {
              setFormData({ ...formData, reason: e.target.value });
              setErrors({ ...errors, reason: undefined });
            }}
            error={!!errors.reason}
            helperText={errors.reason || 'Vui lòng nêu rõ lý do xin thôi việc (tối thiểu 10 ký tự)'}
            fullWidth
            required
            multiline
            rows={4}
            disabled={loading}
            placeholder="Ví dụ: Tôi xin thôi việc vì có cơ hội phát triển nghề nghiệp tốt hơn..."
          />

          <TextField
            label="Link bàn giao công việc"
            value={formData.handoverNote}
            onChange={(e) => {
              setFormData({ ...formData, handoverNote: e.target.value });
              setErrors({ ...errors, handoverNote: undefined });
            }}
            error={!!errors.handoverNote}
            helperText={
              errors.handoverNote || 
              'Cung cấp link tài liệu bàn giao (Google Doc, Notion, v.v.)'
            }
            fullWidth
            required
            disabled={loading}
            placeholder="https://docs.google.com/document/d/..."
          />

          <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Lưu ý:</strong> Sau khi gửi đơn, bạn cần chờ phòng HR xử lý. 
              HR sẽ liên hệ để phỏng vấn và xác định ngày nghỉ chính thức. 
              Tài khoản của bạn sẽ tự động khóa vào ngày đã được duyệt.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          color="inherit"
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          color="error"
        >
          {loading ? 'Đang gửi...' : 'Gửi đơn xin thôi việc'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
