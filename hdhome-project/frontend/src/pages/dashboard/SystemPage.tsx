import { useEffect, useState } from 'react';
import {
  Activity, BookOpen, Cpu, Database, Eraser, ExternalLink, HardDrive, Mail,
  RefreshCw, Server, Timer, Wifi,
} from 'lucide-react';
import { getApiError } from '../../api/client';
import { clearCache, CURRENT_API_URL, fetchSystemInfo, OPENAPI_YAML_URL, pingApi } from '../../services/operations';
import { useToast } from '../../contexts/ToastContext';
import { ErrorState, LoadingState } from '../../components/common/Feedback';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDate } from '../../utils/format';
import type { SystemInfo } from '../../types';

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days) return `${days} ngày ${hours} giờ`;
  if (hours) return `${hours} giờ ${minutes} phút`;
  return `${minutes} phút`;
}

export function SystemPage() {
  const { showToast } = useToast();
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearing, setClearing] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setInfo(await fetchSystemInfo());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    void pingApi().then(setOnline);
  }, []);

  async function handleClearCache() {
    setClearing(true);
    try {
      await clearCache();
      showToast('Đã xóa toàn bộ cache.');
      await load();
    } catch (err) {
      showToast(getApiError(err), 'error');
    } finally {
      setClearing(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="HỆ THỐNG"
        title="Thông tin hệ thống"
        description="Tình trạng máy chủ, cơ sở dữ liệu, cache, tác vụ định kỳ và tài liệu API."
        actions={
          <button className="button button--secondary" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? 'spin' : undefined} />
            Làm mới
          </button>
        }
      />

      {loading ? (
        <section className="panel"><LoadingState label="Đang thu thập thông tin hệ thống..." /></section>
      ) : error ? (
        <section className="panel"><ErrorState message={error} onRetry={load} /></section>
      ) : info ? (
        <>
          <section className="system-stat-grid">
            <article className="system-stat">
              <span className="system-stat-icon"><Server /></span>
              <div>
                <small>Máy chủ</small>
                <strong>Node {info.server.nodeVersion}</strong>
                <em>{info.server.platform} · {formatUptime(info.server.uptimeSeconds)}</em>
              </div>
            </article>
            <article className="system-stat">
              <span className="system-stat-icon"><HardDrive /></span>
              <div>
                <small>Bộ nhớ sử dụng</small>
                <strong>{info.server.memoryMB} MB</strong>
                <em>Dung lượng RSS tiến trình</em>
              </div>
            </article>
            <article className="system-stat">
              <span className="system-stat-icon"><Database /></span>
              <div>
                <small>Cơ sở dữ liệu</small>
                <strong>{info.database.version.split(' ').slice(0, 2).join(' ')}</strong>
                <em>{formatDate(info.database.serverTime)}</em>
              </div>
            </article>
            <article className="system-stat">
              <span className="system-stat-icon"><Wifi /></span>
              <div>
                <small>Kết nối API</small>
                <strong>{online === null ? 'Đang kiểm tra' : online ? 'Đang hoạt động' : 'Mất kết nối'}</strong>
                <em className="system-api-url">{CURRENT_API_URL}</em>
              </div>
            </article>
          </section>

          <div className="system-grid">
            <section className="panel">
              <header className="panel-table-header">
                <div><span className="panel-kicker">BỘ NHỚ ĐỆM</span><h2>Cache</h2></div>
                <Activity />
              </header>
              <div className="system-body">
                <dl className="system-list">
                  <div><dt>Số mục đang lưu</dt><dd>{info.cache.entries}</dd></div>
                  <div><dt>Mục đã hết hạn</dt><dd>{info.cache.expired}</dd></div>
                  <div><dt>Request đang chờ</dt><dd>{info.cache.inflight}</dd></div>
                  <div><dt>Giới hạn tối đa</dt><dd>{info.cache.maxEntries}</dd></div>
                </dl>
                <button className="button button--secondary" onClick={handleClearCache} disabled={clearing}>
                  <Eraser />
                  {clearing ? 'Đang xóa...' : 'Xóa toàn bộ cache'}
                </button>
              </div>
            </section>

            <section className="panel">
              <header className="panel-table-header">
                <div><span className="panel-kicker">THƯ ĐIỆN</span><h2>Cấu hình SMTP</h2></div>
                <Mail />
              </header>
              <div className="system-body">
                <dl className="system-list">
                  <div><dt>Trạng thái</dt><dd>{info.mailer.configured ? 'Đã cấu hình' : 'Chưa cấu hình'}</dd></div>
                  <div><dt>Mail server</dt><dd>{info.mailer.host || '—'}</dd></div>
                  <div><dt>Địa chỉ gửi</dt><dd>{info.mailer.from || '—'}</dd></div>
                </dl>
                <p className="system-hint">
                  {info.mailer.configured
                    ? 'Hệ thống sẽ gửi email thông báo khi có yêu cầu liên hệ mới từ website.'
                    : 'Chưa cấu hình SMTP — hệ thống vẫn hoạt động bình thường, chỉ bỏ qua bước gửi email. Thêm SMTP_HOST, SMTP_USER, SMTP_PASS vào biến môi trường để bật.'}
                </p>
              </div>
            </section>

            <section className="panel">
              <header className="panel-table-header">
                <div><span className="panel-kicker">TÁC VỤ ĐỊNH KỲ</span><h2>Lịch chạy tự động</h2></div>
                <Timer />
              </header>
              <div className="system-body">
                <ul className="schedule-list">
                  {info.scheduler.map((job) => (
                    <li key={job.key}>
                      <span className="schedule-dot" />
                      <div>
                        <strong>{job.label}</strong>
                        <em><code>{job.cron}</code></em>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="panel">
              <header className="panel-table-header">
                <div><span className="panel-kicker">TÀI LIỆU</span><h2>API documentation</h2></div>
                <BookOpen />
              </header>
              <div className="system-body">
                <p className="system-hint">
                  Toàn bộ endpoint của hệ thống được mô tả theo chuẩn OpenAPI 3.0, hỗ trợ thử trực tiếp ngay trên trình duyệt.
                </p>
                <div className="system-doc-links">
                  <a className="button button--secondary" href={CURRENT_API_URL.replace(/\/api\/?$/, '') + '/api/docs/'} target="_blank" rel="noreferrer">
                    <ExternalLink />
                    Mở Swagger UI
                  </a>
                  <a className="button button--ghost" href={OPENAPI_YAML_URL} target="_blank" rel="noreferrer">
                    <Cpu />
                    Xem openapi.yaml
                  </a>
                </div>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}
