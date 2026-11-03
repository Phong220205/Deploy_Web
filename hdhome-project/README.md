# HDHOME Project Management System

Website quản lý dự án và giới thiệu năng lực cho **Công ty TNHH Thiết kế và Xây dựng HDHOME**.

Đây là dự án full-stack phục vụ báo cáo thực tập ngành Công nghệ Thông tin. Hệ thống gồm website công khai và khu vực quản lý nội bộ có đăng nhập, phân quyền, REST API, MySQL và upload file thật trên máy local.

> Tất cả tên người, số điện thoại, email, giá trị hợp đồng và dữ liệu vận hành trong seed là **thông tin minh họa**. Dự án không tự công bố mã số thuế, giấy phép, doanh thu hoặc dữ liệu pháp lý chưa được cung cấp.

## 1. Công nghệ

### Frontend

- React 19 + Vite + TypeScript
- React Router
- Axios
- Lucide React
- Recharts
- CSS responsive thuần, không phụ thuộc framework UI

### Backend

- Node.js + Express.js
- MySQL + `mysql2`
- JWT Authentication
- bcrypt
- Multer
- Helmet, CORS, rate limit login

## 2. Cấu trúc

```text
hdhome-project/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/common/
│   │   ├── contexts/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   └── public/
│   │   ├── routes/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── tests/
│   ├── uploads/projects/
│   ├── server.js
│   └── package.json
├── docs/
│   ├── api.md
│   ├── database.md
│   └── testing.md
├── README.md
└── TESTING.md
```

## 3. Yêu cầu môi trường

- Node.js 20 trở lên
- npm 10 trở lên
- MySQL 8 trở lên
- Trình duyệt hiện đại

## 4. Tạo database MySQL

### Cách 1: Dòng lệnh

Từ thư mục `hdhome-project`:

```bash
mysql --default-character-set=utf8mb4 -u root -p < backend/database/schema.sql
mysql --default-character-set=utf8mb4 -u root -p hdhome_management < backend/database/seed.sql
```

Luôn giữ tùy chọn `--default-character-set=utf8mb4` khi nhập dữ liệu để tiếng Việt không bị lỗi bảng mã.

### Cách 2: MySQL Workbench

1. Mở `backend/database/schema.sql` và chạy toàn bộ.
2. Mở `backend/database/seed.sql` và chạy toàn bộ.
3. Kiểm tra database `hdhome_management` có đủ các bảng.

`schema.sql` có lệnh tạo database, khóa ngoại, unique constraint, check constraint và index. Seed có đủ tối thiểu 3 roles, 3 users, 6 projects, 6 customers, 5 investors, 10 employees, 10 materials, 5 contracts và 10 progress updates.

## 5. Cấu hình backend

```bash
cd backend
copy .env.example .env
```

Chỉnh `.env` theo MySQL trên máy:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
DB_NAME=hdhome_management

JWT_SECRET=thay_bang_chuoi_bi_mat_dai_va_ngau_nhien
JWT_EXPIRES_IN=1d

UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

Không đưa file `.env` lên Git.

## 6. Cấu hình frontend

```bash
cd frontend
copy .env.example .env
```

Giá trị mặc định:

```env
VITE_API_URL=http://localhost:5000/api
```

### Dùng MySQL trên cloud (Aiven / RDS)

Hệ thống chạy được với MySQL bất kỳ, kể cả instance free-tier. Copy file mẫu rồi điền thông số:

```bash
copy .env.import.example .env.import
```

```env
DB_HOST=<host>.aivencloud.com
DB_PORT=26855
DB_USER=avnadmin
DB_PASSWORD=<password>
DB_NAME=defaultdb
DB_SSL=true
```

> `.env.import` chứa mật khẩu thật và **đã được `.gitignore` loại trừ** — không được commit.

Import schema + seed vào database:

```bash
node scripts/import-db.js .env.import
```

Script dùng `CREATE TABLE IF NOT EXISTS` và `ON DUPLICATE KEY UPDATE` nên chạy lại nhiều lần vẫn an toàn.

## 7. Cài đặt

Terminal 1:

```bash
cd backend
npm install
```

Terminal 2:

```bash
cd frontend
npm install
```

## 8. Chạy dự án

### Chạy nhanh trên máy Windows hiện tại

MariaDB riêng của HDHOME đã được khởi tạo trong `.mariadb` trên cổng `3307`. Sau khi khởi động lại máy, có thể mở PowerShell tại thư mục project và chạy:

```powershell
.\start-hdhome.ps1
```

Script sẽ khởi động MariaDB, backend và frontend nếu các dịch vụ chưa chạy.

### Chạy từng phần

Terminal 1 — backend:

```bash
cd backend
npm run dev
```

Terminal 2 — frontend:

```bash
cd frontend
npm run dev
```

Truy cập:

- Website: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

Backend vẫn khởi động và báo cảnh báo rõ ràng nếu MySQL chưa sẵn sàng, nhưng các API dữ liệu chỉ hoạt động sau khi import schema/seed và cấu hình `.env` đúng.

## 9. Tài khoản demo

| Vai trò | Username | Password |
|---|---|---|
| ADMIN | `admin` | `Admin@123` |
| PROJECT_MANAGER | `projectmanager` | `Manager@123` |
| TECHNICAL_STAFF | `technical` | `Technical@123` |

Mật khẩu trong `seed.sql` là bcrypt hash, không lưu plain text. Tài khoản `technical` được liên kết với hồ sơ nhân sự `NV010` và chỉ thấy các dự án được seed phân công.

## 10. Chức năng

