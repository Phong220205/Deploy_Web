import { compactErrors, STATUS_ENUMS, validators as v } from './common.js';

export const validateLogin = (body) => compactErrors([
  v.required(body.username, 'Tên đăng nhập'),
  v.required(body.password, 'Mật khẩu'),
]);

export const validateProject = (body, req) => {
  const errors = compactErrors([
    v.required(body.project_code, 'Mã dự án'),
    v.required(body.project_name, 'Tên dự án'),
    body.progress !== undefined ? v.range(body.progress, 0, 100, 'Tiến độ') : null,
    v.oneOf(body.status, STATUS_ENUMS.projects),
  ]);
  if (body.start_date && body.expected_end_date && body.start_date > body.expected_end_date) {
    errors.push('Ngày bắt đầu không được lớn hơn ngày dự kiến hoàn thành.');
  }
  if (req.method === 'POST' && !body.status) body.status = 'PLANNING';
  return errors;
};

export const validateContact = (body) => compactErrors([
  v.required(body.full_name, 'Họ tên'),
  v.required(body.phone, 'Số điện thoại'),
  v.phone(body.phone),
  v.email(body.email),
  v.required(body.subject, 'Chủ đề'),
  v.required(body.message, 'Nội dung'),
]);

export const validateProgress = (body) => compactErrors([
  v.range(body.progress_percent, 0, 100, 'Tiến độ'),
  v.required(body.title, 'Tiêu đề'),
]);

export const validateUser = (body, req) => compactErrors([
  req.method === 'POST' ? v.required(body.username, 'Tên đăng nhập') : null,
  req.method === 'POST' ? v.required(body.password, 'Mật khẩu') : null,
  v.required(body.full_name, 'Họ tên'),
  v.email(body.email),
  v.phone(body.phone),
  v.required(body.role_id, 'Vai trò'),
  v.oneOf(body.status, STATUS_ENUMS.users),
]);

export const validateGeneric = (resource) => (body) => {
  const required = {
    customers: ['full_name'], investors: ['full_name'], employees: ['employee_code', 'full_name'],
    materials: ['material_code', 'material_name', 'unit'], contracts: ['contract_number', 'project_id', 'contract_value'],
  }[resource] || [];
  const statusEnum = { employees: STATUS_ENUMS.employees, contracts: STATUS_ENUMS.contracts, contacts: STATUS_ENUMS.contacts }[resource];
  return compactErrors([
    ...required.map((field) => v.required(body[field], field)),
    v.email(body.email),
    v.phone(body.phone),
    statusEnum ? v.oneOf(body.status, statusEnum) : null,
  ]);
};
