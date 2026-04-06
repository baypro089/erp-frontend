'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Alert,
  Chip,
  IconButton,
  Collapse,
  Button,
  Paper,
  Stack,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  QrCodeScanner as ScanIcon,
  Warehouse as WarehouseIcon,
  Warning as WarningIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay } from '@libs/src/components/common';
import {
  fetchOrderForReturn,
  createReturnRequest,
  clearError,
} from '@libs/src/features/return-request/return-request.slice';
import { fetchWarehouses } from '@libs/src/features/warehouse/warehouse.slice';
import { OrderStatus } from '@libs/shared/enums/order-status.enum';
import { WarehouseType } from '@libs/shared/enums/warehouse-type.enum';
import type { OrderDetailResponse } from '@libs/shared/types/order-detail.type';
import type { CreateReturnRequestDto } from '@libs/shared/types/return-request.type';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReturnItem {
  orderItemId: string;
  productId: string;
  productName: string;
  hasSerialNumber: boolean;
  purchasedQty: number;
  assignedSerials: string[];
  unitPrice: number;
  // State per row
  selected: boolean;
  serialInput: string;
  serialStatus: 'idle' | 'valid' | 'invalid';
  quantity: number;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  [OrderStatus.PENDING]: 'Chờ xử lý',
  [OrderStatus.PROCESSING]: 'Đang xử lý',
  [OrderStatus.SHIPPED]: 'Đang giao',
  [OrderStatus.DELIVERED]: 'Đã giao',
  [OrderStatus.CANCELLED]: 'Đã hủy',
};

