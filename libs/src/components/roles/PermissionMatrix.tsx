'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControlLabel,
    Checkbox,
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    IconButton,
    useTheme,
    useMediaQuery,
    Alert,
    Chip,
} from '@mui/material';
import {
    Close as CloseIcon,
    CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from '@mui/icons-material';
import { PermissionResponse } from '@libs/shared/types/permissions.type';
import { useState, useEffect } from 'react';

interface PermissionMatrixProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (selectedPermissions: string[]) => void;
    permissions: PermissionResponse[];
    selectedPermissions?: string[];
    title?: string;
    loading?: boolean;
}

export default function PermissionMatrix({
    open,
    onClose,
    onConfirm,
    permissions,
    selectedPermissions = [],
    title = 'Select Permissions',
    loading = false,
}: PermissionMatrixProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selected, setSelected] = useState<string[]>(selectedPermissions);

    useEffect(() => {
        setSelected(selectedPermissions);
    }, [selectedPermissions, open]);

    const handleToggle = (permissionCode: string) => {
        setSelected((prev) =>
            prev.includes(permissionCode)
                ? prev.filter((code) => code !== permissionCode)
                : [...prev, permissionCode]
        );
    };

    const handleSelectAll = () => {
        if (selected.length === permissions.length) {
            setSelected([]);
        } else {
            setSelected(permissions.map((p) => p.permission_code));
        }
    };

    const handleConfirm = () => {
        onConfirm(selected);
    };

    const isAllSelected = selected.length === permissions.length;
    const isSomeSelected = selected.length > 0 && selected.length < permissions.length;

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    borderRadius: isMobile ? 0 : 2,
                    minHeight: isMobile ? '100vh' : '500px',
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 2,
                }}
            >
                <Box>
                    <Typography variant="h6" component="div" fontWeight={600}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Select permissions to assign to this role
                    </Typography>
                </Box>
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 3 }}>
                {/* Header with Select All and Counter */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                        p: 2,
                        bgcolor: theme.palette.primary.main + '10',
                        borderRadius: 1,
                    }}
                >
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isAllSelected}
                                indeterminate={isSomeSelected}
                                onChange={handleSelectAll}
                                icon={<CheckBoxOutlineBlankIcon />}
                                checkedIcon={<CheckBoxIcon />}
                            />
                        }
                        label={
                            <Typography fontWeight={600}>
                                Select All Permissions
                            </Typography>
                        }
                    />
                    <Chip
                        label={`${selected.length} / ${permissions.length} selected`}
                        color="primary"
                        size="small"
                    />
                </Box>

                {/* Info Alert */}
                {selected.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        No permissions selected. Please select at least one permission.
                    </Alert>
                )}

                {/* Permissions Grid */}
                <Paper
                    variant="outlined"
                    sx={{
                        maxHeight: isMobile ? 'calc(100vh - 300px)' : 400,
                        overflow: 'auto',
                        p: 2,
                    }}
                >
                    {permissions.length === 0 ? (
                        <Box py={4} textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                No permissions available
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={1}>
                            {permissions.map((permission) => {
                                const isChecked = selected.includes(permission.permission_code);
                                return (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={permission.permission_code}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 1.5,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: `2px solid ${isChecked
                                                    ? theme.palette.primary.main
                                                    : theme.palette.divider
                                                    }`,
                                                backgroundColor: isChecked
                                                    ? theme.palette.primary.main + '08'
                                                    : 'transparent',
                                                '&:hover': {
                                                    backgroundColor: isChecked
                                                        ? theme.palette.primary.main + '15'
                                                        : theme.palette.action.hover,
                                                    borderColor: theme.palette.primary.main,
                                                },
                                            }}
                                            onClick={() => handleToggle(permission.permission_code)}
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onChange={() => handleToggle(permission.permission_code)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        size="small"
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={isChecked ? 600 : 400}
                                                            sx={{ fontSize: '0.875rem' }}
                                                        >
                                                            {permission.permission_name}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{ fontSize: '0.75rem' }}
                                                        >
                                                            {permission.permission_code}
                                                        </Typography>
                                                    </Box>
                                                }
                                                sx={{
                                                    margin: 0,
                                                    width: '100%',
                                                    '& .MuiFormControlLabel-label': {
                                                        flex: 1,
                                                    },
                                                }}
                                            />
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Paper>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="outlined"
                    color="inherit"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={loading || selected.length === 0}
                    sx={{ minWidth: 120 }}
                >
                    {loading ? 'Saving...' : 'Confirm'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
