import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

interface TerminationGuideDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function TerminationGuideDialog({
  open,
  onClose,
}: TerminationGuideDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Hướng dẫn và quy trình sa thải</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={700}>
            Mục tiêu
          </Typography>
          <Typography variant="body2">
            Chức năng quản lý sa thải dùng để theo dõi, duyệt và phục hồi các yêu cầu đã được tạo từ
            trang chi tiết nhân viên.
          </Typography>

          <Typography variant="subtitle1" fontWeight={700}>
            Quy trình chuẩn
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Bước 1: Vào trang chi tiết nhân viên và bấm nút Sa thải"
                secondary="Thông tin nhân viên đã được khóa sẵn, chỉ cần nhập ngày sa thải và lý do."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Bước 2: Tạo yêu cầu và chờ HR duyệt"
                secondary="Yêu cầu mới ở trạng thái PENDING và xuất hiện trong danh sách quản lý sa thải."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Bước 3: HR duyệt hoặc từ chối"
                secondary="Khi duyệt thành công, hệ thống cập nhật trạng thái nhân viên và tạo bảng lương quyết toán."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Bước 4: Cập nhật nghĩa vụ bàn giao"
                secondary="Chỉ áp dụng khi yêu cầu đã APPROVED, cần xác nhận trước khi đổi trạng thái."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Bước 5: Restore nếu cần"
                secondary="Restore thường yêu cầu đã bàn giao; force restore bắt buộc nhập lý do."
              />
            </ListItem>
          </List>

          <Typography variant="subtitle1" fontWeight={700}>
            Lưu ý nghiệp vụ
          </Typography>
          <Typography variant="body2">
            Mỗi nhân viên không được có nhiều hơn một yêu cầu sa thải ở trạng thái PENDING tại cùng thời điểm.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đã hiểu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
