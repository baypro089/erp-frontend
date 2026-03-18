'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Box,
    Typography,
    IconButton,
    Divider,
    useTheme,
    useMediaQuery,
    alpha,
    Chip,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    EventNote as EventNoteIcon,
    Assessment as AssessmentIcon,
    AttachMoney as AttachMoneyIcon,
    LocalHospital as LocalHospitalIcon,
    Announcement as AnnouncementIcon,
    ExpandLess,
    ExpandMore,
    ChevronLeft,
    ChevronRight,
    CalendarToday as CalendarTodayIcon,
    WorkHistory as WorkHistoryIcon,
    CheckCircle as CheckCircleIcon,
    ExitToApp as ExitToAppIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    Gavel as GavelIcon,
    AccountTree as AccountTreeIcon,
    BusinessCenter as BusinessCenterIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import leaveRequestService from '@libs/src/features/leave-request/leave-request.service';
import resignationRequestService from '@libs/src/features/resignation-request/resignation-request.service';
import terminationRequestService from '@libs/src/features/termination-request/termination-request.service';
import { LeaveRequestStatus } from '@libs/shared/enums/leave-request-status.enum';
import { ResignationStatus } from '@libs/shared/enums/resignation-status.enum';
import { TerminationStatus } from '@libs/shared/enums/termination-status.enum';

export interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path?: string;
    badge?: number;
    badgeColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    children?: MenuItem[];
}

interface HRSidebarProps {
    open: boolean;
    onClose?: () => void;
    width?: number;
    // collapsible?: boolean;
}

const DRAWER_WIDTH = 280;

const baseMenuItems: MenuItem[] = [
    {
        id: 'dashboards',
        label: 'Tổng quan',
        icon: <DashboardIcon />,
        path: '/hr',
    },
    {
        id: 'employees',
        label: 'Nhân viên',
        icon: <PeopleIcon />,
        path: '/hr/employees',
    },
    {
        id: 'leave-approvals',
        label: 'Duyệt đơn nghỉ',
        icon: <CheckCircleIcon />,
        path: '/hr/leave-approvals',
        badgeColor: 'warning',
    },
    {
        id: 'resignation-management',
        label: 'Đơn nghỉ việc',
        icon: <AssignmentTurnedInIcon />,
        path: '/hr/resignations',
        badgeColor: 'warning',
    },
    {
        id: 'termination-management',
        label: 'Yêu cầu sa thải',
        icon: <GavelIcon />,
        path: '/hr/terminations',
        badgeColor: 'warning',
    },
    {
        id: 'payroll-list',
        label: 'Bảng lương',
        icon: <AttachMoneyIcon />,
        path: '/hr/payroll',
    },
    {
        id: 'departments',
        label: 'Phòng ban',
        icon: <AccountTreeIcon />,
        path: '/hr/departments',
    },
    {
        id: 'positions',
        label: 'Chức vụ',
        icon: <BusinessCenterIcon />,
        path: '/hr/positions',
    },
    {
        id: 'reports',
        label: 'Báo cáo & Phân tích',
        icon: <AssessmentIcon />,
        path: '/hr/reports',
    },
];

