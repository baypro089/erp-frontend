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
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
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
    id: 'departments',
    label: 'Departments',
    icon: <AccountTreeIcon />,
    path: '/admin/departments',
  },
  {
    id: 'positions',
    label: 'Positions',
    icon: <BusinessCenterIcon />,
    path: '/admin/positions',
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: <SecurityIcon />,
    path: '/admin/roles',
  },
  {
    id: 'users',
    label: 'Users',
    icon: <AccountCircleIcon />,
    path: '/admin/users',
  },
  {
    id: 'holidays',
    label: 'Holidays',
    icon: <EventIcon />,
    path: '/admin/holidays',
  },
  {
    id: 'leaves',
    label: 'My Leaves',
    icon: <EventNoteIcon />,
    path: '/admin/leaves',
  },
  {
    id: 'settings',
    label: 'Cấu hình Lương',
    icon: <SettingsIcon />,
    path: '/admin/settings',
  },
  {
    id: 'reports',
    label: 'Reports',
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
            backgroundColor: active
              ? theme.palette.primary.main + '20'
              : 'transparent',
            borderLeft: active
              ? `3px solid ${theme.palette.primary.main}`
              : '3px solid transparent',
            '&:hover': {
              backgroundColor: active
                ? theme.palette.primary.main + '30'
                : theme.palette.action.hover,
            },
            transition: 'all 0.2s',
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 0 : 40,
              color: active ? theme.palette.primary.main : 'inherit',
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
                  fontWeight: active ? 600 : 400,
                  color: active ? theme.palette.primary.main : 'inherit',
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
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: collapsed ? 1 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ERP System
          </Typography>
        )}
        {collapsible && !isMobile && (
          <IconButton
            onClick={handleToggleCollapse}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer */}
      {!collapsed && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              © 2026 ERP System
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
