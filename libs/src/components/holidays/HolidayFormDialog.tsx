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
} from '@mui/material';
import type { HolidayResponse, CreateHolidayDto } from '@libs/shared/types/holiday.type';

interface HolidayFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHolidayDto) => Promise<void>;
  selectedHoliday: HolidayResponse | null;
  loading?: boolean;
}

export default function HolidayFormDialog({
  open,
  onClose,
  onSubmit,
  selectedHoliday,
  loading = false,
}: HolidayFormDialogProps) {
  const [formData, setFormData] = useState<CreateHolidayDto>({
    name: '',
    date: new Date(),
    description: '',
  });

  const [errors, setErrors] = useState<{ name?: string; date?: string }>({});

  const isEdit = !!selectedHoliday;

  // Load data when editing
  useEffect(() => {
    if (selectedHoliday) {
      setFormData({
        name: selectedHoliday.name,
        date: new Date(selectedHoliday.date),
        description: selectedHoliday.description || '',
      });
    } else {
      setFormData({
        name: '',
        date: new Date(),
        description: '',
      });
    }
    setErrors({});
  }, [selectedHoliday, open]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; date?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên ngày lễ là bắt buộc';
    }

    if (!formData.date) {
      newErrors.date = 'Ngày là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
        {isEdit ? 'Chỉnh sửa ngày lễ' : 'Thêm ngày lễ mới'}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          {/* Holiday Name */}
          <TextField
            label="Tên ngày lễ"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            autoFocus
            disabled={loading}
            placeholder="e.g., Tết Nguyên Đán"
          />

          {/* Date */}
          <TextField
            label="Ngày"
            type="date"
            value={formatDateForInput(formData.date)}
            onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
            error={!!errors.date}
            helperText={errors.date}
            fullWidth
            required
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* Description */}
          <TextField
            label="Mô tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            disabled={loading}
            placeholder="Nhập mô tả (không bắt buộc)"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {isEdit ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
