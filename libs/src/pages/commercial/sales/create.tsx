'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  InputAdornment,
  Divider,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LocalOffer as OfferIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay } from '@libs/src/components/common';
import { fetchStocksByWarehouse } from '@libs/src/features/product-stock/product-stock.slice';
import { fetchWarehouses } from '@libs/src/features/warehouse/warehouse.slice';
import { createOrder, clearError } from '@libs/src/features/order/order.slice';
import customerService from '@libs/src/features/customer/customer.service';
import productService from '@libs/src/features/product/product.service';
import type { ProductStockResponse } from '@libs/shared/types/product-stock.type';
import type { CustomerResponse, CreateCustomerDto } from '@libs/shared/types/customer.type';
import type { CreateOrderDto } from '@libs/shared/types/order.type';
import { CustomerTier } from '@libs/shared/enums/customer-tier.enum';

interface SaleProductItem {
  stockId: string;
  productId: string;
  name: string;
  sku?: string;
  thumbnailUrl?: string;
  retailPrice: number;
  stockQuantity: number;
  warehouseId: string;
  warehouseName: string;
  isActive: boolean;
}

interface CartItem {
  product: SaleProductItem;
  quantity: number;
  unitPrice: number; // Giá có thể điều chỉnh
}

export default function CreateOrderPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const {
    stocks,
    page: stockPage,
    totalPages: stockTotalPages,
    totalCount: stockTotalCount,
    loading: productsLoading,
  } = useSelector((state: RootState) => state.productStock);
  const { warehouses, loading: warehousesLoading } = useSelector((state: RootState) => state.warehouse);
  const { operationLoading, operationError } = useSelector((state: RootState) => state.order);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);
  
  // Product filters
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productPage, setProductPage] = useState(1);
  const productPageSize = 12;
  
  // Customer search
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPhoneError, setCustomerPhoneError] = useState<string | null>(null);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  
  // Order notes
  const [orderNote, setOrderNote] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [thumbnailMap, setThumbnailMap] = useState<Record<string, string>>({});
  const loadedThumbnailIdsRef = useRef<Set<string>>(new Set());

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load warehouses
  useEffect(() => {
    dispatch(fetchWarehouses());
  }, [dispatch]);

  // Auto-select first active warehouse
  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      const firstActiveWarehouse = warehouses.find((warehouse) => warehouse.isActive);
      if (firstActiveWarehouse) {
        setSelectedWarehouseId(firstActiveWarehouse.id);
      }
    }
  }, [warehouses, selectedWarehouseId]);

  // Load stock products by warehouse
  useEffect(() => {
    if (!selectedWarehouseId) return;

    dispatch(
      fetchStocksByWarehouse({
        warehouseId: selectedWarehouseId,
        search: productSearch.trim() || undefined,
        page: productPage,
        pageSize: productPageSize,
      })
    );
  }, [dispatch, selectedWarehouseId, productSearch, productPage]);

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

  // Always filter by selected warehouse to avoid cross-warehouse results when searching.
  const saleProducts: SaleProductItem[] = useMemo(
    () =>
      stocks
        .filter((stock: ProductStockResponse) =>
          selectedWarehouseId ? stock.warehouse.id === selectedWarehouseId : true
        )
        .map((stock: ProductStockResponse) => ({
          stockId: stock.id,
          productId: stock.product.id,
          name: stock.product.name,
          sku: stock.product.sku,
          thumbnailUrl: stock.product.thumbnailUrl,
          retailPrice: Number(stock.product.retailPrice),
          stockQuantity: Number(stock.quantity),
          warehouseId: stock.warehouse.id,
          warehouseName: stock.warehouse.name,
          isActive: stock.product.isActive,
        })),
    [stocks, selectedWarehouseId]
  );

  // Load latest thumbnail URLs for products currently displayed.
  useEffect(() => {
    if (saleProducts.length === 0) return;

    const productsToFetch = saleProducts.filter(
      (product) => !loadedThumbnailIdsRef.current.has(product.productId)
    );

    if (productsToFetch.length === 0) return;

    let isCancelled = false;

    const loadThumbnails = async () => {
      const results = await Promise.allSettled(
        productsToFetch.map(async (product) => {
          const thumbnail = await productService.getProductThumbnail(product.productId);
          return {
            productId: product.productId,
            publicUrl: thumbnail?.publicUrl || '',
          };
        })
      );

      if (isCancelled) return;

      const nextMap: Record<string, string> = {};

      results.forEach((result, index) => {
        const productId = productsToFetch[index].productId;
        loadedThumbnailIdsRef.current.add(productId);

        if (result.status === 'fulfilled' && result.value.publicUrl) {
          nextMap[productId] = result.value.publicUrl;
        }
      });

      if (Object.keys(nextMap).length > 0) {
        setThumbnailMap((prev) => ({ ...prev, ...nextMap }));
      }
    };

    void loadThumbnails();

    return () => {
      isCancelled = true;
    };
  }, [saleProducts]);

  // Customer search
  const handleCustomerSearch = async () => {
    // validate before searching
    const phone = customerPhone.trim();
    if (!phone) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập số điện thoại',
        severity: 'error',
      });
      return;
    }
    const phoneRegex = /^0(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      setSnackbar({ open: true, message: 'Số điện thoại không hợp lệ', severity: 'error' });
      return;
    }

    setCustomerSearchLoading(true);
    try {
      const customer = await customerService.getCustomerByPhone(customerPhone);
      setSelectedCustomer(customer);
      setSnackbar({
        open: true,
        message: `Tìm thấy khách hàng: ${customer.fullName}`,
        severity: 'success',
      });
    } catch (error: any) {
      // Customer not found - show create dialog
      if (error.response?.status === 404) {
        setOpenNewCustomerDialog(true);
      } else {
        setSnackbar({
          open: true,
          message: 'Không tìm thấy khách hàng',
          severity: 'error',
        });
      }
    } finally {
      setCustomerSearchLoading(false);
    }
  };

  // Create new customer
  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập tên khách hàng',
        severity: 'error',
      });
      return;
    }

    try {
      const newCustomerDto: CreateCustomerDto = {
        fullName: newCustomerName,
        phoneNumber: customerPhone,
      };
      const newCustomer = await customerService.createCustomer(newCustomerDto);
      setSelectedCustomer(newCustomer);
      setOpenNewCustomerDialog(false);
      setNewCustomerName('');
      setSnackbar({
        open: true,
        message: 'Tạo khách hàng mới thành công',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Không thể tạo khách hàng',
        severity: 'error',
      });
    }
  };

  // Add to cart
  const handleAddToCart = (product: SaleProductItem) => {
    if (product.stockQuantity <= 0) {
      setSnackbar({
        open: true,
        message: `Sản phẩm ${product.name} đã hết hàng trong kho đã chọn`,
        severity: 'error',
      });
      return;
    }

    const existingItem = cart.find((item) => item.product.productId === product.productId);
    
    if (existingItem) {
      const nextQuantity = existingItem.quantity + 1;
      if (nextQuantity > product.stockQuantity) {
        setSnackbar({
          open: true,
          message: `Số lượng vượt tồn kho của ${product.name} (tồn: ${product.stockQuantity})`,
          severity: 'error',
        });
        return;
      }

      setCart(
        cart.map((item) =>
          item.product.productId === product.productId
            ? { ...item, quantity: nextQuantity }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          unitPrice: Number(product.retailPrice),
        },
      ]);
    }
  };

  // Update quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    const targetItem = cart.find((item) => item.product.productId === productId);
    if (!targetItem) return;

    const nextQuantity = targetItem.quantity + delta;
    if (delta > 0 && nextQuantity > targetItem.product.stockQuantity) {
      setSnackbar({
        open: true,
        message: `Số lượng vượt tồn kho của ${targetItem.product.name} (tồn: ${targetItem.product.stockQuantity})`,
        severity: 'error',
      });
      return;
    }

    setCart(
      cart
        .map((item) =>
          item.product.productId === productId
            ? { ...item, quantity: Math.max(0, nextQuantity) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Update unit price
  const handleUpdatePrice = (productId: string, newPrice: number) => {
    setCart(
      cart.map((item) =>
        item.product.productId === productId
          ? { ...item, unitPrice: Math.max(0, newPrice) }
          : item
      )
    );
  };

  // Remove from cart
  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.productId !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = subtotal - discountAmount;

  // Create order
  const handleCreateOrder = async () => {
    if (!selectedCustomer) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn khách hàng',
        severity: 'error',
      });
      return;
    }

    if (cart.length === 0) {
      setSnackbar({
        open: true,
        message: 'Giỏ hàng trống',
        severity: 'error',
      });
      return;
    }

    const orderDto: CreateOrderDto = {
      customerId: selectedCustomer.id,
      discountAmount: Number(discountAmount),
      note: orderNote || undefined,
      items: cart.map((item) => ({
        productId: item.product.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    };

    try {
      await dispatch(createOrder(orderDto)).unwrap();
      setSnackbar({
        open: true,
        message: 'Tạo đơn hàng thành công',
        severity: 'success',
      });
      
      // Reset form
      setCart([]);
      setSelectedCustomer(null);
      setCustomerPhone('');
      setOrderNote('');
      setDiscountAmount(0);
      
      // Redirect to orders list after 1.5s
      setTimeout(() => {
        router.push('/commercial/orders');
      }, 1500);
    } catch (error) {
      // Error handled by useEffect
    }
  };

  // Get tier badge
  const getTierBadge = (tier: CustomerTier) => {
    const colors: Record<CustomerTier, string> = {
      [CustomerTier.STANDARD]: '#808080',
      [CustomerTier.SILVER]: '#C0C0C0',
      [CustomerTier.GOLD]: '#FFD700',
      [CustomerTier.PLATINUM]: '#E5E4E2',
    };
    const tierLabels: Record<CustomerTier, string> = {
      [CustomerTier.STANDARD]: 'Thường',
      [CustomerTier.SILVER]: 'Bạc',
      [CustomerTier.GOLD]: 'Vàng',
      [CustomerTier.PLATINUM]: 'Bạch kim',
    };
    return (
      <Chip
        label={tierLabels[tier]}
        size="small"
        sx={{ backgroundColor: colors[tier], color: 'white', fontWeight: 600 }}
      />
    );
  };

  return (
    <Box>
      <PageHeader
        title="Tạo đơn hàng"
        subtitle="Giao diện bán hàng POS"
        breadcrumbs={[{ label: 'Bán hàng', icon: <CartIcon fontSize="small" /> }]}
      />

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ minHeight: 'calc(100vh - 200px)' }}>
          {/* Left: Product List */}
          <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 600 }}>
              <TextField
                fullWidth
                placeholder="Tìm sản phẩm theo tên hoặc SKU..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setProductPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2.5 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="warehouse-select-label">Kho hiển thị sản phẩm</InputLabel>
                <Select
                  labelId="warehouse-select-label"
                  value={selectedWarehouseId}
                  label="Kho hiển thị sản phẩm"
                  onChange={(event) => {
                    setSelectedWarehouseId(event.target.value);
                    setProductPage(1);
                  }}
                  disabled={warehousesLoading}
                >
                  {warehouses
                    .filter((warehouse) => warehouse.isActive)
                    .map((warehouse) => (
                      <MenuItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedWarehouseId
                    ? `Tổng ${stockTotalCount} sản phẩm trong kho đã chọn`
                    : 'Vui lòng chọn kho để hiển thị sản phẩm'}
                </Typography>
                {selectedWarehouseId && (
                  <Chip
                    size="small"
                    color="info"
                    label={`Trang ${stockPage}/${Math.max(stockTotalPages, 1)}`}
                  />
                )}
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {!selectedWarehouseId ? (
                  <Alert severity="warning">Chưa có kho nào khả dụng để bán hàng</Alert>
                ) : productsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : saleProducts.length === 0 ? (
                  <Alert severity="info">Không tìm thấy sản phẩm phù hợp trong kho đã chọn</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {saleProducts.map((product) => {
                      const outOfStock = product.stockQuantity <= 0;

                      return (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.stockId}>
                        <Card>
                          <CardActionArea
                            onClick={() => handleAddToCart(product)}
                            disabled={outOfStock}
                            sx={{ opacity: outOfStock ? 0.6 : 1 }}
                          >
                            <CardMedia
                              component="img"
                              height="140"
                              image={thumbnailMap[product.productId] || product.thumbnailUrl || '/placeholder-product.png'}
                              alt={product.name}
                              sx={{ objectFit: 'cover' }}
                            />
                            <CardContent>
                              <Typography variant="subtitle2" noWrap>
                                {product.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                SKU: {product.sku || 'Không có'}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  mt: 1,
                                }}
                              >
                                <Typography variant="h6" color="primary">
                                  {product.retailPrice.toLocaleString('vi-VN')}₫
                                </Typography>
                                <Chip
                                  label={`Tồn: ${product.stockQuantity}`}
                                  size="small"
                                  color={product.stockQuantity > 0 ? 'success' : 'error'}
                                />
                              </Box>
                              {outOfStock && (
                                <Typography variant="caption" color="error.main">
                                  Hết hàng - không thể chọn
                                </Typography>
                              )}
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>

              {selectedWarehouseId && stockTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    color="primary"
                    page={productPage}
                    count={stockTotalPages}
                    onChange={(_, pageValue) => setProductPage(pageValue)}
                  />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right: Cart & Checkout */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 600 }}>
              {/* Customer Search */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon /> Thông tin khách hàng
                </Typography>
                
                <TextField
                  fullWidth
                  placeholder="Nhập số điện thoại khách hàng..."
                  value={customerPhone}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomerPhone(v);
                    // realtime validation
                    const phoneRegex = /^0(3|5|7|8|9)[0-9]{8}$/;
                    if (!v.trim()) {
                      setCustomerPhoneError(null);
                    } else if (!phoneRegex.test(v.trim())) {
                      setCustomerPhoneError('Số điện thoại không hợp lệ');
                    } else {
                      setCustomerPhoneError(null);
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomerSearch()}
                  disabled={!!selectedCustomer}
                  error={!!customerPhoneError}
                  helperText={customerPhoneError || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                    endAdornment: selectedCustomer ? null : (
                      <InputAdornment position="end">
                        <Button
                          onClick={handleCustomerSearch}
                          disabled={customerSearchLoading || !!customerPhoneError}
                          variant="contained"
                          size="small"
                        >
                          {customerSearchLoading ? <CircularProgress size={20} /> : 'Tìm'}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                {selectedCustomer && (
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {selectedCustomer.fullName.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {selectedCustomer.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedCustomer.phoneNumber}
                        </Typography>
                      </Box>
                      {getTierBadge(selectedCustomer.tier)}
                    </Box>
                    {selectedCustomer.address && (
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HomeIcon fontSize="small" /> {selectedCustomer.address}
                      </Typography>
                    )}
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerPhone('');
                      }}
                      sx={{ mt: 1 }}
                    >
                      Đổi khách hàng
                    </Button>
                  </Paper>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Cart Items */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CartIcon /> Giỏ hàng ({cart.length})
              </Typography>

              <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                {cart.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">Giỏ hàng trống</Typography>
                  </Box>
                ) : (
                  cart.map((item) => (
                    <Paper key={item.product.productId} variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar
                          src={thumbnailMap[item.product.productId] || item.product.thumbnailUrl || '/placeholder-product.png'}
                          variant="rounded"
                          sx={{ width: 60, height: 60 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2">{item.product.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Tồn kho hiện tại: {item.product.stockQuantity}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateQuantity(item.product.productId, -1)}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateQuantity(item.product.productId, 1)}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <TextField
                            type="number"
                            size="small"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleUpdatePrice(item.product.productId, Number(e.target.value))
                            }
                            sx={{ width: 120, mb: 1 }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                            }}
                          />
                          <Typography variant="subtitle2" color="primary">
                            {(item.quantity * item.unitPrice).toLocaleString('vi-VN')}₫
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveFromCart(item.product.productId)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Order Summary */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tạm tính:</Typography>
                  <Typography>{subtotal.toLocaleString('vi-VN')}₫</Typography>
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  label="Chiết khấu"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <OfferIcon />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                  }}
                  sx={{ mb: 2 }}
                />
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="h6">Tổng cộng:</Typography>
                  <Typography variant="h6" color="primary">
                    {total.toLocaleString('vi-VN')}₫
                  </Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Ghi chú đơn hàng..."
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                sx={{ mb: 2 }}
              />

              {/* Create Order Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleCreateOrder}
                disabled={!selectedCustomer || cart.length === 0 || operationLoading}
                sx={{ py: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
              >
                {operationLoading ? <CircularProgress size={24} /> : 'TẠO ĐƠN HÀNG'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* New Customer Dialog */}
      <Dialog open={openNewCustomerDialog} onClose={() => setOpenNewCustomerDialog(false)}>
        <DialogTitle>Khách hàng mới</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Không tìm thấy khách hàng với SĐT: {customerPhone}
          </Alert>
          <TextField
            autoFocus
            fullWidth
            label="Tên khách hàng"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateCustomer()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewCustomerDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreateCustomer}>
            Tạo khách hàng
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

      {operationLoading && <LoadingOverlay open={true} message="Đang tạo đơn hàng..." />}
    </Box>
  );
}
