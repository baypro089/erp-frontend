"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@libs/src/store";
import { login } from "@libs/src/features/auth/auth.slice";
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

export default function LoginPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((s: RootState) => s.auth);
    const router = useRouter();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // ❗ không reload page

        const formData = new FormData(event.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        dispatch(login({ username, password }))
            .unwrap()
            .then(() => router.push("/"));
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
                    type="password"
                    id="password"
                    autoComplete="current-password"
                />

                <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    label="Ghi nhớ đăng nhập"
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
                        <Link href="#" variant="body2">
                            Quên mật khẩu?
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
