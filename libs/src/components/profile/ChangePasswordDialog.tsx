'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Stack,
  Typography,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Email as EmailIcon,
  VpnKey,
} from '@mui/icons-material';
import { authService } from '@libs/src/features/auth/auth.service';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string; // Make optional for forgot password flow
}

export default function ChangePasswordDialog({
  open,
  onClose,
  userEmail: initialEmail,
}: ChangePasswordDialogProps) {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: initialEmail || '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestOTP = async () => {
    if (!formData.email) {
      setError('Vui lòng nhập địa chỉ email của bạn');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const result = await authService.forgotPassword(formData.email);
      setSuccess(result.message || 'OTP sent to your email successfully');
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // Validation
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 chữ số hợp lệ');
      return;
    }
    
    if (!formData.newPassword || formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await authService.resetPassword(
        formData.email,
        formData.otp,
        formData.newPassword
      );
      setSuccess(result.message || 'Password changed successfully');
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('request');
    setFormData({ email: initialEmail || '', otp: '', newPassword: '', confirmPassword: '' });
    setError(null);
    setSuccess(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Lock color="primary" />
          <Typography variant="h6">
            Đổi mật khẩu
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box mt={2}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Email Input/Display */}
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!initialEmail || step === 'verify'}
              required
              fullWidth
              type="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="Mã OTP sẽ được gửi đến email này"
            />

            {step === 'request' && (
              <Alert severity="info">
                Nhấn "Gửi OTP" để nhận mã xác thực qua email. Mã sẽ hết hạn sau 5 phút.
              </Alert>
            )}

            {step === 'verify' && (
              <>
                <TextField
                  label="Mã OTP"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setFormData({ ...formData, otp: value });
                  }}
                  required
                  fullWidth
                  placeholder="Nhập mã OTP 6 chữ số"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKey color="action" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Nhập mã 6 chữ số đã gửi đến email"
                />

                <TextField
                  label="Mật khẩu mới"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText="Tối thiểu 6 ký tự"
                />

                <TextField
                  label="Xác nhận mật khẩu mới"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText="Nhập lại mật khẩu mới"
                />
              </>
            )}
          </Stack>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
            Hủy
        </Button>
        {step === 'request' ? (
          <Button
            variant="contained"
            onClick={handleRequestOTP}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Đang gửi...' : 'Gửi OTP'}
          </Button>
        ) : (
          <>
            <Button
              onClick={() => {
                setStep('request');
                setFormData({ ...formData, otp: '', newPassword: '', confirmPassword: '' });
                setError(null);
                setSuccess(null);
              }}
              disabled={loading}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              onClick={handleResetPassword}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
