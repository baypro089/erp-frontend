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
  MenuItem,
} from '@mui/material';
import type {
  PositionResponse,
  CreatePositionDTO,
  UpdatePositionDTO,
} from '@libs/shared/types/positions.type';

const SALARY_UNITS = {
  ten: { label: 'Chục', multiplier: 10 },
  hundred: { label: 'Trăm', multiplier: 100 },
  thousand: { label: 'Nghìn', multiplier: 1_000 },
  million: { label: 'Triệu', multiplier: 1_000_000 },
} as const;

type SalaryUnitKey = keyof typeof SALARY_UNITS;

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
  const [salaryAmountInput, setSalaryAmountInput] = useState<number>(0);
  const [salaryUnit, setSalaryUnit] = useState<SalaryUnitKey>('million');

  const isEdit = !!selectedPosition;

  // Load data when editing
  useEffect(() => {
    if (selectedPosition) {
      const unit: SalaryUnitKey = 'million';
      setFormData({
        name: selectedPosition.name,
        baseSalary: selectedPosition.baseSalary,
        description: selectedPosition.description || '',
      });
      setSalaryUnit(unit);
      setSalaryAmountInput(Number((selectedPosition.baseSalary / SALARY_UNITS[unit].multiplier).toFixed(2)));
    } else {
      setFormData({
        name: '',
        baseSalary: 0,
        description: '',
      });
      setSalaryAmountInput(0);
      setSalaryUnit('million');
    }
    setErrors({});
  }, [selectedPosition, open]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; baseSalary?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên chức vụ là bắt buộc';
    }

    if (!formData.baseSalary || formData.baseSalary <= 0) {
      newErrors.baseSalary = 'Lương cơ bản phải lớn hơn 0';
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

  const handleSalaryAmountChange = (value: string) => {
    const parsed = Number(value);
    const amount = Number.isNaN(parsed) ? 0 : parsed;
    setSalaryAmountInput(amount);
    setFormData({
      ...formData,
      baseSalary: amount * SALARY_UNITS[salaryUnit].multiplier,
    });
  };

  const handleSalaryUnitChange = (unit: SalaryUnitKey) => {
    const currentSalary = Number(formData.baseSalary) || 0;
    const nextAmount = currentSalary / SALARY_UNITS[unit].multiplier;
    setSalaryUnit(unit);
    setSalaryAmountInput(Number.isFinite(nextAmount) ? Number(nextAmount.toFixed(2)) : 0);
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
        {isEdit ? 'Chỉnh sửa chức vụ' : 'Thêm chức vụ mới'}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          {/* Position Name */}
          <TextField
            label="Tên chức vụ"
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
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <TextField
              label="Lương cơ bản"
              type="number"
              value={salaryAmountInput}
              onChange={(e) => handleSalaryAmountChange(e.target.value)}
              error={!!errors.baseSalary}
              helperText={
                errors.baseSalary || `Tương đương: ${Number(formData.baseSalary || 0).toLocaleString('vi-VN')} đ`
              }
              fullWidth
              required
              disabled={loading}
              InputProps={{
                endAdornment: <InputAdornment position="end">{SALARY_UNITS[salaryUnit].label}</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                step: 0.01,
              }}
            />

            <TextField
              label="Đơn vị"
              select
              value={salaryUnit}
              onChange={(e) => handleSalaryUnitChange(e.target.value as SalaryUnitKey)}
              disabled={loading}
              sx={{ minWidth: 160 }}
            >
              {Object.entries(SALARY_UNITS).map(([key, unit]) => (
                <MenuItem key={key} value={key}>
                  {unit.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

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
