import { useEffect, useState } from 'react';
import { Eye, Filter, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getApiError } from '../../api/client';
import { ConfirmModal } from '../../components/common/Modal';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/Feedback';
import { PageHeader } from '../../components/common/PageHeader';
import { Pagination } from '../../components/common/Pagination';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import type { ApiResponse, Pagination as PaginationType, Project } from '../../types';
import { formatDate } from '../../utils/format';

const defaultPagination: PaginationType = { page: 1, limit: 10, total: 0, totalPages: 1 };

export function ProjectsAdminPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<Project[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const [status, setStatus] = useState('');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteItem, setDeleteItem] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const canManage = user?.role_name !== 'TECHNICAL_STAFF';

  async function load(page = 1) {
    setLoading(true); setError('');
    try {
      const response = await api.get<ApiResponse<Project[]>>('/projects', {
        params: { page, limit: 10, search, status, sort: '-p.created_at' },
      });
      const list = response.data.data || [];
      setItems(onlyFeatured ? list.filter((p) => Boolean(p.featured)) : list);
      setPagination(response.data.pagination || defaultPagination);
    } catch (err) { setError(getApiError(err)); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(1); }, [search, status, onlyFeatured]);

  async function confirmDelete() {
    if (!deleteItem) return; setDeleting(true);
    try { await api.delete(`/projects/${deleteItem.project_id}`); showToast('Xóa dự án thành công.'); setDeleteItem(null); await load(pagination.page); }
    catch (err) { showToast(getApiError(err), 'error'); }
    finally { setDeleting(false); }
  }

  /** Bật/tắt hiển thị công khai ngay trên bảng, không cần mở form sửa. */
  async function toggleFeatured(project: Project) {
    setTogglingId(project.project_id);
    try {
      const response = await api.patch<ApiResponse<{ project_id: number; featured: number }>>(`/projects/${project.project_id}/featured`);
      const featured = Boolean(response.data.data?.featured);
      setItems((current) => current.map((p) => (p.project_id === project.project_id ? { ...p, featured } : p)));
      showToast(response.data.message || (featured ? 'Đã bật hiển thị công khai.' : 'Đã ẩn khỏi website công khai.'), 'success');
    } catch (err) { showToast(getApiError(err), 'error'); }
    finally { setTogglingId(null); }
  }

  return (
    <>
      <PageHeader eyebrow="DỰ ÁN" title="Danh sách dự án" description={canManage ? 'Theo dõi, tìm kiếm và quản lý toàn bộ dự án.' : 'Các dự án bạn đang được phân công.'} actions={canManage && <Link className="button button--accent" to="/dashboard/projects/create"><Plus /> Thêm dự án</Link>} />
      <section className="panel table-panel">
        <form className="table-toolbar" onSubmit={(event) => { event.preventDefault(); setSearch(draftSearch); }}>
          <label className="search-box"><Search /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Tìm theo mã, tên, địa điểm..." /></label>
          <label className="filter-select"><Filter /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Tất cả trạng thái</option><option value="PLANNING">Lập kế hoạch</option><option value="IN_PROGRESS">Đang thi công</option><option value="PAUSED">Tạm dừng</option><option value="COMPLETED">Hoàn thành</option><option value="CANCELLED">Đã hủy</option></select></label>
          <label className="filter-toggle">
            <input type="checkbox" checked={onlyFeatured} onChange={(event) => setOnlyFeatured(event.target.checked)} />
            <span>Chỉ dự án tiêu biểu</span>
          </label>
          <button className="button button--secondary">Tìm kiếm</button>
        </form>
        {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => load(pagination.page)} /> : !items.length ? <EmptyState title="Không có dự án phù hợp" /> : <><div className="table-scroll"><table><thead><tr><th>Mã</th><th>Tên dự án</th><th>Khách hàng</th><th>Địa điểm</th><th>Ngày bắt đầu</th><th>Tiến độ</th><th>Trạng thái</th><th>Công khai</th><th className="actions-cell">Thao tác</th></tr></thead><tbody>{items.map((project) => { const isFeatured = Boolean(project.featured); return (
          <tr key={project.project_id}>
            <td><strong className="code-cell">{project.project_code}</strong></td>
            <td><div className="table-primary"><strong>{project.project_name}</strong><small>{project.investor_name || 'Chưa có chủ đầu tư'}</small></div></td>
            <td>{project.customer_name || '—'}</td>
            <td>{project.location || '—'}</td>
            <td>{formatDate(project.start_date)}</td>
            <td className="progress-cell"><ProgressBar value={project.progress} compact /></td>
            <td><StatusBadge status={project.status} /></td>
            <td>
              {canManage ? (
                <button
                  type="button"
                  className={`icon-button featured-toggle ${isFeatured ? 'is-featured' : ''}`}
                  title={isFeatured ? 'Đang hiển thị công khai — bấm để ẩn' : 'Đang ẩn — bấm để hiển thị công khai'}
                  aria-label={isFeatured ? 'Ẩn khỏi website công khai' : 'Hiển thị trên website công khai'}
                  aria-pressed={isFeatured}
                  disabled={togglingId === project.project_id}
                  onClick={() => toggleFeatured(project)}
                >
                  <Star />
                </button>
              ) : (
                <span className={`featured-state ${isFeatured ? 'is-featured' : ''}`}>{isFeatured ? 'Có' : 'Không'}</span>
              )}
            </td>
            <td className="actions-cell">
              <Link className="icon-button" title="Xem chi tiết" to={`/dashboard/projects/${project.project_id}`}><Eye /></Link>
              {canManage && <><Link className="icon-button" title="Chỉnh sửa" to={`/dashboard/projects/${project.project_id}/edit`}><Pencil /></Link><button className="icon-button icon-button--danger" title="Xóa" onClick={() => setDeleteItem(project)}><Trash2 /></button></>}
            </td>
          </tr>
        ); })}</tbody></table></div><Pagination pagination={pagination} onPageChange={load} /></>}
      </section>
      <ConfirmModal open={Boolean(deleteItem)} busy={deleting} message={`Bạn có chắc chắn muốn xóa dự án “${deleteItem?.project_name}”? Dữ liệu liên quan cũng sẽ bị xóa.`} onClose={() => setDeleteItem(null)} onConfirm={confirmDelete} />
    </>
  );
}
