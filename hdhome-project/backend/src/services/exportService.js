import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { pool } from '../config/database.js';
import { childLogger } from '../utils/logger.js';

const log = childLogger('export');

export const EXPORT_COLUMNS = {
  projects: [
    { key: 'project_code', header: 'Mã dự án', width: 14 },
    { key: 'project_name', header: 'Tên dự án', width: 32 },
    { key: 'customer_name', header: 'Khách hàng', width: 24 },
    { key: 'investor_name', header: 'Chủ đầu tư', width: 24 },
    { key: 'location', header: 'Địa điểm', width: 22 },
    { key: 'start_date', header: 'Ngày bắt đầu', width: 14 },
    { key: 'expected_end_date', header: 'Dự kiến hoàn thành', width: 18 },
    { key: 'status', header: 'Trạng thái', width: 16 },
    { key: 'progress', header: 'Tiến độ (%)', width: 14 },
  ],
  contracts: [
    { key: 'contract_number', header: 'Số hợp đồng', width: 18 },
    { key: 'project_name', header: 'Dự án', width: 30 },
    { key: 'customer_name', header: 'Khách hàng', width: 24 },
    { key: 'signed_date', header: 'Ngày ký', width: 14 },
    { key: 'start_date', header: 'Bắt đầu', width: 14 },
    { key: 'end_date', header: 'Kết thúc', width: 14 },
    { key: 'contract_value', header: 'Giá trị', width: 18 },
    { key: 'status', header: 'Trạng thái', width: 16 },
  ],
  customers: [
    { key: 'full_name', header: 'Họ tên', width: 28 },
    { key: 'phone', header: 'Điện thoại', width: 16 },
    { key: 'email', header: 'Email', width: 28 },
    { key: 'address', header: 'Địa chỉ', width: 36 },
    { key: 'note', header: 'Ghi chú', width: 30 },
  ],
  investors: [
    { key: 'full_name', header: 'Họ tên', width: 28 },
    { key: 'organization', header: 'Tổ chức', width: 28 },
    { key: 'phone', header: 'Điện thoại', width: 16 },
    { key: 'email', header: 'Email', width: 28 },
    { key: 'address', header: 'Địa chỉ', width: 36 },
  ],
  employees: [
    { key: 'employee_code', header: 'Mã nhân viên', width: 16 },
    { key: 'full_name', header: 'Họ tên', width: 28 },
    { key: 'position', header: 'Chức vụ', width: 24 },
    { key: 'department', header: 'Phòng ban', width: 22 },
    { key: 'phone', header: 'Điện thoại', width: 16 },
    { key: 'email', header: 'Email', width: 28 },
    { key: 'status', header: 'Trạng thái', width: 14 },
  ],
  materials: [
    { key: 'material_code', header: 'Mã vật tư', width: 16 },
    { key: 'material_name', header: 'Tên vật tư', width: 30 },
    { key: 'unit', header: 'Đơn vị tính', width: 16 },
    { key: 'description', header: 'Mô tả', width: 40 },
  ],
};

const QUERIES = {
  projects: `SELECT p.*, c.full_name customer_name, COALESCE(i.organization, i.full_name) investor_name
    FROM projects p
    LEFT JOIN customers c ON c.customer_id = p.customer_id
    LEFT JOIN investors i ON i.investor_id = p.investor_id
    ORDER BY p.created_at DESC`,
  contracts: `SELECT ct.*, p.project_name, c.full_name customer_name,
      COALESCE(i.organization, i.full_name) investor_name
    FROM contracts ct
    JOIN projects p ON p.project_id = ct.project_id
    LEFT JOIN customers c ON c.customer_id = ct.customer_id
    LEFT JOIN investors i ON i.investor_id = ct.investor_id
    ORDER BY ct.created_at DESC`,
  customers: 'SELECT * FROM customers ORDER BY created_at DESC',
  investors: 'SELECT * FROM investors ORDER BY created_at DESC',
  employees: 'SELECT * FROM employees ORDER BY created_at DESC',
  materials: 'SELECT * FROM materials ORDER BY created_at DESC',
};

async function fetchRows(resource) {
  const query = QUERIES[resource];
  if (!query) throw new Error(`Không hỗ trợ export "${resource}".`);
  const [rows] = await pool.execute(query);
  return rows;
}

