-- HDHOME Seed Data
-- Idempotent: chạy lại nhiều lần không tạo dữ liệu trùng.
-- Tài khoản demo (bcrypt cost 10):
--   admin/Admin@123, projectmanager/Manager@123, technical/Technical@123

SET NAMES utf8mb4;

-- ============================================================
-- Roles
-- ============================================================
INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES
  (1, 'ADMIN', 'Quản trị viên hệ thống - toàn quyền'),
  (2, 'PROJECT_MANAGER', 'Quản lý dự án - CRUD projects/contracts/...'),
  (3, 'TECHNICAL_STAFF', 'Nhân viên kỹ thuật - chỉ dự án được phân công')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ============================================================
-- Customers
-- ============================================================
INSERT INTO `customers` (`customer_id`, `full_name`, `phone`, `email`, `address`, `note`) VALUES
  (1, 'Nguyễn Văn An', '0901111111', 'an.nguyen@example.com', 'Thanh Khê, Đà Nẵng', 'Khách hàng demo'),
  (2, 'Trần Thị Bình', '0902222222', 'binh.tran@example.com', 'Hải Châu, Đà Nẵng', 'Khách hàng demo'),
  (3, 'Lê Quang Cường', '0903333333', 'cuong.le@example.com', 'Ngũ Hành Sơn, Đà Nẵng', 'Khách hàng demo'),
  (4, 'Phạm Thu Hà', '0904444444', 'ha.pham@example.com', 'Sơn Trà, Đà Nẵng', 'Khách hàng demo'),
  (5, 'Võ Đức Duy', '0905555555', 'duy.vo@example.com', 'Liên Chiểu, Đà Nẵng', 'Khách hàng demo'),
  (6, 'Đặng Minh Giang', '0906666666', 'giang.dang@example.com', 'Cẩm Lệ, Đà Nẵng', 'Khách hàng demo')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), email = VALUES(email), address = VALUES(address);

-- ============================================================
-- Investors
-- ============================================================
INSERT INTO `investors` (`investor_id`, `full_name`, `organization`, `phone`, `email`, `address`, `note`) VALUES
  (1, 'Ngô Thanh Hà', 'Công ty CP Đầu tư Hà Hải', '0911111111', 'ha.ngo@example.com', 'Đà Nẵng', 'Chủ đầu tư demo'),
  (2, 'Bùi Đức Huy', 'Tập đoàn Huy Phát', '0912222222', 'huy.bui@example.com', 'Quảng Nam', 'Chủ đầu tư demo'),
  (3, 'Trương Thu Hà', 'Công ty TNHH Minh Hà', '0913333333', 'minhha@example.com', 'Huế', 'Chủ đầu tư demo'),
  (4, 'Hoàng Văn Kiên', 'Công ty CP Kiên Hưng', '0914444444', 'kien.hoang@example.com', 'Đà Nẵng', 'Chủ đầu tư demo'),
  (5, 'Phan Thị Lan', 'Công ty TNHH Lan Phát', '0915555555', 'lan.phan@example.com', 'Đà Nẵng', 'Chủ đầu tư demo')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), organization = VALUES(organization), phone = VALUES(phone), email = VALUES(email);

