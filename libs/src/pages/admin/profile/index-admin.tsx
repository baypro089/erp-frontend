'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import { Box, Alert, Snackbar } from '@mui/material';
import {
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay } from '@libs/src/components/common';
import { ProfileAccountTab } from '@libs/src/components/profile';
import { fetchUserById } from '@libs/src/features/user/user.slice';
import { checkAuth } from '@libs/src/features/auth/auth.slice';

export default function AdminProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const { currentUser, loading: userLoading } = useSelector((state: RootState) => state.user);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    // Get user from auth (JWT token)
    const loadUserProfile = async () => {
      try {
        const result = await dispatch(checkAuth()).unwrap();
        if (result?.id) {
          dispatch(fetchUserById(result.id));
        }
      } catch (error) {
        console.error('Failed to check auth:', error);
      }
    };
    
    loadUserProfile();
  }, [dispatch]);

  if (userLoading || !currentUser) {
    return <LoadingOverlay open={true} message="Loading profile..." />;
  }

  return (
    <Box>
      <PageHeader
        title="Admin Profile"
        subtitle="View and manage your account information"
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Profile', icon: <PersonIcon fontSize="small" /> },
        ]}
        actions={[
          {
            label: 'Back',
            onClick: () => router.back(),
            icon: <ArrowBackIcon />,
            variant: 'outlined',
          },
        ]}
      />

      {/* Account Information Only */}
      <Box>
        <ProfileAccountTab user={currentUser} />
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
