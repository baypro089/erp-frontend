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
  FormControlLabel,
  Switch,
} from '@mui/material';
import type {
  BrandResponse,
  CreateBrandDto,
  UpdateBrandDto,
} from '@libs/shared/types/brand.type';

interface BrandFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBrandDto | UpdateBrandDto, isEdit: boolean) => Promise<void>;
  selectedBrand: BrandResponse | null;
  loading?: boolean;
}

export default function BrandFormDialog({
  open,
  onClose,
  onSubmit,
  selectedBrand,
  loading = false,
}: BrandFormDialogProps) {
  const [formData, setFormData] = useState<CreateBrandDto & { isActive?: boolean }>({
    name: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<{ name?: string }>({});

  const isEdit = !!selectedBrand;

  // Load data when editing
  useEffect(() => {
    if (selectedBrand) {
      setFormData({
        name: selectedBrand.name,
        isActive: selectedBrand.isActive,
      });
    } else {
      setFormData({
        name: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [selectedBrand, open]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (isEdit) {
      // For update, send both name and isActive
      await onSubmit({ name: formData.name, isActive: formData.isActive }, isEdit);
    } else {
      // For create, only send name
      await onSubmit({ name: formData.name }, isEdit);
    }
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
        {isEdit ? 'Edit Brand' : 'Add New Brand'}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          {/* Brand Name */}
          <TextField
            label="Brand Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            autoFocus
            disabled={loading}
          />

          {/* Is Active - only show when editing */}
          {isEdit && (
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  disabled={loading}
                />
              }
              label="Active"
            />
          )}
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
