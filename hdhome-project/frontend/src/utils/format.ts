export const statusLabels: Record<string, string> = {
  PLANNING: 'Lập kế hoạch', IN_PROGRESS: 'Đang thi công', PAUSED: 'Tạm dừng',
  COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy', DRAFT: 'Bản nháp', SIGNED: 'Đã ký',
  ACTIVE: 'Hoạt động', INACTIVE: 'Ngừng hoạt động', LOCKED: 'Đã khóa', LEAVE: 'Nghỉ phép',
  NEW: 'Mới', CONTACTED: 'Đã liên hệ', CLOSED: 'Đã đóng',
};

export const formatStatus = (status?: string) => status ? statusLabels[status] || status : '—';
export const formatDate = (date?: string) => date ? new Intl.DateTimeFormat('vi-VN').format(new Date(date)) : '—';
export const formatCurrency = (value?: number | string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0));
export const formatNumber = (value?: number | string) => new Intl.NumberFormat('vi-VN').format(Number(value || 0));
