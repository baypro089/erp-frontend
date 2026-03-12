'use client';

import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import {
  Inbox as InboxIcon,
  SearchOff as SearchOffIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';

export type EmptyStateType = 'no-data' | 'no-results' | 'error';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'text' | 'outlined' | 'contained';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'text' | 'outlined' | 'contained';
  };
}

const defaultConfig: Record<
  EmptyStateType,
  {
    icon: React.ReactNode;
    title: string;
    description: string;
  }
> = {
  'no-data': {
    icon: <InboxIcon sx={{ fontSize: 80 }} />,
    title: 'Không có dữ liệu',
    description: 'Hiện không có dữ liệu để hiển thị.',
  },
  'no-results': {
    icon: <SearchOffIcon sx={{ fontSize: 80 }} />,
    title: 'Không tìm thấy kết quả',
    description: 'Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc.',
  },
  error: {
    icon: <ErrorIcon sx={{ fontSize: 80 }} />,
    title: 'Đã xảy ra lỗi',
    description: 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.',
  },
};

export default function EmptyState({
  type = 'no-data',
  title,
  description,
  icon,
  action,
  secondaryAction,
}: EmptyStateProps) {
  const config = defaultConfig[type];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            color: 'text.secondary',
            opacity: 0.5,
          }}
        >
          {icon || config.icon}
        </Box>

        {/* Title */}
        <Typography variant="h6" fontWeight={600} color="text.primary">
          {title || config.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 400 }}
        >
          {description || config.description}
        </Typography>

        {/* Actions */}
        {(action || secondaryAction) && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            {action && (
              <Button
                variant={action.variant || 'contained'}
                onClick={action.onClick}
                sx={{ textTransform: 'none' }}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant={secondaryAction.variant || 'outlined'}
                onClick={secondaryAction.onClick}
                sx={{ textTransform: 'none' }}
              >
                {secondaryAction.label}
              </Button>
            )}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}
