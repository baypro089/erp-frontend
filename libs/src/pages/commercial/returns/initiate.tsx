'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  InputAdornment,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  AssignmentReturn as ReturnIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { PageHeader } from '@libs/src/components/common';
import {
  searchOrdersForReturn,
  clearSearchResults,
  setSelectedOrder,
} from '@libs/src/features/return-request/return-request.slice';
import { OrderStatus } from '@libs/shared/enums/order-status.enum';
import type { OrderResponse } from '@libs/shared/types/order.type';

const ORDER_CODE_REGEX = /^(SO|RTN|RMA)-/i;

const STATUS_LABELS: Record<string, string> = {
  [OrderStatus.DELIVERED]: 'Đã giao',
  [OrderStatus.SHIPPED]: 'Đang giao',
  [OrderStatus.PROCESSING]: 'Đang xử lý',
  [OrderStatus.PENDING]: 'Chờ xử lý',
  [OrderStatus.CANCELLED]: 'Đã hủy',
};

export default function ReturnInitiatePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { searchResults, loading } = useSelector((state: RootState) => state.returnRequest);

  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!query.trim()) {
      dispatch(clearSearchResults());
      setShowResults(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      dispatch(searchOrdersForReturn(query.trim())).then((result: any) => {
        const orders: OrderResponse[] = result.payload ?? [];

        // Nếu khớp chính xác mã đơn hàng -> nhảy thẳng sang màn hình tạo
        const exactMatch = orders.find(
          (o) => o.code.toLowerCase() === query.trim().toLowerCase()
        );
        if (exactMatch) {
          dispatch(setSelectedOrder(exactMatch));
          router.push(`/commercial/returns/create?orderId=${exactMatch.id}`);
          return;
        }

        setShowResults(orders.length > 0);
      });
    }, 400);
  }, [query, dispatch, router]);

  const handleSelectOrder = (order: OrderResponse) => {
    dispatch(setSelectedOrder(order));
    router.push(`/commercial/returns/create?orderId=${order.id}`);
  };

  return (
    <Box>
      <PageHeader
        title="Tạo Đơn Trả Hàng"
        subtitle="Tra cứu đơn hàng để bắt đầu xử lý trả hàng / bảo hành"
        breadcrumbs={[
          { label: 'Thương mại', href: '/commercial/dashboards' },
          { label: 'Trả hàng', href: '/commercial/returns' },
          { label: 'Tạo mới' },
        ]}
      />

      {/* ── Omni-search box ────────────────────────────────────────────── */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={320}
        px={2}
      >
        <ReturnIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" mb={3} textAlign="center">
          Tra cứu đơn hàng cần trả / bảo hành
        </Typography>

        <Box sx={{ width: '100%', maxWidth: 600, position: 'relative' }}>
          <TextField
            fullWidth
            autoFocus
            variant="outlined"
            size="medium"
            placeholder="Nhập Mã Đơn Hàng (SO-...), Số điện thoại khách hoặc quét mã Serial..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SearchIcon color="action" />
                  )}
                </InputAdornment>
              ),
              sx: { borderRadius: 2, fontSize: '1rem' },
            }}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: '1rem' } }}
          />

          {/* ── Dropdown kết quả ──────────────────────────────────────── */}
          {showResults && searchResults.length > 0 && (
            <Paper
              elevation={6}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1300,
                mt: 0.5,
                borderRadius: 2,
                maxHeight: 380,
                overflowY: 'auto',
              }}
            >
              <Box px={2} py={1} bgcolor="grey.50">
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {searchResults.length} đơn hàng tìm thấy — chọn để tiếp tục
                </Typography>
              </Box>
              <Divider />
              <List disablePadding>
                {searchResults.map((order, idx) => (
                  <Box key={order.id}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleSelectOrder(order)} sx={{ py: 1.5 }}>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" fontWeight={700} color="primary">
                                {order.code}
                              </Typography>
                              <Chip
                                label={STATUS_LABELS[order.status] ?? order.status}
                                size="small"
                                color={order.status === OrderStatus.DELIVERED ? 'success' : 'default'}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {order.customer?.fullName} — {order.customer?.phoneNumber} &nbsp;|&nbsp; Ngày mua:{' '}
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')} &nbsp;|&nbsp; Tổng:{' '}
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(order.totalAmount)}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <ArrowIcon color="action" />
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    </ListItem>
                    {idx < searchResults.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Paper>
          )}

          {/* Không có kết quả */}
          {!loading && query.trim().length >= 3 && searchResults.length === 0 && showResults && (
            <Alert severity="info" sx={{ mt: 1, borderRadius: 2 }}>
              Không tìm thấy đơn hàng phù hợp với "{query}"
            </Alert>
          )}
        </Box>

        <Typography variant="caption" color="text.disabled" mt={2} textAlign="center">
          Gõ ít nhất 3 ký tự để tìm kiếm &bull; Nhập chính xác mã SO để chuyển thẳng
        </Typography>
      </Box>
    </Box>
  );
}
