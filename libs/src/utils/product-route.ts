export const ADMIN_PRODUCTS_BASE_PATH = '/admin/products';
export const COMMERCIAL_PRODUCTS_BASE_PATH = '/commercial/inventory/products';

export function getProductRouteContext(pathname?: string) {
  const isCommercialProductsRoute = pathname?.startsWith(COMMERCIAL_PRODUCTS_BASE_PATH);

  return {
    basePath: isCommercialProductsRoute
      ? COMMERCIAL_PRODUCTS_BASE_PATH
      : ADMIN_PRODUCTS_BASE_PATH,
    fallbackPath: isCommercialProductsRoute ? '/commercial/dashboards' : '/admin',
  };
}