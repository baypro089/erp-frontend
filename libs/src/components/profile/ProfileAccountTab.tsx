'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
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

function InfoField({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        sx={{
          minHeight: 44,
          px: 1.5,
          py: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'action.hover',
        }}
      >
        {icon && (
          <Box sx={{ color: 'action.active', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {icon}
          </Box>
        )}
        <Typography
          variant="body2"
          color={!value || value === 'N/A' ? 'text.disabled' : 'text.primary'}
        >
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );
}
import { UserStatus } from '@libs/shared/enums/user-status.enum';
import { StatusChip } from '@libs/src/components/common';
import { PORTAL_PERMISSION_VALUES } from '@libs/shared/constants/portal-permissions.constant';
import ChangePasswordDialog from './ChangePasswordDialog';

interface ProfileAccountTabProps {
  user: UserResponse;
}

export default function ProfileAccountTab({ user }: ProfileAccountTabProps) {
  const [openChangePassword, setOpenChangePassword] = useState(false);

  const statusMap: Record<UserStatus, 'active' | 'inactive' | 'rejected'> = {
    [UserStatus.ACTIVE]: 'active',
    [UserStatus.BANNED]: 'rejected',
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" color="primary">
              Thông tin tài khoản
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Lock />}
              onClick={() => setOpenChangePassword(true)}
            >
              Đổi mật khẩu
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Username */}
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoField icon={<Person />} label="Tên đăng nhập" value={user.username} />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoField icon={<Email />} label="Email" value={user.email} />
            </Grid>

            {/* Role */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Vai trò
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
                  Trạng thái tài khoản
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
                <InfoField icon={<Person />} label="Tên nhân viên" value={user.employee.fullName} />
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* System Information */}
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Thông tin hệ thống
          </Typography>

          <Grid container spacing={3} mt={1}>
            <Grid size={{ xs: 12, md: 4 }}>
              <InfoField
                icon={<CalendarToday />}
                label="Ngày tạo"
                value={user.createdAt ? new Date(user.createdAt).toLocaleString() : null}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <InfoField
                icon={<CalendarToday />}
                label="Cập nhật lần cuối"
                value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : null}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <InfoField
                icon={<CalendarToday />}
                label="Đăng nhập lần cuối"
                value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Chưa đăng nhập'}
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
