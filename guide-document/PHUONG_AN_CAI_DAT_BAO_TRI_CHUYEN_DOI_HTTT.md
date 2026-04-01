# PHƯƠNG ÁN CÀI ĐẶT, BẢO TRÌ VÀ CHUYỂN ĐỔI HTTT ERP

## 1. Mục đích tài liệu

Tài liệu này mô tả chi tiết:
1. Phương án cài đặt hệ thống ERP mới.
2. Phương án bảo trì, vận hành sau triển khai.
3. Phương án chuyển đổi từ hệ thống cũ sang hệ thống mới (nếu có).

Đối tượng sử dụng tài liệu:
- Nhóm triển khai kỹ thuật (DevOps, Backend, Frontend, DBA).
- Nhóm quản trị hệ thống tại đơn vị vận hành.
- Nhóm nghiệp vụ phối hợp nghiệm thu và chạy thật.

## 2. Tổng quan kiến trúc triển khai

Hệ thống ERP hiện tại gồm các thành phần chính:
- Frontend: Next.js (cổng truy cập người dùng).
- Backend: NestJS (API nghiệp vụ).
- Database: PostgreSQL.
- Cache: Redis.
- Công cụ quản trị DB: pgAdmin.

Hình minh họa chức năng tổng thể:

![Sơ đồ chức năng BFD](../../BFD.png)

Hình minh họa dữ liệu tổng quát:

![Sơ đồ dữ liệu ERD](../../ERD.png)

## 3. Phương án cài đặt hệ thống mới

### 3.1. Mô hình cài đặt đề xuất

Có 2 mô hình triển khai phù hợp:
1. Cài đặt on-premise: hạ tầng nội bộ doanh nghiệp.
2. Cài đặt cloud/private cloud: tách môi trường DEV/UAT/PROD rõ ràng.

Khuyến nghị tối thiểu:
- Tách riêng môi trường `DEV`, `UAT`, `PROD`.
- Database và Redis không đặt chung với frontend/backend ở môi trường PROD.
- Bật sao lưu tự động cho PostgreSQL.

### 3.2. Điều kiện tiên quyết

Máy chủ/VM cho từng môi trường cần:
- Node.js 20+.
- npm 10+.
- Docker + Docker Compose.
- Git.

Mạng và bảo mật:
- Mở cổng đúng phạm vi: frontend (4000), backend (3000), db/redis chỉ nội bộ.
- Cấu hình reverse proxy và TLS cho môi trường PROD.
- Lưu trữ biến môi trường bí mật bằng secret manager hoặc file bảo mật.

### 3.3. Cài đặt backend

Thư mục thao tác: `erp-backend`

Bước 1. Cài dependency:

```bash
npm install
```

Bước 2. Tạo file môi trường:

```bash
cp example.env .env
```

Windows PowerShell:

```powershell
Copy-Item example.env .env
```

Bước 3. Cấu hình `.env` chính:
- `PORT=3000`
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`
- `CORS_ORIGIN=http://localhost:4000`

Bước 4. Chạy hạ tầng DB/Redis/pgAdmin:

```bash
docker compose up -d
```

Bước 5. Chạy backend:

```bash
npm run start:dev
```

Kết quả mong đợi:
- API sẵn sàng tại `http://localhost:3000`.
- pgAdmin sẵn sàng tại `http://localhost:5050`.

### 3.4. Cài đặt frontend

Thư mục thao tác: `erp-frontend`

Bước 1. Cài dependency:

```bash
npm install
```

Bước 2. Tạo file môi trường frontend:

```bash
cp example.env.local .env.local
```

Windows PowerShell:

```powershell
Copy-Item example.env.local .env.local
```

Bước 3. Kiểm tra biến môi trường:
- `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
- `NEXT_PUBLIC_CREDENTIALS=true`

Bước 4. Chạy frontend:

```bash
npm run dev
```

Kết quả mong đợi:
- Frontend sẵn sàng tại `http://localhost:4000`.

