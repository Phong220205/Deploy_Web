import { childLogger } from './logger.js';

const log = childLogger('cache');

/**
 * Cache trong bộ nhớ với TTL, hỗ trợ single-flight để tránh query trùng lặp.
 * Dùng cho các endpoint đọc nhiều nhưng thay đổi ít (dashboard summary, danh mục).
 */
class MemoryCache {
  constructor(defaultTtlMs = 60_000, maxEntries = 500) {
    this.defaultTtlMs = defaultTtlMs;
    this.maxEntries = maxEntries;
    this.store = new Map();
    this.inflight = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) this.store.delete(oldestKey);
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }

  delete(key) {
    this.store.delete(key);
  }

  /** Xóa toàn bộ cache có chứa prefix (dùng khi dữ liệu liên quan bị thay đổi). */
  invalidate(prefix = '') {
    if (!prefix) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  /** Lấy từ cache, nếu chưa có thì gọi factory và lưu lại kết quả. */
  async wrap(key, factory, ttlMs = this.defaultTtlMs) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    if (this.inflight.has(key)) return this.inflight.get(key);

    const promise = Promise.resolve()
      .then(factory)
      .then((value) => {
        this.set(key, value, ttlMs);
        return value;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, promise);
    return promise;
  }

  stats() {
    const now = Date.now();
    let expired = 0;
    for (const entry of this.store.values()) {
      if (entry.expiresAt <= now) expired += 1;
    }
    return {
      entries: this.store.size,
      expired,
      inflight: this.inflight.size,
      maxEntries: this.maxEntries,
    };
  }
}

export const cache = new MemoryCache(
  Number(process.env.CACHE_TTL_MS) || 60_000,
  Number(process.env.CACHE_MAX_ENTRIES) || 500,
);

export const cacheKeys = {
  dashboardSummary: (userId) => `dashboard:summary:${userId || 'all'}`,
  resourceList: (resource, params) => `list:${resource}:${JSON.stringify(params)}`,
  resourceDetail: (resource, id) => `detail:${resource}:${id}`,
};

export function invalidateResource(resource) {
  cache.invalidate(`list:${resource}`);
  cache.invalidate(`detail:${resource}`);
  cache.invalidate('dashboard:summary');
  log.debug({ resource }, 'Đã vô hiệu hóa cache');
}
