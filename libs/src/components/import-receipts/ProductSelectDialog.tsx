'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory as ProductIcon,
} from '@mui/icons-material';
import { DataTable, Column } from '@libs/src/components/common';
import { fetchProducts, fetchProductById } from '@libs/src/features/product/product.slice';
import type { ProductTableResponse, ProductResponse } from '@libs/shared/types/product.type';

interface ProductSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: ProductResponse) => void;
}

export default function ProductSelectDialog({
  open,
  onClose,
  onSelect,
}: ProductSelectDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, pagedProducts } = useSelector(
    (state: RootState) => state.product
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectingProductId, setSelectingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      dispatch(
        fetchProducts({
          name: searchQuery || undefined,
          sku: searchQuery || undefined,
          page: page + 1,
          pageSize: rowsPerPage,
        })
      );
    }
  }, [dispatch, open, page, rowsPerPage, searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  const handleSelectProduct = async (productTable: ProductTableResponse) => {
    try {
      setSelectingProductId(productTable.id);
      // Fetch full product details
      const fullProduct = await dispatch(fetchProductById(productTable.id)).unwrap();
      onSelect(fullProduct);
      // Let parent component handle closing
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    } finally {
      setSelectingProductId(null);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const columns: Column<ProductTableResponse>[] = [
    {
      id: 'sku',
      label: 'Mã SKU',
      minWidth: 120,
      format: (value) => (
        <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
          {value || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Tên sản phẩm',
      minWidth: 250,
      format: (value) => (
        <Typography variant="body2" fontWeight={500}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'brandName',
      label: 'Thương hiệu',
      minWidth: 120,
    },
    {
      id: 'categoryName',
      label: 'Danh mục',
      minWidth: 150,
    },
    {
      id: 'retailPrice',
      label: 'Giá bán',
      minWidth: 130,
      align: 'right',
      format: (value) => (
        <Typography variant="body2" fontWeight={500} color="primary">
          {formatCurrency(value as number)}
        </Typography>
      ),
    },
    {
      id: 'stockQuantity',
      label: 'Tồn kho',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        <Chip
          label={value}
          size="small"
          color={Number(value) > 0 ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'isActive',
      label: 'Trạng thái',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        <Typography
          variant="body2"
          sx={{
            color: value ? 'success.main' : 'error.main',
            fontWeight: 500,
          }}
        >
          {value ? 'Hoạt động' : 'Ngưng'}
        </Typography>
      ),
    },
  ];

  const selectAction = {
    icon: <ProductIcon />,
    label: 'Chọn',
    color: 'primary' as const,
    onClick: handleSelectProduct,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: '600px' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProductIcon color="primary" />
          <Typography variant="h6" component="div">
            Chọn Sản Phẩm
          </Typography>
        </Box>
        <IconButton edge="end" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <TextField
            placeholder="Tìm kiếm theo tên hoặc mã SKU..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            size="small"
            fullWidth
          />
        </Box>

        <DataTable
          columns={columns}
          data={products}
          loading={loading || selectingProductId !== null}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={pagedProducts?.totalCount || 0}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setPage(0);
          }}
          actions={[selectAction]}
          rowKey="id"
          emptyMessage="Không tìm thấy sản phẩm"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