### 3.5. Kiểm tra sau cài đặt (smoke test)

Checklist bắt buộc:
1. Truy cập trang đăng nhập frontend thành công.
2. Gọi API đăng nhập backend thành công.
3. Đăng nhập và chuyển portal thành công.
4. Kiểm tra một flow nghiệp vụ đại diện theo từng portal.
5. Kiểm tra ghi log backend, không có lỗi kết nối DB/Redis.

## 4. Phương án bảo trì hệ thống

### 4.1. Bảo trì định kỳ

Hàng ngày:
- Kiểm tra dung lượng ổ đĩa, RAM, CPU.
- Kiểm tra trạng thái process frontend/backend.
- Kiểm tra lỗi kết nối DB/Redis và số lượng lỗi 5xx.

Hàng tuần:
- Backup database đầy đủ (full backup).
- Dọn log cũ, kiểm tra log bất thường.
- Kiểm tra user không hoạt động lâu ngày.

Hàng tháng:
- Cập nhật bản vá bảo mật hệ điều hành.
- Rà soát dependency có lỗ hổng bảo mật.
- Kiểm thử khôi phục backup trên môi trường thử nghiệm.

### 4.2. Quản lý sao lưu và phục hồi

Chính sách đề xuất:
- Full backup mỗi ngày vào 23:00.
- Lưu trữ backup tối thiểu 14-30 ngày.
- Mã hóa file backup khi lưu ngoài máy chủ chính.

Quy trình khôi phục cơ bản:
1. Dừng ghi dữ liệu mới.
2. Khôi phục DB từ bản backup gần nhất.
3. Chạy script đối soát dữ liệu.
4. Mở lại hệ thống và theo dõi trong 2-4 giờ.

### 4.3. Giám sát và cảnh báo

Theo dõi các chỉ số:
- API latency trung bình và p95.
- Tỷ lệ lỗi 4xx/5xx.
- Số kết nối DB.
- Bộ nhớ Redis.
- Tốc độ tăng dung lượng log.

Ngưỡng cảnh báo gợi ý:
- CPU > 80% trong 10 phút.
- RAM > 85% trong 10 phút.
- API 5xx > 2% trong 5 phút.
- DB kết nối thất bại liên tục > 1 phút.

### 4.4. Quản lý thay đổi và nâng cấp

Quy trình chuẩn:
1. Triển khai trước trên DEV và UAT.
2. Nghiệm thu nghiệp vụ bởi key user.
3. Chốt lịch triển khai PROD ngoài giờ cao điểm.
4. Chuẩn bị gói rollback tương ứng phiên bản trước.
5. Theo dõi sau triển khai tối thiểu 24 giờ.

## 5. Phương án chuyển đổi từ hệ thống cũ sang hệ thống mới (nếu có)

## 5.1. Mục tiêu chuyển đổi

- Đảm bảo dữ liệu lịch sử quan trọng được kế thừa đầy đủ.
- Hạn chế gián đoạn vận hành nghiệp vụ.
- Đảm bảo người dùng có thể làm việc ngay trên hệ thống mới.

### 5.2. Chiến lược chuyển đổi đề xuất

Phương án khuyến nghị: chuyển đổi theo giai đoạn (phased migration).

Giai đoạn 1:
- Chuyển dữ liệu danh mục nền tảng (phòng ban, chức vụ, vai trò, quyền, danh mục sản phẩm).

Giai đoạn 2:
- Chuyển dữ liệu nghiệp vụ đang mở (nhân sự, đơn nghỉ phép, khách hàng, tồn kho).

Giai đoạn 3:
- Chuyển dữ liệu lịch sử cần tra cứu (đơn hàng, phiếu lương, lịch sử kho).

Trường hợp dữ liệu ít và tổ chức chấp nhận downtime, có thể dùng Big Bang cutover ngoài giờ.

