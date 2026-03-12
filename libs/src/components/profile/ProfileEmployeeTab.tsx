'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Divider,
  Chip,
  Avatar,
  MenuItem,
  Autocomplete,
  Button,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  Badge,
  CalendarToday,
  Work,
  Business,
  CloudUpload,
  CameraAlt,
  InsertDriveFile,
  PictureAsPdf,
  Description,
  Download,
} from '@mui/icons-material';
import type { EmployeeResponse } from '@libs/shared/types/employees.type';
import type { DepartmentResponse } from '@libs/shared/types/departments.type';
import type { PositionResponse } from '@libs/shared/types/positions.type';
import type { AttachmentResponse } from '@libs/shared/types/attachment.type';
import { StatusChip } from '@libs/src/components/common';
import { Status } from '@libs/shared/enums/employee-status.enum';
import { Level } from '@libs/shared/enums/level.enum';
import { Gender } from '@libs/shared/enums/gender.enum';
import { COUNTRIES } from '@libs/shared/constants/countries.constant';

interface ProfileEmployeeTabProps {
  employee: EmployeeResponse;
  isEditing?: boolean;
  formData?: {
    fullName: string;
    gender: Gender | '';
    dateOfBirth: string;
    nationality: string;
    phone: string;
    addressPermanent: string;
    addressCurrent: string;
    identityNumber: string;
    identityIssuedDate: string;
    identityIssuedPlace: string;
    departmentId: string;
    currentPositionId: string;
    level: Level | '';
    status: Status;
  };
  onFormChange?: (field: string, value: any) => void;
  departments?: DepartmentResponse[];
  positions?: PositionResponse[];
  onPhotoUpload?: (file: File) => void;
  onCVUpload?: (file: File) => void;
  cvAttachment?: AttachmentResponse | null;
  photoAttachment?: AttachmentResponse | null;
}

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

