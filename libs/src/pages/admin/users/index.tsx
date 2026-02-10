'use client';

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import { Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, Typography } from '@mui/material';
import {
    Add as AddIcon,
    Refresh as RefreshIcon,
    Block as BlockIcon,
    People as PeopleIcon,
} from '@mui/icons-material';
import {
    PageHeader,
    DataTable,
    FilterBar,
    StatusChip,
} from '@libs/src/components/common';
import type { Column } from '@libs/src/components/common/DataTable';
import UserFormDialog from '@libs/src/components/users/UserFormDialog';
import { fetchUsersWithOptional, banUser } from '@libs/src/features/user/user.slice';
import { fetchRoles } from '@libs/src/features/role/role.slice';
import type { UserResponse } from '@libs/shared/types/users.type';
import { UserStatus } from '@libs/shared/enums/user-status.enum';
import { RoleResponse } from '@libs/shared/types/roles.type';

export default function UsersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { users, totalCount, totalPages, loading, operationLoading } = useSelector(
        (state: RootState) => state.user
    );
    const { roles } = useSelector((state: RootState) => state.role);

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Filter states
    const [searchUsername, setSearchUsername] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchEmployeeName, setSearchEmployeeName] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<UserResponse[]>([]);
    const [confirmBanDialog, setConfirmBanDialog] = useState<{
        open: boolean;
        userId: string | null;
        username: string;
    }>({
        open: false,
        userId: null,
        username: '',
    });
    const [refreshCounter, setRefreshCounter] = useState(0);

    useEffect(() => {
        dispatch(fetchRoles({}));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
        dispatch(
            fetchUsersWithOptional({
                username: searchUsername || undefined,
                email: searchEmail || undefined,
                roleId: filterRole || undefined,
                employeeName: searchEmployeeName || undefined,
                page: page + 1,
                pageSize,
            })
        );
    }, [dispatch, page, pageSize, searchUsername, searchEmail, filterRole, searchEmployeeName, refreshCounter]);

    // Debug log
    useEffect(() => {
        console.log('Users data:', users);
        console.log('Users length:', users?.length);
        console.log('Loading:', loading);
    }, [users, loading]);

    const handleRefresh = () => {
        setRefreshCounter((prev) => prev + 1);
    };

    const handleEdit = (row: UserResponse) => {
        console.log('Edit user with ID:', row.id); // Debug log
        setSelectedUserId(row.id);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        console.log('Closing edit dialog'); // Debug log
        setOpenEditDialog(false);
        // Delay clearing selectedUserId to ensure dialog closes properly
        setTimeout(() => setSelectedUserId(null), 100);
    };

    const handleBanUser = async () => {
        if (confirmBanDialog.userId) {
            try {
                await dispatch(banUser(confirmBanDialog.userId)).unwrap();
                handleRefresh();
                setConfirmBanDialog({ open: false, userId: null, username: '' });
            } catch (error) {
                console.error('Failed to ban user:', error);
            }
        }
    };

    const handleBulkBan = () => {
        if (selectedRows.length > 0) {
            setConfirmBanDialog({
                open: true,
                userId: null,
                username: `${selectedRows.length} user(s)`,
            });
        }
    };

    const statusMap: Record<UserStatus, 'active' | 'inactive' | 'rejected'> = {
        [UserStatus.ACTIVE]: 'active',
        [UserStatus.BANNED]: 'rejected',
    };

    const columns: Column<UserResponse>[] = [
        {
            id: 'username',
            label: 'Username / Employee Code',
            minWidth: 150,
            format: (value) => (
                <Typography variant="body2" fontWeight={600} color="primary">
                    {value}
                </Typography>
            ),
        },
        {
            id: 'email',
            label: 'Email',
            minWidth: 200,
            format: (value) => (
                <Typography variant="body2" fontWeight={600}>
                    {value}
                </Typography>
            ),
        },
        {
            id: 'employee',
            label: 'Employee Name',
            minWidth: 180,
            format: (value) => value ? (
                <Typography variant="body2" fontWeight={600}>
                    {value.fullName}
                </Typography>
            ) : <Typography variant="body2" fontWeight={600} color="text.secondary">N/A</Typography>,
        },
        {
            id: 'role',
            label: 'Role',
            minWidth: 150,
            format: (value: RoleResponse) =>
                value ? (
                    <Chip label={value.role_name} color="primary" size="small" />
                ) : (
                    <Typography variant="body2" fontWeight={600} color="text.secondary">N/A</Typography>
                ),
        },
        {
            id: 'status',
            label: 'Status',
            minWidth: 120,
            format: (value) => value ? <StatusChip status={statusMap[value as UserStatus]} showIcon /> : 'N/A',
        },
    ];
    const searchFields = [
        {
            id: 'username',
            label: 'Username',
            placeholder: 'Search by username...',
            value: searchUsername,
        },
        {
            id: 'email',
            label: 'Email',
            placeholder: 'Search by email...',
            value: searchEmail,
        },
        {
            id: 'employeeName',
            label: 'Employee Name',
            placeholder: 'Search by employee name...',
            value: searchEmployeeName,
        },
    ];

    const filterConfig = [
        {
            id: 'roleId',
            type: 'select' as const,
            label: 'Role',
            options: roles.map((role) => ({
                value: role.role_code,
                label: role.role_name,
            })),
            value: filterRole,
        },
    ];

    return (
        <Box>
            <PageHeader
                title="User Management"
                subtitle="Manage system user accounts"
                breadcrumbs={[
                    { label: 'Users', icon: <PeopleIcon fontSize="small" /> },
                ]}
                actions={[
                    {
                        label: 'Refresh',
                        onClick: handleRefresh,
                        icon: <RefreshIcon />,
                        variant: 'outlined',
                    },
                    {
                        label: 'Ban Selected',
                        onClick: handleBulkBan,
                        variant: 'outlined',
                        color: 'error',
                        disabled: selectedRows.length === 0,
                        hidden: selectedRows.length === 0,
                    },
                    {
                        label: 'Create Account',
                        onClick: () => setOpenCreateDialog(true),
                        icon: <AddIcon />,
                        variant: 'contained',
                    },
                ]}
                tags={[{ label: `${totalCount || 0} Total` }]}
            />

            <FilterBar
                searchFields={searchFields}
                onSearchChange={(fieldId, value) => {
                    if (fieldId === 'username') setSearchUsername(value);
                    if (fieldId === 'email') setSearchEmail(value);
                    if (fieldId === 'employeeName') setSearchEmployeeName(value);
                    setPage(0);
                }}
                filters={filterConfig}
                onFilterChange={(filterId, value) => {
                    if (filterId === 'roleId') setFilterRole(value);
                    setPage(0);
                }}
                onClearFilters={() => {
                    setSearchUsername('');
                    setSearchEmail('');
                    setSearchEmployeeName('');
                    setFilterRole('');
                    setPage(0);
                }}
            />

            <DataTable
                columns={columns}
                data={users || []}
                loading={loading}
                page={page}
                rowsPerPage={pageSize}
                totalRows={totalCount}
                onPageChange={setPage}
                onRowsPerPageChange={(size: number) => {
                    setPageSize(size);
                    setPage(0);
                }}
                selectable
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                onEdit={handleEdit}
                onDelete={(row: UserResponse) => {
                    setConfirmBanDialog({
                        open: true,
                        userId: row.id,
                        username: row.username,
                    });
                }}
                rowKey="id"
            />

            <UserFormDialog
                open={openCreateDialog}
                onClose={() => setOpenCreateDialog(false)}
                onSuccess={handleRefresh}
                mode="create"
            />

            <UserFormDialog
                open={openEditDialog}
                onClose={handleCloseEditDialog}
                onSuccess={() => {
                    handleRefresh();
                    handleCloseEditDialog();
                }}
                userId={selectedUserId || undefined}
                mode="edit"
            />

            <Dialog
                open={confirmBanDialog.open}
                onClose={() => setConfirmBanDialog({ open: false, userId: null, username: '' })}
            >
                <DialogTitle>Ban User</DialogTitle>
                <DialogContent>
                    <Alert severity="warning">
                        Are you sure you want to ban user "{confirmBanDialog.username}"? This action will
                        prevent the user from accessing the system.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmBanDialog({ open: false, userId: null, username: '' })}
                        disabled={operationLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleBanUser}
                        variant="contained"
                        color="error"
                        disabled={operationLoading}
                    >
                        {operationLoading ? 'Banning...' : 'Ban User'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