### 5.3. Kế hoạch chuyển đổi dữ liệu

Bước 1. Khảo sát nguồn dữ liệu cũ:
- Xác định loại nguồn: DB, Excel, phần mềm cũ.
- Chốt danh sách bảng và trường cần chuyển.

Bước 2. Mapping dữ liệu:
- Lập bảng đối sánh `old_field -> new_field`.
- Xác định rule chuẩn hóa (mã hóa, định dạng ngày, trạng thái).

Bước 3. Làm sạch dữ liệu:
- Loại trùng, chuẩn hóa mã định danh.
- Đánh dấu dữ liệu thiếu bắt buộc để xử lý thủ công.

Bước 4. ETL thử nghiệm:
- Nạp dữ liệu vào môi trường UAT.
- Chạy đối soát tự động số lượng bản ghi.

Bước 5. Nghiệm thu dữ liệu:
- Key user kiểm tra mẫu dữ liệu theo nghiệp vụ.
- Chốt biên bản đạt trước khi cutover PROD.

### 5.4. Kịch bản cutover đề xuất

Mốc `T-14` đến `T-7`:
- Hoàn thành mapping và ETL thử nghiệm lần 1.

Mốc `T-6` đến `T-2`:
- ETL thử nghiệm lần cuối, kiểm thử tích hợp và UAT.

Mốc `T-1`:
- Khóa thay đổi cấu trúc dữ liệu nguồn.
- Sao lưu toàn bộ hệ thống cũ.

Mốc `T` (ngày chuyển đổi):
1. Tạm dừng nhập mới trên hệ thống cũ.
2. Trích xuất delta dữ liệu cuối.
3. Nạp dữ liệu vào hệ thống mới.
4. Chạy đối soát tự động + kiểm tra nhanh bởi key user.
5. Mở hệ thống mới cho người dùng.

Mốc `T+1` đến `T+7`:
- Hypercare: theo dõi sát lỗi, hỗ trợ người dùng và tinh chỉnh.

### 5.5. Phương án rollback

Khi phát sinh lỗi nghiêm trọng (mất dữ liệu, sai lệch lớn, không chạy nghiệp vụ cốt lõi):
1. Kích hoạt quyết định rollback theo quy trình incident.
2. Chuyển hướng người dùng về hệ thống cũ.
3. Phục hồi dữ liệu hệ thống cũ từ bản backup trước cutover.
4. Ghi nhận nguyên nhân gốc và lập kế hoạch cutover lại.

## 6. Hướng dẫn vận hành sau go-live

Checklist tuần đầu sau go-live:
1. Trực hỗ trợ nghiệp vụ theo khung giờ hành chính.
2. Theo dõi log lỗi theo thời gian thực.
3. Ưu tiên xử lý sự cố mức P1/P2.
4. Tổng hợp báo cáo lỗi cuối ngày và kế hoạch khắc phục.

Phân quyền hỗ trợ:
- Tuyến 1: IT nội bộ tiếp nhận ticket.
- Tuyến 2: Nhóm triển khai xử lý cấu hình và lỗi thao tác.
- Tuyến 3: Nhóm phát triển xử lý lỗi code, dữ liệu, hiệu năng.

## 7. Phụ lục

### 7.1. Danh mục cổng dịch vụ mặc định

- Frontend: `http://localhost:4000`
- Backend API: `http://localhost:3000`
- pgAdmin: `http://localhost:5050`

### 7.2. Rủi ro chính và biện pháp giảm thiểu

1. Rủi ro sai mapping dữ liệu:
- Biện pháp: chạy ETL thử nhiều vòng, đối soát tự động và thủ công.

2. Rủi ro gián đoạn dài khi cutover:
- Biện pháp: rehearsal cutover trước tối thiểu 1 lần.

3. Rủi ro người dùng chưa quen hệ thống mới:
- Biện pháp: đào tạo theo vai trò và tài liệu thao tác nhanh.
