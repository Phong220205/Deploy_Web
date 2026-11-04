/**
 * Bổ sung 25 dự án thực tế cho công ty xây dựng HDHOME.
 * Idempotent: chạy lại nhiều lần không tạo dữ liệu trùng.
 *
 * Chạy: node scripts/seed-more-projects.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';

const envFiles = ['.env.import', '.env'];
const envPath = envFiles
  .map((file) => path.resolve(process.cwd(), file))
  .find((file) => fs.existsSync(file));
if (envPath) {
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const value = match[2].replace(/^["']|["']$/g, '');
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST?.includes('aivencloud.com') ? { rejectUnauthorized: false } : undefined,
});

const customers = [
  ['Nguyễn Hoàng Nam', '0907777777', 'nam.nguyen@example.com', 'Hải Châu, Đà Nẵng'],
  ['Lê Thị Mai', '0908888888', 'mai.le@example.com', 'Sơn Trà, Đà Nẵng'],
  ['Trần Quốc Bảo', '0909999999', 'bao.tran@example.com', 'Ngũ Hành Sơn, Đà Nẵng'],
  ['Phạm Ngọc Anh', '0910000001', 'anh.pham@example.com', 'Cẩm Lệ, Đà Nẵng'],
  ['Huỳnh Thị Mai Anh', '0910000002', 'mai-anh.huynh@example.com', 'Thanh Khê, Đà Nẵng'],
  ['Đỗ Anh Tuấn', '0910000003', 'tuan.do@example.com', 'Liên Chiểu, Đà Nẵng'],
  ['Vũ Thị Hồng Nhung', '0910000004', 'nhung.vu@example.com', 'Hải Châu, Đà Nẵng'],
  ['Nguyễn Đình Trọng', '0910000005', 'trong.nguyen@example.com', 'Sơn Trà, Đà Nẵng'],
  ['Bạch Thị Hà', '0910000006', 'ha.bach@example.com', 'Ngũ Hành Sơn, Đà Nẵng'],
  ['Dương Văn Kiên', '0910000007', 'kien.duong@example.com', 'Thanh Khê, Đà Nẵng'],
];

const investors = [
  ['Nguyễn Văn Hùng', 'Tập đoàn Hùng Phát', '0910000011', 'hung.nguyen@example.com', 'Đà Nẵng'],
  ['Lê Thanh Sơn', 'Công ty CP Đầu tư Sơn Hải', '0910000012', 'son.le@example.com', 'Quảng Nam'],
  ['Trần Minh Tuấn', 'Tập đoàn Tuấn Minh', '0910000013', 'tuan.tran@example.com', 'Đà Nẵng'],
  ['Phạm Thị Hồng', 'Công ty TNHH Hồng Phát', '0910000014', 'hong.pham@example.com', 'Quy Nhơn'],
  ['Võ Quang Vinh', 'Công ty CP Vinh Hải', '0910000015', 'vinh.vo@example.com', 'Đà Nẵng'],
  ['Ngô Thị Hạnh', 'Công ty TNHH Hạnh Ngô', '0910000016', 'hanh.ngo@example.com', 'Huế'],
  ['Đinh Văn Hiếu', 'Tập đoàn Hiếu Đinh', '0910000017', 'hieu.dinh@example.com', 'Đà Nẵng'],
  ['Lưu Thị Mai', 'Công ty TNHH Mai Lưu', '0910000018', 'mai.luu@example.com', 'Hội An'],
];

const projects = [
  ['HD-G07', 'Biệt thự hiện đại ven biển G07', 'Thiết kế và thi công biệt thự 4 tầng hướng biển với mặt kính cường lực và sân thượng.', 'Sơn Trà, Đà Nẵng', '2026-02-15', '2027-01-20', 'IN_PROGRESS', 46, 1],
  ['HD-H08', 'Tòa nhà văn phòng 8 tầng H08', 'Công trình văn phòng cho thuê 8 tầng, hệ thống kỹ thuật điện nước tập trung trên hành lang.', 'Hải Châu, Đà Nẵng', '2025-11-01', '2026-09-30', 'IN_PROGRESS', 72, 1],
  ['HD-I09', 'Khách sạn boutique 12 phòng I09', 'Khách sạn nhỏ 4 tầng với 12 phòng, quầy lễ tân và không gian trà gỗ nhiệt đới.', 'Ngũ Hành Sơn, Đà Nẵng', '2026-04-01', '2027-03-15', 'IN_PROGRESS', 33, 1],
  ['HD-J10', 'Trung tâm thương mại 2 tầng J10', 'Trung tâm thương mại cấp phối 2 tầng với 14 cửa hàng và bãi xe ngầm.', 'Cẩm Lệ, Đà Nẵng', '2026-06-10', '2027-06-30', 'PLANNING', 8, 1],
  ['HD-K11', 'Nhà xưởng sản xuất 2.000 m² K11', 'Nhà xưởng kết cấu thép 2.000 m² phục vụ sản xuất, hệ thống cầu trục 5 tấn.', 'Liên Chiểu, Đà Nẵng', '2026-01-20', '2026-11-30', 'IN_PROGRESS', 61, 1],
  ['HD-L12', 'Nhà phố 5 tầng có thang máy L12', 'Nhà phố 5 tầng cho gia đình nhiều thế hệ, bố trí thang máy nội bộ và sân thượng thư giãn.', 'Thanh Khê, Đà Nẵng', '2025-09-15', '2026-08-20', 'IN_PROGRESS', 84, 1],
  ['HD-M13', 'Căn hộ penthouse tầng 25 M13', 'Penthouse 320 m² với sàn kính, bếp đảo và bể bơi thượng.', 'Hải Châu, Đà Nẵng', '2026-05-05', '2027-02-28', 'IN_PROGRESS', 27, 1],
  ['HD-N14', 'Trường mầm non 12 phòng N14', 'Trường mầm non 2 tầng với 12 lớp học, sân chơi trong nhà và khu bếp riêng.', 'Ngũ Hành Sơn, Đà Nẵng', '2026-03-01', '2026-12-20', 'IN_PROGRESS', 55, 1],
  ['HD-O15', 'Văn phòng coworking 1.200 m² O15', 'Không gian coworking 1.200 m² gồm phòng họp, quầy lễ tân và khu gọi trực.', 'Thanh Khê, Đà Nẵng', '2026-07-01', '2027-04-15', 'PLANNING', 4, 1],
  ['HD-P16', 'Showroom ô tô 2 tầng P16', 'Showroom trưng bày xe 2 tầng kèm phòng giao dịch và khu sửa chữa bảo dưỡng.', 'Cẩm Lệ, Đà Nẵng', '2025-12-10', '2026-10-10', 'IN_PROGRESS', 78, 1],
  ['HD-Q17', 'Nhà xưởng may mặc 3.500 m² Q17', 'Nhà xưởng may mặc 3.500 m² với hệ thống treo hàng và khu cắt may thông gió.', 'Liên Chiểu, Đà Nẵng', '2026-02-01', '2027-01-31', 'IN_PROGRESS', 39, 1],
  ['HD-R18', 'Công viên nước gia đình R18', 'Khu công viên nước gia đình với hồ bơi bể tràn, đường nước và vườn xanh.', 'Sơn Trà, Đà Nẵng', '2026-08-01', '2027-07-30', 'PLANNING', 2, 1],
  ['HD-S19', 'Căn hộ 2 phòng ngủ S19', 'Căn hộ 2 phòng ngủ 68 m² bố trí hợp lý, ban công hướng Nam và nội thất bàn giao.', 'Thanh Khê, Đà Nẵng', '2025-08-01', '2026-06-30', 'COMPLETED', 100, 1],
  ['HD-T20', 'Biệt thự mái nghiêng T20', 'Biệt thự mái nghiêng phong cách Nhật với khu vườn Nhật và hồ cá Koi.', 'Hải Châu, Đà Nẵng', '2026-04-20', '2027-05-30', 'IN_PROGRESS', 21, 1],
  ['HD-U21', 'Trung tâm tiếng Anh U21', 'Trung tâm ngoại ngữ 3 tầng với 12 phòng học, phòng thí âm và thư viện nhỏ.', 'Ngũ Hành Sơn, Đà Nẵng', '2026-06-01', '2027-01-30', 'IN_PROGRESS', 12, 1],
  ['HD-V22', 'Nhà kho 3.000 m² V22', 'Kho chứa hàng 3.000 m² kết cấu bê tông cốt thép, sàn epoxy chịu tải trọng.', 'Liên Chiểu, Đà Nẵng', '2025-10-15', '2026-08-15', 'COMPLETED', 100, 1],
  ['HD-W23', 'Quán cà phê trên tầng 3 W23', 'Quán cà phê tầng 3 với sân thượng thoáng gió và view sông Hàn.', 'Hải Châu, Đà Nẵng', '2026-01-10', '2026-09-10', 'IN_PROGRESS', 66, 1],
  ['HD-X24', 'Kho lạnh công nghiệp X24', 'Kho lạnh công nghiệp 2.400 m² giữ nhiệt độ âm 18 độ C, tường PU cách nhiệt.', 'Cẩm Lệ, Đà Nẵng', '2026-05-15', '2027-03-01', 'IN_PROGRESS', 18, 1],
  ['HD-Y25', 'Nhà vườn 400 m² Y25', 'Nhà vườn 400 m² với hồ nước, vườn rau và công trình ngoại thất gỗ.', 'Sơn Trà, Đà Nẵng', '2026-09-01', '2027-08-30', 'PLANNING', 3, 1],
  ['HD-Z26', 'Tòa nhà hỗn hợp 12 tầng Z26', 'Tòa nhà hỗn hợp 12 tầng kết hợp văn phòng và chung cư, 2 tầng hầm để xe.', 'Thanh Khê, Đà Nẵng', '2025-12-01', '2027-06-30', 'IN_PROGRESS', 48, 1],
  ['HD-AA27', 'Trung tâm thể thao AA27', 'Nhà thi đấu trong nhà 4.000 chỗ ngồi, sàn thi đấu gỗ tiêu chuẩn thi đấu quốc tế.', 'Ngũ Hành Sơn, Đà Nẵng', '2026-07-15', '2027-09-30', 'PLANNING', 6, 1],
  ['HD-AB28', 'Văn phòng làm việc công nghệ AB28', 'Trụ sở văn phòng 9 tầng cho công ty công nghệ, thiết kế mở và tối ưu năng lượng.', 'Hải Châu, Đà Nẵng', '2026-02-20', '2027-02-28', 'IN_PROGRESS', 41, 1],
  ['HD-AC29', 'Chung cư mini 12 căn AC29', 'Chung cư mini 12 căn hộ 2 phòng ngủ, hệ thống an ninh và bãi xe 2 tầng.', 'Cẩm Lệ, Đà Nẵng', '2026-08-10', '2027-07-31', 'PLANNING', 5, 1],
  ['HD-AD30', 'Nhà máy bao bì AD30', 'Nhà máy bao bì 4.500 m² gồm dây chuyền in, khu cắt và kho thành phẩm.', 'Liên Chiểu, Đà Nẵng', '2025-11-20', '2026-12-31', 'IN_PROGRESS', 57, 1],
  ['HD-AE31', 'Quán cà phê vườn trên mái AE31', 'Quán cà phê trên mái nhà 4 tầng kết hợp vườn trên mái, view hồ sân vườn.', 'Thanh Khê, Đà Nẵng', '2026-03-15', '2026-12-15', 'IN_PROGRESS', 31, 1],
];

async function main() {
  // 1. Khách hàng
  for (const [full_name, phone, email, address] of customers) {
    await connection.execute(
      `INSERT INTO customers (full_name, phone, email, address, note)
       VALUES (?, ?, ?, ?, 'Khách hàng mở rộng')
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), email = VALUES(email), address = VALUES(address)`,
      [full_name, phone, email, address],
    );
  }

  // 2. Chủ đầu tư
  for (const [full_name, organization, phone, email, address] of investors) {
    await connection.execute(
      `INSERT INTO investors (full_name, organization, phone, email, address, note)
       VALUES (?, ?, ?, ?, ?, 'Chủ đầu tư mở rộng')
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), organization = VALUES(organization), email = VALUES(email), address = VALUES(address)`,
      [full_name, organization, phone, email, address],
    );
  }

  const [[customerCount]] = await connection.execute('SELECT COUNT(*) total FROM customers');
  const [[investorCount]] = await connection.execute('SELECT COUNT(*) total FROM investors');

  // 3. Dự án — gán khách hàng/chủ đầu tư xen kẽ để dữ liệu đa dạng
  const customerIds = [];
  for (let i = 1; i <= customerCount.total; i += 1) customerIds.push(i);
  const investorIds = [];
  for (let i = 1; i <= investorCount.total; i += 1) investorIds.push(i);

  const projectIds = [];
  for (let i = 0; i < projects.length; i += 1) {
    const [code, name, description, location, start_date, expected_end_date, status, progress, featured] = projects[i];
    const customer_id = customerIds[i % customerIds.length];
    const investor_id = investorIds[i % investorIds.length];
    await connection.execute(
      `INSERT INTO projects (project_code, project_name, customer_id, investor_id, description, location, start_date, expected_end_date, status, progress, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE project_name = VALUES(project_name), customer_id = VALUES(customer_id), investor_id = VALUES(investor_id),
         description = VALUES(description), location = VALUES(location), start_date = VALUES(start_date),
         expected_end_date = VALUES(expected_end_date), status = VALUES(status), progress = VALUES(progress), featured = VALUES(featured)`,
      [code, name, customer_id, investor_id, description, location, start_date, expected_end_date, status, progress, featured],
    );
    const [[row]] = await connection.execute('SELECT project_id FROM projects WHERE project_code = ?', [code]);
    projectIds.push(row.project_id);
  }

  // 4. Hợp đồng cho từng dự án mới
  const contractStatus = { PLANNING: 'DRAFT', IN_PROGRESS: 'IN_PROGRESS', COMPLETED: 'COMPLETED' };
  const contractValue = [1200000000, 2400000000, 860000000, 3200000000, 1750000000, 640000000, 2900000000, 980000000, 1580000000, 4350000000];
  for (let i = 0; i < projectIds.length; i += 1) {
    const projectId = projectIds[i];
    const project = projects[i];
    const [[row]] = await connection.execute(
      'SELECT project_code, customer_id, investor_id, start_date, expected_end_date, status FROM projects WHERE project_id = ?',
      [projectId],
    );
    const signed = row.status === 'PLANNING' ? null : row.start_date;
    await connection.execute(
      `INSERT INTO contracts (contract_number, project_id, customer_id, investor_id, signed_date, start_date, end_date, contract_value, status, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Giá trị hợp đồng minh họa')
       ON DUPLICATE KEY UPDATE project_id = VALUES(project_id), customer_id = VALUES(customer_id), investor_id = VALUES(investor_id),
         signed_date = VALUES(signed_date), start_date = VALUES(start_date), end_date = VALUES(end_date),
         contract_value = VALUES(contract_value), status = VALUES(status)`,
      [
        `${row.project_code}-${String(row.start_date).slice(0, 4)}`,
        projectId,
        row.customer_id,
        row.investor_id,
        signed,
        row.start_date,
        row.expected_end_date,
        contractValue[i % contractValue.length],
        contractStatus[row.status] || 'DRAFT',
      ],
    );
  }

  // 5. Phân công nhân sự cho các dự án đang thi công
  const roles = ['Quản lý dự án', 'Kỹ sư xây dựng', 'Giám sát công trình', 'Kỹ sư điện nước', 'Kiến trúc sư', 'Thiết kế nội thất'];
  for (let i = 0; i < projectIds.length; i += 1) {
    const employee_id = (i % 9) + 1;
    await connection.execute(
      `INSERT INTO project_employees (project_id, employee_id, role_in_project, assigned_date, note)
       VALUES (?, ?, ?, ?, NULL)
       ON DUPLICATE KEY UPDATE role_in_project = VALUES(role_in_project)`,
      [projectIds[i], employee_id, roles[i % roles.length], projects[i][4]],
    );
  }

  // 6. Cập nhật tiến độ cho các dự án đang thi công
  for (let i = 0; i < projectIds.length; i += 1) {
    const project = projects[i];
    if (project[6] !== 'IN_PROGRESS') continue;
    const progress = project[7];
    const [[row]] = await connection.execute(
      'SELECT project_code, start_date FROM projects WHERE project_id = ?',
      [projectIds[i]],
    );
    const milestones = [
      [Math.max(5, Math.round(progress * 0.35)), 'Hoàn thành phần móng và kết cấu', 'Đã nghiệm thu nội bộ theo hồ sơ thiết kế.'],
      [Math.max(10, Math.round(progress * 0.7)), 'Thi công phần thân và hạ tầng', 'Tiến độ đúng kế hoạch đã duyệt.'],
      [progress, 'Cập nhật tiến độ hiện tại', 'Dữ liệu tiến độ minh họa.'],
    ];
    for (const [percent, title, note] of milestones) {
      await connection.execute(
        `INSERT INTO progress_updates (project_id, progress_percent, title, note, updated_by)
         VALUES (?, ?, ?, ?, 2)`,
        [projectIds[i], percent, title, note],
      );
    }
  }

  const [[stats]] = await connection.execute(
    `SELECT COUNT(*) total, SUM(featured = 1) featured,
       SUM(status = 'IN_PROGRESS') in_progress, SUM(status = 'COMPLETED') completed,
       SUM(status = 'PLANNING') planning
     FROM projects`,
  );
  const [[contractStats]] = await connection.execute('SELECT COUNT(*) total FROM contracts');
  console.log('Dự án:', stats);
  console.log('Hợp đồng:', contractStats);
  await connection.end();
}

await main();
