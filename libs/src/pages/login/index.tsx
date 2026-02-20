"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@libs/src/store";
import { checkAuth, login } from "@libs/src/features/auth/auth.slice";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from 'next/navigation';
import { PORTAL_INFO, PORTAL_PERMISSION_VALUES } from '@libs/shared/constants/portal-permissions.constant';
import { fetchRoleByCode } from "@libs/src/features/role/role.slice";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ChangePasswordDialog from '@libs/src/components/profile/ChangePasswordDialog';

export default function LoginPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((s: RootState) => s.auth);
    const router = useRouter();
    const [showPassword, setShowPassword] = React.useState(false);
    const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // ❗ không reload page

        const formData = new FormData(event.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        try {
            // Login first
            await dispatch(login({ username, password })).unwrap();
            
            // Then check auth to get full user data
            const userData = await dispatch(checkAuth()).unwrap();
            
            // Get user's portal access permissions
            const role = await dispatch(fetchRoleByCode(userData.role)).unwrap();
            const userPermissions = role.permissions?.map((p: any) => p.permission_code) || [];
            const userPortalPermissions = userPermissions.filter((p: string) => 
                PORTAL_PERMISSION_VALUES.includes(p as any)
            );

            // Redirect based on portal permissions
            if (userPortalPermissions.length === 0) {
                // No portal access - show error or redirect to error page
                console.error('User has no portal access');
                return;
            } else if (userPortalPermissions.length === 1) {
                // Only one portal - redirect directly
                const portalInfo = PORTAL_INFO[userPortalPermissions[0]];
                if (portalInfo && portalInfo.available) {
                    router.push(portalInfo.path);
                }
            } else {
                // Multiple portals - redirect to selection page
                router.push('/portal-selection');
            }
        } catch (error) {
            // Error is handled by Redux
            console.error('Login failed:', error);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                // Bỏ container, style trực tiếp ở đây
                // Tăng chiều rộng và điều chỉnh padding
                width: '100%',
                maxWidth: '500px', 
                py: 4, // padding dọc
            }}
        >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
            </Avatar>

            <Typography component="h1" variant="h5">
                Đăng nhập
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Mã nhân viên / Tên người dùng"
                    name="username"
                    autoComplete="username"
                    autoFocus
                />

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Mật khẩu"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2, py: 1.5 }} // Tăng chiều cao nút
                >
                    {loading ? <CircularProgress size={24} /> : "Đăng nhập"}
                </Button>

                <Grid container justifyContent="flex-end">
                    <Grid>
                        <Link 
                            href="#" 
                            variant="body2"
                            onClick={(e) => {
                                e.preventDefault();
                                setForgotPasswordOpen(true);
                            }}
                            sx={{ cursor: 'pointer' }}
                        >
                            Quên mật khẩu?
                        </Link>
                    </Grid>
                </Grid>
            </Box>

            <ChangePasswordDialog
                open={forgotPasswordOpen}
                onClose={() => setForgotPasswordOpen(false)}
            />
        </Box>
    );
}
