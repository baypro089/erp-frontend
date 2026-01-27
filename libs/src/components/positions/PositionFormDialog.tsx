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
  InputAdornment,
} from '@mui/material';
import type {
  PositionResponse,
  CreatePositionDTO,
  UpdatePositionDTO,
} from '@libs/shared/types/positions.type';

interface PositionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePositionDTO | UpdatePositionDTO, isEdit: boolean) => Promise<void>;
  selectedPosition: PositionResponse | null;
  loading?: boolean;
}

export default function PositionFormDialog({
  open,
  onClose,
  onSubmit,
  selectedPosition,
  loading = false,
}: PositionFormDialogProps) {
  const [formData, setFormData] = useState<CreatePositionDTO>({
    name: '',
    baseSalary: 0,
    description: '',
  });

  const [errors, setErrors] = useState<{ name?: string; baseSalary?: string }>({});

  const isEdit = !!selectedPosition;

  // Load data when editing
  useEffect(() => {
    if (selectedPosition) {
      setFormData({
        name: selectedPosition.name,
        baseSalary: selectedPosition.baseSalary,
        description: selectedPosition.description || '',
      });
    } else {
      setFormData({
        name: '',
        baseSalary: 0,
        description: '',
      });
    }
    setErrors({});
  }, [selectedPosition, open]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; baseSalary?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Position name is required';
    }

    if (!formData.baseSalary || formData.baseSalary <= 0) {
      newErrors.baseSalary = 'Base salary must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    await onSubmit(formData, isEdit);
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
        {isEdit ? 'Edit Position' : 'Add New Position'}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          {/* Position Name */}
          <TextField
            label="Position Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            autoFocus
            disabled={loading}
            placeholder="e.g., Software Engineer, Manager"
          />

          {/* Base Salary */}
          <TextField
            label="Base Salary"
            type="number"
            value={formData.baseSalary}
            onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
            error={!!errors.baseSalary}
            helperText={errors.baseSalary}
            fullWidth
            required
            disabled={loading}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{
              min: 0,
              step: 100,
            }}
          />

          {/* Description */}
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            disabled={loading}
            placeholder="Enter position description (optional)"
          />
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
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
