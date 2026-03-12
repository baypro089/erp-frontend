'use client';

import { Card, CardContent, Typography, Grid, Divider, TextField } from '@mui/material';
import { Badge as BadgeIcon } from '@mui/icons-material';
import type { EmployeeResponse } from '@libs/shared/types/employees.type';

interface IdentificationCardProps {
  employee: EmployeeResponse;
  isEditing: boolean;
  formData: {
    identityNumber: string;
    identityIssuedDate: string;
    identityIssuedPlace: string;
  };
  onFormChange: (field: string, value: any) => void;
}

export default function IdentificationCard({
  employee,
  isEditing,
  formData,
  onFormChange,
}: IdentificationCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
          <BadgeIcon color="primary" />
          Thông tin CMND/CCCD
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Số CMND/CCCD
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                size="small"
                value={formData.identityNumber}
                onChange={(e) => onFormChange('identityNumber', e.target.value)}
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body1">{employee.identityNumber || 'N/A'}</Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Ngày cấp
            </Typography>
            {isEditing ? (
              <TextField
                type="date"
                fullWidth
                size="small"
                value={formData.identityIssuedDate}
                onChange={(e) => onFormChange('identityIssuedDate', e.target.value)}
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body1">
                {employee.identityIssuedDate
                  ? new Date(employee.identityIssuedDate).toLocaleDateString()
                  : 'N/A'}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Nơi cấp
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                size="small"
                value={formData.identityIssuedPlace}
                onChange={(e) => onFormChange('identityIssuedPlace', e.target.value)}
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body1">{employee.identityIssuedPlace || 'N/A'}</Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
