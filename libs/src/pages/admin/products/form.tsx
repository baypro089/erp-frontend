'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import type { AppDispatch, RootState } from '@libs/src/store';
import { Box, Alert, Snackbar } from '@mui/material';
import ProductForm from '@libs/src/components/products/ProductForm';
import { PageHeader, LoadingOverlay } from '@libs/src/components/common';
import { Inventory as ProductIcon } from '@mui/icons-material';
import {
  fetchProductById,
  createProduct,
  updateProduct,
  clearError,
  clearCurrentProduct,
} from '@libs/src/features/product/product.slice';
import type { CreateProductDto, UpdateProductDto } from '@libs/shared/types/product.type';
import { getProductRouteContext } from '../../../utils/product-route';

interface ProductFormPageProps {
  productId?: string;
}

export default function ProductFormPage({ productId }: ProductFormPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const router = useRouter();
  const { basePath } = getProductRouteContext(pathname);
  const { currentProduct, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.product
  );

  const isEdit = !!productId && productId !== 'create';

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load product data if editing
  useEffect(() => {
    if (isEdit && productId) {
      dispatch(fetchProductById(productId));
    }

    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [productId, dispatch, isEdit]);

  // Handle errors
  useEffect(() => {
    if (error || operationError) {
      setSnackbar({
        open: true,
        message: error || operationError || 'Đã xảy ra lỗi',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, operationError, dispatch]);

  const handleSubmit = async (data: CreateProductDto | UpdateProductDto, thumbnail?: File) => {
    try {
      if (isEdit && productId) {
        // Update existing product
        await dispatch(updateProduct({ id: productId, data: data as UpdateProductDto, thumbnail })).unwrap();
        setSnackbar({
          open: true,
          message: 'Cập nhật sản phẩm thành công',
          severity: 'success',
        });
      } else {
        // Create new product
        await dispatch(createProduct({ data: data as CreateProductDto, thumbnail })).unwrap();
        setSnackbar({
          open: true,
          message: 'Tạo sản phẩm thành công',
          severity: 'success',
        });
      }

      // Redirect to products list after a short delay
      setTimeout(() => {
        router.push(basePath);
      }, 1000);
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  // Show loading when fetching product details
  if (isEdit && loading && !currentProduct) {
    return <LoadingOverlay open={true} message="Đang tải sản phẩm..." />;
  }

  // Show error if product not found
  if (isEdit && error && !currentProduct) {
    return (
      <Box>
        <PageHeader
          title={isEdit ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm'}
          breadcrumbs={[
            { label: 'Sản phẩm', icon: <ProductIcon fontSize="small" />, href: basePath },
            { label: isEdit ? 'Chỉnh sửa' : 'Tạo mới' },
          ]}
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Product not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title={isEdit ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm'}
        subtitle={
          isEdit && currentProduct
            ? `Đang chỉnh sửa: ${currentProduct.name}`
            : 'Thêm sản phẩm mới vào kho'
        }
        breadcrumbs={[
          { label: 'Sản phẩm', icon: <ProductIcon fontSize="small" />, href: basePath },
          { label: isEdit ? 'Chỉnh sửa' : 'Tạo mới' },
        ]}
      />

      {/* Product Form */}
      {(!isEdit || currentProduct) && (
        <Box sx={{ mt: 2 }}>
          <ProductForm
            selectedProduct={isEdit ? currentProduct : null}
            onSubmit={handleSubmit}
            loading={operationLoading}
          />
        </Box>
      )}

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