export default function HRSidebar({
    open,
    onClose,
    width = DRAWER_WIDTH,
    // collapsible = true,
}: HRSidebarProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const pathname = usePathname();
    const router = useRouter();
    const [menuBadges, setMenuBadges] = useState<Record<string, number>>({});
    // Remove collapse state
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const drawerWidth = width;

    // Removed handleToggleCollapse

    const handleToggleExpand = (itemId: string) => {
        setExpandedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleNavigate = (path: string) => {
        router.push(path);
        if (isMobile && onClose) {
            onClose();
        }
    };

    useEffect(() => {
        let isCancelled = false;

        const loadMenuBadges = async () => {
            try {
                const [leaveResult, resignationResult, terminationResult] = await Promise.all([
                    leaveRequestService.getLeaveRequests(LeaveRequestStatus.PENDING, undefined, undefined, 1, 1),
                    resignationRequestService.getResignationRequests(ResignationStatus.PENDING, undefined, 1, 1),
                    terminationRequestService.getTerminationRequests(TerminationStatus.PENDING, undefined, 1, 1),
                ]);

                if (isCancelled) {
                    return;
                }

                setMenuBadges({
                    'leave-approvals': leaveResult.totalCount,
                    'resignation-management': resignationResult.totalCount,
                    'termination-management': terminationResult.totalCount,
                });
            } catch {
                if (!isCancelled) {
                    setMenuBadges({});
                }
            }
        };

        loadMenuBadges();

        return () => {
            isCancelled = true;
        };
    }, [pathname]);

    const menuItems = useMemo(
        () =>
            baseMenuItems.map((item) => ({
                ...item,
                badge: menuBadges[item.id],
            })),
        [menuBadges],
    );

    const isActive = (path?: string) => {
        if (!path) return false;

        // Exact match
        if (pathname === path) return true;

        // Check if current pathname is a child page (detail/edit/create)
        if (pathname.startsWith(path + '/')) {
            const remaining = pathname.slice(path.length + 1);
            const segments = remaining.split('/');
            const firstSegment = segments[0];

            // Only match if next segment is 'create', 'edit', 'detail', or looks like an ID
            // This prevents '/hr/employees' from matching when at '/hr/employees/leaves'
            const isDynamicSegment =
                ['create', 'edit', 'detail'].includes(firstSegment) ||
                /^[a-f0-9-]{36}$/.test(firstSegment) || // UUID
                /^\d+$/.test(firstSegment); // Numeric ID

            return isDynamicSegment;
        }

        return false;
    };

    const renderMenuItem = (item: MenuItem, level = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const expanded = expandedItems.includes(item.id);
        const active = isActive(item.path);

        return (
            <Box key={item.id}>
                <ListItemButton
                    onClick={() => {
                        if (hasChildren) {
                            handleToggleExpand(item.id);
                        } else if (item.path) {
                            handleNavigate(item.path);
                        }
                    }}
                    sx={{
                        pl: 2 + level * 2,
                        py: 1.5,
                        mb: 0.5,
                        mx: 1,
                        borderRadius: 2,
                        background: active
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                            : 'transparent',
                        color: active ? 'white' : 'inherit',
                        borderLeft: active
                            ? `4px solid #00BCD4`
                            : '4px solid transparent',
                        '&:hover': {
                            background: active
                                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                                : alpha(theme.palette.primary.main, 0.08),
                            transform: 'translateX(4px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: active ? '0 4px 12px rgba(13, 71, 161, 0.2)' : 'none',
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 40,
                            color: active ? 'white' : theme.palette.primary.main,
                            justifyContent: 'center',
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: active ? 700 : 500,
                        }}
                    />
                    {item.badge !== undefined && item.badge > 0 && (
                        <Chip
                            label={item.badge}
                            size="small"
                            color={item.badgeColor || 'primary'}
                            sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                minWidth: 20,
                            }}
                        />
                    )}
                    {hasChildren && (expanded ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
                {hasChildren && (
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.children?.map((child) => renderMenuItem(child, level + 1))}
                        </List>
                    </Collapse>
                )}
            </Box>
        );
    };

    const drawerContent = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${theme.palette.background.paper} 100%)`,
            }}
        >
            {/* HR Branded Header */}
            <Box
                sx={{
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    background: `linear-gradient(135deg, #0D47A1 0%, #1976D2 50%, #0288D1 100%)`,
                    borderBottom: `3px solid #00BCD4`,
                }}
            >
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: alpha(theme.palette.common.white, 0.2),
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                >
                    <PeopleIcon sx={{ fontSize: 40, color: '#00BCD4' }} />
                </Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 500,
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        letterSpacing: 1,
                    }}
                >
                    HUMAN RESOURCES
                </Typography>
                <Chip
                    label="People First"
                    size="small"
                    sx={{
                        backgroundColor: '#00BCD4',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                    }}
                />
            </Box>

            <Divider />

            {/* Menu Items */}
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <List sx={{ pt: 2 }}>
                    {menuItems.map((item) => renderMenuItem(item))}
                </List>
            </Box>

            <Divider />
            <Box
                sx={{
                    p: 2,
                    background: alpha(theme.palette.primary.main, 0.05),
                }}
            >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    © 2026 ERP System
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                    Human Resources
                </Typography>
            </Box>
        </Box>
    );

    // Height of the header (AppBar) is usually 64px on desktop, 56px on mobile
    const HEADER_HEIGHT = 64;
    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={isMobile ? open : true}
            onClose={onClose}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    top: `${HEADER_HEIGHT}px`,
                    height: `calc(100% - ${HEADER_HEIGHT}px)`
                },
            }}
            ModalProps={{
                keepMounted: true, // Better mobile performance
            }}
        >
            {drawerContent}
        </Drawer>
    );
}
