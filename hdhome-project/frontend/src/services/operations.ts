import axios from 'axios';
import { api, API_BASE_URL, SERVER_BASE_URL } from '../api/client';
import type { ApiResponse, AuditLog, Pagination, SystemInfo } from '../types';

/** Danh mục có thể xuất báo cáo ra Excel / PDF. */
export const EXPORT_RESOURCES = [
  { key: 'projects', label: 'Dự án', description: 'Mã dự án, khách hàng, chủ đầu tư, tiến độ, trạng thái.', endpoint: '/export/projects' },
  { key: 'contracts', label: 'Hợp đồng', description: 'Số hợp đồng, dự án, giá trị, thời hạn, trạng thái.', endpoint: '/export/contracts' },
  { key: 'customers', label: 'Khách hàng', description: 'Hồ sơ khách hàng kèm thông tin liên hệ.', endpoint: '/export/customers' },
  { key: 'investors', label: 'Chủ đầu tư', description: 'Chủ đầu tư cá nhân hoặc tổ chức.', endpoint: '/export/investors' },
  { key: 'employees', label: 'Nhân sự', description: 'Danh sách nhân viên theo phòng ban, chức vụ.', endpoint: '/export/employees' },
  { key: 'materials', label: 'Vật tư', description: 'Danh mục vật tư và đơn vị tính.', endpoint: '/export/materials' },
];

export type ExportFormat = 'xlsx' | 'pdf';

/**
 * Tải file export xuống máy người dùng.
 * Dùng axios với responseType 'blob' vì đây là file nhị phân, không phải JSON.
 */
export async function downloadExport(resource: string, format: ExportFormat): Promise<void> {
  const response = await api.get(`/export/${resource}`, {
    params: { format },
    responseType: 'blob',
    timeout: 60000,
  });

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `hdhome-${resource}-${stamp}.${format}`;

  // Ưu tiên tên file do server gửi về (Content-Disposition)
  const disposition = String(response.headers['content-disposition'] || '');
  const match = disposition.match(/filename="?([^";]+)"?/);
  const finalName = match ? match[1] : filename;

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = finalName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export async function fetchAuditLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
}): Promise<{ data: AuditLog[]; pagination: Pagination }> {
  const response = await api.get<ApiResponse<AuditLog[]>>('/audit-logs', { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 },
  };
}

export async function fetchSystemInfo(): Promise<SystemInfo> {
  const response = await api.get<ApiResponse<SystemInfo>>('/system/info');
  return response.data.data;
}

export async function clearCache(): Promise<void> {
  await api.post('/system/cache/clear');
}

/** Link mở tài liệu API (Swagger UI) ở tab mới. */
export const API_DOCS_URL = `${SERVER_BASE_URL}/api/docs/`;
export const OPENAPI_YAML_URL = `${SERVER_BASE_URL}/openapi.yaml`;

/** Endpoint API đang chạy — hiển thị trong trang hệ thống. */
export const CURRENT_API_URL = API_BASE_URL;

/** Kiểm tra kết nối tới API từ trình duyệt. */
export async function pingApi(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 8000 });
    return response.status === 200;
  } catch {
    return false;
  }
}
