'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import { Box, Tabs, Tab, Alert, Snackbar } from '@mui/material';
import {
    Person as PersonIcon,
    Badge as BadgeIcon,
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay } from '@libs/src/components/common';
import { ProfileAccountTab, ProfileEmployeeTab } from '@libs/src/components/profile';
import { fetchUserById } from '@libs/src/features/user/user.slice';
import { 
    updateEmployee,
    updateEmployeePhoto,
    updateEmployeeCV,
} from '@libs/src/features/employee/employee.slice';
import { fetchDepartments } from '@libs/src/features/department/department.slice';
import { fetchPositions } from '@libs/src/features/position/position.slice';
import { checkAuth } from '@libs/src/features/auth/auth.slice';
import { Status } from '@libs/shared/enums/employee-status.enum';
import { Level } from '@libs/shared/enums/level.enum';
import { Gender } from '@libs/shared/enums/gender.enum';
import type { AttachmentResponse } from '@libs/shared/types/attachment.type';
import employeeService from '@libs/src/features/employee/employee.service';

interface EmployeeFormData {
    fullName: string;
    gender: Gender | '';
    dateOfBirth: string;
    nationality: string;
    phone: string;
    addressPermanent: string;
    addressCurrent: string;
    identityNumber: string;
    identityIssuedDate: string;
    identityIssuedPlace: string;
    departmentId: string;
    currentPositionId: string;
    level: Level | '';
    status: Status;
    dependentCount?: number;
}

