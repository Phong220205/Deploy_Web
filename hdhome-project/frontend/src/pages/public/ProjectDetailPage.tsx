import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, MapPin, Ruler, CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api, getApiError, SERVER_BASE_URL } from '../../api/client';
import { ErrorState, LoadingState } from '../../components/common/Feedback';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { ApiResponse, Project } from '../../types';
import { formatDate, formatStatus } from '../../utils/format';

export function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('revealed');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [project]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ApiResponse<Project>>(`/public/projects/${id}`);
      setProject(response.data.data);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  if (loading) {
    return (
      <main className="detail-page">
        <div className="public-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingState />
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="detail-page">
        <div className="public-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ErrorState message={error || 'Dự án không tồn tại.'} onRetry={load} />
        </div>
      </main>
    );
  }

  return (
    <main className="detail-page">
      {/* Hero */}
      <section className="detail-hero">
        <div className="hero-bg-effects">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-grid-bg"></div>
        </div>
        <div className="public-container">
          <Link to="/projects" className="back-link-modern animate-on-scroll">
            <ArrowLeft size={20} />
            <span> Quay lại dự án</span>
          </Link>
          <div className="detail-hero-content">
            <div className="detail-hero-info animate-on-scroll" style={{ animationDelay: '0.1s' }}>
              <div className="project-code-badge">{project.project_code}</div>
              <h1>{project.project_name}</h1>
              <div className="detail-meta">
                <span><MapPin size={18} /> {project.location || 'Đà Nẵng'}</span>
              </div>
            </div>
            <div className="detail-hero-status animate-on-scroll" style={{ animationDelay: '0.2s' }}>
              <StatusBadge status={project.status} />
              <div className="progress-info">
                <span className="progress-label">Tiến độ</span>
                <span className="progress-value">{project.progress}%</span>
              </div>
              <ProgressBar value={project.progress} />
            </div>
          </div>
          <div className="building-visual" aria-hidden="true">
            <div className="building-3d">
              <div className="building-floor"></div>
              <div className="building-floor"></div>
              <div className="building-floor"></div>
              <div className="building-windows">
                {[...Array(12)].map((_, i) => <div key={i} className="window"></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="detail-content">
        <div className="public-container">
          <div className="detail-grid">
            {/* Main Info */}
            <div className="detail-main">
              <div className="info-card animate-on-scroll">
                <div className="section-tag">/ Thông tin dự án</div>
                <h2>Một công trình được theo dõi theo từng mốc triển khai.</h2>
                <p className="lead-text">{project.description}</p>
                
                <div className="detail-facts-grid">
                  <div className="fact-item">
                    <div className="fact-icon">
                      <Calendar size={24} />
                    </div>
                    <div className="fact-content">
                      <span className="fact-label">Khởi công</span>
                      <span className="fact-value">{formatDate(project.start_date)}</span>
                    </div>
                  </div>
                  <div className="fact-item">
                    <div className="fact-icon">
                      <Calendar size={24} />
                    </div>
                    <div className="fact-content">
                      <span className="fact-label">Dự kiến hoàn thành</span>
                      <span className="fact-value">{formatDate(project.expected_end_date)}</span>
                    </div>
                  </div>
                  <div className="fact-item">
                    <div className="fact-icon">
                      <Ruler size={24} />
                    </div>
                    <div className="fact-content">
                      <span className="fact-label">Trạng thái</span>
                      <span className="fact-value">{formatStatus(project.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery */}
              <div className="gallery-section animate-on-scroll">
                <div className="section-tag">/ Hình ảnh công trình</div>
                <h3>Hồ sơ hình ảnh công khai.</h3>
                {project.images?.length ? (
                  <div className="gallery-grid">
                    {project.images.map((image) => (
                      <figure key={image.image_id} className="gallery-item">
                        <img src={`${SERVER_BASE_URL}/${image.image_path}`} alt={image.title || project.project_name} />
                        <figcaption>
                          <strong>{image.title}</strong>
                          <span>{image.description}</span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <div className="gallery-placeholder">
                    <div className="placeholder-content">
                      <CheckCircle2 size={48} />
                      <span>Hình ảnh sẽ được cập nhật từ hồ sơ dự án.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="detail-sidebar">
              <div className="sidebar-card animate-on-scroll">
                <h4>Tiến độ hiện tại</h4>
                <div className="progress-circle">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#eee" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${project.progress * 2.83} 283`} transform="rotate(-90 50 50)" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f5b82e" />
                        <stop offset="100%" stopColor="#ce8d05" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="progress-text">
                    <span className="progress-number">{project.progress}</span>
                    <span className="progress-unit">%</span>
                  </div>
                </div>
                <p>Tiến độ được đồng bộ từ hệ thống quản lý nội bộ HDHOME.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="detail-cta">
        <div className="public-container">
          <div className="cta-modern animate-on-scroll">
            <div className="cta-content">
              <span className="cta-label">BẠN CÓ NHU CẦU TƯƠNG TỰ?</span>
              <h2>Trao đổi cùng HDHOME.</h2>
            </div>
            <Link to="/contact" className="btn btn-primary btn-lg">
              Liên hệ tư vấn
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
