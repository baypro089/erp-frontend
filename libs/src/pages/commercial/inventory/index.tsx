'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Chip,
  Avatar,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  IconButton,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import {
  DataTable,
  PageHeader,
  FilterBar,
  LoadingOverlay,
  Column,
  PermissionGuard,
} from '@libs/src/components/common';
import StockAdjustmentDialog from '@libs/src/components/inventory/StockAdjustmentDialog';
import StockHistoryDialog from '@libs/src/components/inventory/StockHistoryDialog';
import {
  fetchStocksByWarehouse,
  adjustStock,
  clearError,
} from '@libs/src/features/product-stock/product-stock.slice';
import { fetchWarehouses } from '@libs/src/features/warehouse/warehouse.slice';
import type { ProductStockResponse, StockAdjustmentDTO } from '@libs/shared/types/product-stock.type';
import { CacheService } from '@libs/src/services/cache.service';
import { usePermissionGuard } from '@libs/src/hooks';
import { PermissionDeniedDialog } from '@libs/src/components/common';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';

export default function InventoryPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.PRODUCT_STOCK.VIEW}
      fallbackPath="/commercial"
    >
      <InventoryPageContent />
    </PermissionGuard>
  );
}

function InventoryPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { guardAction, permissionDialogProps } = usePermissionGuard();
  const { stocks, totalCount, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.productStock
  );
  const { warehouses } = useSelector((state: RootState) => state.warehouse);

  // Dialog states
  const [openAdjustment, setOpenAdjustment] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedStock, setSelectedStock] = useState<ProductStockResponse | null>(null);

  // Filter states
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load warehouses on mount
  useEffect(() => {
    dispatch(fetchWarehouses());
  }, [dispatch]);

  // Auto-select first warehouse
  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      // Select first active warehouse
      const firstActive = warehouses.find(w => w.isActive);
      if (firstActive) {
        setSelectedWarehouseId(firstActive.id);
      }
    }
  }, [warehouses, selectedWarehouseId]);

  // Load stocks when warehouse changes
  useEffect(() => {
    if (selectedWarehouseId) {
      dispatch(
        fetchStocksByWarehouse({
          warehouseId: selectedWarehouseId,
          search: searchQuery || undefined,
          lowStock: showLowStockOnly || undefined,
          page: page + 1,
          pageSize: rowsPerPage,
        })
      );
    }
  }, [dispatch, selectedWarehouseId, searchQuery, showLowStockOnly, page, rowsPerPage]);

  // Handle errors
  useEffect(() => {
    if (error || operationError) {
      setSnackbar({
        open: true,
        message: error || operationError || 'Có lỗi xảy ra',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, operationError, dispatch]);

  // Stock level indicator
  const getStockLevelIndicator = (stock: ProductStockResponse) => {
    if (stock.quantity === 0) {
      return (
        <Chip
          label="Hết hàng"
          size="small"
          sx={{
            backgroundColor: '#d32f2f',
            color: 'white',
            fontWeight: 700,
          }}
        />
      );
    }

    if (stock.quantity <= stock.minStockLevel) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <WarningIcon sx={{ fontSize: 20, color: 'error.main' }} />
          <Typography variant="h6" color="error.main" fontWeight={700}>
            {stock.quantity}
          </Typography>
        </Box>
      );
    }

    return (
      <Typography variant="h6" color="success.main" fontWeight={700}>
        {stock.quantity}
      </Typography>
    );
  };

  // Define table columns
  const columns: Column<ProductStockResponse>[] = [
    {
      id: 'product',
      label: 'Sản phẩm',
      minWidth: 300,
      format: (value, row: ProductStockResponse) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={row.product.thumbnailUrl || ''}
            alt={row.product.name}
            variant="rounded"
            sx={{ width: 56, height: 56 }}
          >
            {row.product.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.product.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              SKU: {row.product.sku}
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              {row.product.brand?.name || 'Chưa có thương hiệu'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'quantity',
      label: 'Số lượng',
      minWidth: 150,
      align: 'center',
      format: (value, row: ProductStockResponse) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          {getStockLevelIndicator(row)}
          <Typography variant="caption" color="text.secondary">
            Định mức: {row.minStockLevel}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'minStockLevel',
      label: 'Định mức tối thiểu',
      minWidth: 120,
      align: 'center',
      format: (value) => (
        <Chip
          label={value}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      id: 'lastUpdated',
      label: 'Cập nhật cuối',
      minWidth: 150,
      align: 'center',
      format: (value) => {
        const date = new Date(value);
        return (
          <Typography variant="caption">
            {date.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </Typography>
        );
      },
    },
  ];

  // Handlers
  const handleWarehouseChange = (event: SelectChangeEvent) => {
    setSelectedWarehouseId(event.target.value);
    setPage(0);
  };

  const handleViewHistory = (stock: ProductStockResponse) => {
    setSelectedStock(stock);
    setOpenHistory(true);
  };

  const handleOpenAdjustmentImpl = () => {
    if (!selectedWarehouseId) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn kho trước',
        severity: 'error',
      });
      return;
    }
    setOpenAdjustment(true);
  };

  const handleOpenAdjustment = guardAction(PERMISSIONS.PRODUCT_STOCK.UPDATE, handleOpenAdjustmentImpl);

  const handleAdjustmentSubmit = async (dto: StockAdjustmentDTO) => {
    try {
      await dispatch(adjustStock(dto)).unwrap();
      setSnackbar({
        open: true,
        message: 'Điều chỉnh kho thành công',
        severity: 'success',
      });
      setOpenAdjustment(false);
      // Reload stocks
      if (selectedWarehouseId) {
        dispatch(
          fetchStocksByWarehouse({
            warehouseId: selectedWarehouseId,
            search: searchQuery || undefined,
            lowStock: showLowStockOnly || undefined,
            page: page + 1,
            pageSize: rowsPerPage,
          })
        );
      }
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleRefresh = async () => {
    if (selectedWarehouseId) {
      await CacheService.refreshCache();
      dispatch(
        fetchStocksByWarehouse({
          warehouseId: selectedWarehouseId,
          search: searchQuery || undefined,
          lowStock: showLowStockOnly || undefined,
          page: page + 1,
          pageSize: rowsPerPage,
        })
      );
      setSnackbar({
        open: true,
        message: 'Đã làm mới dữ liệu',
        severity: 'success',
      });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setShowLowStockOnly(false);
  };

  const activeFiltersCount = (searchQuery ? 1 : 0) + (showLowStockOnly ? 1 : 0);

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);
  const lowStockCount = stocks.filter(s => s.quantity <= s.minStockLevel && s.quantity > 0).length;
  const outOfStockCount = stocks.filter(s => s.quantity === 0).length;

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Quản lý Tồn kho"
        subtitle="Theo dõi và điều chỉnh tồn kho sản phẩm theo kho"
        breadcrumbs={[{ label: 'Tồn kho', icon: <InventoryIcon fontSize="small" /> }]}
        actions={[
          {
            label: 'Làm mới',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
            disabled: !selectedWarehouseId,
          },
          {
            label: 'Điều chỉnh kho',
            onClick: handleOpenAdjustment,
            icon: <EditIcon />,
            variant: 'contained',
            disabled: !selectedWarehouseId,
          },
        ]}
        tags={
          selectedWarehouse
            ? [
                { label: `Kho: ${selectedWarehouse.name}` },
                lowStockCount > 0 && { label: `${lowStockCount} sắp hết`, color: 'warning' as const },
                outOfStockCount > 0 && { label: `${outOfStockCount} hết hàng`, color: 'error' as const },
              ].filter(Boolean) as any
            : []
        }
      />

      {/* Toolbar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Warehouse Selector */}
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Chọn kho</InputLabel>
            <Select value={selectedWarehouseId} onChange={handleWarehouseChange} label="Chọn kho">
              {warehouses
                .filter(w => w.isActive)
                .map(warehouse => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {warehouse.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({warehouse.code})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Low Stock Filter */}
          <FormControlLabel
            control={
              <Checkbox
                checked={showLowStockOnly}
                onChange={(e) => {
                  setShowLowStockOnly(e.target.checked);
                  setPage(0);
                }}
                disabled={!selectedWarehouseId}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WarningIcon fontSize="small" color="warning" />
                <Typography variant="body2">Chỉ hiện hàng sắp hết</Typography>
              </Box>
            }
          />
        </Box>
      </Paper>

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'search',
            label: 'Tìm kiếm',
            placeholder: 'Tìm theo tên sản phẩm hoặc SKU...',
            value: searchQuery,
          },
        ]}
        onSearchChange={(fieldId, value) => {
          if (fieldId === 'search') {
            setSearchQuery(value);
            setPage(0);
          }
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
        showFilterButton={false}
      />

      {/* Data Table */}
      {!selectedWarehouseId ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <InventoryIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Vui lòng chọn kho
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chọn kho từ dropdown bên trên để xem tồn kho
          </Typography>
        </Paper>
      ) : (
        <DataTable
          columns={columns}
          data={stocks}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalCount}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setPage(0);
          }}
          actions={[
            {
              label: 'Xem thẻ kho',
              icon: <HistoryIcon />,
              onClick: handleViewHistory,
            },
          ]}
          rowKey="id"
          emptyMessage="Không có sản phẩm nào trong kho"
        />
      )}

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={openAdjustment}
        onClose={() => setOpenAdjustment(false)}
        onSubmit={handleAdjustmentSubmit}
        warehouseId={selectedWarehouseId}
        loading={operationLoading}
      />

      {/* Stock History Dialog */}
      {selectedStock && (
        <StockHistoryDialog
          open={openHistory}
          onClose={() => {
            setOpenHistory(false);
            setSelectedStock(null);
          }}
          warehouseId={selectedWarehouseId}
          productId={selectedStock.product.id}
          productStock={selectedStock}
        />
      )}

      {/* Loading Overlay */}
      <LoadingOverlay open={loading && stocks.length === 0} message="Đang tải dữ liệu tồn kho..." />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <PermissionDeniedDialog {...permissionDialogProps} />
    </Box>
  );
}
