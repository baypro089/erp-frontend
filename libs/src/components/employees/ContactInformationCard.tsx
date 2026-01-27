'use client';

import { Card, CardContent, Typography, Grid, Divider, TextField } from '@mui/material';
import { Phone as PhoneIcon } from '@mui/icons-material';
import type { EmployeeResponse } from '@libs/shared/types/employees.type';

interface ContactInformationCardProps {
  employee: EmployeeResponse;
  isEditing: boolean;
  formData: {
    phone: string;
    addressPermanent: string;
    addressCurrent: string;
  };
  onFormChange: (field: string, value: any) => void;
}

export default function ContactInformationCard({
  employee,
  isEditing,
  formData,
  onFormChange,
}: ContactInformationCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
          <PhoneIcon color="primary" />
          Contact Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Phone Number
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                size="small"
                value={formData.phone}
                onChange={(e) => onFormChange('phone', e.target.value)}
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body1">{employee.phone || 'N/A'}</Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Permanent Address
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                value={formData.addressPermanent}
                onChange={(e) => onFormChange('addressPermanent', e.target.value)}
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body1">{employee.addressPermanent || 'N/A'}</Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Current Address
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                value={formData.addressCurrent}
                onChange={(e) => onFormChange('addressCurrent', e.target.value)}
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body1">{employee.addressCurrent || 'N/A'}</Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
