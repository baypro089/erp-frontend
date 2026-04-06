'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Checkbox,
  FormControlLabel,
  IconButton,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Warehouse as WarehouseIcon,
  CheckCircle as CheckIcon,
  QrCodeScanner as ScanIcon,
  LocalShipping as ShippingIcon,
  Pending as PendingIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay, DataTable, Column, StatusChip, PermissionGuard } from '@libs/src/components/common';
import { fetchOrders, fetchOrderById, fulfillOrder, clearError } from '@libs/src/features/order/order.slice';
import { fetchWarehouses } from '@libs/src/features/warehouse/warehouse.slice';
import productSerialService from '@libs/src/features/product-serial/product-serial.service';
import type { OrderResponse, OrderTableReponse, FulfillOrderDto } from '@libs/shared/types/order.type';
import type { FulfillItemDto } from '@libs/shared/types/order-detail.type';
import type { WarehouseResponse } from '@libs/shared/types/warehouse.type';
import { OrderStatus } from '@libs/shared/enums/order-status.enum';
import { CacheService } from '@libs/src/services/cache.service';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';

interface FulfillItem {
  orderItemId: string;
  productId: string;
  productName: string;
  hasSerial: boolean;
  requiredQuantity: number;
  scannedSerials: string[];
  confirmed: boolean; // For non-serial items
}

const extractBackendMessage = (error: any, fallback: string): string => {
  const message = error?.response?.data?.message;

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (Array.isArray(message) && message.length > 0) {
    return message.filter(Boolean).join(', ');
  }

  if (message && typeof message === 'object') {
    const nestedMessage = (message as { message?: unknown }).message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
      return nestedMessage;
    }
    if (Array.isArray(nestedMessage) && nestedMessage.length > 0) {
      return nestedMessage.filter(Boolean).join(', ');
    }
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const getUniqueSerialCount = (item: FulfillItem): number => {
  if (!item.hasSerial) {
    return 0;
  }

  const normalizedSerials = item.scannedSerials
    .map((serial) => serial.trim().toUpperCase())
    .filter(Boolean);

  return new Set(normalizedSerials).size;
};

export default function FulfillmentPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.ORDER.VIEW}
      fallbackPath="/commercial/orders"
    >
      <FulfillmentPageContent />
    </PermissionGuard>
  );
}

function FulfillmentPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { pendingOrders, shippedOrders, loading, operationLoading, operationError } = useSelector(
    (state: RootState) => state.order
  );
  const { warehouses } = useSelector((state: RootState) => state.warehouse);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Selected order
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [openFulfillDialog, setOpenFulfillDialog] = useState(false);
  
  // Fulfillment state
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [fulfillItems, setFulfillItems] = useState<FulfillItem[]>([]);
  const [scanInput, setScanInput] = useState('');
  const [scanningForItemId, setScanningForItemId] = useState<string | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load data
  useEffect(() => {
    dispatch(fetchOrders({ page: 1, pageSize: 100 }));
    dispatch(fetchWarehouses());
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

  // Open fulfill dialog
  const handleOpenFulfill = async (row: OrderTableReponse) => {
    try {
      // Fetch full order details with items
      const fullOrder = await dispatch(fetchOrderById(row.id)).unwrap();
      setSelectedOrder(fullOrder);
      
      // Initialize fulfill items
      const items: FulfillItem[] = fullOrder.items.map((item) => ({
        orderItemId: item.id,
        productId: item.product.id,
        productName: item.product.name,
        hasSerial: item.product.hasSerialNumber,
        requiredQuantity: item.quantity,
        scannedSerials: [],
        confirmed: false,
      }));

      setFulfillItems(items);
      setOpenFulfillDialog(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Không thể tải chi tiết đơn hàng',
        severity: 'error',
      });
    }
  };

  // Close fulfill dialog
  const handleCloseFulfill = () => {
    setOpenFulfillDialog(false);
    setSelectedOrder(null);
    setFulfillItems([]);
    setSelectedWarehouseId('');
    setScanInput('');
    setScanningForItemId(null);
  };

  // Scan serial
  const handleScanSerial = async () => {
    if (!scanInput.trim() || !scanningForItemId) {
      return;
    }

    const serialNumber = scanInput.trim().toUpperCase();

    try {
      // Verify serial exists and is available
      const serial = await productSerialService.getSerialByNumber(serialNumber);
      
      // Find the item we're scanning for
      const itemIndex = fulfillItems.findIndex((item) => item.orderItemId === scanningForItemId);
      if (itemIndex === -1) return;

      const item = fulfillItems[itemIndex];

      if (getUniqueSerialCount(item) >= item.requiredQuantity) {
        setSnackbar({
          open: true,
          message: `Đã đủ serial cho sản phẩm ${item.productName}`,
          severity: 'error',
        });
        setScanInput('');
        return;
      }

      // Verify serial belongs to correct product
      if (serial.product.id !== item.productId) {
        setSnackbar({
          open: true,
          message: `Serial không thuộc sản phẩm ${item.productName}`,
          severity: 'error',
        });
        setScanInput('');
        return;
      }

      // Check if already scanned
      const normalizedScannedSet = new Set(
        item.scannedSerials.map((scanned) => scanned.trim().toUpperCase())
      );
      if (normalizedScannedSet.has(serialNumber)) {
        setSnackbar({
          open: true,
          message: 'Serial đã được quét',
          severity: 'error',
        });
        setScanInput('');
        return;
      }

      // Add to scanned list
      const updatedItems = [...fulfillItems];
      updatedItems[itemIndex] = {
        ...item,
        scannedSerials: [...item.scannedSerials, serialNumber],
      };
      setFulfillItems(updatedItems);

      setSnackbar({
        open: true,
        message: `Đã quét serial ${serialNumber}`,
        severity: 'success',
      });
      setScanInput('');

      // Auto-close scan if complete
      if (getUniqueSerialCount(updatedItems[itemIndex]) === item.requiredQuantity) {
        setScanningForItemId(null);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: extractBackendMessage(error, 'Serial không hợp lệ'),
        severity: 'error',
      });
      setScanInput('');
    }
  };

  // Remove scanned serial
  const handleRemoveSerial = (itemId: string, serial: string) => {
    setFulfillItems(
      fulfillItems.map((item) =>
        item.orderItemId === itemId
          ? {
              ...item,
              scannedSerials: item.scannedSerials.filter((s) => s !== serial),
            }
          : item
      )
    );
  };

  // Toggle non-serial confirmation
  const handleToggleConfirm = (itemId: string) => {
    setFulfillItems(
      fulfillItems.map((item) =>
        item.orderItemId === itemId ? { ...item, confirmed: !item.confirmed } : item
      )
    );
  };

  // Check if all items ready
  const allItemsReady = fulfillItems.every((item) =>
    item.hasSerial
      ? getUniqueSerialCount(item) === item.requiredQuantity
      : item.confirmed
  );

  // Submit fulfillment
  const handleSubmitFulfill = async () => {
    if (!selectedWarehouseId) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn kho xuất hàng',
        severity: 'error',
      });
      return;
    }

    if (!allItemsReady) {
      setSnackbar({
        open: true,
        message: 'Vui lòng hoàn thành tất cả các mục',
        severity: 'error',
      });
      return;
    }

    if (!selectedOrder) {
      return;
    }

    const expectedItemIds = Array.from(new Set(selectedOrder.items.map((item) => item.id)));
    const fulfillItemMap = new Map<string, FulfillItem>();
    const duplicatedOrderItemIds = new Set<string>();

    for (const item of fulfillItems) {
      if (fulfillItemMap.has(item.orderItemId)) {
        duplicatedOrderItemIds.add(item.orderItemId);
        continue;
      }
      fulfillItemMap.set(item.orderItemId, item);
    }

    if (duplicatedOrderItemIds.size > 0) {
      setSnackbar({
        open: true,
        message: 'Dữ liệu xuất kho không hợp lệ: trùng orderItemId trong payload',
        severity: 'error',
      });
      return;
    }

    const missingOrderItemIds = expectedItemIds.filter((id) => !fulfillItemMap.has(id));
    if (missingOrderItemIds.length > 0) {
      setSnackbar({
        open: true,
        message: 'Dữ liệu xuất kho không hợp lệ: thiếu orderItemId của đơn hàng',
        severity: 'error',
      });
      return;
    }

    const payloadItems: FulfillItemDto[] = [];
    for (const itemId of expectedItemIds) {
      const item = fulfillItemMap.get(itemId);
      if (!item) {
        continue;
      }

      const payloadItem: FulfillItemDto = {
        orderItemId: item.orderItemId,
      };

      if (item.hasSerial) {
        const normalizedSerials = item.scannedSerials
          .map((serial) => serial.trim().toUpperCase())
          .filter(Boolean);
        const uniqueSerials = Array.from(new Set(normalizedSerials));

        if (uniqueSerials.length !== normalizedSerials.length) {
          setSnackbar({
            open: true,
            message: `Serial bị trùng trong cùng item: ${item.productName}`,
            severity: 'error',
          });
          return;
        }

        if (uniqueSerials.length !== item.requiredQuantity) {
          setSnackbar({
            open: true,
            message: `Số serial chưa đủ cho sản phẩm ${item.productName}`,
            severity: 'error',
          });
          return;
        }

        payloadItem.scannedSerials = uniqueSerials;
      }

      payloadItems.push(payloadItem);
    }

    const fulfillDto: FulfillOrderDto = {
      warehouseId: selectedWarehouseId,
      items: payloadItems,
    };

    try {
      await dispatch(
        fulfillOrder({ orderId: selectedOrder.id, data: fulfillDto })
      ).unwrap();
      
      setSnackbar({
        open: true,
        message: 'Xuất hàng thành công',
        severity: 'success',
      });
      
      handleCloseFulfill();
      
      // Reload orders
      dispatch(fetchOrders({ page: 1, pageSize: 100 }));
    } catch (error) {
      // Error handled by useEffect
    }
  };

  // Get status chip
  const getStatusChip = (status: OrderStatus) => {
    const config: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'pending',
      [OrderStatus.PROCESSING]: 'processing',
      [OrderStatus.SHIPPED]: 'completed',
      [OrderStatus.DELIVERED]: 'delivered',
      [OrderStatus.CANCELLED]: 'cancelled',
    };
    return <StatusChip status={config[status]} />;
  };

  // Reload orders
  const handleRefresh = async () => {
    await CacheService.refreshCache();
    dispatch(fetchOrders({ page: 1, pageSize: 100 }));
    setSnackbar({
      open: true,
      message: 'Đã làm mới dữ liệu',
      severity: 'success',
    });
  };

  // Table columns
  const columns: Column<OrderTableReponse>[] = [
    {
      id: 'code',
      label: 'Mã đơn',
      minWidth: 120,
      format: (value, row) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          {row.code}
        </Typography>
      ),
    },
    {
      id: 'customerName',
      label: 'Khách hàng',
      minWidth: 150,
      format: (value, row) => (
        <Typography variant="body2">{row.customerName}</Typography>
      ),
    },
    {
      id: 'creatorName',
      label: 'Người tạo',
      minWidth: 150,
      format: (value, row) => (
        <Typography variant="body2">{row.creatorName}</Typography>
      ),
    },
    {
      id: 'totalAmount',
      label: 'Tổng tiền',
      minWidth: 120,
      align: 'right',
      format: (value, row) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          {row.totalAmount.toLocaleString('vi-VN')}₫
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 120,
      align: 'center',
      format: (value, row) => getStatusChip(row.status),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 150,
      format: (value, row) => (
        <Typography variant="body2">
          {new Date(row.createdAt).toLocaleString('vi-VN')}
        </Typography>
      ),
    },
  ];

  // Calculate progress for fulfill item
  const getItemProgress = (item: FulfillItem) => {
    if (!item.hasSerial) {
      return item.confirmed ? 100 : 0;
    }
    return (getUniqueSerialCount(item) / item.requiredQuantity) * 100;
  };

  const ordersToShow = activeTab === 0 ? pendingOrders : shippedOrders;

  return (
    <Box>
      <PageHeader
        title="Xuất kho / Fulfill"
        subtitle="Quản lý xuất hàng cho đơn hàng"
        breadcrumbs={[{ label: 'Xuất kho', icon: <WarehouseIcon fontSize="small" /> }]}
        actions={[
          {
            label: 'Làm mới',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
        ]}
        tags={[
          { label: `${pendingOrders.length} Đơn chờ xuất` },
          { label: `${shippedOrders.length} Đơn đã xuất` },
        ]}
      />

      <Paper sx={{ mt: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab
            label={
              <Badge badgeContent={pendingOrders.length} color="warning">
                Đơn chờ xuất
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={shippedOrders.length} color="success">
                Đơn đã xuất
              </Badge>
            }
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <DataTable
            columns={columns}
            data={ordersToShow}
            loading={loading}
            actions={
              activeTab === 0
                ? [
                    {
                      icon: <ShippingIcon />,
                      label: 'Xuất hàng',
                      onClick: handleOpenFulfill,
                      color: 'primary' as const,
                    },
                  ]
                : undefined
            }
            emptyMessage={
              activeTab === 0 ? 'Không có đơn chờ xuất' : 'Không có đơn đã xuất'
            }
          />
        </Box>
      </Paper>

      {/* Fulfill Dialog */}
      <Dialog
        open={openFulfillDialog}
        onClose={handleCloseFulfill}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Xuất hàng - {selectedOrder?.code}</Typography>
            <IconButton onClick={handleCloseFulfill}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* Warehouse Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Chọn kho xuất hàng *</InputLabel>
            <Select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              label="Chọn kho xuất hàng *"
            >
              {warehouses
                .filter((w) => w.isActive)
                .map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Quét serial cho sản phẩm có quản lý serial. Với sản phẩm không có serial, đánh dấu checkbox xác nhận.
            </Typography>
          </Alert>

          {/* Fulfill Items */}
          <List>
            {fulfillItems.map((item, index) => {
              const progress = getItemProgress(item);
              const isComplete = progress === 100;
              const isScanning = scanningForItemId === item.orderItemId;

              return (
                <Paper key={item.orderItemId} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.productName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Số lượng: {item.requiredQuantity}
                      </Typography>
                      <Chip
                        size="small"
                        label={item.hasSerial ? 'Có Serial' : 'Không Serial'}
                        color={item.hasSerial ? 'primary' : 'default'}
                        sx={{ mt: 1 }}
                      />
                    </Box>

                    {isComplete ? (
                      <CheckIcon color="success" fontSize="large" />
                    ) : (
                      <Chip
                        label={
                          item.hasSerial
                            ? `${getUniqueSerialCount(item)}/${item.requiredQuantity}`
                            : 'Chưa xác nhận'
                        }
                        color={isComplete ? 'success' : 'warning'}
                      />
                    )}
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    color={isComplete ? 'success' : 'primary'}
                    sx={{ mb: 2, height: 8, borderRadius: 4 }}
                  />

                  {item.hasSerial ? (
                    <>
                      <Button
                        variant={isScanning ? 'contained' : 'outlined'}
                        startIcon={<ScanIcon />}
                        onClick={() => setScanningForItemId(isScanning ? null : item.orderItemId)}
                        fullWidth
                        sx={{ mb: 2 }}
                        disabled={isComplete}
                      >
                        {isScanning ? 'Đang quét...' : 'Quét Serial'}
                      </Button>

                      {isScanning && (
                        <TextField
                          autoFocus
                          fullWidth
                          placeholder="Quét hoặc nhập số serial..."
                          value={scanInput}
                          onChange={(e) => setScanInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleScanSerial()}
                          InputProps={{
                            endAdornment: (
                              <Button onClick={handleScanSerial}>Xác nhận</Button>
                            ),
                          }}
                          sx={{ mb: 2 }}
                        />
                      )}

                      {item.scannedSerials.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {item.scannedSerials.map((serial) => (
                            <Chip
                              key={serial}
                              label={serial}
                              onDelete={() => handleRemoveSerial(item.orderItemId, serial)}
                              color="success"
                              size="small"
                            />
                          ))}
                        </Box>
                      )}
                    </>
                  ) : (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.confirmed}
                          onChange={() => handleToggleConfirm(item.orderItemId)}
                        />
                      }
                      label={`Xác nhận đã lấy đủ ${item.requiredQuantity} sản phẩm`}
                    />
                  )}
                </Paper>
              );
            })}
          </List>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseFulfill}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmitFulfill}
            disabled={!selectedWarehouseId || !allItemsReady || operationLoading}
            startIcon={allItemsReady ? <CheckIcon /> : <InfoIcon />}
            size="large"
          >
            {operationLoading ? 'Đang xử lý...' : 'XÁC NHẬN XUẤT KHO'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {operationLoading && <LoadingOverlay open={true} message="Đang xuất hàng..." />}
    </Box>
  );
}
