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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Business as SupplierIcon } from '@mui/icons-material';
import type {
  SupplierResponse,
  CreateSupplierDTO,
  UpdateSupplierDTO,
} from '@libs/shared/types/supplier.type';

interface SupplierFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSupplierDTO | UpdateSupplierDTO, isEdit: boolean) => Promise<void>;
  selectedSupplier: SupplierResponse | null;
  loading?: boolean;
}

export default function SupplierFormDialog({
  open,
  onClose,
  onSubmit,
  selectedSupplier,
  loading = false,
}: SupplierFormDialogProps) {
  const [formData, setFormData] = useState<CreateSupplierDTO & { isActive?: boolean }>({
    name: '',
    contactPhone: '',
    address: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    contactPhone?: string;
    address?: string;
  }>({});

  const isEdit = !!selectedSupplier;

  // Load data when editing
  useEffect(() => {
    if (selectedSupplier) {
      setFormData({
        name: selectedSupplier.name,
        contactPhone: selectedSupplier.contactPhone,
        address: selectedSupplier.address,
        isActive: selectedSupplier.isActive,
      });
    } else {
      setFormData({
        name: '',
        contactPhone: '',
        address: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [selectedSupplier, open]);

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      contactPhone?: string;
      address?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên nhà cung cấp là bắt buộc';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.contactPhone.trim())) {
      newErrors.contactPhone = 'Số điện thoại không hợp lệ (10-11 chữ số)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const submitData: CreateSupplierDTO | UpdateSupplierDTO = isEdit
      ? {
          name: formData.name,
          contactPhone: formData.contactPhone,
          address: formData.address,
          isActive: formData.isActive,
        }
      : {
          name: formData.name,
          contactPhone: formData.contactPhone,
          address: formData.address,
        };

    await onSubmit(submitData, isEdit);
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
      <DialogTitle sx={{ pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SupplierIcon color="primary" />
        <Typography variant="h6" component="div">
          {isEdit ? 'Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          {/* Supplier Name */}
          <TextField
            label="Tên nhà cung cấp"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            autoFocus
            disabled={loading}
            placeholder="Công ty TNHH ABC"
          />

          {/* Contact Phone */}
          <TextField
            label="Số điện thoại"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            error={!!errors.contactPhone}
            helperText={errors.contactPhone}
            fullWidth
            required
            disabled={loading}
            placeholder="0901234567"
            inputProps={{
              maxLength: 11,
            }}
          />

          {/* Address */}
          <TextField
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={!!errors.address}
            helperText={errors.address}
            fullWidth
            required
            disabled={loading}
            placeholder="123 Đường ABC, Quận 1, TP.HCM"
            multiline
            rows={3}
          />

          {/* Active Status - Only show when editing */}
          {isEdit && (
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  disabled={loading}
                  color="success"
                />
              }
              label={
                <Typography variant="body2">
                  {formData.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </Typography>
              }
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} variant="outlined">
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={loading} variant="contained" color="primary">
          {loading ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
