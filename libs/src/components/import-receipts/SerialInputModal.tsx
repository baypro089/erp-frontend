'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Close as CloseIcon,
  QrCodeScanner as ScannerIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface SerialInputModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (serials: string[]) => void;
  requiredQuantity: number;
  productName: string;
  initialSerials?: string[];
}

export default function SerialInputModal({
  open,
  onClose,
  onConfirm,
  requiredQuantity,
  productName,
  initialSerials = [],
}: SerialInputModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [serials, setSerials] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSerials(initialSerials);
      setInputValue('');
      setDuplicates([]);
    }
  }, [open, initialSerials]);

  // Parse serials from input (split by newlines)
  const parseSerials = (text: string): string[] => {
    return text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  // Handle input change and detect duplicates in real-time
  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    const parsedSerials = parseSerials(text);
    const existingSerials = new Set(serials);
    const newDuplicates: string[] = [];
    const serialCounts = new Map<string, number>();

    // Check for duplicates within the input
    parsedSerials.forEach((serial) => {
      const count = serialCounts.get(serial) || 0;
      serialCounts.set(serial, count + 1);
      
      if (count > 0 || existingSerials.has(serial)) {
        newDuplicates.push(serial);
      }
    });

    setDuplicates(newDuplicates);
  };

  // Add serials from input
  const handleAddSerials = () => {
    const parsedSerials = parseSerials(inputValue);
    
    // Filter out duplicates
    const uniqueNewSerials = parsedSerials.filter((serial) => {
      return !serials.includes(serial);
    });

    // Check if we would exceed the required quantity
    const totalCount = serials.length + uniqueNewSerials.length;
    const serialsToAdd = totalCount > requiredQuantity
      ? uniqueNewSerials.slice(0, requiredQuantity - serials.length)
      : uniqueNewSerials;

    setSerials([...serials, ...serialsToAdd]);
    setInputValue('');
    setDuplicates([]);
  };

  // Remove a serial
  const handleRemoveSerial = (index: number) => {
    const newSerials = serials.filter((_, i) => i !== index);
    setSerials(newSerials);
  };

  // Handle confirm
  const handleConfirm = () => {
    if (serials.length === requiredQuantity) {
      onConfirm(serials);
      onClose();
    }
  };

  const isComplete = serials.length === requiredQuantity;
  const isOverLimit = serials.length > requiredQuantity;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: '600px' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScannerIcon color="primary" />
          <Box>
            <Typography variant="h6" component="div">
              Nhập Serial Number
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {productName}
            </Typography>
          </Box>
        </Box>
        <IconButton edge="end" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Serial count indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" fontWeight={500}>
              Số lượng Serial:
            </Typography>
            <Chip
              icon={isComplete ? <CheckCircleIcon /> : <WarningIcon />}
              label={`${serials.length} / ${requiredQuantity}`}
              color={isComplete ? 'success' : isOverLimit ? 'error' : 'warning'}
              size="small"
            />
          </Box>

          {/* Instructions */}
          <Alert severity="info" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Hướng dẫn quét mã:</strong>
            </Typography>
            <Typography variant="body2" component="div">
              • Đặt con trỏ vào ô nhập liệu bên dưới
              <br />
              • Sử dụng máy quét mã vạch để quét liên tục
              <br />
              • Mỗi mã sẽ tự động xuống dòng sau khi quét
              <br />• Sau khi quét xong, bấm nút "Thêm Serial"
            </Typography>
          </Alert>

          {/* Duplicate warning */}
          {duplicates.length > 0 && (
            <Alert severity="error">
              <Typography variant="body2" fontWeight={500}>
                Phát hiện mã trùng lặp: {duplicates.join(', ')}
              </Typography>
            </Alert>
          )}

          {/* Input area for scanning */}
          <Box>
            <TextField
              label="Nhập hoặc quét Serial Numbers"
              multiline
              rows={6}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              fullWidth
              placeholder="Quét mã vạch hoặc nhập thủ công (mỗi mã một dòng)..."
              helperText={`${parseSerials(inputValue).length} mã đã nhập`}
            />
            <Button
              variant="outlined"
              onClick={handleAddSerials}
              disabled={parseSerials(inputValue).length === 0 || duplicates.length > 0}
              sx={{ mt: 1 }}
              fullWidth
            >
              Thêm Serial
            </Button>
          </Box>

          {/* List of added serials */}
          {serials.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Danh sách Serial đã thêm:
              </Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflowY: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <List dense>
                  {serials.map((serial, index) => (
                    <ListItem key={index} divider={index < serials.length - 1}>
                      <ListItemText
                        primary={`${index + 1}. ${serial}`}
                        primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" size="small" onClick={() => handleRemoveSerial(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!isComplete}
          color={isComplete ? 'success' : 'inherit'}
          startIcon={isComplete ? <CheckCircleIcon /> : <WarningIcon />}
        >
          {isComplete ? 'Xác nhận' : `Còn thiếu ${requiredQuantity - serials.length} mã`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
