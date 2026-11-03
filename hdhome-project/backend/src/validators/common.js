const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+().\s-]{8,20}$/;

// Các giá trị status hợp lệ, khớp với ENUM trong backend/database/schema.sql.
export const STATUS_ENUMS = {
  projects: ['PLANNING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED'],
  contracts: ['DRAFT', 'SIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  users: ['ACTIVE', 'LOCKED'],
  employees: ['ACTIVE', 'INACTIVE', 'LEAVE'],
  contacts: ['NEW', 'CONTACTED', 'CLOSED'],
};

export const validators = {
  required(value, label) {
    return value === undefined || value === null || String(value).trim() === '' ? `${label} là bắt buộc.` : null;
  },
  email(value, label = 'Email') {
    return value && !emailPattern.test(String(value)) ? `${label} không đúng định dạng.` : null;
  },
  phone(value, label = 'Số điện thoại') {
    return value && !phonePattern.test(String(value)) ? `${label} không đúng định dạng cơ bản.` : null;
  },
  range(value, min, max, label) {
    const number = Number(value);
    return Number.isNaN(number) || number < min || number > max ? `${label} phải từ ${min} đến ${max}.` : null;
  },
  oneOf(value, allowed, label = 'Trạng thái') {
    if (value === undefined || value === null || value === '') return null;
    return allowed.includes(String(value)) ? null : `${label} không hợp lệ. Chỉ chấp nhận: ${allowed.join(', ')}.`;
  },
};

export function compactErrors(errors) {
  return errors.filter(Boolean);
}
