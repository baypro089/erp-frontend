'use client';

import { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  Button,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import FormDialog from '@libs/src/components/common/FormDialog';
import PermissionMatrix from './PermissionMatrix';
import type { RoleResponse, CreateRoleDTO, UpdateRoleDTO } from '@libs/shared/types/roles.type';
import type { PermissionResponse } from '@libs/shared/types/permissions.type';
import { fetchRoleByCode } from '@libs/src/features/role/role.slice';
import { AppDispatch, RootState } from '@libs/src/store';
import { useDispatch, useSelector } from 'react-redux';
interface RoleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoleDTO | UpdateRoleDTO, isEdit: boolean) => void;
  selectedRole: RoleResponse | null;
  permissions: PermissionResponse[];
  loading?: boolean;
}

export default function RoleFormDialog({
  open,
  onClose,
  onSubmit,
  selectedRole,
  permissions,
  loading = false,
}: RoleFormDialogProps) {
  const [openPermissionMatrix, setOpenPermissionMatrix] = useState(false);
  const [formData, setFormData] = useState({
    roleCode: '',
    roleName: '',
    permissionCodes: [] as string[],
    AdminSiteAccess: false,
  });
  const dispatch = useDispatch<AppDispatch>();
  const { currentRole } = useSelector((state: RootState) => state.role);

  // Fetch full role details when editing
  useEffect(() => {
    if (open && selectedRole) {
      dispatch(fetchRoleByCode(selectedRole.role_code));
    }
  }, [open, selectedRole, dispatch]);

  // Reset form when dialog opens/closes or currentRole changes
  useEffect(() => {
    if (open) {
      if (selectedRole && currentRole && currentRole.role_code === selectedRole.role_code) {
        // Use currentRole which has full permissions data
        setFormData({
          roleCode: currentRole.role_code,
          roleName: currentRole.role_name,
          permissionCodes: currentRole.permissions?.map((p) => p.permission_code) || [],
          AdminSiteAccess: currentRole.AdminSiteAccess,
        });
      } else if (!selectedRole) {
        // New role
        setFormData({
          roleCode: '',
          roleName: '',
          permissionCodes: [],
          AdminSiteAccess: false,
        });
      }
    }
  }, [open, selectedRole, currentRole]);

  const handleFormSubmit = () => {
    if (selectedRole) {
      // Update
      const updateData: UpdateRoleDTO = {
        roleName: formData.roleName,
        permissionCodes: formData.permissionCodes,
      };
      onSubmit(updateData, true);
    } else {
      // Create
      const createData: CreateRoleDTO = {
        roleCode: formData.roleCode,
        roleName: formData.roleName,
        permissionCodes: formData.permissionCodes,
        AdminSiteAccess: formData.AdminSiteAccess,
      };
      onSubmit(createData, false);
    }
  };

  const handleOpenPermissionMatrix = () => {
    setOpenPermissionMatrix(true);
  };

  const handlePermissionConfirm = (selectedPermissions: string[]) => {
    setFormData({ ...formData, permissionCodes: selectedPermissions });
    setOpenPermissionMatrix(false);
  };

  const isFormValid = () => {
    if (selectedRole) {
      return formData.roleName.trim() !== '';
    }
    return formData.roleCode.trim() !== '' && formData.roleName.trim() !== '';
  };

  return (
    <>
      <FormDialog
        open={open}
        onClose={onClose}
        onSubmit={handleFormSubmit}
        title={selectedRole ? 'Edit Role' : 'Add New Role'}
        subtitle={
          selectedRole
            ? 'Update role information and permissions'
            : 'Create a new role with permissions'
        }
        loading={loading}
        maxWidth="md"
        disableSubmit={!isFormValid()}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Role Code"
              value={formData.roleCode}
              onChange={(e) =>
                setFormData({ ...formData, roleCode: e.target.value.toUpperCase() })
              }
              required
              disabled={!!selectedRole}
              helperText={selectedRole ? 'Role code cannot be changed' : 'Unique identifier'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Role Name"
              value={formData.roleName}
              onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                border: `1px solid`,
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Permissions ({formData.permissionCodes.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleOpenPermissionMatrix}
                >
                  Select Permissions
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.permissionCodes.length > 0 ? (
                  formData.permissionCodes.map((code) => (
                    <Chip
                      key={code}
                      label={code}
                      size="small"
                      onDelete={() =>
                        setFormData({
                          ...formData,
                          permissionCodes: formData.permissionCodes.filter((c) => c !== code),
                        })
                      }
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No permissions selected
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.AdminSiteAccess}
                  onChange={(e) =>
                    setFormData({ ...formData, AdminSiteAccess: e.target.checked })
                  }
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Admin Site Access
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Allow this role to access admin panel
                  </Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>
      </FormDialog>

      {/* Permission Matrix Dialog */}
      <PermissionMatrix
        open={openPermissionMatrix}
        onClose={() => setOpenPermissionMatrix(false)}
        onConfirm={handlePermissionConfirm}
        permissions={permissions}
        selectedPermissions={formData.permissionCodes}
        title="Select Role Permissions"
        loading={false}
      />
    </>
  );
}
