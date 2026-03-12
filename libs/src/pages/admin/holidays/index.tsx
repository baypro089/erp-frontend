'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Grid,
  Typography,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  Fade,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Event as EventIcon,
  AutoAwesome as AutoAwesomeIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay, PermissionDeniedDialog, PermissionGuard } from '@libs/src/components/common';
import { usePermissionGuard } from '@libs/src/hooks';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';
import { HolidayFormDialog, SeedHolidaysDialog, HolidayCard } from '@libs/src/components/holidays';
import {
  fetchHolidays,
  createHoliday,
  deleteHoliday,
  seedHolidays,
  clearError,
  setSelectedYear,
} from '@libs/src/features/holiday/holiday.slice';
import type { HolidayResponse, CreateHolidayDto } from '@libs/shared/types/holiday.type';

export default function HolidaysPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.HOLIDAY.VIEW}
      fallbackPath="/admin"
    >
      <HolidaysPageContent />
    </PermissionGuard>
  );
}

function HolidaysPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { guardAction, guardFn, permissionDialogProps } = usePermissionGuard();
  const { holidays, selectedYear, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.holiday
  );

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openSeed, setOpenSeed] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayResponse | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load data when year changes
  useEffect(() => {
    dispatch(fetchHolidays(selectedYear));
  }, [dispatch, selectedYear]);

  // Handle errors
  useEffect(() => {
    if (error || operationError) {
      setSnackbar({
        open: true,
        message: error || operationError || 'An error occurred',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, operationError, dispatch]);

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Group holidays by month
  const holidaysByMonth = holidays.reduce((acc, holiday) => {
    const month = new Date(holiday.date).getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(holiday);
    return acc;
  }, {} as Record<number, HolidayResponse[]>);

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Handlers
  const handleCreateClick = () => {
    setSelectedHoliday(null);
    setOpenForm(true);
  };

  const handleSeedClick = () => {
    setOpenSeed(true);
  };

  const handleFormSubmit = async (data: CreateHolidayDto) => {
    try {
      await dispatch(createHoliday(data)).unwrap();
      setOpenForm(false);
      setSnackbar({
        open: true,
        message: 'Holiday created successfully!',
        severity: 'success',
      });
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleSeedSubmit = async (year: number) => {
    try {
      await dispatch(seedHolidays(year)).unwrap();
      await dispatch(fetchHolidays(year));
      setOpenSeed(false);
      setSnackbar({
        open: true,
        message: `Successfully seeded holidays for ${year}!`,
        severity: 'success',
      });
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await dispatch(deleteHoliday(id)).unwrap();
        setSnackbar({
          open: true,
          message: 'Holiday deleted successfully!',
          severity: 'success',
        });
      } catch (err) {
        // Error handled by useEffect
      }
    }
  };

  const handleYearChange = (year: number) => {
    dispatch(setSelectedYear(year));
  };

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Holiday Management"
        subtitle={`Manage and view holidays for ${selectedYear}`}
        actions={[
          {
            label: 'Auto Seed',
            onClick: guardAction(PERMISSIONS.HOLIDAY.CREATE, handleSeedClick),
            variant: 'outlined',
            icon: <AutoAwesomeIcon />,
          },
          {
            label: 'Add Holiday',
            onClick: guardAction(PERMISSIONS.HOLIDAY.CREATE, handleCreateClick),
            variant: 'contained',
            icon: <AddIcon />,
          },
        ]}
      />

      {/* Stats Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CalendarIcon sx={{ fontSize: 48, opacity: 0.9 }} />
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {holidays.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Holidays
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.9 }} />
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {Object.keys(holidaysByMonth).length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Months with Holidays
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              size="small"
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiSelect-icon': {
                  color: 'white',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
              fullWidth
              label="Select Year"
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Holidays by Month */}
      {loading ? (
        <LoadingOverlay open={loading} />
      ) : holidays.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <EventIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No holidays found for {selectedYear}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by adding holidays manually or use the auto-seed feature
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Chip
              icon={<AutoAwesomeIcon />}
              label="Auto Seed Holidays"
              onClick={guardAction(PERMISSIONS.HOLIDAY.CREATE, handleSeedClick)}
              clickable
              color="primary"
              sx={{ px: 2 }}
            />
            <Chip
              icon={<AddIcon />}
              label="Add Holiday"
              onClick={guardAction(PERMISSIONS.HOLIDAY.CREATE, handleCreateClick)}
              clickable
              color="secondary"
              sx={{ px: 2 }}
            />
          </Box>
        </Paper>
      ) : (
        <Box>
          {monthNames.map((monthName, monthIndex) => {
            const monthHolidays = holidaysByMonth[monthIndex];
            if (!monthHolidays || monthHolidays.length === 0) return null;

            return (
              <Fade in key={monthIndex} timeout={300 + monthIndex * 100}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                      }}
                    >
                      {monthName} {selectedYear}
                    </Typography>
                    <Chip
                      label={`${monthHolidays.length} holiday${monthHolidays.length > 1 ? 's' : ''}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Divider sx={{ flex: 1 }} />
                  </Box>

                  <Grid container spacing={2}>
                    {monthHolidays
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((holiday) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={holiday.id}>
                          <HolidayCard holiday={holiday} onDelete={guardFn(PERMISSIONS.HOLIDAY.DELETE, handleDelete)} />
                        </Grid>
                      ))}
                  </Grid>
                </Box>
              </Fade>
            );
          })}
        </Box>
      )}

      {/* Dialogs */}
      <HolidayFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        selectedHoliday={selectedHoliday}
        loading={operationLoading}
      />

      <SeedHolidaysDialog
        open={openSeed}
        onClose={() => setOpenSeed(false)}
        onSubmit={handleSeedSubmit}
        loading={operationLoading}
      />

      <PermissionDeniedDialog {...permissionDialogProps} />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