-- ============================================================
-- Employees
-- ============================================================
INSERT INTO `employees` (`employee_id`, `employee_code`, `full_name`, `position`, `department`, `phone`, `email`, `status`) VALUES
  (1, 'NV001', 'Nguyễn Văn An', 'Giám đốc dự án', 'Quản lý', '0921111111', 'an.nv@example.com', 'ACTIVE'),
  (2, 'NV002', 'Trần Thị Bình', 'Quản lý dự án', 'Quản lý dự án', '0922222222', 'binh.tt@example.com', 'ACTIVE'),
  (3, 'NV003', 'Lê Quang Cường', 'Kiến trúc sư', 'Thiết kế', '0923333333', 'cuong.lq@example.com', 'ACTIVE'),
  (4, 'NV004', 'Phạm Thu Hà', 'Thiết kế nội thất', 'Thiết kế', '0924444444', 'ha.pt@example.com', 'ACTIVE'),
  (5, 'NV005', 'Hoàng Văn Kiên', 'Kỹ sư xây dựng', 'Thiết kế', '0925555555', 'kien.hv@example.com', 'ACTIVE'),
  (6, 'NV006', 'Võ Đức Duy', 'Kỹ sư điện nước', 'Kỹ thuật', '0926666666', 'duy.vd@example.com', 'ACTIVE'),
  (7, 'NV007', 'Đặng Minh Giang', 'Giám sát công trình', 'Thi công', '0927777777', 'giang.dm@example.com', 'ACTIVE'),
  (8, 'NV008', 'Bùi Đức Huy', 'Nhân viên vật tư', 'Vật tư', '0928888888', 'huy.bd@example.com', 'ACTIVE'),
  (9, 'NV009', 'Phan Thị Lan', 'Kế toán hợp đồng', 'Tài chính', '0929999999', 'lan.pt@example.com', 'ACTIVE'),
  (10, 'NV010', 'Nguyễn Kỹ Thuật', 'Kỹ thuật hiện trường', 'Kỹ thuật', '0930000000', 'technical@hdhome.local', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), position = VALUES(position), department = VALUES(department), phone = VALUES(phone), email = VALUES(email), status = VALUES(status);

-- ============================================================
-- Users
-- ============================================================
-- admin / Admin@123
INSERT INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `phone`, `employee_id`, `role_id`, `status`) VALUES
  (1, 'admin', '$2b$10$dWGUPjgADyEgcZjOj.HaOe.ml/7eC92pWCT1HOzI3ypMh77BdER0O', 'Quản trị viên', 'admin@hdhome.local', '0900000000', NULL, 1, 'ACTIVE')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name), email = VALUES(email), role_id = VALUES(role_id), status = 'ACTIVE';

-- projectmanager / Manager@123
INSERT INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `phone`, `employee_id`, `role_id`, `status`) VALUES
  (2, 'projectmanager', '$2b$10$z3urO0B3v5fcYMgNrWUku.TeqSNo68zy2I2WVQnSJqkiyOW7gVZ..', 'Trần Quản Lý', 'manager@hdhome.local', '0901111111', NULL, 2, 'ACTIVE')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name), email = VALUES(email), role_id = VALUES(role_id), status = 'ACTIVE';

-- technical / Technical@123 — gắn hồ sơ NV010 để thấy dự án được phân công
INSERT INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `phone`, `employee_id`, `role_id`, `status`) VALUES
  (3, 'technical', '$2b$10$iflrdPTbfh.3SQIA/cZLYeA.KiZjYZ1YHEZbu/oxVQxoEmbxqZKMW', 'Nguyễn Kỹ Thuật', 'technical@hdhome.local', '0902222222', 10, 3, 'ACTIVE')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name), email = VALUES(email), employee_id = VALUES(employee_id), role_id = VALUES(role_id), status = 'ACTIVE';

-- ============================================================
-- Materials
-- ============================================================
INSERT INTO `materials` (`material_id`, `material_code`, `material_name`, `unit`, `description`) VALUES
  (1, 'VT001', 'Xi măng PCB40', 'bao', 'Xi măng poóc-lăng'),
  (2, 'VT002', 'Cát xây tô', 'm3', 'Cát tạo trộn vữa'),
  (3, 'VT003', 'Đá 1x2', 'm3', 'Đá bê tông cốt thép'),
  (4, 'VT004', 'Thép D16', 'kg', 'Thép cây D16'),
  (5, 'VT005', 'Gạch xây', 'viên', 'Gạch đất nung'),
  (6, 'VT006', 'Sơn nội thất', 'thùng', 'Sơn acrylic'),
  (7, 'VT007', 'Ống cấp nước', 'm', 'Ống PVC'),
  (8, 'VT008', 'Dây điện 2.5mm', 'm', 'Dây điện ruột đồng'),
  (9, 'VT009', 'Gạch lát nền', 'm2', 'Gạch ceramic'),
  (10, 'VT010', 'Kính cường lực', 'm2', 'Kính 2 lớp')
ON DUPLICATE KEY UPDATE material_name = VALUES(material_name), unit = VALUES(unit), description = VALUES(description);

