'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Autocomplete,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Warning as WarningIcon, Inventory as InventoryIcon, Search as SearchIcon } from '@mui/icons-material';
import { ProductSelectDialog } from '@libs/src/components/import-receipts';
import type { ProductResponse } from '@libs/shared/types/product.type';
import type { StockAdjustmentDTO } from '@libs/shared/types/product-stock.type';

interface StockAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: StockAdjustmentDTO) => void;
  warehouseId: string;
  loading?: boolean;
}

export default function StockAdjustmentDialog({
  open,
  onClose,
  onSubmit,
  warehouseId,
  loading = false,
}: StockAdjustmentDialogProps) {
  const [formData, setFormData] = useState({
    productId: '',
    type: 'INCREASE' as 'INCREASE' | 'DECREASE',
    quantity: 0,
    reason: '',
  });

  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSelectProduct = (product: ProductResponse) => {
    setSelectedProduct(product);
    setFormData((prev) => ({ ...prev, productId: product.id }));
    setErrors((prev) => ({ ...prev, productId: '' }));
    setOpenProductDialog(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = 'Vui lòng chọn sản phẩm';
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Số lượng phải lớn hơn 0';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Vui lòng nhập lý do điều chỉnh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitClick = () => {
    if (validate()) {
      setShowConfirm(true);
    }
  };

  const handleConfirmAdjustment = () => {
    const dto: StockAdjustmentDTO = {
      warehouseId,
      productId: formData.productId,
      delta: formData.type === 'INCREASE' ? formData.quantity : -formData.quantity,
      reason: formData.reason,
    };
    onSubmit(dto);
    setShowConfirm(false);
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        productId: '',
        type: 'INCREASE',
        quantity: 0,
        reason: '',
      });
      setSelectedProduct(null);
      setOpenProductDialog(false);
      setShowConfirm(false);
      setErrors({});
      onClose();
    }
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={open && !showConfirm} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon color="primary" />
          Điều chỉnh tồn kho thủ công
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Dùng khi kho bị mất, hỏng, hoặc nhập sai số liệu.
              </Typography>
            </Alert>

            {/* Product Selection */}
            <Box>
              <TextField
                label="Sản phẩm"
                value={selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : ''}
                placeholder="Nhấn nút tìm để chọn sản phẩm..."
                error={!!errors.productId}
                helperText={errors.productId}
                required
                fullWidth
                disabled={loading}
                onClick={() => !loading && setOpenProductDialog(true)}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        startIcon={<SearchIcon />}
                        onClick={() => setOpenProductDialog(true)}
                        disabled={loading}
                        sx={{ mr: -1 }}
                      >
                        Tìm
                      </Button>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    cursor: 'pointer',
                  },
                }}
              />
              {selectedProduct && (
                <Box sx={{ mt: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Thương hiệu: {selectedProduct.brand?.name || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Danh mục: {selectedProduct.category?.name || 'N/A'}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Adjustment Type */}
            <FormControl component="fieldset" error={!!errors.type}>
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                Loại điều chỉnh
              </FormLabel>
              <RadioGroup
                row
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as 'INCREASE' | 'DECREASE')}
              >
                <FormControlLabel
                  value="INCREASE"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        Tăng (+)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Nhập thêm
                      </Typography>
                    </Box>
                  }
                  disabled={loading}
                />
                <FormControlLabel
                  value="DECREASE"
                  control={<Radio />}
                 label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} color="error.main">
                        Giảm (-)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Giảm trừ
                      </Typography>
                    </Box>
                  }
                  disabled={loading}
                />
              </RadioGroup>
            </FormControl>

            {/* Quantity */}
            <TextField
              label="Số lượng"
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
              error={!!errors.quantity}
              helperText={errors.quantity}
              required
              fullWidth
              disabled={loading}
              InputProps={{
                inputProps: { min: 1 },
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography fontWeight={700} color={formData.type === 'INCREASE' ? 'success.main' : 'error.main'}>
                      {formData.type === 'INCREASE' ? '+' : '-'}
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />

            {/* Reason */}
            <TextField
              label="Lý do điều chỉnh"
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              error={!!errors.reason}
              helperText={errors.reason || 'VD: "Hàng bị vỡ khi vận chuyển", "Kiểm kê thấy thiếu"'}
              required
              fullWidth
              disabled={loading}
              placeholder="Nhập lý do chi tiết cho việc điều chỉnh..."
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleSubmitClick} variant="contained" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onClose={() => !loading && setShowConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Xác nhận điều chỉnh kho
        </DialogTitle>

        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              Hành động này sẽ thay đổi số liệu tồn kho ngay lập tức!
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Sản phẩm:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {selectedProduct?.name} ({selectedProduct?.sku})
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Điều chỉnh:
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                color={formData.type === 'INCREASE' ? 'success.main' : 'error.main'}
              >
                {formData.type === 'INCREASE' ? '+' : '-'} {formData.quantity}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Lý do:
              </Typography>
              <Typography variant="body2">{formData.reason}</Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowConfirm(false)} disabled={loading} color="inherit">
            Quay lại
          </Button>
          <Button onClick={handleConfirmAdjustment} variant="contained" color="warning" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xác nhận điều chỉnh'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Selection Dialog */}
      <ProductSelectDialog
        open={openProductDialog}
        onClose={() => setOpenProductDialog(false)}
        onSelect={handleSelectProduct}
      />
    </>
  );
}
