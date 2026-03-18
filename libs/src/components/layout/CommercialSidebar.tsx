'use client';

import { useEffect, useMemo, useState } from 'react';
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
  AssignmentReturn as AssignmentReturnIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import orderService from '@libs/src/features/order/order.service';
import { OrderStatus } from '@libs/shared/enums/order-status.enum';

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

const baseMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/commercial/dashboards',
  },
  {
    id: 'orders',
    label: 'Đơn hàng',
    icon: <ShoppingCartIcon />,
    path: '/commercial/orders',
    badgeColor: 'warning',
  },
  {
    id: 'returns',
    label: 'Trả hàng / Bảo hành',
    icon: <AssignmentReturnIcon />,
    path: '/commercial/returns',
    badgeColor: 'error',
  },
  {
    id: 'warehouses',
    label: 'Kho hàng',
    icon: <WarehouseIcon />,
    path: '/commercial/warehouses',
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
        id: 'inventory-exports',
        label: 'Xuất kho',
        icon: <LocalShippingIcon />,
        path: '/commercial/warehouse/fulfillment',
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
        label: 'Doanh Số & Lợi Nhuận',
        icon: <TrendingUpIcon />,
        path: '/commercial/reports/sales',
      },
      {
        id: 'inventory-report',
        label: 'Xuất Nhập Tồn',
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
  const [menuBadges, setMenuBadges] = useState<Record<string, number>>({});
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

  useEffect(() => {
    let isCancelled = false;

    const loadMenuBadges = async () => {
      try {
        const pendingOrders = await orderService.getOrders({
          status: OrderStatus.PENDING,
          page: 1,
          pageSize: 1,
        });

        if (isCancelled) {
          return;
        }

        setMenuBadges({
          orders: pendingOrders.totalCount,
        });
      } catch {
        if (!isCancelled) {
          setMenuBadges({});
        }
      }
    };

    loadMenuBadges();

    return () => {
      isCancelled = true;
    };
  }, [pathname]);

  const menuItems = useMemo(
    () =>
      baseMenuItems.map((item) => ({
        ...item,
        badge: menuBadges[item.id],
      })),
    [menuBadges],
  );

  const isActive = (path?: string) => {
    if (!path) return false;
    
    // Exact match
    if (pathname === path) return true;
    
    // Check if current pathname is a child page (detail/edit/create)
    if (pathname.startsWith(path + '/')) {
      const remaining = pathname.slice(path.length + 1);
      const segments = remaining.split('/');
      const firstSegment = segments[0];
      
      // Only match if next segment is 'create', 'edit', 'detail', or looks like an ID
      // This prevents '/commercial/inventory' from matching when at '/commercial/inventory/imports'
      const isDynamicSegment = 
        ['create', 'edit', 'detail'].includes(firstSegment) ||
        /^[a-f0-9-]{36}$/.test(firstSegment) || // UUID
        /^\d+$/.test(firstSegment); // Numeric ID
      
      return isDynamicSegment;
    }
    
    return false;
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
            background: active
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : 'transparent',
            color: active ? 'white' : 'inherit',
            borderLeft: active ? `4px solid ${theme.palette.warning.main}` : '4px solid transparent',
            '&:hover': {
              background: active
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
          // Offset permanent drawer below the fixed AppBar so logo is fully visible
          top: { xs: '56px', md: '64px' },
          height: { xs: 'calc(100% - 56px)', md: 'calc(100% - 64px)' },
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
