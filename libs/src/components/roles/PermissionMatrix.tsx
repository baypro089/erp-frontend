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
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    Close as CloseIcon,
    CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { PermissionResponse } from '@libs/shared/types/permissions.type';
import { PORTAL_PERMISSION_VALUES } from '@libs/shared/constants/portal-permissions.constant';
import { useState, useEffect, useMemo } from 'react';

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
    const [expandedType, setExpandedType] = useState<string | false>('PORTAL_ACCESS');

    useEffect(() => {
        setSelected(selectedPermissions);
    }, [selectedPermissions, open]);

    // Group permissions by type
    const permissionsByType = useMemo(() => {
        const grouped: Record<string, PermissionResponse[]> = {};
        permissions.forEach((permission) => {
            const type = permission.type || 'OTHER';
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push(permission);
        });
        return grouped;
    }, [permissions]);

    // Separate portal access permissions
    const portalPermissions = useMemo(() => {
        return permissions.filter(p => PORTAL_PERMISSION_VALUES.includes(p.permission_code as any));
    }, [permissions]);

    const selectedPortalCount = useMemo(() => {
        return selected.filter(code => PORTAL_PERMISSION_VALUES.includes(code as any)).length;
    }, [selected]);

    const hasPortalAccessSelected = selectedPortalCount > 0;

    const handleToggle = (permissionCode: string) => {
        setSelected((prev) =>
            prev.includes(permissionCode)
                ? prev.filter((code) => code !== permissionCode)
                : [...prev, permissionCode]
        );
    };

    const handleSelectAllInType = (typePermissions: PermissionResponse[]) => {
        const typeCodes = typePermissions.map(p => p.permission_code);
        const allSelected = typeCodes.every(code => selected.includes(code));
        
        if (allSelected) {
            // Deselect all in this type
            setSelected(prev => prev.filter(code => !typeCodes.includes(code)));
        } else {
            // Select all in this type
            const newCodes = typeCodes.filter(code => !selected.includes(code));
            setSelected(prev => [...prev, ...newCodes]);
        }
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

    const handleAccordionChange = (type: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedType(isExpanded ? type : false);
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

                {/* Portal Access Alert */}
                {!hasPortalAccessSelected && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600}>
                            Bạn phải chọn ít nhất 1 quyền truy cập site/portal
                        </Typography>
                        <Typography variant="caption">
                            Vui lòng chọn ít nhất một trong các quyền: ACCESS_ADMIN_PORTAL, ACCESS_HR_PORTAL, 
                            ACCESS_SALE_PORTAL, hoặc ACCESS_WAREHOUSE_PORTAL
                        </Typography>
                    </Alert>
                )}

                {/* Portal Access Permissions - Always on top */}
                <Paper
                    variant="outlined"
                    sx={{
                        mb: 2,
                        border: `2px solid ${!hasPortalAccessSelected ? theme.palette.error.main : theme.palette.primary.main}`,
                        backgroundColor: theme.palette.primary.main + '05',
                    }}
                >
                    <Accordion 
                        expanded={expandedType === 'PORTAL_ACCESS'}
                        onChange={handleAccordionChange('PORTAL_ACCESS')}
                        sx={{ boxShadow: 'none' }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                                backgroundColor: theme.palette.primary.main + '10',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.main + '15',
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        🔐 Quyền Truy Cập Site/Portal
                                        <Chip 
                                            label="BẮT BUỘC" 
                                            size="small" 
                                            color="error" 
                                            sx={{ ml: 1, height: 20 }}
                                        />
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Chọn ít nhất 1 site mà role này có thể truy cập
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`${selectedPortalCount} / ${portalPermissions.length}`}
                                    size="small"
                                    color={hasPortalAccessSelected ? 'success' : 'error'}
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={1}>
                                {portalPermissions.map((permission) => {
                                    const isChecked = selected.includes(permission.permission_code);
                                    return (
                                        <Grid size={{ xs: 12, sm: 6 }} key={permission.permission_code}>
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
                                                                sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
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
                        </AccordionDetails>
                    </Accordion>
                </Paper>

                {/* Other Permissions by Type */}
                <Paper
                    variant="outlined"
                    sx={{
                        maxHeight: isMobile ? 'calc(100vh - 450px)' : 400,
                        overflow: 'auto',
                    }}
                >
                    {Object.entries(permissionsByType)
                        .filter(([type]) => type !== 'PORTAL_ACCESS')
                        .map(([type, typePermissions]) => {
                            const typeSelectedCount = typePermissions.filter(p => 
                                selected.includes(p.permission_code)
                            ).length;
                            const allTypeSelected = typeSelectedCount === typePermissions.length;

                            return (
                                <Accordion
                                    key={type}
                                    expanded={expandedType === type}
                                    onChange={handleAccordionChange(type)}
                                    sx={{ boxShadow: 'none' }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Checkbox
                                                    checked={allTypeSelected}
                                                    indeterminate={typeSelectedCount > 0 && !allTypeSelected}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectAllInType(typePermissions);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    size="small"
                                                />
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {type.replace(/_/g, ' ')}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {typePermissions.length} permissions
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip
                                                label={`${typeSelectedCount} / ${typePermissions.length}`}
                                                size="small"
                                                color={typeSelectedCount > 0 ? 'primary' : 'default'}
                                            />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 2 }}>
                                        <Grid container spacing={1}>
                                            {typePermissions.map((permission) => {
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
                                                                            sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
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
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
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
                    disabled={loading || !hasPortalAccessSelected}
                    sx={{ minWidth: 120 }}
                >
                    {loading ? 'Saving...' : 'Confirm'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
