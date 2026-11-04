-- ============================================================
-- HDHOME Seed Data — phần bổ sung
-- Sinh tự động từ dữ liệu đang chạy (scripts/gen-seed-sql.mjs)
-- Idempotent: chạy lại nhiều lần không tạo dữ liệu trùng.
-- ============================================================


-- ============================================================
-- Customers (bổ sung)
-- ============================================================
INSERT INTO `customers` (`customer_id`, `full_name`, `phone`, `email`, `address`, `note`) VALUES
  (7, 'Nguyễn Văn An', '0901111111', 'an.nguyen@example.com', 'Thanh Khê, Đà Nẵng', NULL),
  (8, 'Trần Thị Bình', '0902222222', 'binh.tran@example.com', 'Hải Châu, Đà Nẵng', NULL),
  (10, 'Nguyễn Hoàng Nam', '0907777777', 'nam.nguyen@example.com', 'Hải Châu, Đà Nẵng', 'Khách hàng mở rộng'),
  (11, 'Lê Thị Mai', '0908888888', 'mai.le@example.com', 'Sơn Trà, Đà Nẵng', 'Khách hàng mở rộng'),
  (12, 'Trần Quốc Bảo', '0909999999', 'bao.tran@example.com', 'Ngũ Hành Sơn, Đà Nẵng', 'Khách hàng mở rộng'),
  (13, 'Phạm Ngọc Anh', '0910000001', 'anh.pham@example.com', 'Cẩm Lệ, Đà Nẵng', 'Khách hàng mở rộng'),
  (14, 'Huỳnh Thị Mai Anh', '0910000002', 'mai-anh.huynh@example.com', 'Thanh Khê, Đà Nẵng', 'Khách hàng mở rộng'),
  (15, 'Đỗ Anh Tuấn', '0910000003', 'tuan.do@example.com', 'Liên Chiểu, Đà Nẵng', 'Khách hàng mở rộng'),
  (16, 'Vũ Thị Hồng Nhung', '0910000004', 'nhung.vu@example.com', 'Hải Châu, Đà Nẵng', 'Khách hàng mở rộng'),
  (17, 'Nguyễn Đình Trọng', '0910000005', 'trong.nguyen@example.com', 'Sơn Trà, Đà Nẵng', 'Khách hàng mở rộng'),
  (18, 'Bạch Thị Hà', '0910000006', 'ha.bach@example.com', 'Ngũ Hành Sơn, Đà Nẵng', 'Khách hàng mở rộng'),
  (19, 'Dương Văn Kiên', '0910000007', 'kien.duong@example.com', 'Thanh Khê, Đà Nẵng', 'Khách hàng mở rộng')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), email = VALUES(email), address = VALUES(address), note = VALUES(note);


-- ============================================================
-- Investors (bổ sung)
-- ============================================================
INSERT INTO `investors` (`investor_id`, `full_name`, `organization`, `phone`, `email`, `address`, `note`) VALUES
  (7, 'Lê Văn C', 'Công ty Đầu tư XYZ', '0903333333', 'c@example.com', NULL, NULL),
  (8, 'Nguyễn Văn Hùng', 'Tập đoàn Hùng Phát', '0910000011', 'hung.nguyen@example.com', 'Đà Nẵng', 'Chủ đầu tư mở rộng'),
  (9, 'Lê Thanh Sơn', 'Công ty CP Đầu tư Sơn Hải', '0910000012', 'son.le@example.com', 'Quảng Nam', 'Chủ đầu tư mở rộng'),
  (10, 'Trần Minh Tuấn', 'Tập đoàn Tuấn Minh', '0910000013', 'tuan.tran@example.com', 'Đà Nẵng', 'Chủ đầu tư mở rộng'),
  (11, 'Phạm Thị Hồng', 'Công ty TNHH Hồng Phát', '0910000014', 'hong.pham@example.com', 'Quy Nhơn', 'Chủ đầu tư mở rộng'),
  (12, 'Võ Quang Vinh', 'Công ty CP Vinh Hải', '0910000015', 'vinh.vo@example.com', 'Đà Nẵng', 'Chủ đầu tư mở rộng'),
  (13, 'Ngô Thị Hạnh', 'Công ty TNHH Hạnh Ngô', '0910000016', 'hanh.ngo@example.com', 'Huế', 'Chủ đầu tư mở rộng'),
  (14, 'Đinh Văn Hiếu', 'Tập đoàn Hiếu Đinh', '0910000017', 'hieu.dinh@example.com', 'Đà Nẵng', 'Chủ đầu tư mở rộng'),
  (15, 'Lưu Thị Mai', 'Công ty TNHH Mai Lưu', '0910000018', 'mai.luu@example.com', 'Hội An', 'Chủ đầu tư mở rộng')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), organization = VALUES(organization), phone = VALUES(phone), email = VALUES(email), address = VALUES(address), note = VALUES(note);


