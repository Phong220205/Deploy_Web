import test from 'node:test';
import assert from 'node:assert/strict';
import { cache, cacheKeys, invalidateResource } from '../src/utils/cache.js';
import { EXPORT_COLUMNS, EXPORT_LABELS, isExportable } from '../src/services/exportService.js';
import { SCHEDULES } from '../src/services/scheduler.js';
import { buildOpenApiYaml, openapiDocument } from '../src/services/openapi.js';
import { mailerStatus } from '../src/services/mailer.js';

test('cache lưu và hết hạn theo TTL', () => {
  cache.invalidate();
  cache.set('test:key', { a: 1 }, 1000);
  assert.deepEqual(cache.get('test:key'), { a: 1 });
  cache.set('test:expired', 'x', -1);
  assert.equal(cache.get('test:expired'), undefined);
});

test('cache single-flight chỉ gọi factory một lần cho request song song', async () => {
  cache.invalidate();
  let calls = 0;
  const factory = async () => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return 'value';
  };
  const results = await Promise.all([
    cache.wrap('test:sf', factory),
    cache.wrap('test:sf', factory),
    cache.wrap('test:sf', factory),
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(results, ['value', 'value', 'value']);
});

test('invalidateResource xóa cache liên quan', () => {
  cache.invalidate();
  cache.set(cacheKeys.dashboardSummary(1), 'x');
  cache.set(cacheKeys.resourceList('projects', { page: 1 }), 'y');
  invalidateResource('projects');
  assert.equal(cache.get(cacheKeys.dashboardSummary(1)), undefined);
  assert.equal(cache.get(cacheKeys.resourceList('projects', { page: 1 })), undefined);
});

test('cấu hình export bao phủ 6 danh mục và có nhãn tiếng Việt', () => {
  const resources = ['projects', 'contracts', 'customers', 'investors', 'employees', 'materials'];
  for (const resource of resources) {
    assert.equal(isExportable(resource), true, `${resource} phải export được`);
    assert.ok(EXPORT_COLUMNS[resource].length > 0);
    assert.ok(EXPORT_LABELS[resource]);
  }
  assert.equal(isExportable('users'), false);
});

test('cấu hình cron định kỳ có biểu thức hợp lệ', () => {
  const keys = Object.keys(SCHEDULES);
  assert.ok(keys.length >= 3);
  for (const key of keys) {
    const { cron } = SCHEDULES[key];
    assert.equal(cron.split(' ').length, 5, `${key} phải có 5 trường cron`);
    assert.ok(SCHEDULES[key].label.length > 0);
  }
});

test('OpenAPI document mô tả đủ endpoint chính', () => {
  const paths = Object.keys(openapiDocument.paths);
  for (const path of ['/health', '/auth/login', '/dashboard/summary', '/projects', '/export/{resource}', '/audit-logs']) {
    assert.ok(paths.includes(path), `thiếu path ${path}`);
  }
  const yaml = buildOpenApiYaml();
  assert.ok(yaml.includes('openapi: 3.0.3'));
  assert.ok(yaml.includes('/export/{resource}'));
});

test('mailer báo trạng thái cấu hình SMTP', () => {
  const status = mailerStatus();
  assert.equal(typeof status.configured, 'boolean');
  assert.ok(status.frontendUrl);
});
