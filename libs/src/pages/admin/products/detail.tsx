'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Paper,
  Alert,
  Snackbar,
  Button,
} from '@mui/material';
import {
  Inventory as ProductIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay } from '@libs/src/components/common';
import ProductForm from '@libs/src/components/products/ProductForm';
import {
  fetchProductById,
  clearError,
  clearCurrentProduct,
} from '@libs/src/features/product/product.slice';

interface ProductDetailPageProps {
  productId: string;
}

export default function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { currentProduct, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.product
  );

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load product data
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }

    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [productId, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error || operationError) {
      setSnackbar({
        open: true,
        message: error || operationError || 'An error occurred',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, operationError, dispatch]);

  const handleEdit = () => {
    router.push(`/admin/products/${productId}/edit`);
  };

  const handleBack = () => {
    router.push('/admin/products');
  };

  // Show loading when fetching product details
  if (loading && !currentProduct) {
    return <LoadingOverlay open={true} message="Đang tải thông tin sản phẩm..." />;
  }

  // Show error if product not found
  if (error && !currentProduct) {
    return (
      <Box>
        <PageHeader
          title="Chi tiết sản phẩm"
          breadcrumbs={[
            { label: 'Sản phẩm', icon: <ProductIcon fontSize="small" />, href: '/admin/products' },
            { label: 'Chi tiết' },
          ]}
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Không tìm thấy sản phẩm'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title={currentProduct?.name || 'Chi tiết sản phẩm'}
        subtitle={currentProduct ? `SKU: ${currentProduct.sku}` : ''}
        breadcrumbs={[
          { label: 'Sản phẩm', icon: <ProductIcon fontSize="small" />, href: '/admin/products' },
          { label: 'Chi tiết' },
        ]}
        actions={[
          {
            label: 'Chỉnh sửa',
            onClick: handleEdit,
            icon: <EditIcon />,
            variant: 'contained' as const,
            color: 'primary' as const,
          },
        ]}
      />

      {/* Product Form */}
      <Paper sx={{ mt: 3, p: 3 }}>
        {currentProduct && (
          <ProductForm
            selectedProduct={currentProduct}
            onSubmit={async () => {}}
            loading={false}
            readOnly
          />
        )}
      </Paper>

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
    </Box>
  );
}