-- ============================================================
-- Projects
-- ============================================================
INSERT INTO `projects` (`project_id`, `project_code`, `project_name`, `customer_id`, `investor_id`, `description`, `location`, `start_date`, `expected_end_date`, `status`, `progress`, `featured`) VALUES
  (1, 'HD-A01', 'Nhà phố hiện đại A01', 1, 1, 'Thiết kế và thi công nhà phố 4 tầng, tối ưu ánh sáng tự nhiên.', 'Thanh Khê, Đà Nẵng', '2026-01-10', '2026-08-30', 'IN_PROGRESS', 68, 1),
  (2, 'HD-B02', 'Nhà ở gia đình B02', 2, 2, 'Không gian sống gia đình với công năng gọn gàng và bền vững.', 'Hải Châu, Đà Nẵng', '2025-07-01', '2026-02-28', 'COMPLETED', 100, 1),
  (3, 'HD-C03', 'Biệt thự sân vườn C03', 3, 3, 'Biệt thự sân vườn kết nối mảng xanh và không gian sinh hoạt.', 'Ngũ Hành Sơn, Đà Nẵng', '2026-03-15', '2027-01-15', 'IN_PROGRESS', 42, 1),
  (4, 'HD-D04', 'Cải tạo nhà phố D04', 4, 4, 'Cải tạo mặt tiền, nội thất và hệ thống điện nước hiện hữu.', 'Sơn Trà, Đà Nẵng', '2026-05-05', '2026-10-10', 'IN_PROGRESS', 25, 1),
  (5, 'HD-E05', 'Nhà phố 3 tầng E05', 5, 5, 'Hồ sơ thiết kế nhà phố ba tầng theo nhu cầu gia đình.', 'Cẩm Lệ, Đà Nẵng', '2026-09-01', '2027-04-30', 'PLANNING', 5, 1),
  (6, 'HD-F06', 'Công trình dân dụng F06', 6, 1, 'Công trình dân dụng quy mô vừa, dữ liệu phục vụ minh họa.', 'Liên Chiểu, Đà Nẵng', '2025-10-01', '2026-05-30', 'PAUSED', 55, 0)
ON DUPLICATE KEY UPDATE project_name = VALUES(project_name), customer_id = VALUES(customer_id), investor_id = VALUES(investor_id), description = VALUES(description), location = VALUES(location), start_date = VALUES(start_date), expected_end_date = VALUES(expected_end_date), status = VALUES(status), progress = VALUES(progress), featured = VALUES(featured);

