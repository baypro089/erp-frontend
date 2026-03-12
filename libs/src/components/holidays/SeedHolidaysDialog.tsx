'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';

interface SeedHolidaysDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (year: number) => Promise<void>;
  loading?: boolean;
}

export default function SeedHolidaysDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
}: SeedHolidaysDialogProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [error, setError] = useState<string>('');

  const validateYear = (): boolean => {
    if (!year || year < 2000 || year > 2100) {
      setError('Vui lòng nhập năm hợp lệ từ 2000 đến 2100');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateYear()) return;
    await onSubmit(year);
  };

  const handleClose = () => {
    if (!loading) {
      setYear(currentYear);
      setError('');
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
      <DialogTitle sx={{ pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        Tự động thêm ngày lễ
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          <Alert severity="info" sx={{ mb: 1 }}>
            Thao tác này sẽ tự động tạo tất cả các ngày lễ quốc gia Việt Nam cho năm đã chọn.
          </Alert>

          <TextField
            label="Năm"
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            error={!!error}
            helperText={error || 'Nhập năm để tạo ngày lễ'}
            fullWidth
            required
            autoFocus
            disabled={loading}
            InputProps={{
              inputProps: { 
                min: 2000, 
                max: 2100 
              }
            }}
          />

          <Typography variant="body2" color="text.secondary">
            Các ngày lễ sẽ được thêm bao gồm:
            <Box component="ul" sx={{ mt: 1, mb: 0 }}>
              <li>Tết Nguyên Đán (Lunar New Year)</li>
              <li>Giỗ Tổ Hùng Vương</li>
              <li>Ngày Thống Nhất</li>
              <li>Quốc Khánh</li>
              <li>Và các ngày lễ quốc gia khác...</li>
            </Box>
          </Typography>
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
          startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
        >
          Tạo ngày lễ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
