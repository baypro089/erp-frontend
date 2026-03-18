'use client';

import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import type { DepartmentResponse } from '@libs/shared/types/departments.type';
import type { PositionResponse } from '@libs/shared/types/positions.type';
import type { CreateJobHistoryDto } from '@libs/shared/types/job-histories.type';

interface JobHistoryFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobHistoryDto) => Promise<void>;
  employeeId: string;
  departments: DepartmentResponse[];
  positions: PositionResponse[];
  loading?: boolean;
}

export default function JobHistoryFormDrawer({
  open,
  onClose,
  onSubmit,
  employeeId,
  departments,
  positions,
  loading = false,
}: JobHistoryFormDrawerProps) {
  const [formData, setFormData] = useState<CreateJobHistoryDto>({
    employeeId: employeeId,
    departmentId: '',
    positionId: '',
    startDate: new Date(),
    salaryAtTime: 0,
    note: '',
  });

  const [errors, setErrors] = useState<{
    departmentId?: string;
    positionId?: string;
    startDate?: string;
    salaryAtTime?: string;
  }>({});

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      setFormData({
        employeeId: employeeId,
        departmentId: '',
        positionId: '',
        startDate: new Date(),
        salaryAtTime: 0,
        note: '',
      });
      setErrors({});
    }
  }, [open, employeeId]);

  const handleChange = (field: keyof CreateJobHistoryDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.departmentId) {
      newErrors.departmentId = 'Vui lòng chọn phòng ban';
    }
    if (!formData.positionId) {
      newErrors.positionId = 'Vui lòng chọn chức vụ';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.startDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.startDate = 'Ngày bắt đầu phải từ hôm nay trở đi';
      }
    }
    if (!formData.salaryAtTime || formData.salaryAtTime <= 0) {
      newErrors.salaryAtTime = 'Vui lòng nhập mức lương hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Salary units (amount + unit selector)
  const SALARY_UNITS = {
    ten: { label: 'Chục', multiplier: 10 },
    hundred: { label: 'Trăm', multiplier: 100 },
    thousand: { label: 'Nghìn', multiplier: 1_000 },
    million: { label: 'Triệu', multiplier: 1_000_000 },
  } as const;

  type SalaryUnitKey = keyof typeof SALARY_UNITS;

  const [salaryAmountInput, setSalaryAmountInput] = useState<number>(0);
  const [salaryUnit, setSalaryUnit] = useState<SalaryUnitKey>('million');

  // Reset amount/unit when drawer opens
  useEffect(() => {
    if (open) {
      setSalaryAmountInput(0);
      setSalaryUnit('million');
    }
  }, [open]);

  const handleSalaryAmountChange = (value: string) => {
    const parsed = Number(value);
    const amount = Number.isNaN(parsed) ? 0 : parsed;
    setSalaryAmountInput(amount);
    setFormData((prev) => ({
      ...prev,
      salaryAtTime: amount * SALARY_UNITS[salaryUnit].multiplier,
    }));
  };

  const handleSalaryUnitChange = (unit: SalaryUnitKey) => {
    const currentSalary = Number(formData.salaryAtTime) || 0;
    const nextAmount = currentSalary / SALARY_UNITS[unit].multiplier;
    setSalaryUnit(unit);
    setSalaryAmountInput(Number.isFinite(nextAmount) ? Number(nextAmount.toFixed(2)) : 0);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Điều chuyển / Tăng lương
          </Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Chức năng này chỉ dành cho HR Manager/Admin. Thông tin sẽ được lưu vào lịch sử công việc của nhân viên.
        </Alert>

        {/* Form */}
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Department Select */}
          <TextField
            select
            label="Phòng ban mới"
            value={formData.departmentId}
            onChange={(e) => handleChange('departmentId', e.target.value)}
            error={!!errors.departmentId}
            helperText={errors.departmentId}
            disabled={loading}
            required
            fullWidth
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Position Select */}
          <TextField
            select
            label="Chức vụ mới"
            value={formData.positionId}
            onChange={(e) => handleChange('positionId', e.target.value)}
            error={!!errors.positionId}
            helperText={errors.positionId}
            disabled={loading}
            required
            fullWidth
          >
            {positions.map((pos) => (
              <MenuItem key={pos.id} value={pos.id}>
                {pos.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Salary Input (amount + unit) */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <TextField
              label="Mức lương mới"
              type="number"
              value={salaryAmountInput}
              onChange={(e) => handleSalaryAmountChange(e.target.value)}
              error={!!errors.salaryAtTime}
              helperText={errors.salaryAtTime || `Tương đương: ${formatCurrency(formData.salaryAtTime)} đ`}
              disabled={loading}
              required
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              label="Đơn vị"
              select
              value={salaryUnit}
              onChange={(e) => handleSalaryUnitChange(e.target.value as SalaryUnitKey)}
              disabled={loading}
              sx={{ minWidth: 140 }}
            >
              {Object.entries(SALARY_UNITS).map(([key, unit]) => (
                <MenuItem key={key} value={key}>
                  {unit.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Start Date */}
          <TextField
            type="date"
            label="Ngày bắt đầu hiệu lực"
            value={
              formData.startDate
                ? new Date(formData.startDate).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => handleChange('startDate', new Date(e.target.value))}
            error={!!errors.startDate}
            helperText={errors.startDate || 'Ngày bắt đầu phải từ hôm nay trở đi'}
            disabled={loading}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: getTodayDate() }}
          />

          {/* Note TextArea */}
          <TextField
            label="Lý do"
            value={formData.note || ''}
            onChange={(e) => handleChange('note', e.target.value)}
            disabled={loading}
            fullWidth
            multiline
            rows={4}
            placeholder="VD: Đánh giá định kỳ năm 2026"
          />

          {/* Actions */}
          <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={loading}
              size="large"
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={<SaveIcon />}
              size="large"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
