'use client';

import { Box, Card, CardContent, Typography, Chip, Avatar, Divider, TextField } from '@mui/material';
import {
  Person as PersonIcon,
  AccountCircle as AccountCircleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { StatusChip } from '@libs/src/components/common';
import { Status } from '@libs/shared/enums/employee-status.enum';
import { Level } from '@libs/shared/enums/level.enum';
import type { EmployeeResponse } from '@libs/shared/types/employees.type';

interface EmployeeAvatarCardProps {
  employee: EmployeeResponse;
  isEditing: boolean;
  formData: {
    fullName: string;
    level: Level | '';
    status: Status;
  };
  onFormChange: (field: string, value: any) => void;
  statusMap: Record<Status, 'active' | 'inactive' | 'pending' | 'rejected'>;
  getLevelColor: (level?: Level) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export default function EmployeeAvatarCard({
  employee,
  isEditing,
  formData,
  onFormChange,
  statusMap,
  getLevelColor,
}: EmployeeAvatarCardProps) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Avatar
            src={employee.photoUrl}
            sx={{ width: 120, height: 120, bgcolor: 'primary.main' }}
          >
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>

          {isEditing ? (
            <TextField
              fullWidth
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => onFormChange('fullName', e.target.value)}
              size="small"
            />
          ) : (
            <Typography variant="h5" fontWeight={600} textAlign="center">
              {employee.fullName}
            </Typography>
          )}

          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
            <StatusChip
              status={statusMap[formData.status || employee.status || Status.DRAFT]}
              showIcon
            />
            {(formData.level || employee.level) && (
              <Chip
                label={formData.level || employee.level}
                color={getLevelColor(formData.level || employee.level)}
                size="small"
              />
            )}
          </Box>
          <Divider sx={{ width: '100%', my: 1 }} />

          {/* Account Status */}
          <Box display="flex" alignItems="center" gap={1} width="100%">
            <AccountCircleIcon color={employee.userId ? 'success' : 'disabled'} />
            <Typography variant="body2" color="text.secondary">
              Account Status:
            </Typography>
            {employee.userId ? (
              <Chip icon={<CheckCircleIcon />} label="Has Account" color="success" size="small" />
            ) : (
              <Chip icon={<CancelIcon />} label="No Account" color="default" size="small" />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
