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
        path: '/hr/dashboards',
    },
    {
        id: 'employees',
        label: 'Employees Management',
        icon: <PeopleIcon />,
        path: '/hr/employees',
    },
    {
        id: 'my-leaves',
        label: 'My Leaves',
        icon: <EventNoteIcon />,
        path: '/hr/leaves',
    },
    {
        id: 'leave-approvals',
        label: 'Leave Approvals',
        icon: <CheckCircleIcon />,
        path: '/hr/leave-approvals',
    },
    {
        id: 'my-resignation',
        label: 'My Resignation',
        icon: <ExitToAppIcon />,
        path: '/hr/my-resignation',
    },
    {
        id: 'resignation-management',
        label: 'Resignation Management',
        icon: <AssignmentTurnedInIcon />,
        path: '/hr/resignations',
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
        label: 'Reports & Statistics',
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
                        backgroundColor: active
                            ? theme.palette.primary.main + '20'
                            : 'transparent',
                        borderLeft: active
                            ? `3px solid ${theme.palette.primary.main}`
                            : '3px solid transparent',
                        '&:hover': {
                            backgroundColor: active
                                ? theme.palette.primary.main + '30'
                                : theme.palette.action.hover,
                        },
                        transition: 'all 0.2s',
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 40,
                            color: active ? theme.palette.primary.main : 'inherit',
                            justifyContent: 'center',
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: active ? 600 : 400,
                            color: active ? theme.palette.primary.main : 'inherit',
                        }}
                    />
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
                backgroundColor: theme.palette.background.paper,
            }}
        >

            <Divider />

            {/* Menu Items */}
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <List sx={{ pt: 2 }}>
                    {menuItems.map((item) => renderMenuItem(item))}
                </List>
            </Box>

            <Divider />
            <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                    © 2026 ERP System - HR Module
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
