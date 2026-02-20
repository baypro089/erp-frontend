'use client';

import { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Warehouse as WarehouseIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  AccountCircle,
  Storefront,
  QrCode,
  PointOfSale,
  LocalOffer,
  Inventory2,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: number;
  badgeColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  children?: MenuItem[];
}

interface CommercialSidebarProps {
  open: boolean;
  onClose?: () => void;
  width?: number;
}

const DRAWER_WIDTH = 280;

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/commercial',
  },
  {
    id: 'pos',
    label: 'POS - Bán hàng',
    icon: <PointOfSale />,
    path: '/commercial/pos',
    badge: 0,
    badgeColor: 'success',
  },
  {
    id: 'orders',
    label: 'Đơn hàng',
    icon: <ShoppingCartIcon />,
    path: '/commercial/orders',
    badge: 12,
    badgeColor: 'warning',
  },
  {
    id: 'warehouses',
    label: 'Kho hàng',
    icon: <WarehouseIcon />,
    children: [
      {
        id: 'warehouse-list',
        label: 'Danh sách kho',
        icon: <Storefront />,
        path: '/commercial/warehouses',
      },
      {
        id: 'stock-transfer',
        label: 'Chuyển kho',
        icon: <LocalShippingIcon />,
        path: '/commercial/warehouses/transfer',
      },
      {
        id: 'stock-adjustment',
        label: 'Kiểm kê',
        icon: <Inventory2 />,
        path: '/commercial/warehouses/adjustment',
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Tồn kho',
    icon: <InventoryIcon />,
    children: [
      {
        id: 'inventory-overview',
        label: 'Tổng quan',
        icon: <AssessmentIcon />,
        path: '/commercial/inventory',
      },
      {
        id: 'inventory-imports',
        label: 'Phiếu nhập kho',
        icon: <ReceiptIcon />,
        path: '/commercial/inventory/imports',
      },
      {
        id: 'inventory-products',
        label: 'Sản phẩm',
        icon: <CategoryIcon />,
        path: '/commercial/inventory/products',
      },
      {
        id: 'inventory-tracking',
        label: 'Theo dõi Serial',
        icon: <QrCode />,
        path: '/commercial/inventory/tracking',
      },
    ],
  },
  {
    id: 'shipping',
    label: 'Vận chuyển',
    icon: <LocalShippingIcon />,
    path: '/commercial/shipping',
    badge: 8,
    badgeColor: 'info',
  },
  {
    id: 'invoices',
    label: 'Hóa đơn',
    icon: <ReceiptIcon />,
    path: '/commercial/invoices',
  },
  {
    id: 'promotions',
    label: 'Khuyến mãi',
    icon: <LocalOffer />,
    path: '/commercial/promotions',
  },
  {
    id: 'customers',
    label: 'Khách hàng',
    icon: <PeopleIcon />,
    path: '/commercial/customers',
  },
  {
    id: 'suppliers',
    label: 'Nhà cung cấp',
    icon: <BusinessIcon />,
    path: '/commercial/suppliers',
  },
  {
    id: 'reports',
    label: 'Báo cáo',
    icon: <TrendingUpIcon />,
    children: [
      {
        id: 'sales-report',
        label: 'Doanh thu',
        icon: <TrendingUpIcon />,
        path: '/commercial/reports/sales',
      },
      {
        id: 'inventory-report',
        label: 'Tồn kho',
        icon: <InventoryIcon />,
        path: '/commercial/reports/inventory',
      },
      {
        id: 'customer-report',
        label: 'Khách hàng',
        icon: <PeopleIcon />,
        path: '/commercial/reports/customers',
      },
    ],
  },
  {
    id: 'profile',
    label: 'Hồ sơ cá nhân',
    icon: <AccountCircle />,
    path: '/commercial/profile',
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: <SettingsIcon />,
    path: '/commercial/settings',
  },
];

export default function CommercialSidebar({
  open,
  onClose,
  width = DRAWER_WIDTH,
}: CommercialSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const drawerWidth = width;

  const handleToggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return pathname === path || pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const expanded = expandedItems.includes(item.id);
    const active = isActive(item.path);

    return (
      <Box key={item.id}>
        <ListItemButton
          onClick={() => {
            if (hasChildren) {
              handleToggleExpand(item.id);
            } else if (item.path) {
              handleNavigate(item.path);
            }
          }}
          sx={{
            pl: 2 + level * 2,
            py: 1.5,
            mb: 0.5,
            mx: 1,
            borderRadius: 2,
            backgroundColor: active
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : 'transparent',
            color: active ? 'white' : 'inherit',
            borderLeft: active ? `4px solid ${theme.palette.warning.main}` : '4px solid transparent',
            '&:hover': {
              backgroundColor: active
                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                : alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(4px)',
            },
            transition: 'all 0.2s ease-in-out',
            boxShadow: active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: active ? 'white' : theme.palette.primary.main,
              justifyContent: 'center',
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontWeight: active ? 700 : 500,
            }}
          />
          {item.badge !== undefined && item.badge > 0 && (
            <Chip
              label={item.badge}
              size="small"
              color={item.badgeColor || 'primary'}
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 700,
                minWidth: 20,
              }}
            />
          )}
          {hasChildren && (expanded ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
        {hasChildren && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          borderBottom: `3px solid ${theme.palette.warning.main}`,
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: alpha(theme.palette.common.white, 0.15),
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 36, color: theme.palette.warning.main }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            letterSpacing: 0.5,
          }}
        >
          COMMERCIAL
        </Typography>
        <Chip
          label="POS System"
          size="small"
          sx={{
            backgroundColor: theme.palette.warning.main,
            color: theme.palette.warning.contrastText,
            fontWeight: 700,
            fontSize: '0.7rem',
          }}
        />
      </Box>

      <Divider />

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', pt: 2 }}>
        <List sx={{ px: 0 }}>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Divider />
      <Box
        sx={{
          p: 2,
          background: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          © 2026 ERP System
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          Commercial Module
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: '4px 0 12px rgba(0,0,0,0.05)',
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
