'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import { Box, Tabs, Tab, Alert, Snackbar } from '@mui/material';
import {
  Person as PersonIcon,
  Badge as BadgeIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay } from '@libs/src/components/common';
import { ProfileAccountTab, ProfileEmployeeTab } from '@libs/src/components/profile';
import { checkAuth } from '@libs/src/features/auth/auth.slice';
import { fetchUserById } from '@libs/src/features/user/user.slice';
import { updateEmployee } from '@libs/src/features/employee/employee.slice';
import { fetchDepartments } from '@libs/src/features/department/department.slice';
import { fetchPositions } from '@libs/src/features/position/position.slice';
import { Status } from '@libs/shared/enums/employee-status.enum';
import { Level } from '@libs/shared/enums/level.enum';
import { Gender } from '@libs/shared/enums/gender.enum';

interface EmployeeFormData {
  fullName: string;
  gender: Gender | '';
  dateOfBirth: string;
  nationality: string;
  phone: string;
  addressPermanent: string;
  addressCurrent: string;
  identityNumber: string;
  identityIssuedDate: string;
  identityIssuedPlace: string;
  departmentId: string;
  currentPositionId: string;
  level: Level | '';
  status: Status;
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const { currentUser, loading: userLoading } = useSelector((state: RootState) => state.user);
  const { operationLoading: employeeLoading } = useSelector((state: RootState) => state.employee);
  const { departments } = useSelector((state: RootState) => state.department);
  const { positions } = useSelector((state: RootState) => state.position);

  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    phone: '',
    addressPermanent: '',
    addressCurrent: '',
    identityNumber: '',
    identityIssuedDate: '',
    identityIssuedPlace: '',
    departmentId: '',
    currentPositionId: '',
    level: '',
    status: Status.DRAFT,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Check if user has admin access
  const hasAdminAccess = currentUser?.role?.AdminSiteAccess === true;

  useEffect(() => {
    // First, check auth to get user ID
    const loadUserProfile = async () => {
      const result = await dispatch(checkAuth()).unwrap();
      if (result?.id) {
        // Then fetch full user data
        dispatch(fetchUserById(result.id));
      }
    };
    
    loadUserProfile();
    dispatch(fetchDepartments({}));
    dispatch(fetchPositions({}));
  }, [dispatch]);

  useEffect(() => {
    if (currentUser?.employee) {
      const employee = currentUser.employee;
      setFormData({
        fullName: employee.fullName || '',
        gender: employee.gender || '',
        dateOfBirth: employee.dateOfBirth
          ? new Date(employee.dateOfBirth).toISOString().split('T')[0]
          : '',
        nationality: employee.nationality || '',
        phone: employee.phone || '',
        addressPermanent: employee.addressPermanent || '',
        addressCurrent: employee.addressCurrent || '',
        identityNumber: employee.identityNumber || '',
        identityIssuedDate: employee.identityIssuedDate
          ? new Date(employee.identityIssuedDate).toISOString().split('T')[0]
          : '',
        identityIssuedPlace: employee.identityIssuedPlace || '',
        departmentId: employee.department?.id || '',
        currentPositionId: employee.currentPosition?.id || '',
        level: employee.level || '',
        status: employee.status || Status.DRAFT,
      });
    }
  }, [currentUser]);

  if (userLoading || !currentUser) {
    return <LoadingOverlay open={true} message="Loading profile..." />;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (currentUser?.employee) {
      const employee = currentUser.employee;
      setFormData({
        fullName: employee.fullName || '',
        gender: employee.gender || '',
        dateOfBirth: employee.dateOfBirth
          ? new Date(employee.dateOfBirth).toISOString().split('T')[0]
          : '',
        nationality: employee.nationality || '',
        phone: employee.phone || '',
        addressPermanent: employee.addressPermanent || '',
        addressCurrent: employee.addressCurrent || '',
        identityNumber: employee.identityNumber || '',
        identityIssuedDate: employee.identityIssuedDate
          ? new Date(employee.identityIssuedDate).toISOString().split('T')[0]
          : '',
        identityIssuedPlace: employee.identityIssuedPlace || '',
        departmentId: employee.department?.id || '',
        currentPositionId: employee.currentPosition?.id || '',
        level: employee.level || '',
        status: employee.status || Status.DRAFT,
      });
    }
  };

  const handleSave = async () => {
    if (!currentUser?.employee?.id) return;

    try {
      await dispatch(
        updateEmployee({
          id: currentUser.employee.id,
          data: {
            ...formData,
            gender: formData.gender || undefined,
            level: formData.level || undefined,
            dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
            identityIssuedDate: formData.identityIssuedDate
              ? new Date(formData.identityIssuedDate)
              : undefined,
          },
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: 'Employee information updated successfully',
        severity: 'success',
      });
      setIsEditing(false);
      // Reload user data to get updated employee info
      if (authUser?.id) {
        dispatch(fetchUserById(authUser.id));
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err || 'Failed to update employee information',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <PageHeader
        title="My Profile"
        subtitle="View and manage your profile information"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Profile', icon: <PersonIcon fontSize="small" /> },
        ]}
        actions={
          isEditing && activeTab === 1 && currentUser?.employee
            ? [
                {
                  label: 'Cancel',
                  onClick: handleCancel,
                  icon: <CancelIcon />,
                  variant: 'outlined',
                  disabled: employeeLoading,
                },
                {
                  label: 'Save',
                  onClick: handleSave,
                  icon: <SaveIcon />,
                  variant: 'contained',
                  disabled: employeeLoading,
                },
              ]
            : [
                {
                  label: 'Back',
                  onClick: () => router.back(),
                  icon: <ArrowBackIcon />,
                  variant: 'outlined',
                },
                ...(activeTab === 1 && currentUser?.employee
                  ? [
                      {
                        label: 'Edit',
                        onClick: handleEdit,
                        icon: <EditIcon />,
                        variant: 'contained' as const,
                      },
                    ]
                  : []),
              ]
        }
      />

      {/* Tabs - Only show if not admin access */}
      {!hasAdminAccess && currentUser.employee && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<PersonIcon />} label="Account Information" iconPosition="start" />
            <Tab icon={<BadgeIcon />} label="Employee Information" iconPosition="start" />
          </Tabs>
        </Box>
      )}

      {/* Tab Content */}
      <Box>
        {hasAdminAccess || activeTab === 0 ? (
          <ProfileAccountTab user={currentUser} />
        ) : currentUser.employee ? (
          <ProfileEmployeeTab
            employee={currentUser.employee}
            isEditing={isEditing}
            formData={formData}
            onFormChange={handleFormChange}
            departments={departments}
            positions={positions}
          />
        ) : (
          <Alert severity="info">
            Employee information not available
          </Alert>
        )}
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
