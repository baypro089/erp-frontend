import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from './product.service';
import type {
  ProductResponse,
  ProductTableResponse,
  CreateProductDto,
  UpdateProductDto,
  PagedAndFilteredProduct,
} from '@libs/shared/types/product.type';

interface ProductState {
  products: ProductTableResponse[];
  pagedProducts: PagedAndFilteredProduct | null;
  currentProduct: ProductResponse | null;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: ProductState = {
  products: [],
  pagedProducts: null,
  currentProduct: null,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (
    params: {
      sku?: string;
      name?: string;
      brandId?: string;
      categoryId?: string;
      retailPriceMin?: number;
      retailPriceMax?: number;
      page?: number;
      pageSize?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await productService.getProducts(
        params.sku,
        params.name,
        params.brandId,
        params.categoryId,
        params.retailPriceMin,
        params.retailPriceMax,
        params.page,
        params.pageSize
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async ({ data, thumbnail }: { data: CreateProductDto; thumbnail?: File }, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(data, thumbnail);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, data, thumbnail }: { id: string; data: UpdateProductDto; thumbnail?: File }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(id, data, thumbnail);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProducts = createAsyncThunk(
  'product/deleteProducts',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await productService.deleteProducts(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete products');
    }
  }
);

// Slice
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.pagedProducts = action.payload;
        state.products = action.payload.items;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create product
    builder
      .addCase(createProduct.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.operationLoading = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.operationLoading = false;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Delete products
    builder
      .addCase(deleteProducts.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteProducts.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.products = state.products.filter((product) => !action.payload.includes(product.id));
      })
      .addCase(deleteProducts.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