export default function ProfileEmployeeTab({
  employee,
  isEditing = false,
  formData,
  onFormChange,
  departments = [],
  positions = [],
  onPhotoUpload,
  onCVUpload,
  cvAttachment,
  photoAttachment,
}: ProfileEmployeeTabProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);

  const statusMap: Record<Status, 'active' | 'inactive' | 'pending' | 'rejected'> = {
    [Status.ACTIVE]: 'active',
    [Status.RESIGNED]: 'inactive',
    [Status.DRAFT]: 'pending',
    [Status.MATERNITY_LEAVE]: 'rejected',
    [Status.PROBATION]: 'pending',
  };

  const getLevelColor = (level?: Level) => {
    switch (level) {
      case Level.INTERN:
        return 'default';
      case Level.JUNIOR:
        return 'info';
      case Level.MID:
        return 'primary';
      case Level.SENIOR:
        return 'secondary';
      case Level.LEAD:
      case Level.MANAGER:
        return 'warning';
      case Level.DIRECTOR:
      case Level.VP:
      case Level.C_LEVEL:
        return 'error';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.includes('pdf')) return <PictureAsPdf />;
    if (mimeType?.includes('word') || mimeType?.includes('document')) return <Description />;
    return <InsertDriveFile />;
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onPhotoUpload) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn tệp ảnh');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload
      setIsUploadingPhoto(true);
      try {
        await onPhotoUpload(file);
      } finally {
        setIsUploadingPhoto(false);
        setPhotoPreview(null);
      }
    }
  };

  const handleCVChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onCVUpload) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Vui lòng chọn tệp PDF hoặc Word');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Kích thước tệp phải nhỏ hơn 10MB');
        return;
      }

      setIsUploadingCV(true);
      try {
        await onCVUpload(file);
      } finally {
        setIsUploadingCV(false);
      }
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Avatar Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={photoPreview || photoAttachment?.publicUrl || employee.photoUrl || undefined}
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                    }}
                  >
                    {employee.fullName?.charAt(0) || 'E'}
                  </Avatar>
                  {isEditing && onPhotoUpload && (
                    <IconButton
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        width: 36,
                        height: 36,
                      }}
                      disabled={isUploadingPhoto}
                    >
                      <CameraAlt fontSize="small" />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="h5" align="center">
                  {employee.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {employee.employeeCode}
                </Typography>
                {employee.status && (
                  <StatusChip status={statusMap[employee.status]} showIcon />
                )}
                {employee.level && (
                  <Chip
                    label={employee.level}
                    color={getLevelColor(employee.level) as any}
                    size="small"
                  />
                )}
                {isEditing && onPhotoUpload && (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    disabled={isUploadingPhoto}
                    fullWidth
                  >
                    {isUploadingPhoto ? 'Đang tải...' : 'Đổi ảnh'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Information Cards */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Thông tin cơ bản
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {isEditing && formData ? (
                        <TextField
                          label="Họ và tên"
                          value={formData.fullName}
                          onChange={(e) => onFormChange?.('fullName', e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      ) : (
                        <InfoField
                          icon={<Person />}
                          label="Họ và tên"
                          value={employee.fullName}
                        />
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {isEditing && formData ? (
                        <TextField
                          select
                          label="Giới tính"
                          value={formData.gender}
                          onChange={(e) => onFormChange?.('gender', e.target.value as Gender | '')}
                          fullWidth
                        >
                          <MenuItem value="">N/A</MenuItem>
                          {Object.values(Gender).map((g) => (
                            <MenuItem key={g} value={g}>
                              {g}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <InfoField label="Giới tính" value={employee.gender} />
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {isEditing && formData ? (
                        <TextField
                          label="Ngày sinh"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => onFormChange?.('dateOfBirth', e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      ) : (
                        <InfoField
                          icon={<CalendarToday />}
                          label="Ngày sinh"
                          value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : null}
                        />
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {isEditing && formData ? (
                        <Autocomplete
                          options={COUNTRIES}
                          value={formData.nationality || null}
                          onChange={(_, newValue) => onFormChange?.('nationality', newValue || '')}
                          renderInput={(params) => (
                            <TextField {...params} label="Quốc tịch" placeholder="Chọn quốc gia" />
                          )}
                        />
                      ) : (
                        <InfoField label="Quốc tịch" value={employee.nationality} />
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Information */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Thông tin liên hệ
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {isEditing && formData ? (
                        <TextField
                          label="Số điện thoại"
                          value={formData.phone}
                          onChange={(e) => onFormChange?.('phone', e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      ) : (
                        <InfoField icon={<Phone />} label="Số điện thoại" value={employee.phone} />
                      )}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      {isEditing && formData ? (
                        <TextField
                          label="Địa chỉ thường trú"
                          value={formData.addressPermanent}
                          onChange={(e) => onFormChange?.('addressPermanent', e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                          InputProps={{
                            startAdornment: <Home sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      ) : (
                        <InfoField icon={<Home />} label="Địa chỉ thường trú" value={employee.addressPermanent} />
                      )}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      {isEditing && formData ? (
                        <TextField
                          label="Địa chỉ hiện tại"
                          value={formData.addressCurrent}
                          onChange={(e) => onFormChange?.('addressCurrent', e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                          InputProps={{
                            startAdornment: <Home sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      ) : (
                        <InfoField icon={<Home />} label="Địa chỉ hiện tại" value={employee.addressCurrent} />
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Identification */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    CCCD / Chứng minh nhân dân
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {isEditing && formData ? (
                        <TextField
                          label="Số CCCD"
                          value={formData.identityNumber}
                          onChange={(e) => onFormChange?.('identityNumber', e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: <Badge sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      ) : (
                        <InfoField icon={<Badge />} label="Số CCCD" value={employee.identityNumber} />
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {isEditing && formData ? (
                        <TextField
                          label="Ngày cấp"
                          type="date"
                          value={formData.identityIssuedDate}
                          onChange={(e) => onFormChange?.('identityIssuedDate', e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      ) : (
                        <InfoField
                          icon={<CalendarToday />}
                          label="Ngày cấp"
                          value={employee.identityIssuedDate ? new Date(employee.identityIssuedDate).toLocaleDateString() : null}
                        />
                      )}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      {isEditing && formData ? (
                        <TextField
                          label="Nơi cấp"
                          value={formData.identityIssuedPlace}
                          onChange={(e) => onFormChange?.('identityIssuedPlace', e.target.value)}
                          fullWidth
                        />
                      ) : (
                        <InfoField label="Nơi cấp" value={employee.identityIssuedPlace} />
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Work Information */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Thông tin công việc
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField icon={<Business />} label="Phòng ban" value={employee.department?.name} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField icon={<Work />} label="Vị trí" value={employee.currentPosition?.name} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField label="Cấp bậc" value={employee.level} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                          Trạng thái
                        </Typography>
                        {employee.status && <StatusChip status={statusMap[employee.status]} showIcon />}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoField label="Số người phụ thuộc" value={String(employee.dependentCount ?? 0)} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* System Information */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Thông tin hệ thống
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <InfoField
                        icon={<CalendarToday />}
                        label="Ngày tạo"
                        value={employee.createdAt ? new Date(employee.createdAt).toLocaleString() : null}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <InfoField
                        icon={<CalendarToday />}
                        label="Cập nhật lần cuối"
                        value={employee.updatedAt ? new Date(employee.updatedAt).toLocaleString() : null}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Documents */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Tài liệu
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* CV Section */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Hồ sơ xin việc (CV)
                    </Typography>
                    {cvAttachment ? (
                      <Alert
                        severity="success"
                        sx={{ mb: 2 }}
                        action={
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              component="a"
                              size="small"
                              color="inherit"
                              href={cvAttachment.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download />
                            </IconButton>
                            {isEditing && onCVUpload && (
                              <Button
                                size="small"
                                variant="outlined"
                                component="label"
                                disabled={isUploadingCV}
                              >
                                {isUploadingCV ? 'Đang tải...' : 'Thay thế'}
                                <input
                                  type="file"
                                  hidden
                                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                  onChange={handleCVChange}
                                />
                              </Button>
                            )}
                          </Box>
                        }
                        icon={getFileIcon(cvAttachment.mimeType)}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {cvAttachment.originalName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Chip
                              label={formatFileSize(cvAttachment.size)}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={new Date(cvAttachment.createdAt).toLocaleDateString()}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Alert>
                    ) : (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Chưa có CV nào được tải lên
                      </Alert>
                    )}
                    
                    {isEditing && onCVUpload && !cvAttachment && (
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUpload />}
                        disabled={isUploadingCV}
                        fullWidth
                      >
                        {isUploadingCV ? 'Đang tải...' : 'Tải lên CV'}
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleCVChange}
                        />
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
