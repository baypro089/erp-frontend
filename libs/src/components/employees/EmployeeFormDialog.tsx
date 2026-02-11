'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@libs/src/store';
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
  Typography,
} from '@mui/material';
import type {
  EmployeeResponse,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from '@libs/shared/types/employees.type';

interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmployeeDto) => Promise<void>;
  loading?: boolean;
}

export default function EmployeeFormDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
}: EmployeeFormDialogProps) {
  const { departments } = useSelector((state: RootState) => state.department);
  const { positions } = useSelector((state: RootState) => state.position);

  const [formData, setFormData] = useState<CreateEmployeeDto>({
    fullName: '',
    employeeCode: '',
    startDate: new Date(),
    departmentId: '',
    currentPositionId: '',
    initSalary: 0,
  });

  const [errors, setErrors] = useState<{
    fullName?: string;
    employeeCode?: string;
    startDate?: string;
    departmentId?: string;
    currentPositionId?: string;
    initSalary?: string;
  }>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        fullName: '',
        employeeCode: '',
        startDate: new Date(),
        departmentId: '',
        currentPositionId: '',
        initSalary: 0,
      });
      setErrors({});
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = 'Employee code is required';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    if (!formData.currentPositionId) {
      newErrors.currentPositionId = 'Position is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.initSalary === undefined || formData.initSalary === 0) {
      newErrors.initSalary = 'Initial salary is required and must be greater than 0';
    } else if (isNaN(Number(formData.initSalary))) {
      newErrors.initSalary = 'Initial salary must be a number';
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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2, fontWeight: 'bold', backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
        Thêm mới nhân viên
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
            placeholder="Nhập họ và tên nhân viên"
          />

          {/* Employee Code */}
          <TextField
            label="Mã nhân viên"
            value={formData.employeeCode}
            onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
            error={!!errors.employeeCode}
            helperText={errors.employeeCode}
            fullWidth
            required
            disabled={loading}
            placeholder="e.g., EMP001"
          />

          {/* Start Date */}
          <TextField
            label="Ngày bắt đầu"
            type="date"
            value={
              formData.startDate instanceof Date
                ? formData.startDate.toISOString().split('T')[0]
                : formData.startDate
            }
            onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
            error={!!errors.startDate}
            helperText={errors.startDate}
            fullWidth
            required
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />

          {/* Department */}
          <TextField
            label="Phòng ban"
            select
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            error={!!errors.departmentId}
            helperText={errors.departmentId}
            fullWidth
            required
            disabled={loading}
          >
            <MenuItem value="">
              <em>Chọn phòng ban</em>
            </MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Position */}
          <TextField
            label="Chức vụ"
            select
            value={formData.currentPositionId}
            onChange={(e) => setFormData({ ...formData, currentPositionId: e.target.value })}
            error={!!errors.currentPositionId}
            helperText={errors.currentPositionId}
            fullWidth
            required
            disabled={loading}
          >
            <MenuItem value="">
              <em>Chọn chức vụ</em>
            </MenuItem>
            {positions.map((pos) => (
              <MenuItem key={pos.id} value={pos.id}>
                {pos.name} - ${pos.baseSalary.toLocaleString()}
              </MenuItem>
            ))}
          </TextField>

          {/* Initial Salary */}
          <TextField
            label="Lương khởi điểm"
            type="number"
            value={formData.initSalary}
            onChange={(e) => setFormData({ ...formData, initSalary: Number(e.target.value) })}
            error={!!errors.initSalary}
            helperText={errors.initSalary}
            fullWidth
            required
            disabled={loading}
            placeholder="Nhập lương khởi điểm"
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
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
