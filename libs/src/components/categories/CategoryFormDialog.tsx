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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  FormHelperText,
} from '@mui/material';
import type {
  CategoryResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@libs/shared/types/category.type';

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto, isEdit: boolean) => Promise<void>;
  selectedCategory: CategoryResponse | null;
  categories: CategoryResponse[];
  loading?: boolean;
}

export default function CategoryFormDialog({
  open,
  onClose,
  onSubmit,
  selectedCategory,
  categories,
  loading = false,
}: CategoryFormDialogProps) {
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    parentId: undefined,
    isActive: true,
  });

  const [errors, setErrors] = useState<{ name?: string }>({});

  const isEdit = !!selectedCategory;

  // Load data when editing
  useEffect(() => {
    if (selectedCategory) {
      setFormData({
        name: selectedCategory.name,
        parentId: selectedCategory.parent?.id,
        isActive: selectedCategory.isActive,
      });
    } else {
      setFormData({
        name: '',
        parentId: undefined,
        isActive: true,
      });
    }
    setErrors({});
  }, [selectedCategory, open]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên danh mục là bắt buộc';
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

  // Filter out current category and its descendants from parent options
  const availableParentCategories = categories.filter((cat) => {
    if (!selectedCategory) return true;
    // Can't be parent of itself
    if (cat.id === selectedCategory.id) return false;
    // TODO: Add logic to prevent circular references (descendants)
    return true;
  });

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
        {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          {/* Category Name */}
          <TextField
            label="Tên danh mục"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            autoFocus
            disabled={loading}
          />

          {/* Parent Category */}
          <FormControl fullWidth disabled={loading}>
            <InputLabel id="parent-category-label">Danh mục cha</InputLabel>
            <Select
              labelId="parent-category-label"
              label="Danh mục cha"
              value={formData.parentId ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parentId: e.target.value === '' ? (isEdit ? null : undefined) : e.target.value,
                })
              }
            >
              <MenuItem value="">
                <em>Không có (Cấp cao nhất)</em>
              </MenuItem>
              {availableParentCategories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Chọn danh mục cha để tạo danh mục con
            </FormHelperText>
          </FormControl>

          {/* Is Active */}
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
            label="Đang hoạt động"
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
