import { useEffect, useState } from 'react';
import { Activity, Filter, Loader2, RefreshCw, ScrollText } from 'lucide-react';
import { api, getApiError } from '../../api/client';
import { fetchAuditLogs } from '../../services/operations';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/Feedback';
import { PageHeader } from '../../components/common/PageHeader';
import { Pagination } from '../../components/common/Pagination';
import { formatDate } from '../../utils/format';
import type { AuditLog, Pagination as PaginationType } from '../../types';

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Thêm mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  LOGIN: 'Đăng nhập',
  LOGIN_FAILED: 'Đăng nhập sai',
  LOGOUT: 'Đăng xuất',
  UPLOAD: 'Tải lên',
  EXPORT: 'Xuất báo cáo',
};

const ENTITY_LABELS: Record<string, string> = {
  projects: 'Dự án',
  contracts: 'Hợp đồng',
  customers: 'Khách hàng',
  investors: 'Chủ đầu tư',
  employees: 'Nhân sự',
  materials: 'Vật tư',
  users: 'Người dùng',
  contact_requests: 'Yêu cầu liên hệ',
};

const defaultPagination: PaginationType = { page: 1, limit: 25, total: 0, totalPages: 1 };

export function AuditLogsPage() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [applied, setApplied] = useState({ action: '', entity: '' });

  async function load(page = 1) {
    setLoading(true);
    setError('');
    try {
      const result = await fetchAuditLogs({
        page,
        limit: 25,
        action: applied.action,
        entity: applied.entity,
      });
      setItems(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1);
  }, [applied]);

  function applyFilter(event: React.FormEvent) {
    event.preventDefault();
    setApplied({ action, entity });
  }

  function resetFilter() {
    setAction('');
    setEntity('');
    setApplied({ action: '', entity: '' });
  }

  return (
    <>
      <PageHeader
        eyebrow="GIÁM SÁT"
        title="Nhật ký thao tác"
        description="Ghi lại mọi thao tác quan trọng trong hệ thống: đăng nhập, thêm / sửa / xóa dữ liệu và xuất báo cáo."
        actions={
          <button className="button button--secondary" onClick={() => load(pagination.page)} disabled={loading}>
            {loading ? <Loader2 className="spin" /> : <RefreshCw />}
            Làm mới
          </button>
        }
      />

      <section className="panel table-panel">
        <form className="table-toolbar" onSubmit={applyFilter}>
          <label className="search-box">
            <Filter />
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              style={{ border: 0, background: 'transparent', width: '100%' }}
            >
              <option value="">Tất cả thao tác</option>
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
          <select
            className="standalone-select"
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
          >
            <option value="">Tất cả đối tượng</option>
            {Object.entries(ENTITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button className="button button--secondary">Lọc</button>
          {(applied.action || applied.entity) && (
            <button type="button" className="button button--ghost" onClick={resetFilter}>Xóa lọc</button>
          )}
        </form>

        {loading ? (
          <LoadingState label="Đang tải nhật ký..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(pagination.page)} />
        ) : !items.length ? (
          <EmptyState title="Chưa có nhật ký thao tác" description="Các thao tác trong hệ thống sẽ được ghi lại tại đây." />
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Thời điểm</th>
                    <th>Tài khoản</th>
                    <th>Vai trò</th>
                    <th>Thao tác</th>
                    <th>Đối tượng</th>
                    <th>Chi tiết</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.audit_id}>
                      <td>{formatDate(item.created_at)}</td>
                      <td className="table-primary-cell">{item.username || '—'}</td>
                      <td>{item.role_name || '—'}</td>
                      <td>
                        <span className={`audit-badge audit-badge--${item.action.toLowerCase()}`}>
                          {ACTION_LABELS[item.action] || item.action}
                        </span>
                      </td>
                      <td>
                        {item.entity
                          ? `${ENTITY_LABELS[item.entity] || item.entity}${item.entity_id ? ` #${item.entity_id}` : ''}`
                          : '—'}
                      </td>
                      <td className="audit-message">{item.message || '—'}</td>
                      <td>{item.ip_address || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={load} />
          </>
        )}
      </section>

      <section className="panel audit-summary">
        <header className="panel-table-header">
          <div>
            <span className="panel-kicker">TỔNG QUAN</span>
            <h2>Vì sao cần nhật ký?</h2>
          </div>
          <ScrollText />
        </header>
        <div className="audit-note-grid">
          <article>
            <Activity />
            <h3>Truy vết đầy đủ</h3>
            <p>Mỗi thao tác ghi/xóa dữ liệu đều lưu lại người thực hiện, thời điểm và địa chỉ IP.</p>
          </article>
          <article>
            <ScrollText />
            <h3>Phát hiện bất thường</h3>
            <p>Các lần đăng nhập sai mật khẩu được ghi nhận để phát hiện hành vi truy cập trái phép.</p>
          </article>
          <article>
            <RefreshCw />
            <h3>Tự động dọn dẹp</h3>
            <p>Nhật ký cũ hơn 90 ngày sẽ tự động được xóa vào 02:00 Chủ nhật hằng tuần.</p>
          </article>
        </div>
      </section>
    </>
  );
}
