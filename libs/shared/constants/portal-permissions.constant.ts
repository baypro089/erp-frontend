/**
 * Portal Access Permission Constants
 * These permissions determine which sites/portals a user can access
 */
export const PORTAL_PERMISSIONS = {
  ADMIN: 'ACCESS_ADMIN_PORTAL',
  HR: 'ACCESS_HR_PORTAL',
  SALE: 'ACCESS_SALE_PORTAL',
  WAREHOUSE: 'ACCESS_WAREHOUSE_PORTAL',
} as const;

export const PORTAL_PERMISSION_VALUES = Object.values(PORTAL_PERMISSIONS);

export type PortalPermission = typeof PORTAL_PERMISSIONS[keyof typeof PORTAL_PERMISSIONS];

export interface PortalInfo {
  permission: string;
  name: string;
  path: string;
  description: string;
  icon: string;
  available: boolean;
}

export const PORTAL_INFO: Record<string, PortalInfo> = {
  [PORTAL_PERMISSIONS.ADMIN]: {
    permission: PORTAL_PERMISSIONS.ADMIN,
    name: 'Admin Portal',
    path: '/admin/dashboard',
    description: 'Quản trị hệ thống',
    icon: 'AdminPanelSettings',
    available: true,
  },
  [PORTAL_PERMISSIONS.HR]: {
    permission: PORTAL_PERMISSIONS.HR,
    name: 'HR Portal',
    path: '/hr',
    description: 'Quản lý nhân sự',
    icon: 'People',
    available: true,
  },
  [PORTAL_PERMISSIONS.SALE]: {
    permission: PORTAL_PERMISSIONS.SALE,
    name: 'Commercial Portal',
    path: '/commercial/dashboards',
    description: 'Quản lý bán hàng',
    icon: 'ShoppingCart',
    available: true, // Coming soon
  },
};
