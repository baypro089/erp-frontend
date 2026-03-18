'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  MenuItem,
  Typography,
  Alert,
  Chip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { UploadFile as UploadFileIcon, Close as CloseIcon } from '@mui/icons-material';
import type { CreateLeaveRequestPayload, LeaveRequestCreateDto } from '@libs/shared/types/leave-requests.type';
import { LeaveRequestType } from '@libs/shared/enums/leave-request-status.enum';
import { calculateWorkingDays, resetWorkingDays } from '@libs/src/features/leave-request/leave-request.slice';
import type { AppDispatch, RootState } from '@libs/src/store';
import { useDropzone } from 'react-dropzone';
import { addMonths, format } from 'date-fns';

interface LeaveRequestFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateLeaveRequestPayload) => Promise<void>;
  loading?: boolean;
  employeeId?: string;
  leaveBalance?: number;
}

export default function LeaveRequestFormDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  employeeId,
  leaveBalance = 0,
}: LeaveRequestFormDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { workingDays, calculatingDays } = useSelector((state: RootState) => state.leaveRequest);

  const [formData, setFormData] = useState<{
    startDate: string;
    endDate: string;
    type: LeaveRequestType;
    reason: string;
  }>({
    startDate: '',
    endDate: '',
    type: LeaveRequestType.ANNUAL,
    reason: '',
  });

  const [errors, setErrors] = useState<{
    startDate?: string;
    endDate?: string;
    reason?: string;
    document?: string;
  }>({});

  const [attachmentMode, setAttachmentMode] = useState<'upload' | 'url'>('upload');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentUrlInput, setDocumentUrlInput] = useState('');

  const requiresDocument =
    formData.type === LeaveRequestType.MATERNITY || formData.type === LeaveRequestType.SICK;

  const getMaternityEndDate = (startDate: string): string => {
    if (!startDate) return '';
    return format(addMonths(new Date(startDate), 6), 'yyyy-MM-dd');
  };

  const handleTypeChange = (type: LeaveRequestType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      endDate: type === LeaveRequestType.MATERNITY ? getMaternityEndDate(prev.startDate) : prev.endDate,
    }));
  };

  const handleStartDateChange = (startDate: string) => {
    setFormData((prev) => ({
      ...prev,
      startDate,
      endDate: prev.type === LeaveRequestType.MATERNITY ? getMaternityEndDate(startDate) : prev.endDate,
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    disabled: loading || attachmentMode !== 'upload',
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setDocumentFile(file);
      setErrors((prev) => ({ ...prev, document: undefined }));
    },
  });

  useEffect(() => {
    const fetchWorkingDays = async () => {
      if (!formData.startDate || !formData.endDate) {
        dispatch(resetWorkingDays());
        return;
      }

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (startDate > endDate) {
        dispatch(resetWorkingDays());
        return;
      }

      dispatch(
        calculateWorkingDays({
          startDate: formData.startDate,
          endDate: formData.endDate,
        })
      );
    };

    fetchWorkingDays();
  }, [formData.startDate, formData.endDate, dispatch]);

  useEffect(() => {
    if (open) {
      setFormData({
        startDate: '',
        endDate: '',
        type: LeaveRequestType.ANNUAL,
        reason: '',
      });
      setErrors({});
      setAttachmentMode('upload');
      setDocumentFile(null);
      setDocumentUrlInput('');
      dispatch(resetWorkingDays());
    }
  }, [open, dispatch]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Lý do là bắt buộc';
    }

    if (requiresDocument) {
      if (attachmentMode === 'upload' && !documentFile) {
        newErrors.document = 'Bạn cần upload hồ sơ cho loại nghỉ này';
      }

      if (attachmentMode === 'url') {
        const normalizedUrl = documentUrlInput.trim();
        if (!normalizedUrl) {
          newErrors.document = 'Bạn cần nhập URL tài liệu';
        } else {
          try {
            const parsedUrl = new URL(normalizedUrl);
            if (!parsedUrl.protocol.startsWith('http')) {
              newErrors.document = 'URL phải bắt đầu bằng http hoặc https';
            }
          } catch {
            newErrors.document = 'URL tài liệu không hợp lệ';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!formData.startDate || !formData.endDate) return;

    if (!employeeId) {
      console.error('Employee ID is required');
      return;
    }

    const dto: LeaveRequestCreateDto = {
      employeeId,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      type: formData.type,
      reason: formData.reason,
      documentUrl: attachmentMode === 'url' ? documentUrlInput.trim() : undefined,
      autoSplitIfInsufficient:
        formData.type === LeaveRequestType.ANNUAL && workingDays > leaveBalance ? true : undefined,
    };

    await onSubmit({
      data: dto,
      documentFile: attachmentMode === 'upload' ? (documentFile || undefined) : undefined,
    });
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>Xin Nghỉ Phép</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          <TextField
            select
            label="Loại nghỉ"
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value as LeaveRequestType)}
            fullWidth
            required
            disabled={loading}
          >
            <MenuItem value={LeaveRequestType.ANNUAL}>Phép năm</MenuItem>
            <MenuItem value={LeaveRequestType.SICK}>Nghỉ ốm</MenuItem>
            <MenuItem value={LeaveRequestType.UNPAID}>Không lương</MenuItem>
            <MenuItem value={LeaveRequestType.MATERNITY}>Nghỉ thai sản</MenuItem>
            <MenuItem value={LeaveRequestType.OTHER}>Khác</MenuItem>
          </TextField>

          <TextField
            label="Ngày bắt đầu"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            error={!!errors.startDate}
            helperText={errors.startDate}
            fullWidth
            disabled={loading}
          />

          <TextField
            label="Ngày kết thúc"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: formData.startDate || undefined }}
            required
            error={!!errors.endDate}
            helperText={
              errors.endDate ||
              (formData.type === LeaveRequestType.MATERNITY
                ? 'Đơn thai sản tự động tính 6 tháng kể từ ngày bắt đầu'
                : '')
            }
            fullWidth
            disabled={loading || formData.type === LeaveRequestType.MATERNITY}
          />

          {requiresDocument && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Tài liệu đính kèm bắt buộc
              </Typography>

              <ToggleButtonGroup
                value={attachmentMode}
                exclusive
                onChange={(_, value: 'upload' | 'url' | null) => {
                  if (!value) return;
                  setAttachmentMode(value);
                  setErrors((prev) => ({ ...prev, document: undefined }));
                }}
                size="small"
                sx={{ mb: 1.5 }}
              >
                <ToggleButton value="upload">Upload file</ToggleButton>
                <ToggleButton value="url">Nhập URL</ToggleButton>
              </ToggleButtonGroup>

              {attachmentMode === 'upload' && (
                <>
                  <Box
                    {...getRootProps()}
                    sx={{
                      border: '1.5px dashed',
                      borderColor: errors.document ? 'error.main' : isDragActive ? 'primary.main' : 'divider',
                      bgcolor: isDragActive ? 'primary.50' : 'background.default',
                      borderRadius: 2,
                      p: 2,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input {...getInputProps()} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <UploadFileIcon color={errors.document ? 'error' : 'primary'} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {isDragActive
                            ? 'Thả file vào đây...'
                            : 'Kéo thả file hoặc bấm để chọn (PDF/JPG/PNG/WEBP)'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formData.type === LeaveRequestType.MATERNITY
                            ? 'Yêu cầu: Giấy ra viện hoặc Giấy khai sinh'
                            : 'Yêu cầu: Giấy xác nhận khám/chữa bệnh'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {documentFile && (
                    <Box
                      sx={{
                        mt: 1,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1,
                        bgcolor: 'success.50',
                        border: '1px solid',
                        borderColor: 'success.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" noWrap sx={{ maxWidth: '90%' }}>
                        {documentFile.name}
                      </Typography>
                      <IconButton size="small" onClick={() => setDocumentFile(null)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {errors.document && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.document}
                    </Typography>
                  )}
                </>
              )}

              {attachmentMode === 'url' && (
                <TextField
                  label="URL tài liệu"
                  placeholder="https://..."
                  value={documentUrlInput}
                  onChange={(e) => {
                    setDocumentUrlInput(e.target.value);
                    setErrors((prev) => ({ ...prev, document: undefined }));
                  }}
                  fullWidth
                  disabled={loading}
                  error={!!errors.document}
                  helperText={
                    errors.document ||
                    'Có thể dùng link file đã lưu sẵn (S3, Google Drive, CDN nội bộ...)'
                  }
                />
              )}
            </Box>
          )}

          {(workingDays > 0 || calculatingDays) && (
            <Box>
              <Alert severity="info" icon={false}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Tổng cộng:</Typography>
                  {calculatingDays ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Chip label={`${workingDays} ngày công`} color="primary" size="small" sx={{ fontWeight: 600 }} />
                  )}
                </Box>
              </Alert>
              {!calculatingDays && formData.type === LeaveRequestType.ANNUAL && workingDays > leaveBalance && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block', fontWeight: 500 }}>
                  * Số ngày nghỉ vượt quá quỹ phép ({leaveBalance} ngày). Hệ thống sẽ tự động tách đơn.
                </Typography>
              )}
            </Box>
          )}

          <TextField
            label="Lý do"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            error={!!errors.reason}
            helperText={errors.reason}
            fullWidth
            required
            multiline
            rows={3}
            disabled={loading}
            placeholder="Nhập lý do xin nghỉ phép..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Đang gửi...' : 'Gửi đơn'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
