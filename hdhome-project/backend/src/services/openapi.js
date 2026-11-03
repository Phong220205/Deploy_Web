import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { childLogger } from '../utils/logger.js';

const log = childLogger('openapi');

const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'HDHOME API',
    version: '1.0.0',
    description:
      'API quản lý dự án kiến trúc - xây dựng của HDHOME. Bao gồm quản lý dự án, hợp đồng, khách hàng, chủ đầu tư, nhân sự, vật tư, nhân sự và báo cáo.',
    contact: { name: 'HDHOME', url: 'https://hdhome-frontend.onrender.com' },
  },
  servers: [
    { url: '/api', description: 'Server hiện tại' },
    { url: 'https://hdhome-backend.onrender.com/api', description: 'Production' },
  ],
  tags: [
    { name: 'Auth', description: 'Đăng nhập / phiên làm việc' },
    { name: 'Dashboard', description: 'Số liệu tổng quan' },
    { name: 'Projects', description: 'Quản lý dự án' },
    { name: 'Contracts', description: 'Quản lý hợp đồng' },
    { name: 'Resources', description: 'Danh mục dữ liệu' },
    { name: 'Export', description: 'Xuất báo cáo Excel / PDF' },
    { name: 'Audit', description: 'Nhật ký thao tác' },
    { name: 'Public', description: 'API công khai không cần token' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'array', items: { type: 'object' } },
          pagination: { $ref: '#/components/schemas/Pagination' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      Project: {
        type: 'object',
        properties: {
          project_id: { type: 'integer' },
          project_code: { type: 'string', example: 'HD-A01' },
          project_name: { type: 'string', example: 'Nhà phố hiện đại A01' },
          customer_id: { type: 'integer', nullable: true },
          investor_id: { type: 'integer', nullable: true },
          location: { type: 'string' },
          start_date: { type: 'string', format: 'date' },
          expected_end_date: { type: 'string', format: 'date' },
          status: {
            type: 'string',
            enum: ['PLANNING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED'],
          },
          progress: { type: 'integer', minimum: 0, maximum: 100 },
          featured: { type: 'boolean' },
        },
      },
      Contract: {
        type: 'object',
        properties: {
          contract_id: { type: 'integer' },
          contract_number: { type: 'string', example: 'HD-A01-2026' },
          project_id: { type: 'integer' },
          contract_value: { type: 'number', example: 1850000000 },
          status: {
            type: 'string',
            enum: ['DRAFT', 'SIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        tags: ['Dashboard'],
        summary: 'Kiểm tra tình trạng hệ thống',
        security: [],
        responses: { 200: { description: 'Hệ thống hoạt động' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', format: 'password', example: 'Admin@123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Đăng nhập thành công, trả về token JWT' },
          401: { description: 'Sai thông tin đăng nhập' },
          429: { description: 'Quá số lần đăng nhập trong thời gian ngắn' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Thông tin người dùng hiện tại',
        responses: { 200: { description: 'Thông tin tài khoản' } },
      },
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Đăng xuất', responses: { 200: { description: 'Đã đăng xuất' } } },
    },
    '/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Số liệu tổng quan cho dashboard',
        responses: { 200: { description: 'Tổng hợp dự án, hợp đồng, khách hàng' } },
      },
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'Danh sách dự án',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', example: '-updated_at' } },
        ],
        responses: { 200: { description: 'Danh sách dự án' } },
      },
      post: {
        tags: ['Projects'],
        summary: 'Tạo dự án',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } },
        },
        responses: { 201: { description: 'Đã tạo' }, 422: { description: 'Dữ liệu không hợp lệ' } },
      },
    },
    '/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Chi tiết dự án',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Chi tiết dự án' }, 404: { description: 'Không tìm thấy' } },
      },
      put: {
        tags: ['Projects'],
        summary: 'Cập nhật dự án',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } },
        },
        responses: { 200: { description: 'Đã cập nhật' } },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Xóa dự án',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Đã xóa' } },
      },
    },
    '/projects/{id}/employees': {
      get: {
        tags: ['Projects'],
        summary: 'Nhân sự được phân công cho dự án',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Danh sách phân công' } },
      },
    },
    '/projects/{id}/materials': {
      get: {
        tags: ['Projects'],
        summary: 'Vật tư được phân bổ cho dự án',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Danh sách phân bổ' } },
      },
    },
    '/projects/{id}/progress': {
      get: {
        tags: ['Projects'],
        summary: 'Lịch sử cập nhật tiến độ',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Danh sách cập nhật' } },
      },
      post: {
        tags: ['Projects'],
        summary: 'Thêm cập nhật tiến độ',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['progress_percent', 'title'],
                properties: {
                  progress_percent: { type: 'integer', minimum: 0, maximum: 100 },
                  title: { type: 'string' },
                  note: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Đã thêm' } },
      },
    },
    '/contracts': {
      get: { tags: ['Contracts'], summary: 'Danh sách hợp đồng', responses: { 200: { description: 'Danh sách' } } },
      post: {
        tags: ['Contracts'],
        summary: 'Tạo hợp đồng',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Contract' } } },
        },
        responses: { 201: { description: 'Đã tạo' } },
      },
    },
    '/customers': { get: { tags: ['Resources'], summary: 'Danh sách khách hàng', responses: { 200: { description: 'Danh sách' } } } },
    '/investors': { get: { tags: ['Resources'], summary: 'Danh sách chủ đầu tư', responses: { 200: { description: 'Danh sách' } } } },
    '/employees': { get: { tags: ['Resources'], summary: 'Danh sách nhân sự', responses: { 200: { description: 'Danh sách' } } } },
    '/materials': { get: { tags: ['Resources'], summary: 'Danh sách vật tư', responses: { 200: { description: 'Danh sách' } } } },
    '/contacts': { get: { tags: ['Resources'], summary: 'Danh sách yêu cầu liên hệ', responses: { 200: { description: 'Danh sách' } } } },
    '/users': { get: { tags: ['Resources'], summary: 'Danh sách người dùng', responses: { 200: { description: 'Danh sách' } } } },
    '/roles': { get: { tags: ['Resources'], summary: 'Danh sách vai trò', responses: { 200: { description: 'Danh sách' } } } },
    '/export/{resource}': {
      get: {
        tags: ['Export'],
        summary: 'Xuất dữ liệu ra Excel hoặc PDF',
        parameters: [
          { name: 'resource', in: 'path', required: true, schema: { type: 'string', enum: ['projects', 'contracts', 'customers', 'investors', 'employees', 'materials'] } },
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['xlsx', 'pdf'], default: 'xlsx' } },
        ],
        responses: {
          200: { description: 'File tải về', content: { 'application/octet-stream': {} } },
        },
      },
    },
    '/audit-logs': {
      get: {
        tags: ['Audit'],
        summary: 'Nhật ký thao tác',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Danh sách nhật ký' } },
      },
    },
    '/public/projects': {
      get: { tags: ['Public'], summary: 'Dự án công khai', security: [], responses: { 200: { description: 'Danh sách dự án công khai' } } },
    },
    '/public/projects/{id}': {
      get: {
        tags: ['Public'],
        summary: 'Chi tiết dự án công khai',
        security: [],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Chi tiết dự án' } },
      },
    },
    '/public/contacts': {
      post: {
        tags: ['Public'],
        summary: 'Gửi yêu cầu tư vấn',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['full_name', 'phone', 'message'],
                properties: {
                  full_name: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string' },
                  subject: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Đã ghi nhận' } },
      },
    },
  },
};

export function buildOpenApiYaml() {
  return YAML.stringify(openapiDocument, { lineWidth: 100 });
}

export function mountOpenApi(app) {
  app.get('/openapi.yaml', (_req, res) => {
    res.type('text/yaml').send(buildOpenApiYaml());
  });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, {
    customSiteTitle: 'HDHOME API Docs',
    swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
  }));
  log.info('Đã gắn tài liệu OpenAPI tại /api/docs');
}

export { openapiDocument };
