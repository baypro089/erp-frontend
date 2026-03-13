'use client';

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha,
  Chip,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  ShoppingCart,
  LocalShipping,
  Inventory,
  TrendingUp,
  AttachMoney,
  Add,
  SwapHoriz,
} from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CommercialHeaderProps {
  onMenuClick?: () => void;
  title?: string;
  showMenuButton?: boolean;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  notificationCount?: number;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  todaySales?: number;
  pendingOrders?: number;
  lowStockItems?: number;
}

export default function CommercialHeader({
  onMenuClick,
  title = 'Bảng điều khiển Thương mại',
  showMenuButton = true,
  user,
  notificationCount = 0,
  onThemeToggle,
  isDarkMode = false,
  todaySales = 0,
  pendingOrders = 0,
  lowStockItems = 0,
}: CommercialHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    router.push('/personal-page/profile');
  };

  const handleSettings = () => {
    handleCloseUserMenu();
    router.push('/commercial/settings');
  };

  const handleSwitchSite = () => {
    handleCloseUserMenu();
    router.push('/portal-selection');
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        borderBottom: `3px solid ${theme.palette.warning.main}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 3 } }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {showMenuButton && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMenuClick}
              sx={{
                mr: 1,
                display: { md: 'none' },
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Title with Icon */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                background: alpha(theme.palette.common.white, 0.15),
              }}
            >
              <ShoppingCart sx={{ fontSize: 24, color: theme.palette.warning.main }} />
            </Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {title}
            </Typography>
          </Box>
        </Box>

        {/* Center - Quick Metrics (Hidden on mobile) */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          {/* Today's Sales */}
          <Chip
            icon={<AttachMoney sx={{ color: theme.palette.success.main + ' !important' }} />}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9 }}>
                  Doanh thu
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatCurrency(todaySales)}
                </Typography>
              </Box>
            }
            sx={{
              height: 'auto',
              py: 1,
              px: 1.5,
              backgroundColor: alpha(theme.palette.common.white, 0.95),
              '& .MuiChip-label': { px: 1 },
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />

          {/* Pending Orders */}
          <Chip
            icon={<LocalShipping sx={{ color: theme.palette.warning.main + ' !important' }} />}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9 }}>
                  Đơn chờ
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {pendingOrders}
                </Typography>
              </Box>
            }
            sx={{
              height: 'auto',
              py: 1,
              px: 1.5,
              backgroundColor: alpha(theme.palette.common.white, 0.95),
              '& .MuiChip-label': { px: 1 },
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />

          {/* Low Stock */}
          <Chip
            icon={<Inventory sx={{ color: theme.palette.error.main + ' !important' }} />}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9 }}>
                  Hàng sắp hết
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {lowStockItems}
                </Typography>
              </Box>
            }
            sx={{
              height: 'auto',
              py: 1,
              px: 1.5,
              backgroundColor: alpha(theme.palette.common.white, 0.95),
              '& .MuiChip-label': { px: 1 },
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Quick Action Button */}
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              backgroundColor: theme.palette.warning.main,
              color: theme.palette.warning.contrastText,
              fontWeight: 700,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                backgroundColor: theme.palette.warning.dark,
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.2s',
            }}
            onClick={() => router.push('/commercial/orders/new')}
          >
            Đơn mới
          </Button>

          {/* Notifications */}
          <Tooltip title="Thông báo">
            <IconButton
              onClick={handleOpenNotifications}
              sx={{
                color: 'white',
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                },
              }}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="Tài khoản">
            <IconButton
              onClick={handleOpenUserMenu}
              sx={{
                p: 0.5,
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                },
              }}
            >
              <Avatar
                alt={user?.name || 'User'}
                src={user?.avatar || '/default-avatar.png'}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: theme.palette.warning.main,
                  fontWeight: 700,
                  border: '2px solid white',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* User Menu Dropdown */}
        <Menu
          sx={{ mt: '45px' }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
          PaperProps={{
            sx: {
              minWidth: 200,
              mt: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || ''}
            </Typography>
            <Chip
              label={user?.role || 'Commercial'}
              size="small"
              color="primary"
              sx={{ mt: 0.5, fontWeight: 600 }}
            />
          </Box>
          <Divider />
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Hồ sơ</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cài đặt</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSwitchSite}>
            <ListItemIcon>
              <SwapHoriz fontSize="small" />
            </ListItemIcon>
            <ListItemText>Chuyển đổi site</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>
              <Typography color="error" fontWeight={600}>
                Đăng xuất
              </Typography>
            </ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          sx={{ mt: '45px' }}
          id="menu-notifications"
          anchorEl={anchorElNotifications}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorElNotifications)}
          onClose={handleCloseNotifications}
          PaperProps={{
            sx: {
              minWidth: 320,
              maxWidth: 400,
              mt: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Thông báo
            </Typography>
          </Box>
          <Divider />
          {notificationCount > 0 ? [
            <MenuItem key="order-notification">
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Đơn hàng mới
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Có {pendingOrders} đơn hàng đang chờ xử lý
                </Typography>
              </Box>
            </MenuItem>,
            <MenuItem key="stock-notification">
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Cảnh báo tồn kho
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {lowStockItems} sản phẩm sắp hết hàng
                </Typography>
              </Box>
            </MenuItem>
          ] : (
            <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Không có thông báo mới
              </Typography>
            </Box>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
