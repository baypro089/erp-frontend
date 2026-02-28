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
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  SwapHoriz,
} from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PersonalPageHeaderProps {
  onMenuClick?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  notificationCount?: number;
}

export default function PersonalPageHeader({
  onMenuClick,
  user = {
    name: 'User',
    email: 'user@example.com',
  },
  notificationCount = 0,
}: PersonalPageHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElNotifications, setAnchorElNotifications] =
    useState<null | HTMLElement>(null);

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
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    router.push('/personal-page/profile');
  };

  const handleSwitchSite = () => {
    handleCloseUserMenu();
    router.push('/portal-selection');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ gap: 2, px: { xs: 1, sm: 3 } }}>
        {/* Menu Button (Mobile) */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{
            mr: 1,
            display: { sm: 'none' },
            backgroundColor: alpha(theme.palette.common.white, 0.1),
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.2),
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              background: alpha(theme.palette.common.white, 0.2),
              backdropFilter: 'blur(10px)',
            }}
          >
            <AccountCircle sx={{ fontSize: 24 }} />
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: 0.5,
            }}
          >
            Trang cá nhân
          </Typography>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
              <Avatar
                alt={user?.name || 'User'}
                src={user?.avatar}
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: theme.palette.secondary.main,
                  border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  fontWeight: 700,
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
            <MenuItem onClick={handleCloseNotifications}>
              <Typography variant="body2">Thông báo mẫu</Typography>
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
