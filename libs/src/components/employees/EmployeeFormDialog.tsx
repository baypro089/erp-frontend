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
  InputAdornment,
} from '@mui/material';
import type {
  EmployeeResponse,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from '@libs/shared/types/employees.type';
import employeeService from '@libs/src/features/employee/employee.service';

const EMPLOYEE_CODE_PREFIX = 'EMP-';
const EMPLOYEE_CODE_DIGITS = 5;
const MIN_INIT_SALARY = 1_000_000;

const SALARY_UNITS = {
  ten: { label: 'Chục', multiplier: 10 },
  hundred: { label: 'Trăm', multiplier: 100 },
  thousand: { label: 'Nghìn', multiplier: 1_000 },
  million: { label: 'Triệu', multiplier: 1_000_000 },
} as const;

type SalaryUnitKey = keyof typeof SALARY_UNITS;

function generateNextEmployeeCodeFromList(employees: EmployeeResponse[]): string {
  const maxSerial = employees.reduce((max, employee) => {
    const code = employee.employeeCode?.trim();
    if (!code) return max;

    // Accept both EMP-00001 and legacy EMP00001 formats.
    const match = /^EMP-?(\d+)$/i.exec(code);
    if (!match) return max;

    const serial = Number(match[1]);
    if (Number.isNaN(serial)) return max;
    return Math.max(max, serial);
  }, 0);

  return `${EMPLOYEE_CODE_PREFIX}${String(maxSerial + 1).padStart(EMPLOYEE_CODE_DIGITS, '0')}`;
}

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
  const [generatingEmployeeCode, setGeneratingEmployeeCode] = useState(false);
  const [salaryAmountInput, setSalaryAmountInput] = useState<number>(1);
  const [salaryUnit, setSalaryUnit] = useState<SalaryUnitKey>('million');

  // Reset form when dialog opens
  useEffect(() => {
    let cancelled = false;

    const initForm = async () => {
      setGeneratingEmployeeCode(true);
      try {
        const employees = await employeeService.getEmployees();
        const nextEmployeeCode = generateNextEmployeeCodeFromList(employees);
        if (cancelled) return;

        setFormData({
          fullName: '',
          employeeCode: nextEmployeeCode,
          startDate: new Date(),
          departmentId: '',
          currentPositionId: '',
          initSalary: MIN_INIT_SALARY,
        });
        setSalaryAmountInput(1);
        setSalaryUnit('million');
      } catch {
        if (cancelled) return;
        setFormData({
          fullName: '',
          employeeCode: `${EMPLOYEE_CODE_PREFIX}${String(1).padStart(EMPLOYEE_CODE_DIGITS, '0')}`,
          startDate: new Date(),
          departmentId: '',
          currentPositionId: '',
          initSalary: MIN_INIT_SALARY,
        });
        setSalaryAmountInput(1);
        setSalaryUnit('million');
      } finally {
        if (!cancelled) {
          setGeneratingEmployeeCode(false);
          setErrors({});
        }
      }
    };

    if (open) {
      initForm();
    }

    return () => {
      cancelled = true;
    };
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = 'Mã nhân viên là bắt buộc';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Phòng ban là bắt buộc';
    }

    if (!formData.currentPositionId) {
      newErrors.currentPositionId = 'Chức vụ là bắt buộc';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }

    if (formData.initSalary === undefined || formData.initSalary === 0) {
      newErrors.initSalary = 'Lương khởi điểm là bắt buộc và phải lớn hơn 0';
    } else if (isNaN(Number(formData.initSalary))) {
      newErrors.initSalary = 'Lương khởi điểm phải là một số';
    } else if (Number(formData.initSalary) < MIN_INIT_SALARY) {
      newErrors.initSalary = 'Lương khởi điểm không thể nhỏ hơn 1.000.000 VND';
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

  const handleSalaryAmountChange = (value: string) => {
    const parsed = Number(value);
    const amount = Number.isNaN(parsed) ? 0 : parsed;
    setSalaryAmountInput(amount);
    setFormData({
      ...formData,
      initSalary: amount * SALARY_UNITS[salaryUnit].multiplier,
    });
  };

  const handleSalaryUnitChange = (unit: SalaryUnitKey) => {
    const currentSalary = Number(formData.initSalary) || 0;
    const nextAmount = currentSalary / SALARY_UNITS[unit].multiplier;
    setSalaryUnit(unit);
    setSalaryAmountInput(Number.isFinite(nextAmount) ? Number(nextAmount.toFixed(2)) : 0);
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
            error={!!errors.employeeCode}
            helperText={errors.employeeCode || 'Mã được tự động sinh theo định dạng EMP-xxxxx'}
            fullWidth
            required
            disabled={loading || generatingEmployeeCode}
            placeholder="EMP-00001"
            InputProps={{
              readOnly: true,
              endAdornment: generatingEmployeeCode ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined,
            }}
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
                {pos.name} - {pos.baseSalary.toLocaleString('vi-VN')} đ
              </MenuItem>
            ))}
          </TextField>

          {/* Initial Salary */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <TextField
              label="Lương khởi điểm"
              type="number"
              value={salaryAmountInput}
              onChange={(e) => handleSalaryAmountChange(e.target.value)}
              error={!!errors.initSalary}
              helperText={
                errors.initSalary ||
                `Tương đương: ${Number(formData.initSalary || 0).toLocaleString('vi-VN')} VND`
              }
              fullWidth
              required
              disabled={loading}
              placeholder="Nhập giá trị"
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
