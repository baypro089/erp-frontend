'use client';

import { Card, CardContent, Typography, Grid, Divider } from '@mui/material';
import { DateRange as DateRangeIcon } from '@mui/icons-material';
import type { EmployeeResponse } from '@libs/shared/types/employees.type';

interface SystemInformationCardProps {
  employee: EmployeeResponse;
}

export default function SystemInformationCard({ employee }: SystemInformationCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
          <DateRangeIcon color="primary" />
          System Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">
              {new Date(employee.createdAt).toLocaleString()}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body1">
              {new Date(employee.updatedAt).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
