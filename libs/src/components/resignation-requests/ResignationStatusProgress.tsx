'use client';

import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  HourglassEmpty as WaitingIcon,
  CheckCircle as ApprovedIcon,
  Event as ScheduledIcon,
  Check as CompletedIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';
import type { ResignationRequestResponse } from '@libs/shared/types/resignation-request.type';
import { ResignationStatus } from '@libs/shared/enums/resignation-status.enum';

interface ResignationStatusProgressProps {
  resignation: ResignationRequestResponse;
}

export default function ResignationStatusProgress({
  resignation,
}: ResignationStatusProgressProps) {
  const getActiveStep = (): number => {
    switch (resignation.status) {
      case ResignationStatus.PENDING:
        return 1; // Chờ HR phỏng vấn
      case ResignationStatus.APPROVED:
        return 2; // Đã duyệt
      case ResignationStatus.COMPLETED:
        return 3; // Hoàn tất
      case ResignationStatus.REJECTED:
        return -1; // Từ chối
      default:
        return 0;
    }
  };

  const activeStep = getActiveStep();
  const isRejected = resignation.status === ResignationStatus.REJECTED;

  const steps = [
    {
      label: 'Đã gửi đơn',
      date: resignation.summitDate,
      description: `Bạn đã gửi đơn xin thôi việc vào ngày ${new Date(resignation.summitDate).toLocaleDateString('vi-VN')}`,
      icon: <SendIcon />,
    },
    {
      label: 'Chờ HR phỏng vấn',
      date: null,
      description: 'Phòng nhân sự sẽ liên hệ với bạn để phỏng vấn và xác nhận thông tin',
      icon: <WaitingIcon />,
    },
    {
      label: 'Đã duyệt',
      date: resignation.approvedLastDay,
      description: resignation.approvedLastDay
        ? `Ngày làm việc cuối: ${new Date(resignation.approvedLastDay).toLocaleDateString('vi-VN')}. Tài khoản sẽ tự động khóa vào ngày này.`
        : 'Chờ HR phê duyệt ngày nghỉ chính thức',
      icon: <ApprovedIcon />,
    },
    {
      label: 'Hoàn tất',
      date: resignation.status === ResignationStatus.COMPLETED ? resignation.updatedAt : null,
      description: 'Quá trình nghỉ việc đã hoàn tất. Tài khoản đã bị khóa.',
      icon: <CompletedIcon />,
    },
  ];

  if (isRejected) {
    return (
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'error.50', border: 1, borderColor: 'error.200' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <RejectedIcon color="error" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h6" color="error">
              Đơn xin thôi việc đã bị từ chối
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ngày từ chối: {new Date(resignation.updatedAt).toLocaleDateString('vi-VN')}
            </Typography>
          </Box>
        </Box>
        {resignation.hrNote && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Lý do từ chối:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {resignation.hrNote}
            </Typography>
          </Box>
        )}
        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
          Vui lòng liên hệ với HR nếu bạn có thắc mắc hoặc muốn nộp đơn mới.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom>
        Tiến trình xử lý đơn
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
        {steps.map((step, index) => (
          <Step key={step.label} expanded>
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor:
                      index <= activeStep
                        ? 'primary.main'
                        : 'action.disabled',
                    color: 'white',
                  }}
                >
                  {step.icon}
                </Box>
              )}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {step.label}
              </Typography>
              {step.date && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(step.date).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              )}
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
              {index === activeStep && resignation.hrNote && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Ghi chú từ HR:
                  </Typography>
                  <Typography variant="body2">
                    {resignation.hrNote}
                  </Typography>
                </Box>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {resignation.status === ResignationStatus.APPROVED && resignation.approvedLastDay && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>          <Typography variant="body2" fontWeight={600} color="warning.dark" gutterBottom>
            ⏰ Lưu ý quan trọng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tài khoản của bạn sẽ tự động bị khóa vào ngày{' '}
            <strong>{new Date(resignation.approvedLastDay).toLocaleDateString('vi-VN')}</strong>.
            Vui lòng hoàn tất công việc bàn giao trước ngày này.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
