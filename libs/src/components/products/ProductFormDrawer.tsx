'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  InputAdornment,
  Alert,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import type {
  ProductResponse,
  CreateProductDto,
  UpdateProductDto,
} from '@libs/shared/types/product.type';
import { fetchBrands } from '@libs/src/features/brand/brand.slice';
import { fetchCategories } from '@libs/src/features/category/category.slice';

interface ProductFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductDto | UpdateProductDto, isEdit: boolean, thumbnail?: File) => Promise<void>;
  selectedProduct: ProductResponse | null;
  loading?: boolean;
}

interface SpecRow {
  key: string;
  value: string;
}

export default function ProductFormDrawer({
  open,
  onClose,
  onSubmit,
  selectedProduct,
  loading = false,
}: ProductFormDrawerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { brands } = useSelector((state: RootState) => state.brand);
  const { categories } = useSelector((state: RootState) => state.category);

  const isEdit = !!selectedProduct;

  // Form data
  const [formData, setFormData] = useState<CreateProductDto & { isActive?: boolean }>({
    sku: '',
    name: '',
    categoryId: '',
    brandId: '',
    retailPrice: 0,
    warrantyMonths: '12',
    hasSerialNumber: false,
    specifications: {},
    thumbnailUrl: '',
    isActive: true,
  });

  // Dynamic specs
  const [specs, setSpecs] = useState<SpecRow[]>([]);

  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load brands and categories
  useEffect(() => {
    if (open) {
      dispatch(fetchBrands({}));
      dispatch(fetchCategories({}));
    }
  }, [open, dispatch]);

  // Load product data when editing
  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        sku: selectedProduct.sku || '',
        name: selectedProduct.name,
        categoryId: selectedProduct.category.id,
        brandId: selectedProduct.brand.id,
        retailPrice: selectedProduct.retailPrice,
        warrantyMonths: selectedProduct.warrantyMonths,
        hasSerialNumber: selectedProduct.hasSerialNumber,
        specifications: (() => { try { const r = selectedProduct.specifications; return typeof r === 'string' ? JSON.parse(r) : (r || {}); } catch { return {}; } })(),
        thumbnailUrl: selectedProduct.thumbnailUrl || '',
        isActive: selectedProduct.isActive,
      });

      // Parse specifications (may come from API as JSON string)
      let parsedSpecs: Record<string, any> = {};
      try {
        const raw = selectedProduct.specifications;
        parsedSpecs = typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
      } catch {
        parsedSpecs = {};
      }

      // Convert specifications object to array
      const specsArray = Object.entries(parsedSpecs).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      setSpecs(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }]);
    } else {
      setFormData({
        sku: '',
        name: '',
        categoryId: '',
        brandId: '',
        retailPrice: 0,
        warrantyMonths: '12',
        hasSerialNumber: false,
        specifications: {},
        thumbnailUrl: '',
        isActive: true,
      });
      setSpecs([{ key: '', value: '' }]);
    }
    setErrors({});
  }, [selectedProduct, open]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    if (!formData.brandId) {
      newErrors.brandId = 'Brand is required';
    }
    if (!formData.retailPrice || formData.retailPrice <= 0) {
      newErrors.retailPrice = 'Retail price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Convert specs array to object
    const specificationsObj: Record<string, any> = {};
    specs.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        specificationsObj[spec.key.trim()] = spec.value.trim();
      }
    });

    const submitData: CreateProductDto | UpdateProductDto = {
      ...formData,
      specifications: specificationsObj,
    };

    // TODO: Add thumbnail upload support to drawer
    await onSubmit(submitData, isEdit, undefined);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Spec handlers
  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    const newSpecs = specs.filter((_, i) => i !== index);
    setSpecs(newSpecs.length > 0 ? newSpecs : [{ key: '', value: '' }]);
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600, md: 700 } },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {/* Section 1: Basic Information */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            1. Basic Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
            <TextField
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              fullWidth
              disabled={loading}
              placeholder="e.g., CPU-INTEL-I9-14900K"
              helperText="Product SKU for internal management"
            />

            <TextField
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
              disabled={loading}
              placeholder="e.g., CPU Intel Core i9 14900K"
            />

            <FormControl fullWidth required error={!!errors.brandId} disabled={loading}>
              <InputLabel>Brand</InputLabel>
              <Select
                label="Brand"
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
              >
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.brandId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.brandId}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth required error={!!errors.categoryId} disabled={loading}>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.parent ? `${category.parent.name} > ${category.name}` : category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.categoryId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.categoryId}
                </Typography>
              )}
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.hasSerialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, hasSerialNumber: e.target.checked })
                  }
                  disabled={loading}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Has Serial Number</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Enable if you need to manage IMEI/Serial numbers for each unit
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Section 2: Dynamic Specifications */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            2. Technical Specifications
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Add key-value pairs for product specifications (e.g., RAM: 16GB, Color: Blue)
            </Alert>

            {specs.map((spec, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  border: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                }}
              >
                <TextField
                  label="Key"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                  placeholder="e.g., RAM, Color"
                  disabled={loading}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Value"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  placeholder="e.g., 16GB, Blue"
                  disabled={loading}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={() => handleRemoveSpec(index)}
                  disabled={loading || specs.length === 1}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Paper>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={handleAddSpec}
              disabled={loading}
              variant="outlined"
              fullWidth
            >
              Add Specification
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Section 3: Price & Image */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            3. Price & Image
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Retail Price"
              type="number"
              value={formData.retailPrice}
              onChange={(e) =>
                setFormData({ ...formData, retailPrice: parseFloat(e.target.value) || 0 })
              }
              error={!!errors.retailPrice}
              helperText={errors.retailPrice}
              fullWidth
              required
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            <TextField
              label="Warranty Period"
              value={formData.warrantyMonths}
              onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value })}
              fullWidth
              disabled={loading}
              placeholder="e.g., 12, 24"
              helperText="Warranty period in months"
            />

            <Box>
              <Typography variant="body2" gutterBottom>
                Thumbnail Image
              </Typography>
              <TextField
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                fullWidth
                disabled={loading}
                placeholder="Image URL or upload (backend not yet supported)"
                helperText="Upload functionality will be available when backend supports it"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CloudUploadIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {isEdit && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    disabled={loading}
                  />
                }
                label="Active"
              />
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
          }}
        >
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
