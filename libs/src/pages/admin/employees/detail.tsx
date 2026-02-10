'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import { 
  Box, 
  Grid, 
  Alert, 
  Snackbar, 
  Tabs, 
  Tab, 
  Card, 
  CardContent,
  Button,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay } from '@libs/src/components/common';
import {
  EmployeeAvatarCard,
  BasicInformationCard,
  ContactInformationCard,
  IdentificationCard,
  WorkInformationCard,
  SystemInformationCard,
  JobHistoryTimeline,
  JobHistoryFormDrawer,
} from '@libs/src/components/employees';
import { fetchEmployeeById, updateEmployee } from '@libs/src/features/employee/employee.slice';
import { fetchDepartments } from '@libs/src/features/department/department.slice';
import { fetchPositions } from '@libs/src/features/position/position.slice';
import { 
  fetchJobHistoriesByEmployeeId, 
  createJobHistory 
} from '@libs/src/features/job-history/job-history.slice';
import { Status } from '@libs/shared/enums/employee-status.enum';
import { Level } from '@libs/shared/enums/level.enum';
import { Gender } from '@libs/shared/enums/gender.enum';
import type { CreateJobHistoryDto } from '@libs/shared/types/job-histories.type';

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

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentEmployee, loading, operationLoading } = useSelector(
    (state: RootState) => state.employee
  );
  const { departments } = useSelector((state: RootState) => state.department);
  const { positions } = useSelector((state: RootState) => state.position);
  const { jobHistories, operationLoading: jobHistoryLoading } = useSelector(
    (state: RootState) => state.jobHistory
  );

  const [isEditing, setIsEditing] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const employeeId = params?.id as string;

  useEffect(() => {
    if (employeeId) {
      dispatch(fetchEmployeeById(employeeId));
      dispatch(fetchJobHistoriesByEmployeeId(employeeId));
    }
    dispatch(fetchDepartments({}));
    dispatch(fetchPositions({}));
  }, [dispatch, employeeId]);

  useEffect(() => {
    if (currentEmployee) {
      setFormData({
        fullName: currentEmployee.fullName || '',
        gender: currentEmployee.gender || '',
        dateOfBirth: currentEmployee.dateOfBirth
          ? new Date(currentEmployee.dateOfBirth).toISOString().split('T')[0]
          : '',
        nationality: currentEmployee.nationality || '',
        phone: currentEmployee.phone || '',
        addressPermanent: currentEmployee.addressPermanent || '',
        addressCurrent: currentEmployee.addressCurrent || '',
        identityNumber: currentEmployee.identityNumber || '',
        identityIssuedDate: currentEmployee.identityIssuedDate
          ? new Date(currentEmployee.identityIssuedDate).toISOString().split('T')[0]
          : '',
        identityIssuedPlace: currentEmployee.identityIssuedPlace || '',
        departmentId: currentEmployee.department?.id || '',
        currentPositionId: currentEmployee.currentPosition?.id || '',
        level: currentEmployee.level || '',
        status: currentEmployee.status || Status.DRAFT,
      });
    }
  }, [currentEmployee]);

  if (!currentEmployee && !loading) {
    return (
      <Box>
        <Alert severity="error">Employee not found</Alert>
      </Box>
    );
  }

  const statusMap: Record<Status, 'active' | 'inactive' | 'pending' | 'rejected'> = {
    [Status.ACTIVE]: 'active',
    [Status.INACTIVE]: 'inactive',
    [Status.DRAFT]: 'pending',
    [Status.TERMINATED]: 'rejected',
  };

  const getLevelColor = (level?: Level) => {
    switch (level) {
      case Level.INTERN:
        return 'default';
      case Level.JUNIOR:
        return 'info';
      case Level.MID:
        return 'primary';
      case Level.SENIOR:
        return 'secondary';
      case Level.LEAD:
      case Level.MANAGER:
        return 'warning';
      case Level.DIRECTOR:
      case Level.VP:
      case Level.C_LEVEL:
        return 'error';
      default:
        return 'default';
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (currentEmployee) {
      setFormData({
        fullName: currentEmployee.fullName || '',
        gender: currentEmployee.gender || '',
        dateOfBirth: currentEmployee.dateOfBirth
          ? new Date(currentEmployee.dateOfBirth).toISOString().split('T')[0]
          : '',
        nationality: currentEmployee.nationality || '',
        phone: currentEmployee.phone || '',
        addressPermanent: currentEmployee.addressPermanent || '',
        addressCurrent: currentEmployee.addressCurrent || '',
        identityNumber: currentEmployee.identityNumber || '',
        identityIssuedDate: currentEmployee.identityIssuedDate
          ? new Date(currentEmployee.identityIssuedDate).toISOString().split('T')[0]
          : '',
        identityIssuedPlace: currentEmployee.identityIssuedPlace || '',
        departmentId: currentEmployee.department?.id || '',
        currentPositionId: currentEmployee.currentPosition?.id || '',
        level: currentEmployee.level || '',
        status: currentEmployee.status || Status.DRAFT,
      });
    }
  };

  const handleSave = async () => {
    try {
      await dispatch(
        updateEmployee({
          id: employeeId,
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
        message: 'Employee updated successfully',
        severity: 'success',
      });
      setIsEditing(false);
      dispatch(fetchEmployeeById(employeeId));
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err || 'Failed to update employee',
        severity: 'error',
      });
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateJobHistory = async (data: CreateJobHistoryDto) => {
    try {
      await dispatch(createJobHistory(data)).unwrap();
      setSnackbar({
        open: true,
        message: 'Lịch sử công việc được tạo thành công',
        severity: 'success',
      });
      // Refresh job histories
      dispatch(fetchJobHistoriesByEmployeeId(employeeId));
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err || 'Không thể tạo lịch sử công việc',
        severity: 'error',
      });
      throw err;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Employee Details"
        subtitle="View and manage employee information"
        breadcrumbs={[
          { label: 'Employees', href: '/employees' },
          { label: currentEmployee?.fullName || 'Loading...' },
        ]}
        actions={
          isEditing
            ? [
                {
                  label: 'Cancel',
                  onClick: handleCancel,
                  icon: <CancelIcon />,
                  variant: 'outlined',
                  disabled: operationLoading,
                },
                {
                  label: 'Save',
                  onClick: handleSave,
                  icon: <SaveIcon />,
                  variant: 'contained',
                  disabled: operationLoading,
                },
              ]
            : [
                {
                  label: 'Back',
                  onClick: () => router.back(),
                  icon: <ArrowBackIcon />,
                  variant: 'outlined',
                },
                {
                  label: 'Edit',
                  onClick: handleEdit,
                  icon: <EditIcon />,
                  variant: 'contained',
                },
              ]
        }
      />

      {currentEmployee && (
        <Box>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label="Thông tin nhân viên" />
              <Tab label="Lịch sử công việc" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {currentTab === 0 && (
            <Grid container spacing={3}>
              {/* Main Info Card */}
              <Grid size={{ xs: 12, md: 4 }}>
                <EmployeeAvatarCard
                  employee={currentEmployee}
                  isEditing={isEditing}
                  formData={formData}
                  onFormChange={handleFormChange}
                  statusMap={statusMap}
                  getLevelColor={getLevelColor}
                />
              </Grid>

              {/* Details Grid */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Grid container spacing={3}>
                  {/* Basic Information */}
                  <Grid size={{ xs: 12 }}>
                    <BasicInformationCard
                      employee={currentEmployee}
                      isEditing={isEditing}
                      formData={formData}
                      onFormChange={handleFormChange}
                    />
                  </Grid>

                  {/* Contact Information */}
                  <Grid size={{ xs: 12 }}>
                    <ContactInformationCard
                      employee={currentEmployee}
                      isEditing={isEditing}
                      formData={formData}
                      onFormChange={handleFormChange}
                    />
                  </Grid>

                  {/* Identification */}
                  <Grid size={{ xs: 12 }}>
                    <IdentificationCard
                      employee={currentEmployee}
                      isEditing={isEditing}
                      formData={formData}
                      onFormChange={handleFormChange}
                    />
                  </Grid>

                  {/* Work Information */}
                  <Grid size={{ xs: 12 }}>
                    <WorkInformationCard
                      employee={currentEmployee}
                      isEditing={isEditing}
                      formData={formData}
                      onFormChange={handleFormChange}
                      departments={departments}
                      positions={positions}
                      statusMap={statusMap}
                    />
                  </Grid>

                  {/* System Information */}
                  <Grid size={{ xs: 12 }}>
                    <SystemInformationCard employee={currentEmployee} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}

          {currentTab === 1 && (
            <Card>
              <CardContent>
                <JobHistoryTimeline
                  jobHistories={jobHistories}
                  currentDepartment={currentEmployee.department?.name}
                  currentPosition={currentEmployee.currentPosition?.name}
                />
              </CardContent>
            </Card>
          )}

          {/* Floating Action Button - Only show in Job History tab */}
          {currentTab === 1 && (
            <Fab
              color="primary"
              aria-label="add job history"
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
              }}
              onClick={() => setDrawerOpen(true)}
            >
              <AddIcon />
            </Fab>
          )}

          {/* Job History Form Drawer */}
          <JobHistoryFormDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onSubmit={handleCreateJobHistory}
            employeeId={employeeId}
            departments={departments}
            positions={positions}
            loading={jobHistoryLoading}
          />
        </Box>
      )}

      <LoadingOverlay open={loading} message="Loading employee details..." />

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
