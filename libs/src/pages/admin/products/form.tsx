'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
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

interface ProductFormPageProps {
  productId?: string;
}

export default function ProductFormPage({ productId }: ProductFormPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
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
        message: error || operationError || 'An error occurred',
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
          message: 'Product updated successfully',
          severity: 'success',
        });
      } else {
        // Create new product
        await dispatch(createProduct({ data: data as CreateProductDto, thumbnail })).unwrap();
        setSnackbar({
          open: true,
          message: 'Product created successfully',
          severity: 'success',
        });
      }

      // Redirect to products list after a short delay
      setTimeout(() => {
        router.push('/admin/products');
      }, 1000);
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  // Show loading when fetching product details
  if (isEdit && loading && !currentProduct) {
    return <LoadingOverlay open={true} message="Loading product..." />;
  }

  // Show error if product not found
  if (isEdit && error && !currentProduct) {
    return (
      <Box>
        <PageHeader
          title={isEdit ? 'Edit Product' : 'Create Product'}
          breadcrumbs={[
            { label: 'Products', icon: <ProductIcon fontSize="small" />, href: '/admin/products' },
            { label: isEdit ? 'Edit' : 'Create' },
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
        title={isEdit ? 'Edit Product' : 'Create Product'}
        subtitle={
          isEdit && currentProduct
            ? `Editing: ${currentProduct.name}`
            : 'Add a new product to inventory'
        }
        breadcrumbs={[
          { label: 'Products', icon: <ProductIcon fontSize="small" />, href: '/admin/products' },
          { label: isEdit ? 'Edit' : 'Create' },
        ]}
      />

      {/* Product Form */}
      {(!isEdit || currentProduct) && (
        <ProductForm
          selectedProduct={isEdit ? currentProduct : null}
          onSubmit={handleSubmit}
          loading={operationLoading}
        />
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
