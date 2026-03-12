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
  Toolbar,
  useTheme,
  useMediaQuery,
  alpha,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  BusinessCenter as BusinessCenterIcon,
  AccountTree as AccountTreeIcon,
  Security as SecurityIcon,
  AccountCircle as AccountCircleIcon,
  Assessment as AssessmentIcon,
  EventNote as EventNoteIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
  AttachMoney as AttachMoneyIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  InventoryOutlined as ProductIcon,
  CategoryOutlined as CategoryIcon,
  BrandingWatermarkOutlined as BrandIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

interface AdminSidebarProps {
  open: boolean;
  onClose?: () => void;
  width?: number;
  collapsible?: boolean;
}

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 64;

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    icon: <DashboardIcon />,
    path: '/admin/dashboard',
  },
  {
    id: 'departments',
    label: 'Phòng ban',
    icon: <AccountTreeIcon />,
    path: '/admin/departments',
  },
  {
    id: 'positions',
    label: 'Chức vụ',
    icon: <BusinessCenterIcon />,
    path: '/admin/positions',
  },
  {
    id: 'roles',
    label: 'Vai trò',
    icon: <SecurityIcon />,
    path: '/admin/roles',
  },
  {
    id: 'users',
    label: 'Người dùng',
    icon: <AccountCircleIcon />,
    path: '/admin/users',
  },
  {
    id: 'holidays',
    label: 'Ngày nghỉ lễ',
    icon: <EventIcon />,
    path: '/admin/holidays',
  },
  {
    id: 'categories',
    label: 'Danh mục',
    icon: <CategoryIcon />,
    path: '/admin/categories',
  },
  {
    id: 'brands',
    label: 'Thương hiệu',
    icon: <BrandIcon />,
    path: '/admin/brands',
  },
  {
    id: 'products',
    label: 'Sản phẩm',
    icon: <ProductIcon />,
    path: '/admin/products',
  },
  {
    id: 'settings',
    label: 'Cấu hình Lương',
    icon: <SettingsIcon />,
    path: '/admin/settings',
  },
  {
    id: 'reports',
    label: 'Báo cáo',
    icon: <AssessmentIcon />,
    path: '/admin/reports',
  }
];

export default function AdminSidebar({
  open,
  onClose,
  width = DRAWER_WIDTH,
  collapsible = true,
}: AdminSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : width;

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

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
            background: active
              ? `linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)`
              : 'transparent',
            color: active ? 'white' : 'inherit',
            borderLeft: active ? `4px solid #ff6b6b` : '4px solid transparent',
            '&:hover': {
              background: active
                ? `linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)`
                : alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(4px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 0 : 40,
              color: active ? 'white' : 'inherit',
              justifyContent: 'center',
            }}
          >
            {item.icon}
          </ListItemIcon>
          {!collapsed && (
            <>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'white' : 'inherit',
                }}
              />
              {hasChildren && (expanded ? <ExpandLess /> : <ExpandMore />)}
            </>
          )}
        </ListItemButton>
        {hasChildren && !collapsed && (
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
        background: `linear-gradient(180deg, ${alpha('#6a11cb', 0.03)} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      {/* Offset for fixed AppBar */}
      <Toolbar />

      {/* Logo Section */}
      <Box
        sx={{
          p: collapsed ? 1.5 : 2.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: collapsed ? 0 : 1,
          background: `linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)`,
          borderBottom: `3px solid #ff6b6b`,
          minHeight: collapsed ? 64 : 'auto',
        }}
      >
        {!collapsed ? (
          <>
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
              <AdminIcon sx={{ fontSize: 36, color: '#ff6b6b' }} />
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
              ADMIN PANEL
            </Typography>
            <Chip
              label="Control System"
              size="small"
              sx={{
                backgroundColor: '#ff6b6b',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          </>
        ) : (
          <AdminIcon sx={{ fontSize: 32, color: '#ff6b6b' }} />
        )}
        {collapsible && !isMobile && (
          <IconButton
            onClick={handleToggleCollapse}
            size="small"
            sx={{
              color: 'white',
              mt: collapsed ? 0 : 1,
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
              },
            }}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', pt: 2 }}>
        <List sx={{ px: 0 }}>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer */}
      {!collapsed && (
        <>
          <Divider />
          <Box
            sx={{
              p: 2,
              background: alpha('#6a11cb', 0.05),
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              © 2026 ERP System
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Admin Module
            </Typography>
          </Box>
        </>
      )}
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
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
