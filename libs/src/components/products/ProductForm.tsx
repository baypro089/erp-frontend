'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
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
  CircularProgress,
  InputAdornment,
  Paper,
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  Divider,
  Stack,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon,
  LocalOffer as LocalOfferIcon,
  Inventory2 as InventoryIcon,
  Category as CategoryIcon,
  VerifiedUser as WarrantyIcon,
} from '@mui/icons-material';
import type {
  ProductResponse,
  CreateProductDto,
  UpdateProductDto,
} from '@libs/shared/types/product.type';
import { fetchBrands } from '@libs/src/features/brand/brand.slice';
import { fetchCategories } from '@libs/src/features/category/category.slice';
import productService from '@libs/src/features/product/product.service';
import { getProductRouteContext } from '../../utils/product-route';

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

const MONEY_UNITS = {
  ten: { label: 'Chục', multiplier: 10 },
  hundred: { label: 'Trăm', multiplier: 100 },
  thousand: { label: 'Nghìn', multiplier: 1_000 },
  million: { label: 'Triệu', multiplier: 1_000_000 },
} as const;

type MoneyUnitKey = keyof typeof MONEY_UNITS;

/** Chuyển tên sản phẩm thành mã SKU (loại bỏ dấu tiếng Việt, in hoa, dùng '-') */
function generateSkuFromName(name: string): string {
  if (!name.trim()) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Card thống kê nhỏ dùng cho trang chi tiết */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  const theme = useTheme();
  const tintColor = color || theme.palette.primary.main;
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: alpha(tintColor, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: tintColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={600}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function ProductForm({
  selectedProduct,
  onSubmit,
  loading = false,
  readOnly = false,
}: ProductFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const { basePath } = getProductRouteContext(pathname);
  const { brands } = useSelector((state: RootState) => state.brand);
  const { categories } = useSelector((state: RootState) => state.category);

  const isEdit = !!selectedProduct;

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
  const [skuIsAuto, setSkuIsAuto] = useState(true);
  const [specs, setSpecs] = useState<SpecRow[]>([{ key: '', value: '' }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [retailPriceAmountInput, setRetailPriceAmountInput] = useState<number>(0);
  const [retailPriceUnit, setRetailPriceUnit] = useState<MoneyUnitKey>('million');

  useEffect(() => {
    dispatch(fetchBrands({}));
    dispatch(fetchCategories({}));
  }, [dispatch]);

  useEffect(() => {
    if (selectedProduct) {
      const defaultMoneyUnit: MoneyUnitKey = 'million';
      setFormData({
        sku: selectedProduct.sku || '',
        name: selectedProduct.name,
        categoryId: selectedProduct.category.id,
        brandId: selectedProduct.brand.id,
        retailPrice: selectedProduct.retailPrice,
        warrantyMonths: selectedProduct.warrantyMonths,
        hasSerialNumber: selectedProduct.hasSerialNumber,
        specifications: (() => {
          try {
            const r = selectedProduct.specifications;
            return typeof r === 'string' ? JSON.parse(r) : r || {};
          } catch {
            return {};
          }
        })(),
        thumbnailUrl: selectedProduct.thumbnailUrl || '',
        isActive: selectedProduct.isActive,
      });
      setRetailPriceUnit(defaultMoneyUnit);
      setRetailPriceAmountInput(
        Number((selectedProduct.retailPrice / MONEY_UNITS[defaultMoneyUnit].multiplier).toFixed(2))
      );
      setSkuIsAuto(false);

      let parsedSpecs: Record<string, any> = {};
      try {
        const raw = selectedProduct.specifications;
        parsedSpecs = typeof raw === 'string' ? JSON.parse(raw) : raw || {};
      } catch {
        parsedSpecs = {};
      }
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
      setRetailPriceAmountInput(0);
      setRetailPriceUnit('million');
      setSkuIsAuto(true);
      setSpecs([{ key: '', value: '' }]);
      setErrors({});
    }
  }, [selectedProduct]);

  useEffect(() => {
    const load = async () => {
      if (selectedProduct?.id) {
        try {
          const thumb = await productService.getProductThumbnail(selectedProduct.id);
          if (thumb?.publicUrl) setThumbnailPreview(thumb.publicUrl);
        } catch {
          /* ignore */
        }
      } else {
        setThumbnailPreview('');
        setThumbnailFile(null);
      }
    };
    load();
  }, [selectedProduct]);

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      sku: skuIsAuto ? generateSkuFromName(value) : prev.sku,
    }));
  };

  const handleSkuChange = (value: string) => {
    setSkuIsAuto(false);
    setFormData((prev) => ({ ...prev, sku: value }));
  };

  const handleResetSku = () => {
    setSkuIsAuto(true);
    setFormData((prev) => ({ ...prev, sku: generateSkuFromName(prev.name) }));
  };

  const handleRetailPriceAmountChange = (value: string) => {
    const parsed = Number(value);
    const amount = Number.isNaN(parsed) ? 0 : parsed;
    setRetailPriceAmountInput(amount);
    setFormData({
      ...formData,
      retailPrice: amount * MONEY_UNITS[retailPriceUnit].multiplier,
    });
  };

  const handleRetailPriceUnitChange = (unit: MoneyUnitKey) => {
    const currentPrice = Number(formData.retailPrice) || 0;
    const nextAmount = currentPrice / MONEY_UNITS[unit].multiplier;
    setRetailPriceUnit(unit);
    setRetailPriceAmountInput(Number.isFinite(nextAmount) ? Number(nextAmount.toFixed(2)) : 0);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.categoryId) newErrors.categoryId = 'Danh mục là bắt buộc';
    if (!formData.brandId) newErrors.brandId = 'Thương hiệu là bắt buộc';
    if (!formData.retailPrice || formData.retailPrice <= 0)
      newErrors.retailPrice = 'Giá bán phải lớn hơn 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const specificationsObj: Record<string, any> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) specificationsObj[s.key.trim()] = s.value.trim();
    });
    await onSubmit({ ...formData, specifications: specificationsObj }, thumbnailFile || undefined);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const ns = [...specs];
    ns[index][field] = value;
    setSpecs(ns);
  };

  const handleRemoveSpec = (index: number) => {
    const ns = specs.filter((_, i) => i !== index);
    setSpecs(ns.length > 0 ? ns : [{ key: '', value: '' }]);
  };

  const formatSpecKey = (key: string) =>
    key
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  // ─── READ-ONLY DETAIL VIEW ─────────────────────────────────────────────────
  if (readOnly && selectedProduct) {
    const brandName =
      brands.find((b) => b.id === formData.brandId)?.name || selectedProduct.brand.name;
    const cat = categories.find((c) => c.id === formData.categoryId);
    const catDisplay = cat
      ? cat.parent
        ? `${cat.parent.name} > ${cat.name}`
        : cat.name
      : selectedProduct.category.name;
    const hasSpecs = specs.length > 0 && !!specs[0].key;

    return (
      <Box>
        {/* Hero Card: Image + Key Info */}
        <Card elevation={0} variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Thumbnail */}
            <Box
              sx={{
                width: { xs: '100%', md: 260 },
                minHeight: 220,
                bgcolor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                borderRight: { md: 1 },
                borderBottom: { xs: 1, md: 0 },
                borderColor: 'divider',
              }}
            >
              {thumbnailPreview ? (
                <Box
                  component="img"
                  src={thumbnailPreview}
                  alt={selectedProduct.name}
                  sx={{ width: '100%', height: 220, objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <Box sx={{ textAlign: 'center', color: 'text.disabled', py: 4 }}>
                  <ImageIcon sx={{ fontSize: 56 }} />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Chưa có ảnh
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Product Identity */}
            <CardContent sx={{ flex: 1, p: 3 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5, gap: 1 }}>
                <Chip
                  label={selectedProduct.isActive ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                  size="small"
                  color={selectedProduct.isActive ? 'success' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
                {selectedProduct.hasSerialNumber && (
                  <Chip
                    label="Quản lý Serial"
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Stack>

              <Typography variant="h5" fontWeight={700} gutterBottom>
                {selectedProduct.name}
              </Typography>

              {selectedProduct.sku && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    SKU:
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }}
                  >
                    {selectedProduct.sku}
                  </Typography>
                </Box>
              )}

              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Thương hiệu
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {brandName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Danh mục
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {catDisplay}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Box>
        </Card>

        {/* Stats Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              icon={<LocalOfferIcon />}
              label="Giá bán lẻ"
              value={`₫${selectedProduct.retailPrice.toLocaleString('vi-VN')}`}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              icon={<WarrantyIcon />}
              label="Bảo hành"
              value={`${selectedProduct.warrantyMonths} tháng`}
              color={theme.palette.info.main}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              icon={<InventoryIcon />}
              label="Tồn kho"
              value={`${selectedProduct.stockQuantity} sản phẩm`}
              color={
                selectedProduct.stockQuantity > 0
                  ? theme.palette.primary.main
                  : theme.palette.error.main
              }
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              icon={<CategoryIcon />}
              label="Cập nhật lần cuối"
              value={new Date(selectedProduct.updatedAt).toLocaleDateString('vi-VN')}
              color={theme.palette.warning.main}
            />
          </Grid>
        </Grid>

        {/* Technical Specifications */}
        <Card elevation={0} variant="outlined">
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Thông số kỹ thuật
            </Typography>
            {hasSpecs ? (
              <Grid container>
                {specs.map((spec, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block">
                        {formatSpecKey(spec.key)}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {spec.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                Chưa có thông số kỹ thuật
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ─── EDIT / CREATE FORM ────────────────────────────────────────────────────
  return (
    <Box>
      <Grid container spacing={3}>
        {/* ── Left Column: Product Info + Specs ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Basic Information Card */}
          <Card elevation={0} variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
                Thông tin sản phẩm
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Product Name */}
                <TextField
                  label="Tên sản phẩm"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name || 'Nhập tên để tự động sinh mã SKU'}
                  fullWidth
                  required
                  disabled={loading}
                  placeholder="VD: CPU Intel Core i9 14900K"
                />

                {/* SKU with auto-generation */}
                <TextField
                  label="Mã SKU"
                  value={formData.sku}
                  onChange={(e) => handleSkuChange(e.target.value)}
                  fullWidth
                  disabled={loading}
                  placeholder="VD: CPU-INTEL-I9-14900K"
                  helperText={
                    skuIsAuto
                      ? 'Đang tự động sinh từ tên sản phẩm'
                      : 'Đã chỉnh sửa thủ công — nhấn nút refresh để reset'
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          {skuIsAuto ? (
                            <Tooltip title="SKU đang được tự động sinh">
                              <Chip
                                label="Auto"
                                size="small"
                                color="primary"
                                variant="outlined"
                                icon={<AutoAwesomeIcon sx={{ fontSize: '13px !important' }} />}
                                sx={{ fontSize: '0.7rem', height: 22, cursor: 'default' }}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Khôi phục tự động sinh">
                              <IconButton size="small" onClick={handleResetSku} edge="start">
                                <RefreshIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* Brand + Category side by side */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required error={!!errors.brandId} disabled={loading}>
                      <InputLabel>Thương hiệu</InputLabel>
                      <Select
                        label="Thương hiệu"
                        value={formData.brandId}
                        onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                      >
                        {brands.map((b) => (
                          <MenuItem key={b.id} value={b.id}>
                            {b.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.brandId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.brandId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required error={!!errors.categoryId} disabled={loading}>
                      <InputLabel>Danh mục</InputLabel>
                      <Select
                        label="Danh mục"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.categoryId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.categoryId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Has Serial Number */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: 1,
                    borderRadius: 2,
                    borderColor: formData.hasSerialNumber ? 'primary.main' : 'divider',
                    bgcolor: formData.hasSerialNumber
                      ? alpha(theme.palette.primary.main, 0.04)
                      : 'transparent',
                    transition: 'border-color 0.2s, background-color 0.2s',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.hasSerialNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, hasSerialNumber: e.target.checked })
                        }
                        disabled={loading}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Quản lý theo Serial Number
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Bật nếu cần theo dõi IMEI / Serial Number cho từng đơn vị
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Box>
            </CardContent>
          </Card>

          {/* Technical Specifications Card */}
          <Card elevation={0} variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2.5,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Thông số kỹ thuật
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Thêm các cặp thuộc tính – giá trị (VD: RAM: 16GB)
                  </Typography>
                </Box>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setSpecs([...specs, { key: '', value: '' }])}
                  disabled={loading}
                  variant="outlined"
                  size="small"
                >
                  Thêm
                </Button>
              </Box>

              <Stack spacing={1.5}>
                {specs.map((spec, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <TextField
                      label="Thuộc tính"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      placeholder="VD: RAM"
                      disabled={loading}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Giá trị"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="VD: 16GB"
                      disabled={loading}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      onClick={() => handleRemoveSpec(index)}
                      disabled={loading || specs.length === 1}
                      color="error"
                      size="small"
                      sx={{ mt: 0.5 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right Column: Image + Pricing ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Image Upload Card */}
          <Card elevation={0} variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Hình ảnh sản phẩm
              </Typography>

              {thumbnailPreview ? (
                <Box>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      overflow: 'hidden',
                      mb: 2,
                      bgcolor: 'grey.50',
                    }}
                  >
                    <Box
                      component="img"
                      src={thumbnailPreview}
                      alt="preview"
                      sx={{ width: '100%', height: 200, objectFit: 'contain', display: 'block' }}
                    />
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      disabled={loading}
                      size="small"
                      fullWidth
                    >
                      Thay ảnh
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
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview('');
                      }}
                      disabled={loading}
                      size="small"
                    >
                      Xoá
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Button
                  component="label"
                  variant="outlined"
                  disabled={loading}
                  fullWidth
                  sx={{
                    py: 4,
                    borderStyle: 'dashed',
                    borderRadius: 2,
                    '&:hover': { borderStyle: 'dashed' },
                    flexDirection: 'column',
                    gap: 0.5,
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Nhấn để tải ảnh lên
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    JPG, PNG, GIF — tối đa 5MB
                  </Typography>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleThumbnailChange}
                  />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pricing & Warranty Card */}
          <Card elevation={0} variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
                Giá & Bảo hành
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <TextField
                    label="Giá bán lẻ"
                    type="number"
                    value={retailPriceAmountInput}
                    onChange={(e) => handleRetailPriceAmountChange(e.target.value)}
                    error={!!errors.retailPrice}
                    helperText={
                      errors.retailPrice ||
                      `Tương đương: ${Number(formData.retailPrice || 0).toLocaleString('vi-VN')} đ`
                    }
                    fullWidth
                    required
                    disabled={loading}
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">{MONEY_UNITS[retailPriceUnit].label}</InputAdornment>,
                      },
                    }}
                  />

                  <TextField
                    label="Đơn vị"
                    select
                    value={retailPriceUnit}
                    onChange={(e) => handleRetailPriceUnitChange(e.target.value as MoneyUnitKey)}
                    disabled={loading}
                    sx={{ minWidth: 160 }}
                  >
                    {Object.entries(MONEY_UNITS).map(([key, unit]) => (
                      <MenuItem key={key} value={key}>
                        {unit.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <TextField
                  label="Thời gian bảo hành"
                  value={formData.warrantyMonths}
                  onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value })}
                  fullWidth
                  disabled={loading}
                  placeholder="VD: 12, 24"
                  helperText="Đơn vị: tháng"
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">tháng</InputAdornment>,
                    },
                  }}
                />

                {isEdit && (
                  <>
                    <Divider />
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: 1,
                        borderRadius: 2,
                        borderColor: formData.isActive ? 'success.main' : 'divider',
                        bgcolor: formData.isActive
                          ? alpha(theme.palette.success.main, 0.04)
                          : 'transparent',
                        transition: 'border-color 0.2s, background-color 0.2s',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive}
                            onChange={(e) =>
                              setFormData({ ...formData, isActive: e.target.checked })
                            }
                            disabled={loading}
                            color="success"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              Trạng thái hoạt động
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formData.isActive
                                ? 'Sản phẩm đang được kinh doanh'
                                : 'Sản phẩm đã ngừng kinh doanh'}
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          onClick={() => router.push(basePath)}
          disabled={loading}
          color="inherit"
          size="large"
          variant="outlined"
        >
          Huỷ
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : null}
          size="large"
          sx={{ minWidth: 160 }}
        >
          {isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
        </Button>
      </Box>
    </Box>
  );
}
