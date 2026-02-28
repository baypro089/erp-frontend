'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  QrCodeScanner as ScannerIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay } from '@libs/src/components/common';
import { SupplierSelectDialog, SerialInputModal, ProductSelectDialog } from '@libs/src/components/import-receipts';
import { fetchWarehouses } from '@libs/src/features/warehouse/warehouse.slice';
import { fetchProducts } from '@libs/src/features/product/product.slice';
import { createImportReceipt, clearError } from '@libs/src/features/import-receipt/import-receipt.slice';
import api from '@libs/src/services/api.service';
import type { WarehouseResponse } from '@libs/shared/types/warehouse.type';
import type { ProductResponse } from '@libs/shared/types/product.type';
import type { SupplierResponse } from '@libs/shared/types/supplier.type';
import type { CreateImportReceiptDto } from '@libs/shared/types/import-receipt.type';
import type { CreateImportDetailDto } from '@libs/shared/types/import-detail.type';

interface ImportItem {
  id: string;
  product: ProductResponse | null;
  quantity: number;
  unitPrice: number;
  scannedSerials: string[];
}

export default function CreateImportReceiptPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { warehouses } = useSelector((state: RootState) => state.warehouse);
  const { products, pagedProducts } = useSelector((state: RootState) => state.product);
  const { operationLoading, operationError } = useSelector((state: RootState) => state.importReceipt);
  const { user, isAuth } = useSelector((state: RootState) => state.auth);

  // Form state
  const [warehouseId, setWarehouseId] = useState('');
  const [supplier, setSupplier] = useState<SupplierResponse | null>(null);
  const [note, setNote] = useState('');
  const [items, setItems] = useState<ImportItem[]>([]);

  // Dialog state
  const [openSupplierDialog, setOpenSupplierDialog] = useState(false);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openSerialModal, setOpenSerialModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load initial data
  useEffect(() => {
    dispatch(fetchWarehouses());
    dispatch(fetchProducts({ page: 1, pageSize: 100 }));
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (operationError) {
      setSnackbar({
        open: true,
        message: operationError,
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [operationError, dispatch]);

  // Add new item row
  const handleAddItem = () => {
    const newItem: ImportItem = {
      id: `item-${Date.now()}`,
      product: null,
      quantity: 1,
      unitPrice: 0,
      scannedSerials: [],
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Remove item row
  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update item field (functional to avoid stale state)
  const handleUpdateItem = (index: number, field: keyof ImportItem, value: any) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  // Open product dialog for an item
  const handleOpenProductDialog = (index: number) => {
    setSelectedItemIndex(index);
    setOpenProductDialog(true);
  };

  // Handle product selection from dialog
  const handleSelectProduct = (product: ProductResponse) => {
    console.log('Selected product:', product); // Debug log
    console.log('Selected item index:', selectedItemIndex); // Debug log
    console.log('hasSerialNumber:', product.hasSerialNumber); // Debug log
    
    if (selectedItemIndex !== null) {
      // Update both product and unitPrice at once to avoid race condition
      const newItems = [...items];
      newItems[selectedItemIndex] = {
        ...newItems[selectedItemIndex],
        product: product,
        unitPrice: product.retailPrice || 0,
      };
      setItems(newItems);
      
      console.log('Updated items:', newItems); // Debug log
      
      // Close dialog and reset index after update
      setOpenProductDialog(false);
      setSelectedItemIndex(null);
    }
  };

  // Open serial modal for an item
  const handleOpenSerialModal = (index: number) => {
    setSelectedItemIndex(index);
    setOpenSerialModal(true);
  };

  // Confirm serials from modal
  const handleConfirmSerials = (serials: string[]) => {
    if (selectedItemIndex !== null) {
      const qty = serials.length;
      setItems((prev) => {
        const newItems = [...prev];
        newItems[selectedItemIndex] = {
          ...newItems[selectedItemIndex],
          scannedSerials: serials,
          quantity: qty,
        };
        return newItems;
      });
    }
  };

  // Calculate total for an item
  const calculateItemTotal = (item: ImportItem): number => {
    return item.quantity * item.unitPrice;
  };

  // Calculate grand total
  const calculateGrandTotal = (): number => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!warehouseId) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn kho',
        severity: 'error',
      });
      return false;
    }

    if (!supplier) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn nhà cung cấp',
        severity: 'error',
      });
      return false;
    }

    if (items.length === 0) {
      setSnackbar({
        open: true,
        message: 'Vui lòng thêm ít nhất một sản phẩm',
        severity: 'error',
      });
      return false;
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item.product) {
        setSnackbar({
          open: true,
          message: `Dòng ${i + 1}: Vui lòng chọn sản phẩm`,
          severity: 'error',
        });
        return false;
      }

      if (item.quantity <= 0) {
        setSnackbar({
          open: true,
          message: `Dòng ${i + 1}: Số lượng phải lớn hơn 0`,
          severity: 'error',
        });
        return false;
      }

      if (item.unitPrice <= 0) {
        setSnackbar({
          open: true,
          message: `Dòng ${i + 1}: Đơn giá phải lớn hơn 0`,
          severity: 'error',
        });
        return false;
      }

      // Check serial requirements
      if (item.product.hasSerialNumber) {
        if (item.scannedSerials.length !== item.quantity) {
          setSnackbar({
            open: true,
            message: `Dòng ${i + 1}: Vui lòng nhập đủ ${item.quantity} serial`,
            severity: 'error',
          });
          return false;
        }
      }
    }

    return true;
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const importDetails = items.map((item) => ({
      productId: item.product!.id,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      scannedSerials: item.product!.hasSerialNumber ? item.scannedSerials : undefined,
    }));

    const data = {
      // Do not send `code` - backend will generate it
      warehouseId,
      supplierId: supplier?.id,
      note: note || undefined,
      items: importDetails,
    };

    try {
        // Ensure user is authenticated. If auth state is empty, try to read token from localStorage.
        if (!isAuth && !localStorage.getItem('token')) {
          setSnackbar({ open: true, message: 'Bạn chưa đăng nhập', severity: 'error' });
          return;
        }

        // If a token exists in localStorage, set Authorization header for this request.
        const token = localStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      // Backend expects payload without `code` and without `receiptId` in items.
      // Cast to the expected DTO type to satisfy TypeScript while sending the cleaned payload.
      const payload = data as unknown as CreateImportReceiptDto;
      await dispatch(createImportReceipt(payload)).unwrap();
      setSnackbar({
        open: true,
        message: 'Tạo phiếu nhập kho thành công',
        severity: 'success',
      });
      
      // Navigate back or to list after success
      setTimeout(() => {
        router.push('/commercial/inventory');
      }, 1500);
    } catch (error) {
      console.error('Failed to create import receipt:', error);
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Tạo Phiếu Nhập Kho"
        actions={[
          {
            label: 'Quay lại',
            icon: <ArrowBackIcon />,
            onClick: () => router.back(),
            variant: 'outlined',
          },
        ]}
      />

      {operationLoading && <LoadingOverlay open={operationLoading} />}

      {/* Header Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Thông tin chung
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {/* Warehouse Selection */}
            <TextField
              select
              label="Chọn Kho"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              required
              fullWidth
            >
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} ({warehouse.code})
                </MenuItem>
              ))}
            </TextField>

            {/* Supplier Selection */}
            <Box>
              <TextField
                label="Nhà cung cấp"
                value={supplier?.name || ''}
                onClick={() => setOpenSupplierDialog(true)}
                placeholder="Nhấn để chọn nhà cung cấp"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>

            {/* Note */}
            <TextField
              label="Ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              rows={2}
              fullWidth
              sx={{ gridColumn: { md: 'span 2' } }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Danh sách hàng hóa
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              size="small"
            >
              Thêm sản phẩm
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell width="5%">#</TableCell>
                  <TableCell width="30%">Sản phẩm</TableCell>
                  <TableCell width="15%" align="right">Đơn giá</TableCell>
                  <TableCell width="15%" align="right">Số lượng</TableCell>
                  <TableCell width="15%" align="right">Thành tiền</TableCell>
                  <TableCell width="15%" align="center">Serial</TableCell>
                  <TableCell width="5%" align="center">Xóa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      
                      {/* Product Selection */}
                      <TableCell>
                        <TextField
                          value={item.product ? `${item.product.name} (${item.product.sku || 'N/A'})` : ''}
                          onClick={() => handleOpenProductDialog(index)}
                          placeholder="Nhấn để chọn sản phẩm"
                          size="small"
                          fullWidth
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>

                      {/* Unit Price */}
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(index, 'unitPrice', Number(e.target.value))}
                          size="small"
                          fullWidth
                          inputProps={{ min: 0, step: 1000 }}
                        />
                      </TableCell>

                      {/* Quantity */}
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = Number(e.target.value);
                            handleUpdateItem(index, 'quantity', newQty);
                            // Clear serials if quantity changed
                            if (item.product?.hasSerialNumber && newQty !== item.scannedSerials.length) {
                              handleUpdateItem(index, 'scannedSerials', []);
                            }
                          }}
                          size="small"
                          fullWidth
                          inputProps={{ min: 1 }}
                          disabled={item.product?.hasSerialNumber && item.scannedSerials.length > 0}
                        />
                      </TableCell>

                      {/* Total Price */}
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(calculateItemTotal(item))}
                        </Typography>
                      </TableCell>

                      {/* Serial Button */}
                      <TableCell align="center">
                        {item.product?.hasSerialNumber ? (
                          <Button
                            size="small"
                            variant={item.scannedSerials.length === item.quantity ? 'contained' : 'outlined'}
                            color={item.scannedSerials.length === item.quantity ? 'success' : 'primary'}
                            startIcon={<ScannerIcon />}
                            onClick={() => handleOpenSerialModal(index)}
                          >
                            {item.scannedSerials.length}/{item.quantity}
                          </Button>
                        ) : (
                          <Chip label="N/A" size="small" variant="outlined" disabled />
                        )}
                      </TableCell>

                      {/* Delete Button */}
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer with Total */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
            <Typography variant="h6">
              Tổng tiền:
            </Typography>
            <Typography variant="h5" color="primary" fontWeight={600}>
              {formatCurrency(calculateGrandTotal())}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.back()}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={operationLoading || items.length === 0}
              size="large"
            >
              Lưu & Nhập kho
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Supplier Select Dialog */}
      <SupplierSelectDialog
        open={openSupplierDialog}
        onClose={() => setOpenSupplierDialog(false)}
        onSelect={(selectedSupplier) => setSupplier(selectedSupplier)}
      />

      {/* Product Select Dialog */}
      <ProductSelectDialog
        open={openProductDialog}
        onClose={() => {
          setOpenProductDialog(false);
          setSelectedItemIndex(null);
        }}
        onSelect={handleSelectProduct}
      />

      {/* Serial Input Modal */}
      {selectedItemIndex !== null && items[selectedItemIndex]?.product && (
        <SerialInputModal
          open={openSerialModal}
          onClose={() => {
            setOpenSerialModal(false);
            setSelectedItemIndex(null);
          }}
          onConfirm={handleConfirmSerials}
          requiredQuantity={items[selectedItemIndex].quantity}
          productName={items[selectedItemIndex].product?.name || ''}
          initialSerials={items[selectedItemIndex].scannedSerials}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
