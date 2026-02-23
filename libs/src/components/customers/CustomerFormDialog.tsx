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
  MenuItem,
} from '@mui/material';
import { People as CustomerIcon } from '@mui/icons-material';
import type {
  CustomerResponse,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '@libs/shared/types/customer.type';
import { CustomerTier } from '@libs/shared/enums/customer-tier.enum';

interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerDto | UpdateCustomerDto, isEdit: boolean) => Promise<void>;
  selectedCustomer: CustomerResponse | null;
  loading?: boolean;
}

export default function CustomerFormDialog({
  open,
  onClose,
  onSubmit,
  selectedCustomer,
  loading = false,
}: CustomerFormDialogProps) {
  const [formData, setFormData] = useState<CreateCustomerDto & { tier?: CustomerTier; isActive?: boolean }>({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    note: '',
    tier: CustomerTier.STANDARD,
    isActive: true,
  });

  const [errors, setErrors] = useState<{
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  }>({});

  const isEdit = !!selectedCustomer;

  // Load data when editing
  useEffect(() => {
    if (selectedCustomer) {
      setFormData({
        fullName: selectedCustomer.fullName,
        phoneNumber: selectedCustomer.phoneNumber,
        email: selectedCustomer.email || '',
        address: selectedCustomer.address || '',
        note: selectedCustomer.note || '',
        tier: selectedCustomer.tier,
        isActive: selectedCustomer.isActive,
      });
    } else {
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        address: '',
        note: '',
        tier: CustomerTier.STANDARD,
        isActive: true,
      });
    }
    setErrors({});
  }, [selectedCustomer, open]);

  const validateForm = (): boolean => {
    const newErrors: {
      fullName?: string;
      phoneNumber?: string;
      email?: string;
    } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ (10-11 chữ số)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const submitData: CreateCustomerDto | UpdateCustomerDto = isEdit
      ? {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email || undefined,
          address: formData.address || undefined,
          note: formData.note || undefined,
          tier: formData.tier,
          isActive: formData.isActive,
        }
      : {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email || undefined,
          address: formData.address || undefined,
          note: formData.note || undefined,
        };

    await onSubmit(submitData, isEdit);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const getTierLabel = (tier: CustomerTier): string => {
    const tierLabels: Record<CustomerTier, string> = {
      [CustomerTier.STANDARD]: 'Thường',
      [CustomerTier.SILVER]: 'Bạc',
      [CustomerTier.GOLD]: 'Vàng',
      [CustomerTier.PLATINUM]: 'Bạch Kim',
    };
    return tierLabels[tier] || tier;
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
        <CustomerIcon color="primary" />
        <Typography variant="h6" component="div">
          {isEdit ? 'Sửa Khách Hàng' : 'Thêm Khách Hàng Mới'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          {/* Full Name */}
          <TextField
            label="Họ và tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={!!errors.fullName}
            helperText={errors.fullName}
            fullWidth
            required
            autoFocus
            disabled={loading}
            placeholder="Nguyễn Văn A"
          />

          {/* Phone Number */}
          <TextField
            label="Số điện thoại"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            fullWidth
            required
            disabled={loading}
            placeholder="0901234567"
            inputProps={{
              maxLength: 11,
            }}
          />

          {/* Email */}
          <TextField
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            disabled={loading}
            placeholder="example@email.com"
            type="email"
          />

          {/* Address */}
          <TextField
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            fullWidth
            disabled={loading}
            placeholder="123 Đường ABC, Quận 1, TP.HCM"
            multiline
            rows={2}
          />

          {/* Note */}
          <TextField
            label="Ghi chú"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            fullWidth
            disabled={loading}
            placeholder="Ghi chú về khách hàng..."
            multiline
            rows={2}
          />

          {/* Tier - Only show when editing */}
          {isEdit && (
            <TextField
              select
              label="Hạng thành viên"
              value={formData.tier}
              onChange={(e) => setFormData({ ...formData, tier: e.target.value as CustomerTier })}
              fullWidth
              disabled={loading}
            >
              <MenuItem value={CustomerTier.STANDARD}>{getTierLabel(CustomerTier.STANDARD)}</MenuItem>
              <MenuItem value={CustomerTier.SILVER}>{getTierLabel(CustomerTier.SILVER)}</MenuItem>
              <MenuItem value={CustomerTier.GOLD}>{getTierLabel(CustomerTier.GOLD)}</MenuItem>
              <MenuItem value={CustomerTier.PLATINUM}>{getTierLabel(CustomerTier.PLATINUM)}</MenuItem>
            </TextField>
          )}

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
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          color="primary"
        >
          {loading ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
