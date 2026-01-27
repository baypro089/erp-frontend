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
} from '@mui/material';
import type {
  DepartmentResponse,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
} from '@libs/shared/types/departments.type';

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

  const [errors, setErrors] = useState<{ name?: string }>({});

  const isEdit = !!selectedDepartment;

  // Load data when editing
  useEffect(() => {
    if (selectedDepartment) {
      setFormData({
        name: selectedDepartment.name,
        description: selectedDepartment.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
    setErrors({});
  }, [selectedDepartment, open]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
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
        {isEdit ? 'Edit Department' : 'Add New Department'}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          {/* Department Name */}
          <TextField
            label="Department Name"
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
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            disabled={loading}
            placeholder="Enter department description (optional)"
          />

          {/* Display employee count if editing */}
          {isEdit && selectedDepartment && (
            <TextField
              label="Total Employees"
              value={selectedDepartment.totalEmployees}
              fullWidth
              disabled
              helperText="Number of employees in this department"
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
