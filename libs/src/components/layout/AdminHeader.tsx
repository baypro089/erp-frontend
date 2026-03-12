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
  InputBase,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  Search as SearchIcon,
  Brightness4,
  Brightness7,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon,
  SwapHoriz,
} from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  onMenuClick?: () => void;
  title?: string;
  showMenuButton?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  notificationCount?: number;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  totalUsers?: number;
  activeUsers?: number;
  systemStatus?: 'healthy' | 'warning' | 'error';
}

export default function AdminHeader({
  onMenuClick,
  title = 'Bảng điều khiển',
  showMenuButton = true,
  user,
  notificationCount = 0,
  onThemeToggle,
  isDarkMode = false,
  totalUsers = 0,
  activeUsers = 0,
  systemStatus = 'healthy',
}: AdminHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElNotifications, setAnchorElNotifications] =
    useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState('');

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

  const handleLogout = () => {
    handleCloseUserMenu();
    // Add logout logic here
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    // Navigate to profile page
    router.push('/personal-page/profile');
  };

  const handleSettings = () => {
    handleCloseUserMenu();
    // Navigate to settings page
    router.push('/admin/settings');
  };

  const handleSwitchSite = () => {
    handleCloseUserMenu();
    router.push('/portal-selection');
  };

  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'healthy':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.success.main;
    }
  };

  const getSystemStatusLabel = () => {
    switch (systemStatus) {
      case 'healthy':
        return 'Hoạt động tốt';
      case 'warning':
        return 'Cảnh báo';
      case 'error':
        return 'Lỗi hệ thống';
      default:
        return 'Hoạt động tốt';
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        background: `linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)`,
        color: 'white',
        borderBottom: `4px solid #ff6b6b`,
        boxShadow: '0 4px 20px rgba(106, 17, 203, 0.4)',
      }}
    >
      <Toolbar sx={{ gap: 2, px: { xs: 1, sm: 3 } }}>
        {/* Menu Button */}
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

        {/* Title with Admin Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: 2,
              background: alpha(theme.palette.common.white, 0.2),
              backdropFilter: 'blur(10px)',
            }}
          >
            <AdminIcon sx={{ fontSize: 26, color: '#ff6b6b' }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                letterSpacing: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: { xs: 'none', md: 'block' },
                color: alpha(theme.palette.common.white, 0.85),
                fontSize: '0.7rem',
              }}
            >
              Bảng điều khiển hệ thống
            </Typography>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.25),
            },
            marginLeft: { xs: 0, sm: 3 },
            width: { xs: '100%', sm: 'auto' },
            flex: { xs: 1, sm: 'initial' },
          }}
        >
          <Box
            sx={{
              padding: theme.spacing(0, 2),
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon sx={{ color: 'white' }} />
          </Box>
          <InputBase
            placeholder="Tìm kiếm..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{
              color: 'white',
              '& .MuiInputBase-input': {
                padding: theme.spacing(1, 1, 1, 0),
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                transition: theme.transitions.create('width'),
                width: { xs: '100%', sm: '15ch', md: '25ch' },
                '&::placeholder': {
                  color: alpha(theme.palette.common.white, 0.7),
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Center - Admin Metrics (Hidden on mobile) */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            gap: 2,
            alignItems: 'center',
            ml: 'auto',
            mr: 2,
          }}
        >
          {/* Total Users */}
          <Chip
            icon={<PeopleIcon sx={{ color: theme.palette.info.main + ' !important' }} />}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9 }}>
                  Tổng người dùng
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {totalUsers}
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          />

          {/* Active Users */}
          <Chip
            icon={<CheckCircleIcon sx={{ color: theme.palette.success.main + ' !important' }} />}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9 }}>
                  Đang hoạt động
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {activeUsers}
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          />

          {/* System Status */}
          <Chip
            icon={<ShieldIcon sx={{ color: getSystemStatusColor() + ' !important' }} />}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9 }}>
                  Hệ thống
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {getSystemStatusLabel()}
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          />
        </Box>

        {/* Spacer for mobile */}
        <Box sx={{ flexGrow: 1, display: { lg: 'none' } }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          {onThemeToggle && (
            <Tooltip title="Chuyển đổi giao diện">
              <IconButton
                onClick={onThemeToggle}
                sx={{
                  color: 'white',
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                  },
                }}
              >
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          )}

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
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="Tài khoản">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
              <Avatar
                alt={user?.name || 'User'}
                src={user?.avatar}
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: '#ff6b6b',
                  border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  fontWeight: 700,
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
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
              minWidth: 220,
              mt: 1.5,
            },
          }}
        >
          {user && (
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          )}
          <Divider />
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Hồ sơ cá nhân</ListItemText>
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
              <Typography color="error">Đăng xuất</Typography>
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
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Thông báo
            </Typography>
          </Box>
          <Divider />
          {notificationCount === 0 ? (
            <MenuItem>
              <Typography variant="body2" color="text.secondary">
                Không có thông báo mới
              </Typography>
            </MenuItem>
          ) : (
            // Add notification items here
            <MenuItem onClick={handleCloseNotifications}>
              <Typography variant="body2">Thông báo mẫu</Typography>
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