-- ============================================================
-- Contracts
-- ============================================================
INSERT INTO `contracts` (`contract_id`, `contract_number`, `project_id`, `customer_id`, `investor_id`, `signed_date`, `start_date`, `end_date`, `contract_value`, `status`, `note`) VALUES
  (1, 'HD-A01-2026', 1, 1, 1, '2026-01-05', '2026-01-10', '2026-08-30', 1850000000, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (2, 'HD-B02-2025', 2, 2, 2, '2025-06-20', '2025-07-01', '2026-02-28', 1260000000, 'COMPLETED', 'Giá trị hợp đồng minh họa'),
  (3, 'HD-C03-2026', 3, 3, 3, '2026-03-01', '2026-03-15', '2027-01-15', 3280000000, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (4, 'HD-D04-2026', 4, 4, 4, '2026-04-25', '2026-05-05', '2026-10-10', 780000000, 'SIGNED', 'Giá trị hợp đồng minh họa'),
  (5, 'HD-E05-2026', 5, 5, 5, NULL, '2026-09-01', '2027-04-30', 2100000000, 'DRAFT', 'Giá trị hợp đồng minh họa')
ON DUPLICATE KEY UPDATE project_id = VALUES(project_id), customer_id = VALUES(customer_id), investor_id = VALUES(investor_id), signed_date = VALUES(signed_date), start_date = VALUES(start_date), end_date = VALUES(end_date), contract_value = VALUES(contract_value), status = VALUES(status), note = VALUES(note);

-- ============================================================
-- Project Assignments
-- ============================================================
INSERT INTO `project_employees` (`project_id`, `employee_id`, `role_in_project`, `assigned_date`, `note`) VALUES
  (1, 2, 'Quản lý dự án', '2026-01-05', NULL),
  (1, 5, 'Kỹ sư xây dựng', '2026-01-10', NULL),
  (1, 10, 'Kỹ thuật hiện trường', '2026-01-12', 'Tài khoản technical được phân công dự án này'),
  (2, 3, 'Kiến trúc sư', '2025-06-25', NULL),
  (3, 2, 'Quản lý dự án', '2026-03-01', NULL),
  (3, 7, 'Giám sát công trình', '2026-03-15', NULL),
  (3, 10, 'Kỹ thuật hiện trường', '2026-03-20', NULL),
  (4, 4, 'Thiết kế nội thất', '2026-04-28', NULL),
  (5, 6, 'Kỹ sư điện nước', '2026-08-20', NULL)
ON DUPLICATE KEY UPDATE role_in_project = VALUES(role_in_project), assigned_date = VALUES(assigned_date), note = VALUES(note);

-- ============================================================
-- Project Materials
-- ============================================================
INSERT INTO `project_materials` (`project_id`, `material_id`, `quantity`, `note`) VALUES
  (1, 1, 420, 'Theo dự toán giai đoạn kết cấu'),
  (1, 4, 3850, 'Thép phần móng và thân'),
  (1, 5, 18500, 'Gạch xây tường'),
  (3, 2, 210, NULL),
  (3, 3, 180, NULL),
  (3, 10, 125, 'Khu vực mặt tiền'),
  (4, 6, 32, 'Hoàn thiện nội thất'),
  (5, 7, 460, NULL)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), note = VALUES(note);

-- ============================================================
-- Progress Updates
-- ============================================================
INSERT INTO `progress_updates` (`project_id`, `progress_percent`, `title`, `note`, `updated_by`, `created_at`, `updated_at`) VALUES
  (1, 10, 'Hoàn thành chuẩn bị mặt bằng', 'Đã hoàn tất công tác chuẩn bị.', 2, '2026-01-20 08:00:00', '2026-01-20 08:00:00'),
  (1, 30, 'Hoàn thành phần móng', 'Kiểm tra chất lượng đạt yêu cầu.', 2, '2026-03-01 09:00:00', '2026-03-01 09:00:00'),
  (1, 50, 'Thi công phần thân', 'Đang triển khai tầng hai.', 3, '2026-05-15 10:00:00', '2026-05-15 10:00:00'),
  (1, 68, 'Bắt đầu hoàn thiện', 'Thi công tô trát và điện nước.', 3, '2026-07-20 14:00:00', '2026-07-20 14:00:00'),
  (2, 35, 'Hoàn thành kết cấu', 'Dữ liệu tiến độ minh họa.', 2, '2025-09-10 08:30:00', '2025-09-10 08:30:00'),
  (2, 75, 'Hoàn thiện nội thất', 'Dữ liệu tiến độ minh họa.', 2, '2025-12-18 09:30:00', '2025-12-18 09:30:00'),
  (2, 100, 'Nghiệm thu hoàn thành', 'Công trình đã hoàn thành.', 1, '2026-02-20 16:00:00', '2026-02-20 16:00:00'),
  (3, 20, 'Hoàn thành phần móng', 'Đã nghiệm thu nội bộ.', 2, '2026-05-20 11:00:00', '2026-05-20 11:00:00'),
  (3, 42, 'Thi công tầng một', 'Tiến độ đúng kế hoạch.', 3, '2026-07-25 15:00:00', '2026-07-25 15:00:00'),
  (4, 25, 'Tháo dỡ và gia cố', 'Hoàn thành gia cố kết cấu cũ.', 2, '2026-07-10 13:00:00', '2026-07-10 13:00:00')
ON DUPLICATE KEY UPDATE progress_percent = VALUES(progress_percent), title = VALUES(title), note = VALUES(note), updated_by = VALUES(updated_by);

-- ============================================================
-- Contact Requests
-- ============================================================
INSERT INTO `contact_requests` (`full_name`, `phone`, `email`, `subject`, `message`, `status`) VALUES
  ('Khách hàng liên hệ 01', '0940000001', 'contact1@example.com', 'Tư vấn thiết kế nhà phố', 'Tôi cần thông tin về quy trình tư vấn.', 'NEW'),
  ('Khách hàng liên hệ 02', '0940000002', NULL, 'Tư vấn cải tạo', 'Yêu cầu dùng cho dữ liệu demo.', 'CONTACTED')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), email = VALUES(email), subject = VALUES(subject), message = VALUES(message), status = VALUES(status);