export default function HRProfilePage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { currentUser, loading: userLoading } = useSelector((state: RootState) => state.user);
    const { operationLoading: employeeLoading } = useSelector((state: RootState) => state.employee);
    const { departments } = useSelector((state: RootState) => state.department);
    const { positions } = useSelector((state: RootState) => state.position);

    const [activeTab, setActiveTab] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<EmployeeFormData>({
        fullName: '',
        gender: '',
        dateOfBirth: '',
        nationality: '',
        phone: '',
        addressPermanent: '',
        addressCurrent: '',
        identityNumber: '',
        identityIssuedDate: '',
        identityIssuedPlace: '',
        departmentId: '',
        currentPositionId: '',
        level: '',
        status: Status.DRAFT,
        dependentCount: 0,
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });
    const [cvAttachment, setCvAttachment] = useState<AttachmentResponse | null>(null);
    const [photoAttachment, setPhotoAttachment] = useState<AttachmentResponse | null>(null);

    useEffect(() => {
        // Get user from auth (JWT token)
        const loadUserProfile = async () => {
            try {
                const result = await dispatch(checkAuth()).unwrap();
                if (result?.id) {
                    dispatch(fetchUserById(result.id));
                }
            } catch (error) {
                console.error('Failed to check auth:', error);
            }
        };

        loadUserProfile();
        dispatch(fetchDepartments({}));
        dispatch(fetchPositions({}));
    }, [dispatch]);

    // Load photo and CV when employee data is available
    useEffect(() => {
        const loadAttachments = async () => {
            if (currentUser?.employee?.id) {
                try {
                    const [photo, cv] = await Promise.all([
                        employeeService.getEmployeePhoto(currentUser.employee.id),
                        employeeService.getEmployeeCV(currentUser.employee.id)
                    ]);
                    setPhotoAttachment(photo);
                    setCvAttachment(cv);
                } catch (error) {
                    console.error('Failed to load attachments:', error);
                }
            }
        };

        loadAttachments();
    }, [currentUser?.employee?.id]);

    useEffect(() => {
        if (currentUser?.employee) {
            const employee = currentUser.employee;
            setFormData({
                fullName: employee.fullName || '',
                gender: employee.gender || '',
                dateOfBirth: employee.dateOfBirth
                    ? new Date(employee.dateOfBirth).toISOString().split('T')[0]
                    : '',
                nationality: employee.nationality || '',
                phone: employee.phone || '',
                addressPermanent: employee.addressPermanent || '',
                addressCurrent: employee.addressCurrent || '',
                identityNumber: employee.identityNumber || '',
                identityIssuedDate: employee.identityIssuedDate
                    ? new Date(employee.identityIssuedDate).toISOString().split('T')[0]
                    : '',
                identityIssuedPlace: employee.identityIssuedPlace || '',
                departmentId: employee.department?.id || '',
                currentPositionId: employee.currentPosition?.id || '',
                level: employee.level || '',
                status: employee.status || Status.DRAFT,
            });
        }
    }, [currentUser]);

    if (userLoading || !currentUser) {
        return <LoadingOverlay open={true} message="Loading profile..." />;
    }

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleFormChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (currentUser?.employee) {
            const employee = currentUser.employee;
            setFormData({
                fullName: employee.fullName || '',
                gender: employee.gender || '',
                dateOfBirth: employee.dateOfBirth
                    ? new Date(employee.dateOfBirth).toISOString().split('T')[0]
                    : '',
                nationality: employee.nationality || '',
                phone: employee.phone || '',
                addressPermanent: employee.addressPermanent || '',
                addressCurrent: employee.addressCurrent || '',
                identityNumber: employee.identityNumber || '',
                identityIssuedDate: employee.identityIssuedDate
                    ? new Date(employee.identityIssuedDate).toISOString().split('T')[0]
                    : '',
                identityIssuedPlace: employee.identityIssuedPlace || '',
                departmentId: employee.department?.id || '',
                currentPositionId: employee.currentPosition?.id || '',
                level: employee.level || '',
                status: employee.status || Status.DRAFT,
                dependentCount: employee.dependentCount ?? 0,
            });
        }
    };

    const handleSave = async () => {
        if (!currentUser?.employee?.id) return;

        try {
            await dispatch(
                updateEmployee({
                    id: currentUser.employee.id,
                    data: {
                        ...formData,
                        gender: formData.gender || undefined,
                        level: formData.level || undefined,
                        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
                        identityIssuedDate: formData.identityIssuedDate
                            ? new Date(formData.identityIssuedDate)
                            : undefined,
                        dependentCount: formData.dependentCount ?? 0,
                    },
                })
            ).unwrap();
            setSnackbar({
                open: true,
                message: 'Thông tin nhân viên đã được cập nhật thành công',
                severity: 'success',
            });
            setIsEditing(false);
            // Reload user data
            const result = await dispatch(checkAuth()).unwrap();
            if (result?.id) {
                dispatch(fetchUserById(result.id));
            }
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err || 'Không thể cập nhật thông tin nhân viên',
                severity: 'error',
            });
        }
    };

    const handlePhotoUpload = async (file: File) => {
        if (!currentUser?.employee?.id) return;

        try {
            await dispatch(updateEmployeePhoto({ id: currentUser.employee.id, photo: file })).unwrap();
            setSnackbar({
                open: true,
                message: 'Ảnh đại diện đã được cập nhật thành công',
                severity: 'success',
            });
            // Reload photo attachment to get updated URL
            const photo = await employeeService.getEmployeePhoto(currentUser.employee.id);
            setPhotoAttachment(photo);
            // Also reload user data
            const result = await dispatch(checkAuth()).unwrap();
            if (result?.id) {
                dispatch(fetchUserById(result.id));
            }
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err || 'Không thể cập nhật ảnh đại diện',
                severity: 'error',
            });
        }
    };

    const handleCVUpload = async (file: File) => {
        if (!currentUser?.employee?.id) return;

        try {
            await dispatch(updateEmployeeCV({ id: currentUser.employee.id, cv: file })).unwrap();
            setSnackbar({
                open: true,
                message: 'CV đã được cập nhật thành công',
                severity: 'success',
            });
            // Reload CV attachment
            const cv = await employeeService.getEmployeeCV(currentUser.employee.id);
            setCvAttachment(cv);
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err || 'Không thể cập nhật CV',
                severity: 'error',
            });
        }
    };

    return (
        <Box>
            <PageHeader
                title="Hồ sơ của tôi"
                subtitle="Xem và quản lý thông tin cá nhân"
                actions={
                    isEditing && activeTab === 1 && currentUser?.employee
                        ? [
                            {
                                label: 'Hủy',
                                onClick: handleCancel,
                                icon: <CancelIcon />,
                                variant: 'outlined',
                                disabled: employeeLoading,
                            },
                            {
                                label: 'Lưu',
                                onClick: handleSave,
                                icon: <SaveIcon />,
                                variant: 'contained',
                                disabled: employeeLoading,
                            },
                        ]
                        : [
                            ...(activeTab === 1 && currentUser?.employee
                                ? [
                                    {
                                        label: 'Chỉnh sửa',
                                        onClick: handleEdit,
                                        icon: <EditIcon />,
                                        variant: 'contained' as const,
                                    },
                                ]
                                : []),
                        ]
                }
            />

            {/* Tabs */}
            {currentUser.employee && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab icon={<PersonIcon />} label="Thông tin tài khoản" iconPosition="start" />
                        <Tab icon={<BadgeIcon />} label="Thông tin nhân viên" iconPosition="start" />
                    </Tabs>
                </Box>
            )}

            {/* Tab Content */}
            <Box>
                {activeTab === 0 ? (
                    <ProfileAccountTab user={currentUser} />
                ) : currentUser.employee ? (
                    <ProfileEmployeeTab
                        employee={currentUser.employee}
                        isEditing={isEditing}
                        formData={formData}
                        onFormChange={handleFormChange}
                        departments={departments}
                        positions={positions}
                        onPhotoUpload={handlePhotoUpload}
                        onCVUpload={handleCVUpload}
                        cvAttachment={cvAttachment}
                        photoAttachment={photoAttachment}
                    />
                ) : (
                    <Alert severity="info">
                        Thông tin nhân viên không khả dụng
                    </Alert>
                )}
            </Box>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