### Website công khai

- Trang chủ theo phong cách kiến trúc – xây dựng
- Giới thiệu công ty, lĩnh vực và quy trình làm việc
- Trang dịch vụ
- Dự án tiêu biểu lấy từ MySQL qua API
- Tìm kiếm, lọc trạng thái, pagination dự án công khai
- Chi tiết dự án chỉ hiển thị dữ liệu được phép công khai
- Form liên hệ lưu vào `contact_requests`
- Responsive cho desktop, tablet và mobile

### Quản lý nội bộ

- Đăng nhập JWT, show/hide password, loading và lỗi
- Dashboard với card thống kê, biểu đồ trạng thái, dự án gần đây
- CRUD dự án, tìm kiếm API, filter, pagination
- Form thêm/sửa dự án và validation ngày/tiến độ
- Chi tiết dự án theo tabs: tổng quan, tiến độ, nhân sự, vật tư, hợp đồng, bản vẽ, hình ảnh
- Timeline tiến độ không ghi đè lịch sử
- Phân công nhân sự, chống trùng cùng vai trò
- Vật tư theo dự án
- Upload PDF/JPG/JPEG/PNG tối đa 10 MB
- Upload nhiều hình ảnh và gallery preview
- CRUD khách hàng, chủ đầu tư, hợp đồng, nhân sự, vật tư
- Quản lý yêu cầu liên hệ
- Quản lý user: tạo, sửa, khóa/mở, gán role, reset password
- Quản lý role, bảo vệ 3 role mặc định
- Modal xác nhận trước thao tác xóa
- Toast cho thao tác thành công/thất bại
- Loading, error và empty state cho các API call
- Sidebar desktop và drawer mobile

## 11. Phân quyền

### ADMIN

Toàn quyền trên dashboard, dự án, khách hàng, chủ đầu tư, hợp đồng, nhân sự, vật tư, file, hình ảnh, tiến độ, liên hệ, người dùng và vai trò.

### PROJECT_MANAGER

Quản lý nghiệp vụ dự án, khách hàng, chủ đầu tư, hợp đồng, nhân sự, phân công, vật tư, file, hình ảnh và tiến độ. Không truy cập quản lý user/role cấp cao.

### TECHNICAL_STAFF

Chỉ xem dự án được phân công, xem chi tiết, upload bản vẽ/hình ảnh, cập nhật và xem lịch sử tiến độ. Không tạo/xóa dự án, không quản lý hợp đồng, user hoặc role.

Frontend ẩn route/menu không phù hợp; backend luôn là nơi quyết định quyền cuối cùng.

## 12. API chính

- Auth: `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`
- Public: `/api/public/projects`, `/api/public/contacts`
- Dashboard: `/api/dashboard/summary`
- CRUD: `/api/projects`, `/api/customers`, `/api/investors`, `/api/employees`, `/api/materials`, `/api/contracts`
- Project assignments: `/api/projects/:id/employees`
- Project materials: `/api/projects/:id/materials`
- Progress: `/api/projects/:id/progress`
- Files: `/api/projects/:id/files`
- Images: `/api/projects/:id/images`
- Admin: `/api/users`, `/api/roles`, `/api/contacts`

Chi tiết request/response tại [`docs/api.md`](docs/api.md).

## 13. Kiểm tra

Backend:

```bash
cd backend
npm test
npm run check
```

Smoke test toàn diện (cần backend đang chạy ở `localhost:5000`):

```powershell
cd backend
powershell -File scripts\smoke-test.ps1
```

Frontend production build:

```bash
cd frontend
npm run build
```

Test cases tích hợp và hướng dẫn responsive nằm tại [`TESTING.md`](TESTING.md).

## 14. Upload

File vật lý được lưu tại:

```text
backend/uploads/projects/{projectId}/
```

MySQL chỉ lưu metadata và `file_path`. Backend kiểm tra MIME type, kích thước và tạo tên file an toàn.

## 15. Gợi ý chụp ảnh báo cáo

1. Import seed và chạy cả hai server.
2. Chụp các trang công khai tại `/`, `/about`, `/services`, `/projects`, `/contact`, `/login`.
3. Đăng nhập `admin` để chụp dashboard và các module quản lý.
4. Mở dự án `A01` và lần lượt chọn các tabs tiến độ, nhân sự, vật tư, hợp đồng, bản vẽ, hình ảnh.
5. Mở form thêm/sửa dự án và modal phân công nhân sự.
6. Đăng nhập `technical` để minh họa việc menu và dữ liệu bị giới hạn theo role.

## 16. Lỗi thường gặp

- `ECONNREFUSED 3306`: MySQL chưa chạy hoặc cấu hình `.env` sai.
- `Access denied for user`: sai `DB_USER`/`DB_PASSWORD`.
- `ENOTFOUND <host>.aivencloud.com`: service Aiven đang `Powered off` hoặc đã đổi host — vào console Aiven kiểm tra lại Host/Port.
- `Data truncated for column 'status'`: giá trị `status` gửi lên không nằm trong ENUM của bảng. Giá trị hợp lệ được khai báo tại `backend/src/validators/common.js` (`STATUS_ENUMS`) và `backend/database/schema.sql` — hai nơi này phải khớp nhau.
- Frontend báo không kết nối máy chủ: backend chưa chạy ở cổng 5000 hoặc `VITE_API_URL` sai.
- Token hết hạn: đăng xuất và đăng nhập lại.
- Upload thất bại: kiểm tra định dạng, dung lượng dưới 10 MB và quyền ghi thư mục `backend/uploads`.
