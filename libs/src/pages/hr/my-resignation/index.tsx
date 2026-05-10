'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Info as InfoIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import {
  PageHeader,
  LoadingOverlay,
} from '@libs/src/components/common';
import {
  ResignationRequestForm,
  ResignationStatusProgress,
} from '@libs/src/components/resignation-requests';
import {
  fetchMyResignationRequests,
  createResignationRequest,
  clearError,
} from '@libs/src/features/resignation-request/resignation-request.slice';
import type {
  CreateResignationRequest,
} from '@libs/shared/types/resignation-request.type';
import { ResignationStatus } from '@libs/shared/enums/resignation-status.enum';
import { fetchCurrentUser } from '@libs/src/features/auth/auth.slice';
import { fetchCurrentUserById } from '@libs/src/features/user/user.slice';
import { fetchEmployeeById } from '@libs/src/features/employee/employee.slice';

export default function EmployeeResignationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    resignationRequests,
    loading,
    error,
    operationLoading,
    operationError
  } = useSelector((state: RootState) => state.resignationRequest);

  // Get current auth user
  const { user, isAuth, authChecked } = useSelector((state: RootState) => state.auth);

  // Get detailed user info
  const { currentUser } = useSelector((state: RootState) => state.user);

  // Get employee info
  const { currentEmployee } = useSelector((state: RootState) => state.employee);

  // Dialog state
  const [openForm, setOpenForm] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load current user and employee data on mount
  useEffect(() => {
    const loadUserData = async () => {
      await dispatch(fetchCurrentUser());
    };
    loadUserData();
  }, [dispatch]);

  // Load detailed user info when auth user is available
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCurrentUserById(user.id));
    }
  }, [dispatch, user?.id]);

  // Load employee info when current user is available
  useEffect(() => {
    if (currentUser?.employee?.id) {
      dispatch(fetchEmployeeById(currentUser.employee.id));
    }
  }, [dispatch, currentUser?.employee?.id]);

  // Load my resignation requests when employee is available
  useEffect(() => {
    if (currentEmployee?.id) {
      dispatch(fetchMyResignationRequests(currentEmployee.id));
    }
  }, [dispatch, currentEmployee?.id]);

  // Handle errors
  useEffect(() => {
    if (error || operationError) {
      setSnackbar({
        open: true,
        message: error || operationError || 'Đã xảy ra lỗi',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, operationError, dispatch]);

  // Get the latest active resignation request (PENDING or APPROVED)
  const activeResignation = resignationRequests.find(
    (r) => r.status === ResignationStatus.PENDING || r.status === ResignationStatus.APPROVED
  );

  // Check if user can create a new resignation request
  const canCreateNew = !activeResignation;

  // Handler
  const handleCreateResignation = async (data: CreateResignationRequest) => {
    try {
      await dispatch(createResignationRequest(data)).unwrap();

      setSnackbar({
        open: true,
        message: 'Gửi đơn xin thôi việc thành công',
        severity: 'success',
      });
      setOpenForm(false);

      // Reload resignation requests
      if (currentEmployee?.id) {
        dispatch(fetchMyResignationRequests(currentEmployee.id));
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err || 'Không thể gửi đơn',
        severity: 'error',
      });
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authChecked && !isAuth) {
      window.location.href = '/auth/login';
    }
  }, [authChecked, isAuth]);

  // Show loading while checking authentication
  if (!authChecked || !currentEmployee) {
    return <LoadingOverlay open={true} />;
  }

  return (
    <Box>
      <LoadingOverlay open={loading} />

      <PageHeader
        title="Đơn xin thôi việc"
        subtitle="Tạo và theo dõi đơn xin nghỉ việc của bạn"
      />

      {/* Show info about active resignation */}
      {activeResignation ? (
        <Box sx={{ mb: 4 }}>
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
            <Typography variant="body2">
              Bạn có một đơn xin thôi việc đang được xử lý. Vui lòng theo dõi tiến trình bên dưới.
            </Typography>
          </Alert>

          {/* Resignation Details Card */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin đơn xin nghỉ việc
            </Typography>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ngày nộp đơn
                    </Typography>
                    <Typography variant="body1">
                      {new Date(activeResignation.summitDate).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ngày mong muốn
                    </Typography>
                    <Typography variant="body1">
                      {new Date(activeResignation.desiredLastDay).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {activeResignation.approvedLastDay && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="success" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Ngày đã duyệt
                      </Typography>
                      <Typography variant="body1" color="success.main" fontWeight={600}>
                        {new Date(activeResignation.approvedLastDay).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <DescriptionIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Lý do
                    </Typography>
                    <Typography variant="body1">
                      {activeResignation.reason}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {activeResignation.handoverNote && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LinkIcon color="action" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Link bàn giao
                      </Typography>
                      <Typography variant="body1">
                        <a
                          href={activeResignation.handoverNote}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {activeResignation.handoverNote}
                        </a>
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Progress Bar */}
          <ResignationStatusProgress resignation={activeResignation} />
        </Box>
      ) : (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Bạn chưa có đơn xin thôi việc nào. Nếu bạn muốn nghỉ việc, vui lòng tạo đơn bằng cách nhấn nút bên dưới.
            </Typography>
          </Alert>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              border: 2,
              borderStyle: 'dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Tạo đơn xin thôi việc
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Bạn có thể tạo đơn xin nghỉ việc tại đây. Vui lòng trao đổi với quản lý trực tiếp trước khi gửi đơn.
            </Typography>
            <Button
              variant="contained"
              color="error"
              startIcon={<AddIcon />}
              onClick={() => setOpenForm(true)}
              size="large"
            >
              Tạo đơn xin thôi việc
            </Button>
          </Paper>

          {/* Show previously rejected/completed resignations */}
          {resignationRequests.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Lịch sử đơn xin nghỉ việc
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {resignationRequests.map((resignation) => (
                  <Card key={resignation.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Ngày nộp: {new Date(resignation.summitDate).toLocaleDateString('vi-VN')}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Lý do: {resignation.reason}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor:
                              resignation.status === ResignationStatus.REJECTED
                                ? 'error.50'
                                : 'success.50',
                            color:
                              resignation.status === ResignationStatus.REJECTED
                                ? 'error.main'
                                : 'success.main',
                          }}
                        >
                          {resignation.status === ResignationStatus.REJECTED ? 'Đã từ chối' : 'Hoàn tất'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Resignation Request Form Dialog */}
      <ResignationRequestForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleCreateResignation}
        loading={operationLoading}
        employeeId={currentEmployee?.id}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
