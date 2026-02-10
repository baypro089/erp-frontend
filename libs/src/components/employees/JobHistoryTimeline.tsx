'use client';

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  WorkOutline as WorkIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import type { JobHistoryResponse } from '@libs/shared/types/job-histories.type';
import { format } from 'date-fns';

interface JobHistoryTimelineProps {
  jobHistories: JobHistoryResponse[];
  currentDepartment?: string;
  currentPosition?: string;
  currentSalary?: number;
}

export default function JobHistoryTimeline({
  jobHistories,
  currentDepartment,
  currentPosition,
  currentSalary,
}: JobHistoryTimelineProps) {
  // Sort by startDate descending (most recent first)
  const sortedHistories = [...jobHistories].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy');
  };

  return (
    <Timeline position="right">
      {/* Current position - Always show first */}
      <TimelineItem>
        <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}>
          <Typography variant="body2" fontWeight={600}>
            Hiện tại
          </Typography>
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot color="success">
            <CheckCircleIcon />
          </TimelineDot>
          {sortedHistories.length > 0 && <TimelineConnector />}
        </TimelineSeparator>
        <TimelineContent>
          <Card 
            elevation={2} 
            sx={{ 
              mb: 2,
              borderLeft: 3,
              borderColor: 'success.main',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" component="div">
                  {currentPosition || 'Chưa có chức vụ'}
                </Typography>
                <Chip label="Hiện tại" color="success" size="small" />
              </Box>
              <Typography color="text.secondary" gutterBottom>
                {currentDepartment || 'Chưa có phòng ban'}
              </Typography>
              {currentSalary && (
                <Typography variant="body1" color="primary" fontWeight={600}>
                  {formatCurrency(currentSalary)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </TimelineContent>
      </TimelineItem>

      {/* Historical positions */}
      {sortedHistories.map((history, index) => (
        <TimelineItem key={history.id}>
          <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}>
            <Typography variant="body2">
              {formatDate(history.startDate)}
            </Typography>
            {history.endDate && (
              <Typography variant="body2">
                {formatDate(history.endDate)}
              </Typography>
            )}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="grey">
              <WorkIcon />
            </TimelineDot>
            {index < sortedHistories.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Card 
              elevation={1} 
              sx={{ 
                mb: 2,
                borderLeft: 3,
                borderColor: 'grey.400',
              }}
            >
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  {history.position?.name || 'N/A'}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {history.department?.name || 'N/A'}
                </Typography>
                <Typography variant="body1" color="text.primary" fontWeight={600} gutterBottom>
                  {formatCurrency(history.salaryAtTime)}
                </Typography>
                {history.note && (
                  <Box mt={1} p={1} bgcolor="grey.100" borderRadius={1}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Ghi chú:</strong> {history.note}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
