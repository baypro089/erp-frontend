'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  TextField,
  Button,
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
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  CardMedia,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import type {
  ProductResponse,
  CreateProductDto,
  UpdateProductDto,
} from '@libs/shared/types/product.type';
import { fetchBrands } from '@libs/src/features/brand/brand.slice';
import { fetchCategories } from '@libs/src/features/category/category.slice';
import productService from '@libs/src/features/product/product.service';

interface ProductFormProps {
  selectedProduct?: ProductResponse | null;
  onSubmit: (data: CreateProductDto | UpdateProductDto, thumbnail?: File) => Promise<void>;
  loading?: boolean;
  readOnly?: boolean;
}

interface SpecRow {
  key: string;
  value: string;
}

// Display Field Component for read-only mode
interface DisplayFieldProps {
  label: string;
  value: any;
  format?: (val: any) => string | React.ReactNode;
}

function DisplayField({ label, value, format }: DisplayFieldProps) {
  const displayValue = format ? format(value) : value;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {label}
      </Typography>
      <Typography component="div" variant="body1" fontWeight={500}>
        {displayValue || '-'}
      </Typography>
    </Box>
  );
}

export default function ProductForm({
  selectedProduct,
  onSubmit,
  loading = false,
  readOnly = false,
}: ProductFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
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
  const [specs, setSpecs] = useState<SpecRow[]>([{ key: '', value: '' }]);

  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Thumbnail upload
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  // Load brands and categories
  useEffect(() => {
    dispatch(fetchBrands({}));
    dispatch(fetchCategories({}));
  }, [dispatch]);

  // Load product data when editing
  useEffect(() => {
    if (selectedProduct) {
      console.log('Loading product data:', selectedProduct);
      console.log('SKU value:', selectedProduct.sku);
      
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
      // Reset form when no product selected
      console.log('Resetting form - no product selected');
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
      setErrors({});
    }
  }, [selectedProduct]);

  // Load thumbnail when editing
  useEffect(() => {
    const loadThumbnail = async () => {
      if (selectedProduct && selectedProduct.id) {
        try {
          const thumbnail = await productService.getProductThumbnail(selectedProduct.id);
          if (thumbnail && thumbnail.publicUrl) {
            setThumbnailPreview(thumbnail.publicUrl);
          }
        } catch (error) {
          console.error('Failed to load thumbnail:', error);
        }
      } else {
        setThumbnailPreview('');
        setThumbnailFile(null);
      }
    };
    
    loadThumbnail();
  }, [selectedProduct]);

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

    await onSubmit(submitData, thumbnailFile || undefined);
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  // Thumbnail handlers
  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
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

  // Format snake_case to readable text
  const formatSpecKey = (key: string): string => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Box>
      <Box sx={{ mx: 'auto' }}>
        {/* Section 1: Basic Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              1. Basic Information
            </Typography>
            {readOnly ? (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DisplayField label="SKU" value={formData.sku} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DisplayField
                    label="Brand"
                    value={brands.find((b) => b.id === formData.brandId)?.name}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <DisplayField label="Product Name" value={formData.name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DisplayField
                    label="Category"
                    value={(() => {
                      const cat = categories.find((c) => c.id === formData.categoryId);
                      return cat
                        ? cat.parent
                          ? `${cat.parent.name} > ${cat.name}`
                          : cat.name
                        : '-';
                    })()}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DisplayField
                    label="Has Serial Number"
                    value={formData.hasSerialNumber ? 'Yes' : 'No'}
                    format={(val) => (
                      <Chip
                        label={val}
                        color={formData.hasSerialNumber ? 'primary' : 'default'}
                        size="small"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="SKU"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  fullWidth
                  disabled={loading}
                  placeholder="e.g., CPU-INTEL-I9-14900K"
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
                        {category.parent
                          ? `${category.parent.name} > ${category.name}`
                          : category.name}
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
            )}
          </CardContent>
        </Card>

        {/* Section 2: Dynamic Specifications */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              2. Technical Specifications
            </Typography>
            {readOnly ? (
              <Grid container spacing={2}>
                {specs.length > 0 && specs[0].key ? (
                  specs.map((spec, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                      <DisplayField label={formatSpecKey(spec.key)} value={spec.value} />
                    </Grid>
                  ))
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      No specifications available
                    </Typography>
                  </Grid>
                )}
              </Grid>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Price & Image */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              3. Price & Image
            </Typography>
            {readOnly ? (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DisplayField
                    label="Retail Price"
                    value={formData.retailPrice}
                    format={(val) => `₫${val.toLocaleString()}`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DisplayField
                    label="Warranty Period"
                    value={formData.warrantyMonths}
                    format={(val) => `${val} months`}
                  />
                </Grid>
                {isEdit && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DisplayField
                      label="Status"
                      value={formData.isActive ? 'Active' : 'Inactive'}
                      format={(val) => (
                        <Chip
                          label={val}
                          color={formData.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                )}
                {/* Thumbnail Display */}
                {thumbnailPreview && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Product Thumbnail
                    </Typography>
                    <Card sx={{ maxWidth: 300, mt: 1 }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={thumbnailPreview}
                        alt="Product thumbnail"
                        sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
                      />
                    </Card>
                  </Grid>
                )}
              </Grid>
            ) : (
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
                    endAdornment: <InputAdornment position="end">₫</InputAdornment>,
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

                {/* Thumbnail Upload Section */}
                <Box>
                  <Typography variant="body2" gutterBottom fontWeight={500}>
                    Product Thumbnail
                  </Typography>
                  
                  {thumbnailPreview ? (
                    <Box>
                      <Card sx={{ maxWidth: 300, mb: 2 }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={thumbnailPreview}
                          alt="Product thumbnail preview"
                          sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
                        />
                      </Card>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          disabled={loading}
                          size="small"
                        >
                          Change Image
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleThumbnailChange}
                          />
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleRemoveThumbnail}
                          disabled={loading}
                          size="small"
                        >
                          Remove
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      disabled={loading}
                      fullWidth
                      sx={{ 
                        py: 3, 
                        borderStyle: 'dashed',
                        '&:hover': {
                          borderStyle: 'dashed',
                        }
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2">
                          Click to upload thumbnail image
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Supports: JPG, PNG, GIF (Max 5MB)
                        </Typography>
                      </Box>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                    </Button>
                  )}
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
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!readOnly && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} disabled={loading} color="inherit" size="large">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              size="large"
            >
              {isEdit ? 'Update Product' : 'Create Product'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