-- ============================================================
-- Contracts (bổ sung)
-- ============================================================
INSERT INTO `contracts` (`contract_id`, `contract_number`, `project_id`, `customer_id`, `investor_id`, `signed_date`, `start_date`, `end_date`, `contract_value`, `status`, `note`) VALUES
  (73, 'HD-F06-2025', 6, 8, 7, '2025-09-30', '2025-09-30', '2026-05-29', 1200000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (74, 'A23-2026', 15, 10, 8, '2026-11-02', '2026-11-02', '2027-03-04', 2400000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (75, 'HD-G07-2026', 16, 11, 9, '2026-02-14', '2026-02-14', '2027-01-19', 860000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (76, 'HD-H08-2025', 17, 12, 10, '2025-10-31', '2025-10-31', '2026-09-29', 3200000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (77, 'HD-I09-2026', 18, 13, 11, '2026-03-31', '2026-03-31', '2027-03-14', 1750000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (78, 'HD-J10-2026', 19, 14, 12, NULL, '2026-06-09', '2027-06-29', 640000000.00, 'DRAFT', 'Giá trị hợp đồng minh họa'),
  (79, 'HD-K11-2026', 20, 15, 13, '2026-01-19', '2026-01-19', '2026-11-29', 2900000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (80, 'HD-L12-2025', 21, 16, 14, '2025-09-14', '2025-09-14', '2026-08-19', 980000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (81, 'HD-M13-2026', 22, 17, 15, '2026-05-04', '2026-05-04', '2027-02-27', 1580000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (82, 'HD-N14-2026', 23, 18, 1, '2026-02-28', '2026-02-28', '2026-12-19', 4350000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (83, 'HD-O15-2026', 24, 19, 2, NULL, '2026-06-30', '2027-04-14', 1200000000.00, 'DRAFT', 'Giá trị hợp đồng minh họa'),
  (84, 'HD-P16-2025', 25, 3, 3, '2025-12-09', '2025-12-09', '2026-10-09', 2400000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (85, 'HD-Q17-2026', 26, 4, 4, '2026-01-31', '2026-01-31', '2027-01-30', 860000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (86, 'HD-R18-2026', 27, 5, 5, NULL, '2026-07-31', '2027-07-29', 3200000000.00, 'DRAFT', 'Giá trị hợp đồng minh họa'),
  (87, 'HD-S19-2025', 28, 6, 7, '2025-07-31', '2025-07-31', '2026-06-29', 1750000000.00, 'COMPLETED', 'Giá trị hợp đồng minh họa'),
  (88, 'HD-T20-2026', 29, 7, 8, '2026-04-19', '2026-04-19', '2027-05-29', 640000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (89, 'HD-U21-2026', 30, 8, 9, '2026-05-31', '2026-05-31', '2027-01-29', 2900000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (90, 'HD-V22-2025', 31, 10, 10, '2025-10-14', '2025-10-14', '2026-08-14', 980000000.00, 'COMPLETED', 'Giá trị hợp đồng minh họa'),
  (91, 'HD-W23-2026', 32, 11, 11, '2026-01-09', '2026-01-09', '2026-09-09', 1580000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (92, 'HD-X24-2026', 33, 12, 12, '2026-05-14', '2026-05-14', '2027-02-28', 4350000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (93, 'HD-Y25-2026', 34, 13, 13, NULL, '2026-08-31', '2027-08-29', 1200000000.00, 'DRAFT', 'Giá trị hợp đồng minh họa'),
  (94, 'HD-Z26-2025', 35, 14, 14, '2025-11-30', '2025-11-30', '2027-06-29', 2400000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (95, 'HD-AA27-2026', 36, 15, 15, NULL, '2026-07-14', '2027-09-29', 860000000.00, 'DRAFT', 'Giá trị hợp đồng minh họa'),
  (96, 'HD-AB28-2026', 37, 16, 1, '2026-02-19', '2026-02-19', '2027-02-27', 3200000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (97, 'HD-AC29-2026', 38, 17, 2, NULL, '2026-08-09', '2027-07-30', 1750000000.00, 'DRAFT', 'Giá trị hợp đồng minh họa'),
  (98, 'HD-AD30-2025', 39, 18, 3, '2025-11-19', '2025-11-19', '2026-12-30', 640000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa'),
  (99, 'HD-AE31-2026', 40, 19, 4, '2026-03-14', '2026-03-14', '2026-12-14', 2900000000.00, 'IN_PROGRESS', 'Giá trị hợp đồng minh họa')
ON DUPLICATE KEY UPDATE project_id = VALUES(project_id), customer_id = VALUES(customer_id), investor_id = VALUES(investor_id), signed_date = VALUES(signed_date), start_date = VALUES(start_date), end_date = VALUES(end_date), contract_value = VALUES(contract_value), status = VALUES(status), note = VALUES(note);


-- ============================================================
-- Project Assignments (bổ sung)
-- ============================================================
INSERT INTO `project_employees` (`project_id`, `employee_id`, `role_in_project`, `assigned_date`, `note`) VALUES
  (15, 1, 'Giám đốc dự án', '2026-11-03', NULL),
  (15, 2, 'Kỹ sư xây dựng', '2026-11-03', NULL),
  (15, 6, 'Điện nước', '2026-11-03', NULL),
  (15, 7, 'Giám sát', '2026-11-03', NULL),
  (15, 8, 'Vật tư', '2026-11-03', NULL),
  (16, 1, 'Quản lý dự án', '2026-02-15', NULL),
  (17, 2, 'Kỹ sư xây dựng', '2025-11-01', NULL),
  (18, 3, 'Giám sát công trình', '2026-04-01', NULL),
  (19, 4, 'Kỹ sư điện nước', '2026-06-10', NULL),
  (20, 5, 'Kiến trúc sư', '2026-01-20', NULL),
  (21, 6, 'Thiết kế nội thất', '2025-09-15', NULL),
  (22, 7, 'Quản lý dự án', '2026-05-05', NULL),
  (23, 8, 'Kỹ sư xây dựng', '2026-03-01', NULL),
  (24, 9, 'Giám sát công trình', '2026-07-01', NULL),
  (25, 1, 'Kỹ sư điện nước', '2025-12-10', NULL),
  (26, 2, 'Kiến trúc sư', '2026-02-01', NULL),
  (27, 3, 'Thiết kế nội thất', '2026-08-01', NULL),
  (28, 4, 'Quản lý dự án', '2025-08-01', NULL),
  (29, 5, 'Kỹ sư xây dựng', '2026-04-20', NULL),
  (30, 6, 'Giám sát công trình', '2026-06-01', NULL),
  (31, 7, 'Kỹ sư điện nước', '2025-10-15', NULL),
  (32, 8, 'Kiến trúc sư', '2026-01-10', NULL),
  (33, 9, 'Thiết kế nội thất', '2026-05-15', NULL),
  (34, 1, 'Quản lý dự án', '2026-09-01', NULL),
  (35, 2, 'Kỹ sư xây dựng', '2025-12-01', NULL),
  (36, 3, 'Giám sát công trình', '2026-07-15', NULL),
  (37, 4, 'Kỹ sư điện nước', '2026-02-20', NULL),
  (38, 5, 'Kiến trúc sư', '2026-08-10', NULL),
  (39, 6, 'Thiết kế nội thất', '2025-11-20', NULL),
  (40, 7, 'Quản lý dự án', '2026-03-15', NULL)
ON DUPLICATE KEY UPDATE role_in_project = VALUES(role_in_project), assigned_date = VALUES(assigned_date), note = VALUES(note);


-- ============================================================
-- Progress Updates (bổ sung)
-- ============================================================
INSERT INTO `progress_updates` (`update_id`, `project_id`, `progress_percent`, `title`, `note`, `updated_by`, `created_at`) VALUES
  (101, 15, 34, 'Hoàn thành phần móng', NULL, 1, '2026-11-03 01:09:22'),
  (112, 16, 16, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:01'),
  (113, 16, 32, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:02'),
  (114, 16, 46, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:02'),
  (115, 17, 25, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:02'),
  (116, 17, 50, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:02'),
  (117, 17, 72, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:03'),
  (118, 18, 12, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:03'),
  (119, 18, 23, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:03'),
  (120, 18, 33, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:03'),
  (121, 20, 21, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:03'),
  (122, 20, 43, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:03'),
  (123, 20, 61, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:04'),
  (124, 21, 29, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:04'),
  (125, 21, 59, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:04'),
  (126, 21, 84, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:04'),
  (127, 22, 9, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:04'),
  (128, 22, 19, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:04'),
  (129, 22, 27, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:05'),
  (130, 23, 19, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:05'),
  (131, 23, 39, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:05'),
  (132, 23, 55, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:05'),
  (133, 25, 27, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:06'),
  (134, 25, 55, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:06'),
  (135, 25, 78, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:06'),
  (136, 26, 14, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:06'),
  (137, 26, 27, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:07'),
  (138, 26, 39, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:07'),
  (139, 29, 7, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:08'),
  (140, 29, 15, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:08'),
  (141, 29, 21, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:08'),
  (142, 30, 5, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:09'),
  (143, 30, 10, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:09'),
  (144, 30, 12, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:09'),
  (145, 32, 23, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:10'),
  (146, 32, 46, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:11'),
  (147, 32, 66, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:11'),
  (148, 33, 6, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:11'),
  (149, 33, 13, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:11'),
  (150, 33, 18, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:11'),
  (151, 35, 17, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:12'),
  (152, 35, 34, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:12'),
  (153, 35, 48, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:12'),
  (154, 37, 14, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:13'),
  (155, 37, 29, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:13'),
  (156, 37, 41, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:13'),
  (157, 39, 20, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:13'),
  (158, 39, 40, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:13'),
  (159, 39, 57, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:14'),
  (160, 40, 11, 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.', 2, '2026-11-04 09:28:14'),
  (161, 40, 22, 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.', 2, '2026-11-04 09:28:14'),
  (162, 40, 31, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.', 2, '2026-11-04 09:28:14')
ON DUPLICATE KEY UPDATE progress_percent = VALUES(progress_percent), title = VALUES(title), note = VALUES(note), updated_by = VALUES(updated_by), created_at = VALUES(created_at);
