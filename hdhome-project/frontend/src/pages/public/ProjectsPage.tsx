import { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import { api, getApiError } from '../../api/client';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/Feedback';
import { Pagination } from '../../components/common/Pagination';
import { ProjectCard } from '../../components/common/ProjectCard';
import type { ApiResponse, Pagination as PaginationType, Project } from '../../types';

const defaultPagination: PaginationType = { page: 1, limit: 9, total: 0, totalPages: 1 };

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('revealed');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    // Sau khi load xong, observe lại các element mới
    const timer = setTimeout(() => {
      document.querySelectorAll('.animate-on-scroll:not(.revealed)').forEach(el => observer.observe(el));
    }, 100);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, [projects, loading]);

  async function load(page = 1) {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ApiResponse<Project[]>>('/public/projects', { params: { page, limit: 9, search, status } });
      setProjects(response.data.data);
      setPagination(response.data.pagination || defaultPagination);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1);
  }, [search, status]);

  return (
    <main className="projects-page">
      {/* Hero */}
      <section className="projects-hero">
        <div className="hero-bg-effects">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-grid-bg"></div>
        </div>
        <div className="public-container">
          <div className="hero-content-grid">
            <div className="hero-text animate-on-scroll">
              <div className="hero-badge-modern">
                <Grid size={16} />
                <span>Dự án của chúng tôi</span>
              </div>
              <h1>
                <span className="gradient-text">Không gian thật.</span>
                <br />
                <span className="text-white">Tiến độ</span>
                <br />
                <em className="text-accent">rõ ràng.</em>
              </h1>
              <p className="hero-desc">
                Các dự án được đánh dấu công khai trong hệ thống HDHOME.
              </p>
            </div>
            <div className="hero-stats-box animate-on-scroll" style={{ animationDelay: '0.2s' }}>
              <div className="stats-mini">
                <div className="stat-mini-item">
                  <span className="stat-mini-value">{pagination.total}</span>
                  <span className="stat-mini-label">Dự án công khai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Grid */}
      <section className="projects-content">
        <div className="public-container">
          {/* Filters */}
          <div className="filters-bar animate-on-scroll">
            <form className="filter-form" onSubmit={(e) => { e.preventDefault(); setSearch(draftSearch); }}>
              <div className="search-box">
                <Search size={20} />
                <input
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                  placeholder="Tìm tên hoặc địa điểm dự án..."
                />
              </div>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                <option value="PLANNING">Lập kế hoạch</option>
                <option value="IN_PROGRESS">Đang thi công</option>
                <option value="PAUSED">Tạm dừng</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
              <button type="submit" className="btn btn-primary">Tìm kiếm</button>
            </form>
          </div>

          {/* Results Info */}
          <div className="results-info animate-on-scroll">
            <span className="results-count">{pagination.total} DỰ ÁN CÔNG KHAI</span>
            <div className="results-divider"></div>
          </div>

          {/* Projects Grid */}
          <div className="projects-grid-animated">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} onRetry={() => load(pagination.page)} />
            ) : projects.length ? (
              <div className="projects-cards-grid">
                {projects.map((project, index) => (
                  <div key={project.project_id} className="project-card-wrapper animate-on-scroll" style={{ animationDelay: `${index * 0.1}s` }}>
                    <ProjectCard project={project} index={index} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Không tìm thấy dự án" description="Thử từ khóa hoặc trạng thái khác." />
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination-wrapper animate-on-scroll">
              <Pagination pagination={pagination} onPageChange={load} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
