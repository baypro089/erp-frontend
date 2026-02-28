'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Avatar, Divider, TextField, Button, IconButton, Badge } from '@mui/material';
import {
  Person as PersonIcon,
  AccountCircle as AccountCircleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { StatusChip } from '@libs/src/components/common';
import { Status } from '@libs/shared/enums/employee-status.enum';
import { Level } from '@libs/shared/enums/level.enum';
import type { EmployeeResponse } from '@libs/shared/types/employees.type';
import type { AttachmentResponse } from '@libs/shared/types/attachment.type';

interface EmployeeAvatarCardProps {
  employee: EmployeeResponse;
  isEditing: boolean;
  formData: {
    fullName: string;
    level: Level | '';
    status: Status;
  };
  onFormChange: (field: string, value: any) => void;
  onPhotoUpload?: (file: File) => Promise<void>;
  statusMap: Record<Status, 'active' | 'maternity' | 'pending' | 'probation' | 'resigned'>;
  getLevelColor: (level?: Level) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  photoAttachment?: AttachmentResponse | null;
}

export default function EmployeeAvatarCard({
  employee,
  isEditing,
  formData,
  onFormChange,
  onPhotoUpload,
  statusMap,
  getLevelColor,
  photoAttachment,
}: EmployeeAvatarCardProps) {
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Priority: photoAttachment.publicUrl > employee.photoUrl
    if (photoAttachment?.publicUrl) {
      setPhotoPreview(photoAttachment.publicUrl);
    } else if (employee.photoUrl) {
      setPhotoPreview(employee.photoUrl);
    }
  }, [photoAttachment?.publicUrl, employee.photoUrl]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onPhotoUpload) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload
      setUploading(true);
      try {
        await onPhotoUpload(file);
      } catch (error) {
        console.error('Failed to upload photo:', error);
        // Restore original photo on error
        setPhotoPreview(employee.photoUrl || '');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box position="relative">
            <Avatar
              src={photoPreview || employee.photoUrl}
              sx={{ width: 120, height: 120, bgcolor: 'primary.main' }}
            >
              <PersonIcon sx={{ fontSize: 60 }} />
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
                  boxShadow: 2,
                }}
                disabled={uploading}
              >
                <PhotoCameraIcon fontSize="small" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </IconButton>
            )}
          </Box>

          {isEditing && onPhotoUpload && (
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              size="small"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Change Photo'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </Button>
          )}

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
