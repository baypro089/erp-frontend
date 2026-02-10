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
}

export default function AdminHeader({
  onMenuClick,
  title = 'Dashboard',
  showMenuButton = true,
  user,
  notificationCount = 0,
  onThemeToggle,
  isDarkMode = false,
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
    router.push('/auth/login');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    // Navigate to profile page
    router.push('/admin/profile');
  };

  const handleSettings = () => {
    handleCloseUserMenu();
    // Navigate to settings page
    router.push('/admin/settings');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Menu Button */}
        {showMenuButton && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Title */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            display: { xs: 'none', sm: 'block' },
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>

        {/* Search Bar */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
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
            <SearchIcon color="action" />
          </Box>
          <InputBase
            placeholder="Search…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{
              color: 'inherit',
              '& .MuiInputBase-input': {
                padding: theme.spacing(1, 1, 1, 0),
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                transition: theme.transitions.create('width'),
                width: { xs: '100%', sm: '20ch', md: '30ch' },
              },
            }}
          />
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          {onThemeToggle && (
            <Tooltip title="Toggle theme">
              <IconButton onClick={onThemeToggle} color="inherit">
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          )}

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleOpenNotifications}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="Account settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
              <Avatar
                alt={user?.name || 'User'}
                src={user?.avatar}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: theme.palette.primary.main,
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
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>
              <Typography color="error">Logout</Typography>
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
              Notifications
            </Typography>
          </Box>
          <Divider />
          {notificationCount === 0 ? (
            <MenuItem>
              <Typography variant="body2" color="text.secondary">
                No new notifications
              </Typography>
            </MenuItem>
          ) : (
            // Add notification items here
            <MenuItem onClick={handleCloseNotifications}>
              <Typography variant="body2">Sample notification</Typography>
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
