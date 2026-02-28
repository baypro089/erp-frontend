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
        alert('Please select an image file');
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
        alert('Please select a PDF or Word document');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
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
                    {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
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
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Full Name"
                        value={isEditing && formData ? formData.fullName : employee.fullName || 'N/A'}
                        onChange={(e) => isEditing && onFormChange?.('fullName', e.target.value)}
                        disabled={!isEditing}
                        fullWidth
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {isEditing && formData ? (
                        <TextField
                          select
                          label="Gender"
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
                        <TextField
                          label="Gender"
                          value={employee.gender || 'N/A'}
                          disabled
                          fullWidth
                        />
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Date of Birth"
                        type={isEditing ? "date" : "text"}
                        value={
                          isEditing && formData
                            ? formData.dateOfBirth
                            : employee.dateOfBirth
                            ? new Date(employee.dateOfBirth).toLocaleDateString()
                            : 'N/A'
                        }
                        onChange={(e) => isEditing && onFormChange?.('dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        fullWidth
                        InputProps={{
                          startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                        InputLabelProps={isEditing ? { shrink: true } : undefined}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {isEditing && formData ? (
                        <Autocomplete
                          options={COUNTRIES}
                          value={formData.nationality || null}
                          onChange={(_, newValue) => onFormChange?.('nationality', newValue || '')}
                          renderInput={(params) => (
                            <TextField {...params} label="Nationality" placeholder="Select country" />
                          )}
                        />
                      ) : (
                        <TextField
                          label="Nationality"
                          value={employee.nationality || 'N/A'}
                          disabled
                          fullWidth
                        />
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
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Phone"
                        value={isEditing && formData ? formData.phone : employee.phone || 'N/A'}
                        onChange={(e) => isEditing && onFormChange?.('phone', e.target.value)}
                        disabled={!isEditing}
                        fullWidth
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Permanent Address"
                        value={isEditing && formData ? formData.addressPermanent : employee.addressPermanent || 'N/A'}
                        onChange={(e) => isEditing && onFormChange?.('addressPermanent', e.target.value)}
                        disabled={!isEditing}
                        fullWidth
                        multiline
                        rows={2}
                        InputProps={{
                          startAdornment: <Home sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Current Address"
                        value={isEditing && formData ? formData.addressCurrent : employee.addressCurrent || 'N/A'}
                        onChange={(e) => isEditing && onFormChange?.('addressCurrent', e.target.value)}
                        disabled={!isEditing}
                        fullWidth
                        multiline
                        rows={2}
                        InputProps={{
                          startAdornment: <Home sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
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
                    Identification
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Identity Number"
                        value={isEditing && formData ? formData.identityNumber : employee.identityNumber || 'N/A'}
                        onChange={(e) => isEditing && onFormChange?.('identityNumber', e.target.value)}
                        disabled={!isEditing}
                        fullWidth
                        InputProps={{
                          startAdornment: <Badge sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Issued Date"
                        type={isEditing ? "date" : "text"}
                        value={
                          isEditing && formData
                            ? formData.identityIssuedDate
                            : employee.identityIssuedDate
                            ? new Date(employee.identityIssuedDate).toLocaleDateString()
                            : 'N/A'
                        }
                        onChange={(e) => isEditing && onFormChange?.('identityIssuedDate', e.target.value)}
                        disabled={!isEditing}
                        fullWidth
                        InputProps={{
                          startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                        InputLabelProps={isEditing ? { shrink: true } : undefined}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Issued Place"
                        value={isEditing && formData ? formData.identityIssuedPlace : employee.identityIssuedPlace || 'N/A'}
                        onChange={(e) => isEditing && onFormChange?.('identityIssuedPlace', e.target.value)}
                        disabled={!isEditing}
                        fullWidth
                      />
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
                    Work Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Department"
                        value={employee.department?.name || 'N/A'}
                        disabled
                        fullWidth
                        InputProps={{
                          startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Position"
                        value={employee.currentPosition?.name || 'N/A'}
                        disabled
                        fullWidth
                        InputProps={{
                          startAdornment: <Work sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Level"
                        value={employee.level || 'N/A'}
                        disabled
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                          Status
                        </Typography>
                        {employee.status && <StatusChip status={statusMap[employee.status]} showIcon />}
                      </Box>
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
                    System Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Created At"
                        value={employee.createdAt ? new Date(employee.createdAt).toLocaleString() : 'N/A'}
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
                        value={employee.updatedAt ? new Date(employee.updatedAt).toLocaleString() : 'N/A'}
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
            </Grid>

            {/* Documents */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Documents
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* CV Section */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Curriculum Vitae (CV)
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
                                {isUploadingCV ? 'Uploading...' : 'Replace'}
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
                        No CV uploaded yet
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
                        {isUploadingCV ? 'Uploading...' : 'Upload CV'}
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
