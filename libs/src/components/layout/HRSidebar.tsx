'use client';

import { useState } from 'react';
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
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';

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

const menuItems: MenuItem[] = [
    {
        id: 'dashboards',
        label: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/hr',
    },
    {
        id: 'employees',
        label: 'Employees',
        icon: <PeopleIcon />,
        path: '/hr/employees',
    },
    {
        id: 'my-leaves',
        label: 'My Leaves',
        icon: <EventNoteIcon />,
        path: '/hr/my-leaves',
    },
    {
        id: 'leave-approvals',
        label: 'Leave Approvals',
        icon: <CheckCircleIcon />,
        path: '/hr/leave-approvals',
        badge: 5,
        badgeColor: 'warning',
    },
    {
        id: 'my-resignation',
        label: 'My Resignation',
        icon: <ExitToAppIcon />,
        path: '/hr/my-resignation',
    },
    {
        id: 'resignation-management',
        label: 'Resignations',
        icon: <AssignmentTurnedInIcon />,
        path: '/hr/resignations',
        badge: 2,
        badgeColor: 'info',
    },
    {
        id: 'payroll-list',
        label: 'Payroll',
        icon: <AttachMoneyIcon />,
        path: '/hr/payroll',
    },
    {
        id:'my-payslips',
        label: 'My Payslips',
        icon: <AttachMoneyIcon />,
        path: '/hr/my-payslips',
    },
    {
        id: 'reports',
        label: 'Reports & Analytics',
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

    const isActive = (path?: string) => {
        if (!path) return false;
        return pathname === path || pathname.startsWith(path + '/');
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
                        backgroundColor: active
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                            : 'transparent',
                        color: active ? 'white' : 'inherit',
                        borderLeft: active
                            ? `4px solid #00BCD4`
                            : '4px solid transparent',
                        '&:hover': {
                            backgroundColor: active
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
                        fontWeight: 800,
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        letterSpacing: 1,
                    }}
                >
                    HR PORTAL
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
