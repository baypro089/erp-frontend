'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Alert,
} from '@mui/material';
import {
  Description as DocumentIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { EmployeeResponse } from '@libs/shared/types/employees.type';
import type { AttachmentResponse } from '@libs/shared/types/attachment.type';

interface DocumentsCardProps {
  employee: EmployeeResponse;
  isEditing: boolean;
  onCVUpload: (file: File) => Promise<void>;
  cvAttachment: AttachmentResponse | null;
}

export default function DocumentsCard({
  employee,
  isEditing,
  onCVUpload,
  cvAttachment,
}: DocumentsCardProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      await onCVUpload(file);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDownload = (attachment: AttachmentResponse) => {
    // Create a download link
    const link = document.createElement('a');
    link.href = attachment.path;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (attachment: AttachmentResponse) => {
    window.open(attachment.path, '_blank');
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" display="flex" alignItems="center" gap={1}>
            <DocumentIcon color="primary" />
            Documents & CV
          </Typography>
          {isEditing && (
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload CV'}
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
              />
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            {cvAttachment ? (
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DocumentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={cvAttachment.originalName}
                    secondary={`${formatFileSize(cvAttachment.size)} • ${new Date(
                      cvAttachment.createdAt || ''
                    ).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="view"
                      onClick={() => handleView(cvAttachment)}
                      sx={{ mr: 1 }}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="download"
                      onClick={() => handleDownload(cvAttachment)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  color: 'text.secondary',
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <DocumentIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                <Typography variant="body2">No CV uploaded yet</Typography>
                {isEditing && (
                  <Typography variant="caption" display="block" mt={1}>
                    Click "Upload CV" to add a document
                  </Typography>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
