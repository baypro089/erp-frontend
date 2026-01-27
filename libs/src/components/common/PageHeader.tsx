'use client';

import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Stack,
  Chip,
  useTheme,
  Divider,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface PageAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  disabled?: boolean;
  hidden?: boolean;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: PageAction[];
  tags?: { label: string; color?: string }[];
  showDivider?: boolean;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  tags,
  showDivider = true,
}: PageHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  const visibleActions = actions?.filter((action) => !action.hidden);

  return (
    <Box sx={{ mb: 3 }}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
              },
            }}
            onClick={() => router.push('/')}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Box
                key={index}
                component="span"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.primary',
                  fontWeight: 500,
                }}
              >
                {item.icon && (
                  <Box component="span" sx={{ mr: 0.5, display: 'inline-flex' }}>{item.icon}</Box>
                )}
                {item.label}
              </Box>
            ) : (
              <Link
                key={index}
                underline="hover"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
                onClick={() => item.href && router.push(item.href)}
              >
                {item.icon && (
                  <Box component="span" sx={{ mr: 0.5, display: 'inline-flex' }}>
                    {item.icon}
                  </Box>
                )}
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Header Content */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
          gap: 2,
        }}
      >
        {/* Title & Subtitle */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              {title}
            </Typography>
            {tags && tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag.label}
                    size="small"
                    sx={{
                      backgroundColor: tag.color || theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 600 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        {visibleActions && visibleActions.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ width: 'auto' }}
          >
            {visibleActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                onClick={action.onClick}
                disabled={action.disabled}
                startIcon={action.icon}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}
      </Box>

      {/* Divider */}
      {showDivider && <Divider sx={{ mt: 3 }} />}
    </Box>
  );
}
