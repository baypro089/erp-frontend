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
  EventNote as EventNoteIcon,
  People as PeopleIcon,
  SwapHoriz,
} from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface HRHeaderProps {
  onMenuClick?: () => void;
  title?: string;
  showMenuButton?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  notificationCount?: number;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  pendingLeaveRequests?: number;
  todayAttendance?: number;
}

export default function HRHeader({
  onMenuClick,
  title = 'Quản lý Nhân sự',
  showMenuButton = true,
  user,
  notificationCount = 0,
  onThemeToggle,
  isDarkMode = false,
  pendingLeaveRequests = 0,
  todayAttendance = 0,
}: HRHeaderProps) {
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
    router.push('/auth/login');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    router.push('/personal-page/profile');
  };

  const handleSettings = () => {
    handleCloseUserMenu();
    router.push('/hr/settings');
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
        background: `linear-gradient(135deg, #0D47A1 0%, #1976D2 50%, #0288D1 100%)`,
        color: 'white',
        borderBottom: `4px solid #00BCD4`,
        boxShadow: '0 4px 20px rgba(13, 71, 161, 0.3)',
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

        {/* Title with HR Icon */}
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
            <PeopleIcon sx={{ fontSize: 26, color: '#00BCD4' }} />
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
              Hệ thống Quản lý Nhân sự
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
            <SearchIcon color="action" />
          </Box>
          <InputBase
            placeholder="Tìm nhân viên, đơn nghỉ..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{
              color: 'white',
              '& .MuiInputBase-input': {
                padding: theme.spacing(1, 1, 1, 0),
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                transition: theme.transitions.create('width'),
                width: { xs: '100%', sm: '20ch', md: '35ch' },
                '&::placeholder': {
                  color: alpha(theme.palette.common.white, 0.7),
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Quick Stats - Enhanced HR Metrics */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mr: 2 }}>
          <Chip
            icon={<EventNoteIcon sx={{ color: '#FF6B35 !important' }} />}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 0.5 }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.6)' }}>
                  Đơn chờ duyệt
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#D32F2F' }}>
                  {pendingLeaveRequests}
                </Typography>
              </Box>
            }
            sx={{
              height: 'auto',
              py: 1,
              px: 1.5,
              backgroundColor: alpha(theme.palette.common.white, 0.95),
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.2s',
            }}
            onClick={() => router.push('/hr/leave-approvals')}
          />
          <Chip
            icon={<PeopleIcon sx={{ color: '#00897B !important' }} />}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 0.5 }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.6)' }}>
                  Đang làm việc
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#00695C' }}>
                  {todayAttendance}
                </Typography>
              </Box>
            }
            sx={{
              height: 'auto',
              py: 1,
              px: 1.5,
              backgroundColor: alpha(theme.palette.common.white, 0.95),
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          />
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          {onThemeToggle && (
            <Tooltip title="Đổi chủ đề">
              <IconButton onClick={onThemeToggle} color="inherit">
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          )}

          {/* Notifications */}
          <Tooltip title="Thông báo">
            <IconButton
              onClick={handleOpenNotifications}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
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
                src={user?.avatar || ''}
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
              minWidth: 240,
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
              {user.role && (
                <Chip
                  label={user.role}
                  size="small"
                  color="primary"
                  sx={{ mt: 1 }}
                />
              )}
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
              minWidth: 360,
              maxWidth: 400,
              mt: 1.5,
              maxHeight: 480,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
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
          ) : ([
            <MenuItem onClick={handleCloseNotifications} key="leave">
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Đơn xin nghỉ mới
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Nguyễn Văn A đã gửi đơn xin nghỉ
                </Typography>
              </Box>
            </MenuItem>,
            <Divider key="divider" />,
            <MenuItem onClick={handleCloseNotifications} key="onboard">
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Nhân viên mới
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Hoàn tất onboarding cho Trần Thị B
                </Typography>
              </Box>
            </MenuItem>
          ])}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