function formatCell(column, value) {
  if (value === null || value === undefined) return '';
  if (column.key === 'contract_value') return Number(value).toLocaleString('vi-VN');
  if (column.key === 'progress') return `${value}%`;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

/** Xuất dữ liệu ra file Excel (.xlsx) và trả về Buffer. */
export async function exportToExcel(resource, title = 'HDHOME') {
  const columns = EXPORT_COLUMNS[resource];
  const rows = await fetchRows(resource);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HDHOME PMS';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Dữ liệu', {
    views: [{ state: 'frozen', ySplit: 4 }],
    pageSetup: { orientation: 'landscape', fitToPage: true },
  });

  sheet.mergeCells(1, 1, 1, columns.length);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = `${title} — ${EXPORT_LABELS[resource] || resource}`;
  titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 26;

  sheet.mergeCells(2, 1, 2, columns.length);
  const subCell = sheet.getCell(2, 1);
  subCell.value = `Xuất lúc ${new Date().toLocaleString('vi-VN')} · ${rows.length} bản ghi`;
  subCell.font = { italic: true, size: 10, color: { argb: 'FF666666' } };

  const headerRow = sheet.getRow(3);
  columns.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = column.header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3D5A80' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
  });
  headerRow.height = 22;

  rows.forEach((row, rowIndex) => {
    const excelRow = sheet.getRow(rowIndex + 4);
    columns.forEach((column, index) => {
      const cell = excelRow.getCell(index + 1);
      cell.value = formatCell(column, row[column.key]);
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = {
        top: { style: 'hair' }, left: { style: 'hair' },
        bottom: { style: 'hair' }, right: { style: 'hair' },
      };
      if (rowIndex % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F6FA' } };
      }
    });
  });

  columns.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width;
  });

  sheet.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: 3, column: columns.length },
  };

  return workbook.xlsx.writeBuffer();
}

/** Xuất dữ liệu ra file PDF và trả về Buffer. */
export async function exportToPdf(resource, title = 'HDHOME') {
  const columns = EXPORT_COLUMNS[resource];
  const rows = await fetchRows(resource);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 36 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).font('Helvetica-Bold').text(`${title} — ${EXPORT_LABELS[resource] || resource}`, { align: 'left' });
    doc.moveDown(0.2);
    doc.fontSize(9).font('Helvetica').fillColor('#666666')
      .text(`Xuất lúc ${new Date().toLocaleString('vi-VN')} · ${rows.length} bản ghi`);
    doc.moveDown(0.8);
    doc.fillColor('#000000');

    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = usableWidth / columns.length;

    const drawHeader = () => {
      const y = doc.y;
      doc.rect(doc.page.margins.left, y, usableWidth, 20).fill('#3D5A80');
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
      columns.forEach((column, index) => {
        doc.text(column.header, doc.page.margins.left + index * colWidth + 4, y + 6, {
          width: colWidth - 8,
          ellipsis: true,
          lineBreak: false,
        });
      });
      doc.fillColor('#000000');
      doc.y = y + 20;
    };

    drawHeader();

    doc.fontSize(8).font('Helvetica');
    rows.forEach((row, rowIndex) => {
      if (doc.y > doc.page.height - doc.page.margins.bottom - 24) {
        doc.addPage();
        drawHeader();
        doc.fontSize(8).font('Helvetica');
      }
      const y = doc.y;
      if (rowIndex % 2 === 1) {
        doc.rect(doc.page.margins.left, y, usableWidth, 16).fill('#F4F6FA');
      }
      columns.forEach((column, index) => {
        doc.fillColor('#222222').text(formatCell(column, row[column.key]),
          doc.page.margins.left + index * colWidth + 4, y + 4, {
            width: colWidth - 8,
            ellipsis: true,
            lineBreak: false,
          });
      });
      doc.y = y + 16;
    });

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i += 1) {
      doc.switchToPage(i);
      doc.fontSize(7).fillColor('#999999').text(
        `Trang ${i + 1} / ${range.count}`,
        doc.page.margins.left,
        doc.page.height - doc.page.margins.bottom + 6,
        { width: usableWidth, align: 'center' },
      );
    }

    doc.end();
  });
}

export const EXPORT_LABELS = {
  projects: 'Danh sách dự án',
  contracts: 'Danh sách hợp đồng',
  customers: 'Danh sách khách hàng',
  investors: 'Danh sách chủ đầu tư',
  employees: 'Danh sách nhân sự',
  materials: 'Danh sách vật tư',
};

export function isExportable(resource) {
  return Boolean(EXPORT_COLUMNS[resource]);
}

export async function exportResource(resource, format, title) {
  try {
    if (format === 'xlsx') {
      const buffer = await exportToExcel(resource, title);
      log.info({ resource, format, size: buffer.length }, 'Xuất file thành công');
      return { buffer, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx' };
    }
    if (format === 'pdf') {
      const buffer = await exportToPdf(resource, title);
      log.info({ resource, format, size: buffer.length }, 'Xuất file thành công');
      return { buffer, mime: 'application/pdf', ext: 'pdf' };
    }
    throw new Error(`Định dạng "${format}" không được hỗ trợ.`);
  } catch (error) {
    log.error({ err: error.message, resource, format }, 'Xuất file thất bại');
    throw error;
  }
}
