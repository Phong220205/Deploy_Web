-- ============================================================
-- Projects (bổ sung 25 dự án thực tế)
-- ============================================================
INSERT INTO `projects` (`project_id`, `project_code`, `project_name`, `customer_id`, `investor_id`, `description`, `location`, `start_date`, `expected_end_date`, `status`, `progress`, `featured`) VALUES
  (16, 'HD-G07', 'Biệt thự hiện đại ven biển G07', 11, 9, 'Thiết kế và thi công biệt thự 4 tầng hướng biển với mặt kính cường lực và sân thượng.', 'Sơn Trà, Đà Nẵng', '2026-02-15', '2027-01-20', 'IN_PROGRESS', 46, 1),
  (17, 'HD-H08', 'Tòa nhà văn phòng 8 tầng H08', 12, 10, 'Công trình văn phòng cho thuê 8 tầng, hệ thống kỹ thuật điện nước tập trung trên hành lang.', 'Hải Châu, Đà Nẵng', '2025-11-01', '2026-09-30', 'IN_PROGRESS', 72, 1),
  (18, 'HD-I09', 'Khách sạn boutique 12 phòng I09', 13, 11, 'Khách sạn nhỏ 4 tầng với 12 phòng, quầy lễ tân và không gian trà gỗ nhiệt đới.', 'Ngũ Hành Sơn, Đà Nẵng', '2026-04-01', '2027-03-15', 'IN_PROGRESS', 33, 1),
  (19, 'HD-J10', 'Trung tâm thương mại 2 tầng J10', 14, 12, 'Trung tâm thương mại cấp phối 2 tầng với 14 cửa hàng và bãi xe ngầm.', 'Cẩm Lệ, Đà Nẵng', '2026-06-10', '2027-06-30', 'PLANNING', 8, 1),
  (20, 'HD-K11', 'Nhà xưởng sản xuất 2.000 m² K11', 15, 13, 'Nhà xưởng kết cấu thép 2.000 m² phục vụ sản xuất, hệ thống cầu trục 5 tấn.', 'Liên Chiểu, Đà Nẵng', '2026-01-20', '2026-11-30', 'IN_PROGRESS', 61, 1),
  (21, 'HD-L12', 'Nhà phố 5 tầng có thang máy L12', 16, 14, 'Nhà phố 5 tầng cho gia đình nhiều thế hệ, bố trí thang máy nội bộ và sân thượng thư giãn.', 'Thanh Khê, Đà Nẵng', '2025-09-15', '2026-08-20', 'IN_PROGRESS', 84, 1),
  (22, 'HD-M13', 'Căn hộ penthouse tầng 25 M13', 17, 15, 'Penthouse 320 m² với sàn kính, bếp đảo và bể bơi thượng.', 'Hải Châu, Đà Nẵng', '2026-05-05', '2027-02-28', 'IN_PROGRESS', 27, 1),
  (23, 'HD-N14', 'Trường mầm non 12 phòng N14', 18, 1, 'Trường mầm non 2 tầng với 12 lớp học, sân chơi trong nhà và khu bếp riêng.', 'Ngũ Hành Sơn, Đà Nẵng', '2026-03-01', '2026-12-20', 'IN_PROGRESS', 55, 1),
  (24, 'HD-O15', 'Văn phòng coworking 1.200 m² O15', 19, 2, 'Không gian coworking 1.200 m² gồm phòng họp, quầy lễ tân và khu gọi trực.', 'Thanh Khê, Đà Nẵng', '2026-07-01', '2027-04-15', 'PLANNING', 4, 1),
  (25, 'HD-P16', 'Showroom ô tô 2 tầng P16', 3, 3, 'Showroom trưng bày xe 2 tầng kèm phòng giao dịch và khu sửa chữa bảo dưỡng.', 'Cẩm Lệ, Đà Nẵng', '2025-12-10', '2026-10-10', 'IN_PROGRESS', 78, 1),
  (26, 'HD-Q17', 'Nhà xưởng may mặc 3.500 m² Q17', 4, 4, 'Nhà xưởng may mặc 3.500 m² với hệ thống treo hàng và khu cắt may thông gió.', 'Liên Chiểu, Đà Nẵng', '2026-02-01', '2027-01-31', 'IN_PROGRESS', 39, 1),
  (27, 'HD-R18', 'Công viên nước gia đình R18', 5, 5, 'Khu công viên nước gia đình với hồ bơi bể tràn, đường nước và vườn xanh.', 'Sơn Trà, Đà Nẵng', '2026-08-01', '2027-07-30', 'PLANNING', 2, 1),
  (28, 'HD-S19', 'Căn hộ 2 phòng ngủ S19', 6, 7, 'Căn hộ 2 phòng ngủ 68 m² bố trí hợp lý, ban công hướng Nam và nội thất bàn giao.', 'Thanh Khê, Đà Nẵng', '2025-08-01', '2026-06-30', 'COMPLETED', 100, 1),
  (29, 'HD-T20', 'Biệt thự mái nghiêng T20', 7, 8, 'Biệt thự mái nghiêng phong cách Nhật với khu vườn Nhật và hồ cá Koi.', 'Hải Châu, Đà Nẵng', '2026-04-20', '2027-05-30', 'IN_PROGRESS', 21, 1),
  (30, 'HD-U21', 'Trung tâm tiếng Anh U21', 8, 9, 'Trung tâm ngoại ngữ 3 tầng với 12 phòng học, phòng thí âm và thư viện nhỏ.', 'Ngũ Hành Sơn, Đà Nẵng', '2026-06-01', '2027-01-30', 'IN_PROGRESS', 12, 1),
  (31, 'HD-V22', 'Nhà kho 3.000 m² V22', 10, 10, 'Kho chứa hàng 3.000 m² kết cấu bê tông cốt thép, sàn epoxy chịu tải trọng.', 'Liên Chiểu, Đà Nẵng', '2025-10-15', '2026-08-15', 'COMPLETED', 100, 1),
  (32, 'HD-W23', 'Quán cà phê trên tầng 3 W23', 11, 11, 'Quán cà phê tầng 3 với sân thượng thoáng gió và view sông Hàn.', 'Hải Châu, Đà Nẵng', '2026-01-10', '2026-09-10', 'IN_PROGRESS', 66, 1),
  (33, 'HD-X24', 'Kho lạnh công nghiệp X24', 12, 12, 'Kho lạnh công nghiệp 2.400 m² giữ nhiệt độ âm 18 độ C, tường PU cách nhiệt.', 'Cẩm Lệ, Đà Nẵng', '2026-05-15', '2027-03-01', 'IN_PROGRESS', 18, 1),
  (34, 'HD-Y25', 'Nhà vườn 400 m² Y25', 13, 13, 'Nhà vườn 400 m² với hồ nước, vườn rau và công trình ngoại thất gỗ.', 'Sơn Trà, Đà Nẵng', '2026-09-01', '2027-08-30', 'PLANNING', 3, 1),
  (35, 'HD-Z26', 'Tòa nhà hỗn hợp 12 tầng Z26', 14, 14, 'Tòa nhà hỗn hợp 12 tầng kết hợp văn phòng và chung cư, 2 tầng hầm để xe.', 'Thanh Khê, Đà Nẵng', '2025-12-01', '2027-06-30', 'IN_PROGRESS', 48, 1),
  (36, 'HD-AA27', 'Trung tâm thể thao AA27', 15, 15, 'Nhà thi đấu trong nhà 4.000 chỗ ngồi, sàn thi đấu gỗ tiêu chuẩn thi đấu quốc tế.', 'Ngũ Hành Sơn, Đà Nẵng', '2026-07-15', '2027-09-30', 'PLANNING', 6, 1),
  (37, 'HD-AB28', 'Văn phòng làm việc công nghệ AB28', 16, 1, 'Trụ sở văn phòng 9 tầng cho công ty công nghệ, thiết kế mở và tối ưu năng lượng.', 'Hải Châu, Đà Nẵng', '2026-02-20', '2027-02-28', 'IN_PROGRESS', 41, 1),
  (38, 'HD-AC29', 'Chung cư mini 12 căn AC29', 17, 2, 'Chung cư mini 12 căn hộ 2 phòng ngủ, hệ thống an ninh và bãi xe 2 tầng.', 'Cẩm Lệ, Đà Nẵng', '2026-08-10', '2027-07-31', 'PLANNING', 5, 1),
  (39, 'HD-AD30', 'Nhà máy bao bì AD30', 18, 3, 'Nhà máy bao bì 4.500 m² gồm dây chuyền in, khu cắt và kho thành phẩm.', 'Liên Chiểu, Đà Nẵng', '2025-11-20', '2026-12-31', 'IN_PROGRESS', 57, 1),
  (40, 'HD-AE31', 'Quán cà phê vườn trên mái AE31', 19, 4, 'Quán cà phê trên mái nhà 4 tầng kết hợp vườn trên mái, view hồ sân vườn.', 'Thanh Khê, Đà Nẵng', '2026-03-15', '2026-12-15', 'IN_PROGRESS', 31, 1)
ON DUPLICATE KEY UPDATE project_name = VALUES(project_name), customer_id = VALUES(customer_id), investor_id = VALUES(investor_id), description = VALUES(description), location = VALUES(location), start_date = VALUES(start_date), expected_end_date = VALUES(expected_end_date), status = VALUES(status), progress = VALUES(progress), featured = VALUES(featured);
