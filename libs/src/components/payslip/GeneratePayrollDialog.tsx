'use client';

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
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Calculate as CalculateIcon } from '@mui/icons-material';

interface GeneratePayrollDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (month: number, year: number) => Promise<void>;
  loading?: boolean;
}

export default function GeneratePayrollDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
}: GeneratePayrollDialogProps) {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    if (open) {
      const now = new Date();
      setMonth(now.getMonth() + 1);
      setYear(now.getFullYear());
    }
  }, [open]);

  const handleSubmit = async () => {
    await onSubmit(month, year);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const months = [
    { value: 1, label: 'Tháng 01' },
    { value: 2, label: 'Tháng 02' },
    { value: 3, label: 'Tháng 03' },
    { value: 4, label: 'Tháng 04' },
    { value: 5, label: 'Tháng 05' },
    { value: 6, label: 'Tháng 06' },
    { value: 7, label: 'Tháng 07' },
    { value: 8, label: 'Tháng 08' },
    { value: 9, label: 'Tháng 09' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalculateIcon color="primary" />
        Tính lương hàng loạt
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          <TextField
            select
            fullWidth
            label="Tháng"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            disabled={loading}
            required
          >
            {months.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Năm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            disabled={loading}
            required
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>

          <Box
            sx={{
              p: 2,
              bgcolor: 'info.lighter',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.light',
            }}
          >
            <Box component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              Hệ thống sẽ tính lương cho{' '}
              <strong>tất cả nhân viên</strong> trong tháng{' '}
              {month.toString().padStart(2, '0')}/{year}
            </Box>
          </Box>
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
          startIcon={loading ? <CircularProgress size={20} /> : <CalculateIcon />}
        >
          {loading ? 'Đang tính toán...' : 'Tính lương'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
