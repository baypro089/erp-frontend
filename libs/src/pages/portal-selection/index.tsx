'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Paper,
  Avatar,
  Divider,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Warehouse as WarehouseIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { PORTAL_INFO, PORTAL_PERMISSION_VALUES } from '@libs/shared/constants/portal-permissions.constant';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@libs/src/store';
import { fetchRoleByCode } from '@libs/src/features/role/role.slice';

const iconMap: Record<string, React.ReactNode> = {
  AdminPanelSettings: <AdminIcon sx={{ fontSize: 48 }} />,
  People: <PeopleIcon sx={{ fontSize: 48 }} />,
  ShoppingCart: <ShoppingCartIcon sx={{ fontSize: 48 }} />,
  Warehouse: <WarehouseIcon sx={{ fontSize: 48 }} />,
};

export default function PortalSelectionPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [availablePortals, setAvailablePortals] = useState<typeof PORTAL_INFO>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePortals = async () => {
      if (!currentUser) {
        // Redirect to login if not authenticated
        router.push('/auth/login');
        return;
      }

      try {
        let userPermissions: string[] = [];

        // Check if role is a string (role_code) or an object
        if (typeof currentUser.role === 'string') {
          // Fetch full role data
          const roleData = await dispatch(fetchRoleByCode(currentUser.role)).unwrap();
          userPermissions = roleData.permissions?.map((p: any) => p.permission_code) || [];
        } else if (currentUser.role?.permissions) {
          // Role is already an object with permissions
          userPermissions = currentUser.role.permissions.map((p: any) => p.permission_code) || [];
        }

        const userPortalPermissions = userPermissions.filter((p: string) => 
          PORTAL_PERMISSION_VALUES.includes(p as any)
        );

        console.log('Portal Selection - User Permissions:', userPermissions);
        console.log('Portal Selection - Portal Permissions:', userPortalPermissions);

        // If user has no portal access, show error
        if (userPortalPermissions.length === 0) {
          setLoading(false);
          return;
        }

        // If user has only one portal access, redirect directly
        if (userPortalPermissions.length === 1) {
          const portalInfo = PORTAL_INFO[userPortalPermissions[0]];
          if (portalInfo && portalInfo.available) {
            router.push(portalInfo.path);
            return;
          }
        }

        // Filter available portals based on user permissions
        const availablePortalsMap = Object.fromEntries(
          Object.entries(PORTAL_INFO).filter(([permission]) => 
            userPortalPermissions.includes(permission)
          )
        );

        setAvailablePortals(availablePortalsMap);
      } catch (error) {
        console.error('Error loading portal permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePortals();
  }, [currentUser, router, dispatch]);

  const handlePortalSelect = (path: string) => {
    router.push(path);
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Đang tải thông tin...
          </Typography>
        </Paper>
      </Box>
    );
  }

  const portalCount = Object.keys(availablePortals).length;

  if (portalCount === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Không có quyền truy cập
          </Typography>
          <Typography variant="body2">
            Tài khoản của bạn không có quyền truy cập vào bất kỳ portal nào. 
            Vui lòng liên hệ quản trị viên để được hỗ trợ.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Chọn Hệ Thống
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Chào mừng, <strong>{currentUser.username}</strong>!
            </Typography>
            <Divider sx={{ maxWidth: 200, mx: 'auto' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Bạn có quyền truy cập vào {portalCount} hệ thống. Vui lòng chọn hệ thống bạn muốn sử dụng.
            </Typography>
          </Box>

          {/* Portal Cards */}
          <Grid container spacing={3}>
            {Object.entries(availablePortals).map(([permission, portal]) => {
              const isAvailable = portal.available;

              return (
                <Grid size={{ xs: 12, sm: 6, md: portalCount > 2 ? 6 : 12 }} key={permission}>
                  <Card
                    elevation={isAvailable ? 3 : 0}
                    sx={{
                      height: '100%',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      opacity: isAvailable ? 1 : 0.6,
                      '&:hover': isAvailable ? {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                      } : {},
                    }}
                  >
                    <CardActionArea
                      onClick={() => isAvailable && handlePortalSelect(portal.path)}
                      disabled={!isAvailable}
                      sx={{ height: '100%', p: 3 }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            mb: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              background: isAvailable 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                            }}
                          >
                            {iconMap[portal.icon]}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h5" component="h2" fontWeight={700}>
                                {portal.name}
                              </Typography>
                              {!isAvailable && (
                                <Chip 
                                  label="Coming Soon" 
                                  size="small" 
                                  color="warning"
                                  sx={{ fontWeight: 600 }}
                                />
                              )}
                            </Box>
                            <Typography variant="body1" color="text.secondary">
                              {portal.description}
                            </Typography>
                          </Box>
                          {isAvailable && (
                            <ArrowForwardIcon 
                              sx={{ 
                                fontSize: 32,
                                color: 'primary.main',
                                transition: 'transform 0.3s',
                                '.MuiCardActionArea-root:hover &': {
                                  transform: 'translateX(8px)',
                                },
                              }} 
                            />
                          )}
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Nếu bạn cần thêm quyền truy cập vào các hệ thống khác, vui lòng liên hệ với quản trị viên hệ thống.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
