'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Autocomplete,
  Alert,
  Typography,
} from '@mui/material';
import { Warehouse as WarehouseIcon } from '@mui/icons-material';
import { fetchEmployees } from '@libs/src/features/employee/employee.slice';
import type {
  WarehouseResponse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from '@libs/shared/types/warehouse.type';
import { WarehouseType } from '@libs/shared/enums/warehouse-type.enum';
import { PORTAL_PERMISSIONS } from '@libs/shared/constants/portal-permissions.constant';

interface WarehouseFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWarehouseDto | UpdateWarehouseDto, isEdit: boolean) => Promise<void>;
  selectedWarehouse: WarehouseResponse | null;
  loading?: boolean;
}

export default function WarehouseFormDialog({
  open,
  onClose,
  onSubmit,
  selectedWarehouse,
  loading = false,
}: WarehouseFormDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { allEmployees } = useSelector((state: RootState) => state.employee);

  const [formData, setFormData] = useState<CreateWarehouseDto>({
    code: '',
    name: '',
    address: '',
    type: WarehouseType.CENTRAL,
    managerId: undefined,
  });

  const [errors, setErrors] = useState<{ code?: string; name?: string; type?: string }>({});

  const isEdit = !!selectedWarehouse;

  // Load employees
  useEffect(() => {
    if (open) {
      dispatch(fetchEmployees({ permissionPortal: PORTAL_PERMISSIONS.SALE }));
    }
  }, [dispatch, open]);

  // Load data when editing
  useEffect(() => {
    if (selectedWarehouse) {
      setFormData({
        code: selectedWarehouse.code,
        name: selectedWarehouse.name,
        address: selectedWarehouse.address || '',
        type: selectedWarehouse.type,
        managerId: selectedWarehouse.manager?.id,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        address: '',
        type: WarehouseType.CENTRAL,
        managerId: undefined,
      });
    }
    setErrors({});
  }, [selectedWarehouse, open]);

  const validateForm = (): boolean => {
    const newErrors: { code?: string; name?: string; type?: string } = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Mã kho là bắt buộc';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Tên kho là bắt buộc';
    }

    if (!formData.type) {
      newErrors.type = 'Loại kho là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const submitData = isEdit 
      ? {
          name: formData.name,
          address: formData.address,
          type: formData.type,
          managerId: formData.managerId,
        }
      : formData;

    await onSubmit(submitData, isEdit);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto uppercase
    setFormData({ ...formData, code: e.target.value.toUpperCase() });
  };

  const getWarehouseTypeLabel = (type: WarehouseType) => {
    switch (type) {
      case WarehouseType.CENTRAL:
        return 'Kho tổng';
      case WarehouseType.STORE:
        return 'Cửa hàng';
      case WarehouseType.DAMAGED:
        return 'Kho hủy';
      default:
        return type;
    }
  };

  const selectedManager = allEmployees.find((emp) => emp.id === formData.managerId);

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
      <DialogTitle sx={{ pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarehouseIcon color="primary" />
        <Typography variant="h6" component="div">
          {isEdit ? 'Sửa Kho Hàng' : 'Thêm Kho Hàng Mới'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          {/* Warehouse Code */}
          <TextField
            label="Mã kho"
            value={formData.code}
            onChange={handleCodeChange}
            error={!!errors.code}
            helperText={errors.code || 'Ví dụ: WH-HN-01'}
            fullWidth
            required
            autoFocus
            disabled={loading || isEdit}
            placeholder="WH-HN-01"
            inputProps={{
              style: { textTransform: 'uppercase' },
            }}
          />

          {/* Warehouse Name */}
          <TextField
            label="Tên kho"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            disabled={loading}
            placeholder="Kho Cầu Giấy"
          />

          {/* Warehouse Type */}
          <TextField
            label="Loại kho"
            select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as WarehouseType })}
            error={!!errors.type}
            helperText={errors.type}
            fullWidth
            required
            disabled={loading}
          >
            <MenuItem value={WarehouseType.CENTRAL}>
              {getWarehouseTypeLabel(WarehouseType.CENTRAL)}
            </MenuItem>
            <MenuItem value={WarehouseType.STORE}>
              {getWarehouseTypeLabel(WarehouseType.STORE)}
            </MenuItem>
            <MenuItem value={WarehouseType.DAMAGED}>
              {getWarehouseTypeLabel(WarehouseType.DAMAGED)}
            </MenuItem>
          </TextField>

          {/* Store Type Hint */}
          {formData.type === WarehouseType.STORE && (
            <Alert severity="info" sx={{ mt: -1 }}>
              <Typography variant="body2">
                💡 Kho cửa hàng sẽ hiển thị trong danh sách điểm bán của Sale.
              </Typography>
            </Alert>
          )}

          {/* Manager (Thủ kho) */}
          <Autocomplete
            options={allEmployees}
            getOptionLabel={(option) => `${option.fullName} (${option.employeeCode})`}
            value={selectedManager || null}
            onChange={(_, newValue) => {
              setFormData({ ...formData, managerId: newValue?.id });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Thủ kho"
                placeholder="Gõ tên để tìm nhân viên..."
                helperText="Tìm kiếm theo tên hoặc mã nhân viên"
              />
            )}
            disabled={loading}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="Không tìm thấy nhân viên"
          />

          {/* Address */}
          <TextField
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            fullWidth
            multiline
            rows={3}
            disabled={loading}
            placeholder="Nhập địa chỉ kho hàng..."
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
