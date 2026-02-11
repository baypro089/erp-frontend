'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Typography,
  Alert,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { PageHeader } from '@libs/src/components/common';
import { fetchSettings, updateSetting } from '@libs/src/features/system-setting/system-setting.slice';
import type { SystemSettingResponse } from '@libs/shared/types/system-setting.type';

export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading, operationLoading, error, operationError } = useSelector(
    (state: RootState) => state.systemSetting
  );

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleEdit = (setting: SystemSettingResponse) => {
    setEditingKey(setting.key);
    setEditValue(setting.value);
    setSuccessMessage(null);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const handleSave = async (key: string) => {
    try {
      await dispatch(updateSetting({ key, data: { value: editValue } })).unwrap();
      setEditingKey(null);
      setEditValue('');
      setSuccessMessage('Cập nhật cài đặt thành công');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchSettings());
    setSuccessMessage(null);
  };

  const headerActions = [
    {
      label: 'Làm mới',
      icon: <RefreshIcon />,
      onClick: handleRefresh,
      color: 'primary' as const,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Cấu hình Lương"
        subtitle="Quản lý các tham số tính lương hệ thống"
        actions={headerActions}
      />

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {operationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {operationError}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                  Tên tham số
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                  Giá trị hiện tại
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'background.paper', width: 100 }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {settings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      Không có dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                settings.map((setting) => {
                  const isEditing = editingKey === setting.key;
                  
                  return (
                    <TableRow key={setting.key} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {setting.description || setting.key}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            disabled={operationLoading}
                            autoFocus
                            sx={{ maxWidth: 300 }}
                          />
                        ) : (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { color: 'primary.main' }
                            }}
                            onClick={() => handleEdit(setting)}
                          >
                            {setting.value}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {isEditing ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Lưu">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleSave(setting.key)}
                                disabled={operationLoading}
                              >
                                {operationLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Hủy">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={handleCancel}
                                disabled={operationLoading}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEdit(setting)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
