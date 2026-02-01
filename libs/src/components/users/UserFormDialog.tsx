'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
  Stack,
  Typography,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Badge,
} from '@mui/icons-material';
import { createUser, updateUser, fetchUserById, clearCurrentUser } from '@libs/src/features/user/user.slice';
import { fetchEmployees } from '@libs/src/features/employee/employee.slice';
import { fetchRoles } from '@libs/src/features/role/role.slice';
import type { CreateUserDto, UpdateUserDto, UserResponse } from '@libs/shared/types/users.type';
import { UserStatus } from '@libs/shared/enums/user-status.enum';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: string;
  mode?: 'create' | 'edit';
}

export default function UserFormDialog({ 
  open, 
  onClose, 
  onSuccess, 
  userId = undefined, 
  mode = 'create' 
}: UserFormDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, operationLoading, operationError } = useSelector((state: RootState) => state.user);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { roles } = useSelector((state: RootState) => state.role);

  const [formData, setFormData] = useState({
    username: '',
    password: '123456',
    email: '',
    role_code: '',
    status: UserStatus.ACTIVE,
  });

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      console.log('Dialog opened - mode:', mode, 'userId:', userId); // Debug log
      dispatch(fetchEmployees());
      dispatch(fetchRoles({}));
      
      if (mode === 'edit' && userId) {
        console.log('Fetching user by ID:', userId); // Debug log
        dispatch(fetchUserById(userId));
      } else if (mode === 'create') {
        // Reset form for create mode
        setFormData({
          username: '',
          password: '123456',
          email: '',
          role_code: '',
          status: UserStatus.ACTIVE,
        });
        setSelectedEmployee('');
      }
    }
  }, [dispatch, open, mode, userId]);

  useEffect(() => {
    console.log('Populate effect - mode:', mode, 'currentUser:', currentUser, 'roles length:', roles.length, 'userId:', userId); // Debug log
    
    if (mode === 'edit' && currentUser && roles.length > 0 && userId) {
      // Verify currentUser matches the userId being edited
      console.log('Checking currentUser.id:', currentUser.id, 'vs userId:', userId); // Debug log
      if (currentUser.id !== userId) {
        console.log('ID mismatch - waiting for correct user data'); // Debug log
        return; // Wait for correct user data
      }
      
      console.log('Populating form with:', currentUser); // Debug log
      setFormData({
        username: currentUser.username || '',
        password: '',
        email: currentUser.email || '',
        role_code: currentUser.role?.role_code || '',
        status: currentUser.status || UserStatus.ACTIVE,
      });
    }
  }, [currentUser, mode, roles, userId]);

  // Filter employees without user account
  // Since we're using fetchEmployees which returns EmployeeTableResponse[], 
  // we need to check using the full employees list from fetchEmployeesWithOptional
  // For now, show all employees - backend should filter
  const availableEmployees = employees;

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    const employee = availableEmployees.find((emp) => emp.id === employeeId);
    if (employee) {
      setFormData({
        ...formData,
        username: employee.employeeCode || '',
        email: formData.email || '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'edit' && userId) {
        const updateData: UpdateUserDto = {
          email: formData.email,
          roleCode: formData.role_code,
          status: formData.status,
        };
        await dispatch(updateUser({ id: userId, data: updateData })).unwrap();
      } else {
        await dispatch(createUser(formData)).unwrap();
      }
      onSuccess();
      handleClose();
    } catch (error) {
      console.error(`Failed to ${mode} user:`, error);
    }
  };

  const handleClose = () => {
    setFormData({
      username: '',
      password: '123456',
      email: '',
      role_code: '',
      status: UserStatus.ACTIVE,
    });
    setSelectedEmployee('');
    setShowPassword(false);
    dispatch(clearCurrentUser()); // Clear currentUser when closing dialog
    onClose();
  };

  const isEditMode = mode === 'edit';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Person color="primary" />
            <Typography variant="h6">
              {isEditMode ? 'Edit User Account' : 'Create New User Account'}
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box mt={2}>
            {operationError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {operationError}
              </Alert>
            )}

            <Stack spacing={3}>
              {/* Employee Section - Only for create mode */}
              {!isEditMode && (
                <>
                  <Typography variant="subtitle2" color="primary">
                    Employee Information
                  </Typography>
                  <TextField
                    select
                    label="Employee"
                    value={selectedEmployee}
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge color="action" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Select an employee to create account"
                  >
                    {availableEmployees.length === 0 ? (
                      <MenuItem disabled>No employees available</MenuItem>
                    ) : (
                      availableEmployees.map((emp) => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.employeeCode} - {emp.fullName}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </>
              )}

              {/* Account Information */}
              <Typography variant="subtitle2" color="primary">
                Account Information
              </Typography>
              <Box display="flex" gap={2}>
                <TextField
                  label="Username"
                  value={formData.username}
                  disabled
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                  helperText={isEditMode ? 'Username cannot be changed' : 'Auto-filled from employee code'}
                />

                {!isEditMode && (
                  <TextField
                    label="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    helperText="Default: 123456"
                  />
                )}
              </Box>

              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Role & Status */}
              <Typography variant="subtitle2" color="primary">
                Role & Permissions
              </Typography>
              <Box display="flex" gap={2}>
                <TextField
                  select
                  label="Role"
                  value={formData.role_code}
                  onChange={(e) => setFormData({ ...formData, role_code: e.target.value })}
                  required
                  fullWidth
                >
                  {roles.map((role) => (
                    <MenuItem key={role.role_code} value={role.role_code}>
                      {role.role_name}
                    </MenuItem>
                  ))}
                </TextField>

                {isEditMode && (
                  <TextField
                    select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    required
                    fullWidth
                  >
                    <MenuItem value={UserStatus.ACTIVE}>Active</MenuItem>
                    <MenuItem value={UserStatus.INACTIVE}>Inactive</MenuItem>
                    <MenuItem value={UserStatus.BANNED}>Banned</MenuItem>
                  </TextField>
                )}
              </Box>

              {/* System Information - Only in edit mode */}
              {isEditMode && currentUser && (
                <>
                  <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                    System Information
                  </Typography>
                  <Box display="flex" gap={2}>
                    <TextField
                      label="Created At"
                      value={currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleString() : 'N/A'}
                      disabled
                      fullWidth
                      helperText="Account creation date"
                    />
                    <TextField
                      label="Updated At"
                      value={currentUser.updatedAt ? new Date(currentUser.updatedAt).toLocaleString() : 'N/A'}
                      disabled
                      fullWidth
                      helperText="Last modification date"
                    />
                  </Box>
                  <TextField
                    label="Last Login"
                    value={currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'Never logged in'}
                    disabled
                    fullWidth
                    helperText="Last login timestamp"
                  />
                </>
              )}
            </Stack>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={operationLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={operationLoading || (!isEditMode && !selectedEmployee)}
          >
            {operationLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update User' : 'Create User')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
