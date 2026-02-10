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
      setError('Please enter a valid year between 2000 and 2100');
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
        Auto Seed Holidays
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          <Alert severity="info" sx={{ mb: 1 }}>
            This will automatically generate all Vietnamese national holidays for the selected year.
          </Alert>

          <TextField
            label="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            error={!!error}
            helperText={error || 'Enter the year to seed holidays'}
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
            This will add standard Vietnamese holidays including:
            <Box component="ul" sx={{ mt: 1, mb: 0 }}>
              <li>Tết Nguyên Đán (Lunar New Year)</li>
              <li>Giỗ Tổ Hùng Vương</li>
              <li>Ngày Thống Nhất</li>
              <li>Quốc Khánh</li>
              <li>And other national holidays...</li>
            </Box>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
        >
          Seed Holidays
        </Button>
      </DialogActions>
    </Dialog>
  );
}
