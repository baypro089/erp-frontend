'use client';

import { Box, Card, CardContent, Typography, Grid, Divider, TextField, MenuItem } from '@mui/material';
import { Work as WorkIcon } from '@mui/icons-material';
import { StatusChip } from '@libs/src/components/common';
import { Status } from '@libs/shared/enums/employee-status.enum';
import { Level } from '@libs/shared/enums/level.enum';
import type { EmployeeResponse } from '@libs/shared/types/employees.type';
import type { DepartmentResponse } from '@libs/shared/types/departments.type';
import type { PositionResponse } from '@libs/shared/types/positions.type';

interface WorkInformationCardProps {
  employee: EmployeeResponse;
  isEditing: boolean;
  formData: {
    departmentId: string;
    currentPositionId: string;
    level: Level | '';
    status: Status;
    dependentCount: number;
  };
  onFormChange: (field: string, value: any) => void;
  departments: DepartmentResponse[];
  positions: PositionResponse[];
  statusMap: Record<Status, 'active' | 'maternity' | 'pending' | 'probation' | 'resigned'>;
}

export default function WorkInformationCard({
  employee,
  isEditing,
  formData,
  onFormChange,
  departments,
  positions,
  statusMap,
}: WorkInformationCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
          <WorkIcon color="primary" />
          Thông tin công việc
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Phòng ban
            </Typography>
            {isEditing ? (
              <TextField
                select
                fullWidth
                size="small"
                value={formData.departmentId}
                onChange={(e) => onFormChange('departmentId', e.target.value)}
                sx={{ mt: 0.5 }}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Typography variant="body1" fontWeight={500}>
                {employee.department?.name || 'N/A'}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Chức vụ
            </Typography>
            {isEditing ? (
              <TextField
                select
                fullWidth
                size="small"
                value={formData.currentPositionId}
                onChange={(e) => onFormChange('currentPositionId', e.target.value)}
                sx={{ mt: 0.5 }}
              >
                {positions.map((pos) => (
                  <MenuItem key={pos.id} value={pos.id}>
                    {pos.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Typography variant="body1" fontWeight={500}>
                {employee.currentPosition?.name || 'N/A'}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Ngày bắt đầu
            </Typography>
            <Typography variant="body1">
              {new Date(employee.startDate).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Cấp bậc
            </Typography>
            {isEditing ? (
              <TextField
                select
                fullWidth
                size="small"
                value={formData.level}
                onChange={(e) => onFormChange('level', e.target.value as Level | '')}
                sx={{ mt: 0.5 }}
              >
                <MenuItem value="">N/A</MenuItem>
                {Object.values(Level).map((l) => (
                  <MenuItem key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Typography variant="body1">{employee.level || 'N/A'}</Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Trạng thái
            </Typography>
            {isEditing ? (
              <TextField
                select
                fullWidth
                size="small"
                value={formData.status}
                onChange={(e) => onFormChange('status', e.target.value as Status)}
                sx={{ mt: 0.5 }}
              >
                {Object.values(Status).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Box display="flex" alignItems="center" mt={0.5}>
                <StatusChip status={statusMap[employee.status]} showIcon />
              </Box>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Số người phụ thuộc
            </Typography>
            {isEditing ? (
              <TextField
                type="number"
                fullWidth
                size="small"
                value={formData.dependentCount}
                onChange={(e) => onFormChange('dependentCount', Number(e.target.value))}
                inputProps={{ min: 0 }}
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body1" fontWeight={500}>
                {employee.dependentCount ?? 0}
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
