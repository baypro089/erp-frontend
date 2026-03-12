'use client';

import { Card, CardContent, Typography, Grid, Divider, TextField, MenuItem, Autocomplete } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { Gender } from '@libs/shared/enums/gender.enum';
import { COUNTRIES } from '@libs/shared/constants/countries.constant';
import type { EmployeeResponse } from '@libs/shared/types/employees.type';

interface BasicInformationCardProps {
  employee: EmployeeResponse;
  isEditing: boolean;
  formData: {
    gender: Gender | '';
    dateOfBirth: string;
    nationality: string;
  };
  onFormChange: (field: string, value: any) => void;
}

export default function BasicInformationCard({
  employee,
  isEditing,
  formData,
  onFormChange,
}: BasicInformationCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
          <PersonIcon color="primary" />
          Thông tin cơ bản
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Mã nhân viên
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {employee.employeeCode}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Giới tính
            </Typography>
            {isEditing ? (
              <TextField
                select
                fullWidth
                size="small"
                value={formData.gender}
                onChange={(e) => onFormChange('gender', e.target.value as Gender | '')}
                sx={{ mt: 0.5 }}
              >
                <MenuItem value="">N/A</MenuItem>
                {Object.values(Gender).map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Typography variant="body1">{employee.gender || 'N/A'}</Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Ngày sinh
            </Typography>
            {isEditing ? (
              <TextField
                type="date"
                fullWidth
                size="small"
                value={formData.dateOfBirth}
                onChange={(e) => onFormChange('dateOfBirth', e.target.value)}
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body1">
                {employee.dateOfBirth
                  ? new Date(employee.dateOfBirth).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Quốc tịch
            </Typography>
            {isEditing ? (
              <Autocomplete
                options={COUNTRIES}
                value={formData.nationality || null}
                onChange={(_, newValue) => onFormChange('nationality', newValue || '')}
                renderInput={(params) => (
                  <TextField {...params} size="small" placeholder="Chọn quốc gia" />
                )}
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body1">{employee.nationality || 'N/A'}</Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
