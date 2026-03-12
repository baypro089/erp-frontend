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
    PermissionDeniedDialog,
    PermissionGuard,
} from '@libs/src/components/common';
import { usePermissionGuard } from '@libs/src/hooks';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';
import type { Column } from '@libs/src/components/common/DataTable';
import UserFormDialog from '@libs/src/components/users/UserFormDialog';
import { fetchUsersWithOptional, banUser } from '@libs/src/features/user/user.slice';
import { fetchRoles } from '@libs/src/features/role/role.slice';
import type { UserResponse } from '@libs/shared/types/users.type';
import { UserStatus } from '@libs/shared/enums/user-status.enum';
import { RoleResponse } from '@libs/shared/types/roles.type';
import { CacheService } from '@libs/src/services/cache.service';

export default function UsersPage() {
    return (
        <PermissionGuard 
            permission={PERMISSIONS.USER.VIEW}
            fallbackPath="/admin"
        >
            <UsersPageContent />
        </PermissionGuard>
    );
}

function UsersPageContent() {
    const dispatch = useDispatch<AppDispatch>();
    const { guardAction, guardFn, permissionDialogProps } = usePermissionGuard();
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

    const handleRefresh = async () => {
        await CacheService.refreshCache();
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
            label: 'Tên đăng nhập / Mã nhân viên',
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
            label: 'Tên nhân viên',
            minWidth: 180,
            format: (value) => value ? (
                <Typography variant="body2" fontWeight={600}>
                    {value.fullName}
                </Typography>
            ) : <Typography variant="body2" fontWeight={600} color="text.secondary">N/A</Typography>,
        },
        {
            id: 'role',
            label: 'Vai trò',
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
            label: 'Trạng thái',
            minWidth: 120,
            format: (value) => value ? <StatusChip status={statusMap[value as UserStatus]} showIcon /> : 'N/A',
        },
    ];
    const searchFields = [
        {
            id: 'username',
            label: 'Tên đăng nhập',
            placeholder: 'Tìm theo tên đăng nhập...',
            value: searchUsername,
        },
        {
            id: 'email',
            label: 'Email',
            placeholder: 'Tìm theo email...',
            value: searchEmail,
        },
        {
            id: 'employeeName',
            label: 'Tên nhân viên',
            placeholder: 'Tìm theo tên nhân viên...',
            value: searchEmployeeName,
        },
    ];

    const filterConfig = [
        {
            id: 'roleId',
            type: 'select' as const,
            label: 'Vai trò',
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
                title="Quản lý tài khoản"
                subtitle="Quản lý tài khoản người dùng hệ thống"
                breadcrumbs={[
                    { label: 'Người dùng', icon: <PeopleIcon fontSize="small" /> },
                ]}
                actions={[
                    {
                        label: 'Làm mới',
                        onClick: handleRefresh,
                        icon: <RefreshIcon />,
                        variant: 'outlined',
                    },
                    {
                        label: 'Khóa đã chọn',
                        onClick: guardAction(PERMISSIONS.USER.BAN, handleBulkBan),
                        variant: 'outlined',
                        color: 'error',
                        disabled: selectedRows.length === 0,
                        hidden: selectedRows.length === 0,
                    },
                    {
                        label: 'Tạo tài khoản',
                        onClick: guardAction(PERMISSIONS.USER.CREATE, () => setOpenCreateDialog(true)),
                        icon: <AddIcon />,
                        variant: 'contained',
                    },
                ]}
                tags={[{ label: `${totalCount || 0} Tổng` }]}
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
                onEdit={guardFn(PERMISSIONS.USER.UPDATE, handleEdit)}
                onDelete={guardFn(PERMISSIONS.USER.BAN, (row: UserResponse) => {
                    setConfirmBanDialog({
                        open: true,
                        userId: row.id,
                        username: row.username,
                    });
                })}
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
                <DialogTitle>Khóa tài khoản</DialogTitle>
                <DialogContent>
                    <Alert severity="warning">
                        Bạn có chắc muốn khóa tài khoản "{confirmBanDialog.username}"? Hành động này sẽ ngăn người dùng truy cập hệ thống.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmBanDialog({ open: false, userId: null, username: '' })}
                        disabled={operationLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleBanUser}
                        variant="contained"
                        color="error"
                        disabled={operationLoading}
                    >
                        {operationLoading ? 'Đang khóa...' : 'Khóa tài khoản'}
                    </Button>
                </DialogActions>
            </Dialog>

            <PermissionDeniedDialog {...permissionDialogProps} />
        </Box>
    );
}