const formatBackendBusinessError = (message: string): string => {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('overflow') ||
    normalized.includes('luy ke') ||
    normalized.includes('lũy kế')
  ) {
    return `Vượt số lượng trả cho phép theo lũy kế: ${message}`;
  }

  if (normalized.includes('sold')) {
    return `Serial không còn hợp lệ để trả hàng: ${message}`;
  }

  return message;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReturnCreatePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { selectedOrder, operationLoading, operationError, loading } = useSelector(
    (state: RootState) => state.returnRequest
  );
  const { warehouses } = useSelector((state: RootState) => state.warehouse);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [warehouseId, setWarehouseId] = useState('');
  const [reason, setReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundEdited, setRefundEdited] = useState(false);
  // Refund amount input (amount + unit selector)
  const MONEY_UNITS = {
    ten: { label: 'Chục', multiplier: 10 },
    hundred: { label: 'Trăm', multiplier: 100 },
    thousand: { label: 'Nghìn', multiplier: 1_000 },
    million: { label: 'Triệu', multiplier: 1_000_000 },
  } as const;
  type MoneyUnitKey = keyof typeof MONEY_UNITS;
  const [refundAmountInput, setRefundAmountInput] = useState<number>(0);
  const [refundAmountUnit, setRefundAmountUnit] = useState<MoneyUnitKey>('million');

  // ── UI state ────────────────────────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (orderId) dispatch(fetchOrderForReturn(orderId));
    dispatch(fetchWarehouses());
  }, [orderId, dispatch]);

  // Set default warehouse to DAMAGED type
  useEffect(() => {
    if (warehouses.length > 0 && !warehouseId) {
      const damaged = warehouses.find((w) => w.type === WarehouseType.DAMAGED && w.isActive);
      if (damaged) setWarehouseId(damaged.id);
    }
  }, [warehouses, warehouseId]);

  // Build items from order details
  useEffect(() => {
    if (!selectedOrder) return;
    const built: ReturnItem[] = (selectedOrder.items ?? []).map((detail: OrderDetailResponse) => ({
      orderItemId: detail.id,
      productId: detail.product.id,
      productName: detail.product.name,
      hasSerialNumber: detail.product.hasSerialNumber,
      purchasedQty: detail.quantity,
      assignedSerials: detail.assignedSerials ?? [],
      unitPrice: Number(detail.unitPrice) || 0,
      selected: false,
      serialInput: '',
      serialStatus: 'idle',
      quantity: 1,
    }));
    setItems(built);
  }, [selectedOrder]);

  // ── Auto-calculate refund ────────────────────────────────────────────────────
  const autoRefund = useMemo(() => {
    return items
      .filter((item) => item.selected)
      .reduce((sum, item) => {
        const unitPrice = Number(item.unitPrice) || 0;
        const quantity = Number(item.quantity) || 0;
        
        if (item.hasSerialNumber && item.serialStatus === 'valid') {
          return sum + unitPrice;
        }
        if (!item.hasSerialNumber) {
          return sum + unitPrice * quantity;
        }
        return sum;
      }, 0);
  }, [items]);

  useEffect(() => {
    if (!refundEdited) {
      setRefundAmount(autoRefund);
      // Update amount+unit inputs to reflect autoRefund
      const unit: MoneyUnitKey = 'million';
      setRefundAmountUnit(unit);
      setRefundAmountInput(Number((autoRefund / MONEY_UNITS[unit].multiplier).toFixed(2)));
    }
  }, [autoRefund, refundEdited]);

  // ── Error handling ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (operationError) {
      setSnackbar({
        open: true,
        message: formatBackendBusinessError(operationError),
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [operationError, dispatch]);

  // ─── Row handlers ──────────────────────────────────────────────────────────

  const toggleSelect = useCallback((idx: number) => {
    setItems((prev) => {
      const target = prev[idx];
      if (!target) return prev;

      if (target.selected) {
        return prev.map((item, i) => (i === idx ? { ...item, selected: false } : item));
      }

      const totalPurchasedForProduct = prev
        .filter((item) => item.productId === target.productId)
        .reduce((sum, item) => sum + item.purchasedQty, 0);

      const selectedQtyForProduct = prev.reduce((sum, item, i) => {
        if (i === idx || !item.selected || item.productId !== target.productId) {
          return sum;
        }

        return sum + (item.hasSerialNumber ? 1 : item.quantity);
      }, 0);

      const nextQty = target.hasSerialNumber ? 1 : target.quantity;
      if (selectedQtyForProduct + nextQty > totalPurchasedForProduct) {
        setSnackbar({
          open: true,
          message: 'Tổng số lượng trả cho cùng sản phẩm vượt số lượng đã mua',
          severity: 'error',
        });
        return prev;
      }

      return prev.map((item, i) => (i === idx ? { ...item, selected: true } : item));
    });
  }, []);

  const handleSerialChange = useCallback((idx: number, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const normalizedValue = value.toUpperCase();
        const trimmed = normalizedValue.trim();
        const isValid = item.assignedSerials
          .map((s) => s.toUpperCase())
          .includes(trimmed);
        return {
          ...item,
          serialInput: normalizedValue,
          serialStatus: trimmed === '' ? 'idle' : isValid ? 'valid' : 'invalid',
        };
      })
    );
  }, []);

  const handleQuantityChange = useCallback((idx: number, delta: number) => {
    setItems((prev) => {
      const target = prev[idx];
      if (!target || target.hasSerialNumber) {
        return prev;
      }

      const next = Math.min(Math.max(1, target.quantity + delta), target.purchasedQty);
      if (next === target.quantity) {
        return prev;
      }

      if (target.selected) {
        const totalPurchasedForProduct = prev
          .filter((item) => item.productId === target.productId)
          .reduce((sum, item) => sum + item.purchasedQty, 0);

        const selectedQtyExcludingCurrent = prev.reduce((sum, item, i) => {
          if (i === idx || !item.selected || item.productId !== target.productId) {
            return sum;
          }

          return sum + (item.hasSerialNumber ? 1 : item.quantity);
        }, 0);

        if (selectedQtyExcludingCurrent + next > totalPurchasedForProduct) {
          setSnackbar({
            open: true,
            message: 'Tổng số lượng trả cho cùng sản phẩm vượt số lượng đã mua',
            severity: 'error',
          });
          return prev;
        }
      }

      return prev.map((item, i) => (i === idx ? { ...item, quantity: next } : item));
    });
  }, []);

  // ─── Validation ────────────────────────────────────────────────────────────

  const selectedItems = items.filter((item) => item.selected);

  const totalPurchasedByProduct = useMemo(() => {
    const totalMap = new Map<string, number>();

    for (const item of items) {
      const current = totalMap.get(item.productId) ?? 0;
      totalMap.set(item.productId, current + item.purchasedQty);
    }

    return totalMap;
  }, [items]);

  const selectedQuantityByProduct = useMemo(() => {
    const totalMap = new Map<string, number>();

    for (const item of selectedItems) {
      const quantity = item.hasSerialNumber ? 1 : item.quantity;
      const current = totalMap.get(item.productId) ?? 0;
      totalMap.set(item.productId, current + quantity);
    }

    return totalMap;
  }, [selectedItems]);

  const overflowProductIds = useMemo(() => {
    const overflowSet = new Set<string>();

    for (const [productId, selectedQty] of selectedQuantityByProduct) {
      const purchasedQty = totalPurchasedByProduct.get(productId) ?? 0;
      if (selectedQty > purchasedQty) {
        overflowSet.add(productId);
      }
    }

    return overflowSet;
  }, [selectedQuantityByProduct, totalPurchasedByProduct]);

  const duplicatedSerials = useMemo(() => {
    const serialCounter = new Map<string, number>();

    for (const item of selectedItems) {
      if (!item.hasSerialNumber) {
        continue;
      }

      const serial = item.serialInput.trim().toUpperCase();
      if (!serial) {
        continue;
      }

      serialCounter.set(serial, (serialCounter.get(serial) ?? 0) + 1);
    }

    return new Set(
      Array.from(serialCounter.entries())
        .filter(([, count]) => count > 1)
        .map(([serial]) => serial)
    );
  }, [selectedItems]);

  const hasDuplicateSerialAcrossForm = duplicatedSerials.size > 0;

  const validationHint = useMemo(() => {
    if (selectedItems.length === 0) {
      return 'Vui lòng chọn ít nhất một sản phẩm để trả';
    }

    if (!warehouseId) {
      return 'Vui lòng chọn kho tiếp nhận';
    }

    if (!reason.trim()) {
      return 'Vui lòng nhập lý do trả hàng';
    }

    const serialItemsOk = selectedItems
      .filter((i) => i.hasSerialNumber)
      .every((i) => i.serialStatus === 'valid');
    if (!serialItemsOk) {
      return 'Vui lòng nhập serial hợp lệ cho sản phẩm có serial';
    }

    if (hasDuplicateSerialAcrossForm) {
      return 'Không được nhập trùng serial ở nhiều dòng trong cùng form';
    }

    if (overflowProductIds.size > 0) {
      return 'Tổng số lượng trả của cùng sản phẩm vượt số lượng đã mua';
    }

    return '';
  }, [selectedItems, warehouseId, reason, hasDuplicateSerialAcrossForm, overflowProductIds]);

  const isFormValid = useMemo(() => {
    return validationHint === '';
  }, [validationHint]);

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!warehouseId) errors.warehouse = 'Vui lòng chọn kho tiếp nhận';
    if (!reason.trim()) errors.reason = 'Vui lòng nhập lý do trả hàng';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setConfirmOpen(false);
      return;
    }

    if (!selectedOrder) {
      return;
    }

    if (!isFormValid) {
      setConfirmOpen(false);
      setSnackbar({
        open: true,
        message: validationHint || 'Thông tin trả hàng chưa hợp lệ',
        severity: 'error',
      });
      return;
    }

    const dto: CreateReturnRequestDto = {
      orderId: selectedOrder.id,
      warehouseId,
      reason,
      items: selectedItems.map((item) => ({
        productId: item.productId,
        quantity: item.hasSerialNumber ? 1 : item.quantity,
        refundPrice: Number(item.hasSerialNumber ? item.unitPrice : item.unitPrice * item.quantity),
        returnedSerials: item.hasSerialNumber ? [item.serialInput.trim().toUpperCase()] : undefined,
      })),
    };

    const result = await dispatch(createReturnRequest(dto));
    if (createReturnRequest.fulfilled.match(result)) {
      setConfirmOpen(false);
      setSnackbar({
        open: true,
        message: 'Tạo phiếu trả hàng thành công!',
        severity: 'success',
      });
      setTimeout(() => {
        router.push(`/commercial/returns/${result.payload.id}`);
      }, 1200);
    }
  };

  const selectedWarehouse = warehouses.find((w) => w.id === warehouseId);

  if (loading && !selectedOrder) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedOrder && !loading) {
    return (
      <Box p={4}>
        <Alert severity="error">
          Không tìm thấy đơn hàng. Vui lòng{' '}
          <Button size="small" onClick={() => router.push('/commercial/returns/initiate')}>
            quay lại tra cứu
          </Button>
        </Alert>
      </Box>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Box pb={14}>
      <LoadingOverlay open={operationLoading} />

      <PageHeader
        title="Xử lý Trả Hàng"
        subtitle={`Đơn hàng: ${selectedOrder?.code}`}
        breadcrumbs={[
          { label: 'Thương mại', href: '/commercial/dashboards' },
          { label: 'Trả hàng', href: '/commercial/returns' },
          { label: 'Tạo phiếu' },
        ]}
      />

      <Stack spacing={3}>
        {/* ════════════════════════════════════════════════════════════════
            CARD 1 — Thông tin đơn hàng gốc (read-only)
        ════════════════════════════════════════════════════════════════ */}
        <Card variant="outlined">
          <CardHeader
            avatar={<InfoIcon color="primary" />}
            title={
              <Typography fontWeight={700} variant="h6">
                Thông tin Đơn hàng gốc
              </Typography>
            }
            sx={{ pb: 0 }}
          />
          <Divider />
          <CardContent>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }}
              gap={2}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Mã đơn hàng
                </Typography>
                <Typography variant="body1" fontWeight={700} color="primary">
                  {selectedOrder?.code}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Ngày mua
                </Typography>
                <Typography variant="body1">
                  {selectedOrder?.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')
                    : '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Khách hàng
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedOrder?.customer?.fullName ?? '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1">
                  {selectedOrder?.customer?.phoneNumber ?? '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Trạng thái đơn
                </Typography>
                <Chip
                  label={
                    ORDER_STATUS_LABELS[selectedOrder?.status ?? ''] ?? selectedOrder?.status
                  }
                  color={selectedOrder?.status === OrderStatus.DELIVERED ? 'success' : 'default'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tổng tiền đơn
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(selectedOrder?.totalAmount ?? 0)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ════════════════════════════════════════════════════════════════
            CARD 2 — Danh sách hàng hóa & Dynamic Form
        ════════════════════════════════════════════════════════════════ */}
        <Card variant="outlined">
          <CardHeader
            avatar={<ScanIcon color="warning" />}
            title={
              <Typography fontWeight={700} variant="h6">
                Danh sách Hàng hóa
              </Typography>
            }
            subheader="Tích chọn sản phẩm cần trả và điền thông tin bên dưới"
            sx={{ pb: 0 }}
          />
          <Divider />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell padding="checkbox" />
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell align="center">Loại</TableCell>
                  <TableCell align="right">Đã mua</TableCell>
                  <TableCell align="right">Đơn giá</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, idx) => {
                  const normalizedSerial = item.serialInput.trim().toUpperCase();
                  const duplicateSerial =
                    item.selected &&
                    item.hasSerialNumber &&
                    normalizedSerial !== '' &&
                    duplicatedSerials.has(normalizedSerial);

                  const productOverflow =
                    item.selected && overflowProductIds.has(item.productId);

                  return (
                    <ItemRow
                      key={item.orderItemId}
                      item={item}
                      duplicateSerial={duplicateSerial}
                      productOverflow={productOverflow}
                      selectedProductQty={selectedQuantityByProduct.get(item.productId) ?? 0}
                      purchasedProductQty={totalPurchasedByProduct.get(item.productId) ?? 0}
                      onToggle={() => toggleSelect(idx)}
                      onSerialChange={(val) => handleSerialChange(idx, val)}
                      onQuantityChange={(delta) => handleQuantityChange(idx, delta)}
                    />
                  );
                })}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Không có sản phẩm</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {selectedItems.length > 0 && (
            <Box px={2} py={1} bgcolor="primary.50">
              <Typography variant="caption" color="primary" fontWeight={600}>
                Đã chọn {selectedItems.length} sản phẩm để trả
              </Typography>
            </Box>
          )}
        </Card>

        {/* ════════════════════════════════════════════════════════════════
            CARD 3 — Cấu hình Nhập Kho & Hoàn tiền
        ════════════════════════════════════════════════════════════════ */}
        <Card variant="outlined">
          <CardHeader
            avatar={<WarehouseIcon color="error" />}
            title={
              <Typography fontWeight={700} variant="h6">
                Cấu hình Nhập Kho & Hoàn tiền
              </Typography>
            }
            sx={{ pb: 0 }}
          />
          <Divider />
          <CardContent>
            <Stack spacing={3}>
              {/* Kho tiếp nhận */}
              <FormControl fullWidth error={!!formErrors.warehouse} required>
                <InputLabel>Kho tiếp nhận *</InputLabel>
                <Select
                  value={warehouseId}
                  label="Kho tiếp nhận *"
                  onChange={(e) => {
                    setWarehouseId(e.target.value);
                    setFormErrors((prev) => ({ ...prev, warehouse: '' }));
                  }}
                >
                  {warehouses
                    .filter((w) => w.isActive)
                    .map((w) => (
                      <MenuItem key={w.id} value={w.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {w.name}
                          {w.type === WarehouseType.DAMAGED && (
                            <Chip
                              label="Kho lỗi"
                              size="small"
                              color="warning"
                            />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
                {formErrors.warehouse ? (
                  <FormHelperText>{formErrors.warehouse}</FormHelperText>
                ) : (
                  <FormHelperText>
                    Mặc định chọn Kho Hàng Lỗi để tránh nhập nhầm về kho bán mới
                  </FormHelperText>
                )}
              </FormControl>

              {/* Lý do */}
              <TextField
                label="Lý do trả hàng *"
                multiline
                rows={3}
                fullWidth
                required
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setFormErrors((prev) => ({ ...prev, reason: '' }));
                }}
                error={!!formErrors.reason}
                helperText={formErrors.reason || 'VD: Lỗi NSX, quạt không quay, màn hình bị sọc...'}
                placeholder="Nhập lý do trả hàng chi tiết..."
              />

              {/* Xử lý tài chính */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                  Xử lý tài chính
                </Typography>
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
                  gap={2}
                >
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Tổng tiền hàng trả (tự động)
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(autoRefund)}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Dựa trên đơn giá × số lượng được chọn
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <TextField
                      label="Tiền hoàn trả khách (có thể điều chỉnh)"
                      type="number"
                      fullWidth
                      value={refundAmountInput}
                      onChange={(e) => {
                        const parsed = Number(e.target.value);
                        const amount = Number.isNaN(parsed) ? 0 : parsed;
                        setRefundAmountInput(amount);
                        setRefundAmount(amount * MONEY_UNITS[refundAmountUnit].multiplier);
                        setRefundEdited(true);
                      }}
                      inputProps={{ min: 0, step: 0.01 }}
                      helperText="Có thể giảm nếu hàng hao mòn, trầy xước — thông thường trừ ~10%"
                    />

                    <TextField
                      label="Đơn vị"
                      select
                      value={refundAmountUnit}
                      onChange={(e) => {
                        const unit = e.target.value as MoneyUnitKey;
                        const current = Number(refundAmount) || 0;
                        const nextAmount = current / MONEY_UNITS[unit].multiplier;
                        setRefundAmountUnit(unit);
                        setRefundAmountInput(Number.isFinite(nextAmount) ? Number(nextAmount.toFixed(2)) : 0);
                        setRefundEdited(true);
                      }}
                      sx={{ minWidth: 140 }}
                      disabled={false}
                    >
                      {Object.entries(MONEY_UNITS).map(([key, unit]) => (
                        <MenuItem key={key} value={key}>
                          {unit.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* ════════════════════════════════════════════════════════════════
          STICKY FOOTER
      ════════════════════════════════════════════════════════════════ */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          borderTop: '2px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {selectedItems.length} sản phẩm được chọn &bull; Hoàn tiền:&nbsp;
            <Typography component="span" fontWeight={700} color="error.main" variant="body2">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(refundAmount)}
            </Typography>
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => router.push('/commercial/returns')}
          >
            Hủy
          </Button>
          <Tooltip
            title={!isFormValid ? validationHint : ''}
          >
            <span>
              <Button
                variant="contained"
                color="error"
                size="large"
                disabled={!isFormValid || operationLoading}
                onClick={() => setConfirmOpen(true)}
                sx={{ fontWeight: 700, px: 4 }}
              >
                {operationLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'XÁC NHẬN NHẬP KHO LỖI & TẠO PHIẾU'
                )}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Paper>

      {/* ════════════════════════════════════════════════════════════════
          CONFIRMATION DIALOG
      ════════════════════════════════════════════════════════════════ */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Xác nhận tạo phiếu trả hàng
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Hệ thống sẽ tiến hành nhập kho các sản phẩm này vào{' '}
            <strong>[{selectedWarehouse?.name ?? 'Kho đã chọn'}]</strong> và hoàn lại{' '}
            <strong>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(refundAmount)}
            </strong>{' '}
            cho khách hàng. Thao tác này sẽ ghi nhận vào Thẻ kho. Bạn có chắc chắn?
          </Alert>

          <Stack spacing={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Đơn hàng:</Typography>
              <Typography variant="body2" fontWeight={600}>{selectedOrder?.code}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Khách hàng:</Typography>
              <Typography variant="body2">{selectedOrder?.customer?.fullName}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Kho tiếp nhận:</Typography>
              <Typography variant="body2">{selectedWarehouse?.name}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Sản phẩm trả:</Typography>
              <Typography variant="body2">{selectedItems.length} mặt hàng</Typography>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" fontWeight={700}>Tiền hoàn trả:</Typography>
              <Typography variant="body2" fontWeight={700} color="error.main">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(refundAmount)}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setConfirmOpen(false)}>
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSubmit}
            disabled={operationLoading}
            startIcon={operationLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Xác nhận tạo phiếu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ─── Sub-component: ItemRow ────────────────────────────────────────────────────

interface ItemRowProps {
  item: ReturnItem;
  duplicateSerial: boolean;
  productOverflow: boolean;
  selectedProductQty: number;
  purchasedProductQty: number;
  onToggle: () => void;
  onSerialChange: (val: string) => void;
  onQuantityChange: (delta: number) => void;
}

function ItemRow({
  item,
  duplicateSerial,
  productOverflow,
  selectedProductQty,
  purchasedProductQty,
  onToggle,
  onSerialChange,
  onQuantityChange,
}: ItemRowProps) {
  const serialBorderColor =
    duplicateSerial
      ? 'error.main'
      : item.serialStatus === 'valid'
      ? 'success.main'
      : item.serialStatus === 'invalid'
      ? 'error.main'
      : 'divider';

  return (
    <>
      {/* Main row */}
      <TableRow
        hover
        sx={{ cursor: 'pointer', bgcolor: item.selected ? 'action.selected' : 'inherit' }}
        onClick={onToggle}
      >
        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={item.selected} onChange={onToggle} color="primary" />
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={item.selected ? 700 : 400}>
            {item.productName}
          </Typography>
        </TableCell>
        <TableCell align="center">
          {item.hasSerialNumber ? (
            <Chip label="Có Serial" size="small" color="info" />
          ) : (
            <Chip label="Số lượng" size="small" color="default" />
          )}
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2">{item.purchasedQty}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(item.unitPrice)}
          </Typography>
        </TableCell>
      </TableRow>

      {/* Expanded form row */}
      <TableRow>
        <TableCell
          colSpan={5}
          sx={{ py: 0, border: item.selected ? undefined : 'none' }}
        >
          <Collapse in={item.selected} timeout="auto" unmountOnExit>
            <Box
              sx={{
                px: 4,
                py: 2,
                borderLeft: '3px solid',
                borderColor: 'primary.main',
                bgcolor: 'grey.50',
                mb: 1,
                borderRadius: '0 8px 8px 0',
              }}
            >
              {item.hasSerialNumber ? (
                /* ── Case A: Serial product ───────────────────────── */
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Đơn này đã xuất các Serial:{' '}
                    {item.assignedSerials.length > 0 ? (
                      item.assignedSerials.map((s) => (
                        <Chip key={s} label={s} size="small" sx={{ mr: 0.5 }} />
                      ))
                    ) : (
                      <em>(chưa có serial được gán)</em>
                    )}
                  </Typography>
                  <TextField
                    size="small"
                    label="Nhập hoặc quét mã Serial"
                    placeholder="VD: SN-999"
                    value={item.serialInput}
                    onChange={(e) => onSerialChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      maxWidth: 360,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: serialBorderColor,
                          borderWidth:
                            item.serialStatus !== 'idle' ? 2 : 1,
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ScanIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment:
                        duplicateSerial ? (
                          <InputAdornment position="end">
                            <CancelIcon color="error" />
                          </InputAdornment>
                        ) : item.serialStatus === 'valid' ? (
                          <InputAdornment position="end">
                            <CheckIcon color="success" />
                          </InputAdornment>
                        ) : item.serialStatus === 'invalid' ? (
                          <InputAdornment position="end">
                            <CancelIcon color="error" />
                          </InputAdornment>
                        ) : null,
                    }}
                  />
                  {duplicateSerial && (
                    <Alert severity="error" sx={{ mt: 1, maxWidth: 420, py: 0 }}>
                      Serial đang bị trùng ở dòng khác trong cùng form. Vui lòng nhập serial khác.
                    </Alert>
                  )}
                  {!duplicateSerial && item.serialStatus === 'invalid' && (
                    <Alert severity="error" sx={{ mt: 1, maxWidth: 360, py: 0 }}>
                      Mã Serial không thuộc đơn hàng này!
                    </Alert>
                  )}
                  {!duplicateSerial && item.serialStatus === 'valid' && (
                    <Alert severity="success" sx={{ mt: 1, maxWidth: 360, py: 0 }}>
                      Serial hợp lệ — đã xác nhận
                    </Alert>
                  )}
                  {productOverflow && (
                    <Alert severity="error" sx={{ mt: 1, maxWidth: 500, py: 0 }}>
                      Tổng số lượng trả của sản phẩm này đang là {selectedProductQty}, vượt quá số lượng đã mua {purchasedProductQty}.
                    </Alert>
                  )}
                </Box>
              ) : (
                /* ── Case B: Non-serial product ──────────────────── */
                <Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      Số lượng trả:
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuantityChange(-1);
                        }}
                        disabled={item.quantity <= 1}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        minWidth={32}
                        textAlign="center"
                      >
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuantityChange(1);
                        }}
                        disabled={item.quantity >= item.purchasedQty}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      / Tối đa: <strong>{item.purchasedQty}</strong>
                    </Typography>
                  </Box>
                  {productOverflow && (
                    <Alert severity="error" sx={{ mt: 1, maxWidth: 500, py: 0 }}>
                      Tổng số lượng trả của sản phẩm này đang là {selectedProductQty}, vượt quá số lượng đã mua {purchasedProductQty}.
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
