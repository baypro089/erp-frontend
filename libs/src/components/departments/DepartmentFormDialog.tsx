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
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type {
  DepartmentResponse,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
} from '@libs/shared/types/departments.type';
import type { EmployeeTableResponse } from '@libs/shared/types/employees.type';
import EmployeePickerDialog from './EmployeePickerDialog';
import employeeService from '@libs/src/features/employee/employee.service';

interface DepartmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDepartmentDTO | UpdateDepartmentDTO, isEdit: boolean) => Promise<void>;
  selectedDepartment: DepartmentResponse | null;
  loading?: boolean;
}

export default function DepartmentFormDialog({
  open,
  onClose,
  onSubmit,
  selectedDepartment,
  loading = false,
}: DepartmentFormDialogProps) {
  const [formData, setFormData] = useState<CreateDepartmentDTO>({
    name: '',
    description: '',
  });

  const [managerId, setManagerId] = useState<string | undefined>(undefined);
  const [managerInfo, setManagerInfo] = useState<EmployeeTableResponse | null>(null);
  const [managerInfoLoading, setManagerInfoLoading] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);

  const [errors, setErrors] = useState<{ name?: string }>({});

  const isEdit = !!selectedDepartment;
  const canSelectManager = isEdit && (selectedDepartment?.totalEmployees || 0) > 0;

  // Load data when editing
  useEffect(() => {
    if (selectedDepartment) {
      setFormData({
        name: selectedDepartment.name,
        description: selectedDepartment.description || '',
      });
      setManagerId(selectedDepartment.managerId);
      setManagerInfo(null);
    } else {
      setFormData({
        name: '',
        description: '',
      });
      setManagerId(undefined);
      setManagerInfo(null);
    }
    setErrors({});
  }, [selectedDepartment, open]);

  useEffect(() => {
    const loadManagerInfo = async () => {
      if (!open || !selectedDepartment?.managerId) {
        setManagerInfoLoading(false);
        return;
      }

      setManagerInfoLoading(true);
      try {
        const manager = await employeeService.getEmployeeById(selectedDepartment.managerId);
        setManagerInfo({
          id: manager.id,
          employeeCode: manager.employeeCode,
          fullName: manager.fullName,
          startDate: manager.startDate,
          departmentName: manager.department?.name,
          positionName: manager.currentPosition?.name,
          createdAt: manager.createdAt,
          updatedAt: manager.updatedAt,
          status: manager.status,
        });
      } catch {
        setManagerInfo(null);
      } finally {
        setManagerInfoLoading(false);
      }
    };

    loadManagerInfo();
  }, [open, selectedDepartment?.managerId]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên phòng ban là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (isEdit) {
      const updateData: UpdateDepartmentDTO = {
        name: formData.name,
        description: formData.description,
        managerId: managerId,
      };
      await onSubmit(updateData, true);
    } else {
      await onSubmit(formData, false);
    }
  };

  const handleManagerSelect = (employee: EmployeeTableResponse) => {
    setManagerId(employee.id);
    setManagerInfo(employee);
  };

  const handleClearManager = () => {
    setManagerId(undefined);
    setManagerInfo(null);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <>
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
          {isEdit ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            {/* Department Name */}
            <TextField
              label="Tên phòng ban"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
              autoFocus
              disabled={loading}
            />

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

            {/* Manager picker — only in edit mode */}
            {isEdit && (
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Trưởng phòng
                </Typography>

                {managerInfo ? (
                  /* Show selected employee info */
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PersonIcon color="primary" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {managerInfo.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {managerInfo.employeeCode}
                          {managerInfo.positionName ? ` · ${managerInfo.positionName}` : ''}
                          {managerInfo.departmentName ? ` · ${managerInfo.departmentName}` : ''}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Thay đổi">
                          <IconButton size="small" onClick={() => setOpenPicker(true)} disabled={loading || !canSelectManager}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa trưởng phòng">
                          <IconButton size="small" onClick={handleClearManager} disabled={loading} color="error">
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Paper>
                ) : managerId && !managerInfo ? (
                  /* managerId exists from existing department but not yet resolved via picker */
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PersonIcon color="action" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {managerInfoLoading ? 'Đang tải thông tin trưởng phòng...' : 'Đã có trưởng phòng'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {managerInfoLoading
                            ? 'Vui lòng chờ trong giây lát'
                            : 'Không tải được thông tin chi tiết. Nhấn "Thay đổi" để chọn lại trưởng phòng'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Thay đổi">
                          <IconButton size="small" onClick={() => setOpenPicker(true)} disabled={loading || !canSelectManager}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa trưởng phòng">
                          <IconButton size="small" onClick={handleClearManager} disabled={loading} color="error">
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Paper>
                ) : (
                  /* No manager set */
                  <Button
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    onClick={() => setOpenPicker(true)}
                    disabled={loading || !canSelectManager}
                    fullWidth
                    sx={{ justifyContent: 'flex-start', py: 1.5, borderStyle: 'dashed' }}
                  >
                    Chọn trưởng phòng...
                  </Button>
                )}

                {!canSelectManager && (
                  <Alert severity="info" sx={{ mt: 1.5 }}>
                    Phòng ban chưa có nhân viên. Vui lòng thêm nhân viên vào phòng ban trước khi chọn trưởng phòng.
                  </Alert>
                )}
              </Box>
            )}

            {/* Display employee count if editing */}
            {isEdit && selectedDepartment && (
              <TextField
                label="Tổng số nhân viên"
                value={selectedDepartment.totalEmployees}
                fullWidth
                disabled
                helperText="Số nhân viên trong phòng ban này"
              />
            )}
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

      {/* Employee Picker Dialog */}
      <EmployeePickerDialog
        open={openPicker}
        onClose={() => setOpenPicker(false)}
        onSelect={handleManagerSelect}
        selectedEmployeeId={managerId}
        departmentId={selectedDepartment?.id}
        departmentName={selectedDepartment?.name}
      />
    </>
  );
}
