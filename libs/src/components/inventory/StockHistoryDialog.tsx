'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  History as HistoryIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  SwapHoriz as SwapIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { fetchStockHistory, clearHistories } from '@libs/src/features/product-stock/product-stock.slice';
import { StockChangeType } from '@libs/shared/enums/warehouse-type.enum';
import type { ProductStockResponse } from '@libs/shared/types/product-stock.type';

interface StockHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  warehouseId: string;
  productId: string;
  productStock?: ProductStockResponse;
}

export default function StockHistoryDialog({
  open,
  onClose,
  warehouseId,
  productId,
  productStock,
}: StockHistoryDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { histories, loading } = useSelector((state: RootState) => state.productStock);

  useEffect(() => {
    if (open && warehouseId && productId) {
      dispatch(fetchStockHistory({ warehouseId, productId, page: 1, pageSize: 50 }));
    }

    return () => {
      dispatch(clearHistories());
    };
  }, [open, warehouseId, productId, dispatch]);

  const handleClose = () => {
    dispatch(clearHistories());
    onClose();
  };

  const getChangeTypeConfig = (type: StockChangeType) => {
    switch (type) {
      case StockChangeType.IMPORT:
        return {
          icon: <AddIcon fontSize="small" />,
          chipColor: 'success' as const,
          timelineColor: 'success' as const,
          label: 'Nhập hàng',
          sign: '+',
        };
      case StockChangeType.EXPORT:
        return {
          icon: <RemoveIcon fontSize="small" />,
          chipColor: 'error' as const,
          timelineColor: 'error' as const,
          label: 'Xuất bán',
          sign: '-',
        };
      case StockChangeType.TRANSFER:
        return {
          icon: <SwapIcon fontSize="small" />,
          chipColor: 'info' as const,
          timelineColor: 'info' as const,
          label: 'Chuyển kho',
          sign: '~',
        };
      case StockChangeType.ADJUSTMENT:
        return {
          icon: <EditIcon fontSize="small" />,
          chipColor: 'warning' as const,
          timelineColor: 'warning' as const,
          label: 'Điều chỉnh',
          sign: '±',
        };
      default:
        return {
          icon: <HistoryIcon fontSize="small" />,
          chipColor: 'default' as const,
          timelineColor: 'grey' as const,
          label: type,
          sign: '',
        };
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <HistoryIcon color="primary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">Thẻ kho - Lịch sử biến động</Typography>
          {productStock && (
            <Typography variant="body2" color="text.secondary">
              {productStock.product.name} ({productStock.product.sku})
            </Typography>
          )}
        </Box>
        {productStock && (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Tồn hiện tại
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary">
              {productStock.quantity}
            </Typography>
          </Box>
        )}
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {loading && histories.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : histories.length === 0 ? (
          <Alert severity="info">
            <Typography variant="body2">Chưa có lịch sử biến động cho sản phẩm này.</Typography>
          </Alert>
        ) : (
          <Timeline position="right">
            {histories.map((history, index) => {
              const config = getChangeTypeConfig(history.type);
              const isIncrease = history.changeAmount > 0;

              return (
                <TimelineItem key={history.id}>
                  <TimelineOppositeContent color="text.secondary" sx={{ maxWidth: '150px', pr: 2 }}>
                    <Typography variant="caption" display="block">
                      {formatDate(history.createdAt)}
                    </Typography>
                    {history.performer && (
                      <Typography variant="caption" color="text.disabled" display="block">
                        {history.performer.username}
                      </Typography>
                    )}
                  </TimelineOppositeContent>

                  <TimelineSeparator>
                    <TimelineDot color={config.timelineColor} variant="outlined">
                      {config.icon}
                    </TimelineDot>
                    {index < histories.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>

                  <TimelineContent>
                    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip label={config.label} color={config.chipColor} size="small" />
                        {history.referenceCode && (
                          <Chip
                            label={history.referenceCode}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace' }}
                          />
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color={isIncrease ? 'success.main' : 'error.main'}
                        >
                          {isIncrease ? '+' : ''}{history.changeAmount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          → Số dư: <strong>{history.balanceAfter}</strong>
                        </Typography>
                      </Box>

                      {history.reason && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          "{history.reason}"
                        </Typography>
                      )}
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} startIcon={<CloseIcon />}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
