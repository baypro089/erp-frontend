'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  Security,
  CalendarToday,
  Lock,
} from '@mui/icons-material';
import type { UserResponse } from '@libs/shared/types/users.type';
import { UserStatus } from '@libs/shared/enums/user-status.enum';
import { StatusChip } from '@libs/src/components/common';
import ChangePasswordDialog from './ChangePasswordDialog';

interface ProfileAccountTabProps {
  user: UserResponse;
}

export default function ProfileAccountTab({ user }: ProfileAccountTabProps) {
  const [openChangePassword, setOpenChangePassword] = useState(false);

  const statusMap: Record<UserStatus, 'active' | 'inactive' | 'rejected'> = {
    [UserStatus.ACTIVE]: 'active',
    [UserStatus.INACTIVE]: 'inactive',
    [UserStatus.BANNED]: 'rejected',
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" color="primary">
              Account Information
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Lock />}
              onClick={() => setOpenChangePassword(true)}
            >
              Change Password
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Username */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Username"
                value={user.username}
                disabled
                fullWidth
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Email"
                value={user.email || 'N/A'}
                disabled
                fullWidth
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            {/* Role */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Role
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Security color="action" />
                  <Chip 
                    label={user.role?.role_name || 'N/A'} 
                    color="primary" 
                    size="small"
                  />
                </Box>
              </Box>
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Account Status
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Badge color="action" />
                  {user.status && <StatusChip status={statusMap[user.status]} showIcon />}
                </Box>
              </Box>
            </Grid>

            {/* Employee Name */}
            {user.employee && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Employee Name"
                  value={user.employee.fullName}
                  disabled
                  fullWidth
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
            )}

            {/* Admin Access */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Admin Site Access
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Security color="action" />
                  <StatusChip 
                    status={user.role?.AdminSiteAccess ? 'active' : 'inactive'} 
                    showIcon 
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* System Information */}
          <Typography variant="subtitle2" color="primary" gutterBottom>
            System Information
          </Typography>

          <Grid container spacing={3} mt={1}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Created At"
                value={user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                disabled
                fullWidth
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Updated At"
                value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}
                disabled
                fullWidth
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Last Login"
                value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never logged in'}
                disabled
                fullWidth
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
        userEmail={user.email}
      />
    </Box>
  );
}
