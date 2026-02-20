'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  QrCode as QrCodeIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useState } from 'react';

interface SerialListModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  serials: string[];
}

export default function SerialListModal({
  open,
  onClose,
  productName,
  serials,
}: SerialListModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter serials based on search
  const filteredSerials = serials.filter((serial) =>
    serial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Copy to clipboard
  const handleCopyAll = () => {
    navigator.clipboard.writeText(serials.join('\n'));
  };

  const handleCopySerial = (serial: string) => {
    navigator.clipboard.writeText(serial);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCodeIcon color="primary" />
          <Box>
            <Typography variant="h6" component="div">
              Danh sách Serial Number
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
          {/* Header info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={`Tổng: ${serials.length} serial`}
              color="primary"
              size="small"
            />
            <Button
              size="small"
              startIcon={<CopyIcon />}
              onClick={handleCopyAll}
              variant="outlined"
            >
              Copy tất cả
            </Button>
          </Box>

          {/* Search */}
          <TextField
            placeholder="Tìm kiếm serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {/* Serials list */}
          <Box
            sx={{
              maxHeight: 400,
              overflowY: 'auto',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            {filteredSerials.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? 'Không tìm thấy serial phù hợp' : 'Không có serial nào'}
                </Typography>
              </Box>
            ) : (
              <List dense>
                {filteredSerials.map((serial, index) => (
                  <ListItem
                    key={index}
                    divider={index < filteredSerials.length - 1}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleCopySerial(serial)}
                        title="Copy"
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={index + 1} size="small" sx={{ minWidth: 40 }} />
                          <Typography
                            variant="body2"
                            fontFamily="monospace"
                            fontWeight={500}
                          >
                            {serial}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {searchQuery && (
            <Typography variant="caption" color="text.secondary">
              Hiển thị {filteredSerials.length} / {serials.length} serial
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
