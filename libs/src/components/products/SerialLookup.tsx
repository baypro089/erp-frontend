'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Grid,
  CircularProgress,
  InputAdornment,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
  Warning as WarningIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { searchSerialByNumber, clearCurrentSerial } from '@libs/src/features/product-serial/product-serial.slice';
import { SerialStatus } from '@libs/shared/enums/serial-status.enum';
import { format, addYears, isAfter } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function SerialLookup() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentSerial, searchLoading, searchError } = useSelector((state: RootState) => state.productSerial);
  const [serialNumber, setSerialNumber] = useState('');

  const handleSearch = async () => {
    if (!serialNumber.trim()) return;
    await dispatch(searchSerialByNumber(serialNumber.trim()));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSerialNumber('');
    dispatch(clearCurrentSerial());
  };

  const getStatusColor = (status: SerialStatus) => {
    switch (status) {
      case SerialStatus.AVAILABLE:
        return 'success';
      case SerialStatus.SOLD:
        return 'info';
      case SerialStatus.DEFECTIVE:
        return 'error';
      case SerialStatus.TRANSFERRING:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: SerialStatus) => {
    switch (status) {
      case SerialStatus.AVAILABLE:
        return 'Sẵn sàng bán';
      case SerialStatus.SOLD:
        return 'Đã bán';
      case SerialStatus.DEFECTIVE:
        return 'Hàng lỗi';
      case SerialStatus.TRANSFERRING:
        return 'Đang chuyển kho';
      default:
        return status;
    }
  };

  const calculateWarrantyExpiry = (createdAt: Date, warrantyMonths: number = 12) => {
    return addYears(new Date(createdAt), warrantyMonths / 12);
  };

  const isWarrantyValid = (expiryDate: Date) => {
    return isAfter(expiryDate, new Date());
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '30vh',
          mb: 4,
        }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          Tra cứu Serial/IMEI
        </Typography>
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <TextField
            fullWidth
            placeholder="Nhập mã IMEI/Serial Number..."
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={searchLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '1.1rem',
                py: 1,
              },
            }}
          />
          <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={searchLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              onClick={handleSearch}
              disabled={searchLoading || !serialNumber.trim()}
              sx={{ minWidth: 150 }}
            >
              Tìm kiếm
            </Button>
            {(currentSerial || searchError) && (
              <Button variant="outlined" size="large" onClick={handleClear}>
                Làm mới
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Error Message */}
      {searchError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {searchError}
        </Alert>
      )}

      {/* Result Card */}
      {currentSerial && (
        <Card
          elevation={3}
          sx={{
            maxWidth: 800,
            mx: 'auto',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Product Info */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Avatar
                variant="rounded"
                src={currentSerial.product.thumbnailUrl}
                sx={{ width: 100, height: 100, mr: 3 }}
              >
                <InventoryIcon sx={{ fontSize: 50 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {currentSerial.product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  SKU: {currentSerial.product.sku}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Serial/IMEI: <strong>{currentSerial.serialNumber}</strong>
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={getStatusLabel(currentSerial.status)}
                    color={getStatusColor(currentSerial.status)}
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Details Grid */}
            <Grid container spacing={3}>
              {/* Vị trí hiện tại */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <WarehouseIcon color="action" sx={{ mr: 1.5, mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Vị trí hiện tại
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {currentSerial.status === SerialStatus.SOLD
                        ? '--'
                        : currentSerial.warehouse?.name || 'N/A'}
                    </Typography>
                    {currentSerial.status === SerialStatus.SOLD && (
                      <Typography variant="caption" color="text.secondary">
                        (Đã bán - không còn trong kho)
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Ngày nhập kho */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CalendarIcon color="action" sx={{ mr: 1.5, mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Ngày nhập kho
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {format(new Date(currentSerial.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </Typography>
                    {currentSerial.importReceiptId && (
                      <Typography variant="caption" color="primary">
                        Phiếu nhập: {currentSerial.importReceiptId}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Ngày xuất bán (nếu đã bán) */}
              {currentSerial.status === SerialStatus.SOLD && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <ShoppingCartIcon color="action" sx={{ mr: 1.5, mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Ngày xuất bán
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {currentSerial.updatedAt
                          ? format(new Date(currentSerial.updatedAt), 'dd/MM/yyyy', { locale: vi })
                          : 'N/A'}
                      </Typography>
                      {currentSerial.orderId && (
                        <Typography variant="caption" color="primary">
                          Đơn hàng: {currentSerial.orderId}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              )}

              {/* Bảo hành */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <ShieldIcon color="action" sx={{ mr: 1.5, mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Bảo hành
                    </Typography>
                    {(() => {
                      const warrantyExpiry = calculateWarrantyExpiry(currentSerial.createdAt, 12);
                      const isValid = isWarrantyValid(warrantyExpiry);
                      return (
                        <>
                          <Typography variant="body1" fontWeight={600} color={isValid ? 'success.main' : 'error.main'}>
                            {isValid ? 'Còn hạn bảo hành' : 'Hết hạn bảo hành'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {isValid ? 'Đến' : 'Hết hạn'}: {format(warrantyExpiry, 'dd/MM/yyyy', { locale: vi })}
                          </Typography>
                        </>
                      );
                    })()}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Defective Warning */}
            {currentSerial.status === SerialStatus.DEFECTIVE && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  Sản phẩm này đã được đánh dấu là hàng lỗi
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
