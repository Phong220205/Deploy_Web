import { useEffect, useState, useRef } from 'react';
import { ArrowDownRight, ArrowRight, Check, MapPin, MoveUpRight, Sparkles, Building2, Users, Award, Clock, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/Feedback';
import { ProjectCard } from '../../components/common/ProjectCard';
import type { ApiResponse, Project } from '../../types';
import { companyAddress, services } from '../../utils/content';

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Scroll Reveal Hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Reveal Wrapper
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal-element ${isVisible ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  async function loadProjects() {
    setLoading(true); setError('');
    try {
      const response = await api.get<ApiResponse<Project[]>>('/public/projects?limit=6');
      setProjects(response.data.data);
    } catch { setError('Chưa thể tải dự án từ hệ thống. Vui lòng kiểm tra backend và MySQL.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    void loadProjects();
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left - rect.width / 2) / 25,
          y: (e.clientY - rect.top - rect.height / 2) / 25,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stats = [
    { value: 150, suffix: '+', label: 'Dự án hoàn thành', icon: Building2 },
    { value: 12, suffix: ' năm', label: 'Kinh nghiệm', icon: Clock },
    { value: 98, suffix: '%', label: 'Khách hàng hài lòng', icon: Award },
    { value: 50, suffix: '+', label: 'Đội ngũ chuyên nghiệp', icon: Users },
  ];

  return (
    <>
      {/* Animated Background Particles */}
      <div className="floating-particles" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 4}s`
          }} />
        ))}
      </div>

      {/* Hero Section */}
      <section className="hero-section-v2" ref={heroRef}>
        <div className="hero-gradient-overlay" />
        <div className="hero-mesh-gradient" />
        
        {/* Floating Elements */}
        <div className="floating-shapes" aria-hidden="true">
          <div className="shape shape-1" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }} />
          <div className="shape shape-2" style={{ transform: `translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px)` }} />
          <div className="shape shape-3" style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }} />
        </div>

        <div className="public-container hero-content-v2">
          <div className="hero-text-wrapper">
            <RevealSection>
              <span className="hero-badge">
                <Sparkles size={14} />
                Thiết kế & Xây dựng chuyên nghiệp
              </span>
            </RevealSection>
            
            <RevealSection delay={100}>
              <h1 className="hero-title">
                Kiến tạo <span className="gradient-text">không gian</span>
                <br />hoàn hảo cho bạn
              </h1>
            </RevealSection>
            
            <RevealSection delay={200}>
              <p className="hero-description">
                HDHOME - Đối tác tin cậy trong thiết kế, thi công và quản lý công trình. 
                Biến vision của bạn thành hiện thực với chất lượng vượt kỳ vọng.
              </p>
            </RevealSection>
            
            <RevealSection delay={300}>
              <div className="hero-actions-v2">
                <Link className="btn btn-primary" to="/projects">
                  Khám phá dự án
                  <ArrowRight size={18} />
                </Link>
                <Link className="btn btn-secondary" to="/contact">
                  <span>Tư vấn ngay</span>
                </Link>
              </div>
            </RevealSection>

            <RevealSection delay={400}>
              <div className="hero-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <stat.icon size={20} className="stat-icon" />
                    <span className="stat-value">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>

          <div className="hero-visual-wrapper">
            <div className="hero-card-stack">
              <div className="main-card">
                <div className="card-image">
                  <div className="building-illustration">
                    <div className="building-main">
                      <div className="windows-row"><span /><span /><span /><span /></div>
                      <div className="windows-row"><span /><span /><span /><span /></div>
                      <div className="windows-row"><span /><span /><span /><span /></div>
                      <div className="entrance" />
                    </div>
                    <div className="building-accent" />
                  </div>
                </div>
                <div className="card-content">
                  <span className="card-tag">Dự án tiêu biểu</span>
                  <h3>Biệt thự cao cấp</h3>
                  <p>Đà Nẵng, Việt Nam</p>
                </div>
              </div>
              <div className="floating-card card-1">
                <Check size={16} />
                <span>Thiết kế hiện đại</span>
              </div>
              <div className="floating-card card-2">
                <Award size={16} />
                <span>Chất lượng cao</span>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>Cuộn xuống</span>
          <ChevronDown className="bounce" size={20} />
        </div>

        <div className="hero-meta-v2">
          <span>16°03' N</span>
          <span>108°12' E</span>
          <span>ĐÀ NẴNG, VIỆT NAM</span>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section-v2">
        <div className="public-container">
          <div className="about-grid-v2">
            <RevealSection className="about-image-col">
              <div className="about-image-wrapper">
                <div className="about-image-bg" />
                <div className="building-shape">
                  <div className="window-row"><span /><span /><span /><span /></div>
                  <div className="window-row"><span /><span /><span /><span /></div>
                  <div className="window-row"><span /><span /><span /><span /></div>
                  <div className="window-row"><span /><span /><span /><span /></div>
                </div>
                <div className="about-experience-badge">
                  <span className="number">12</span>
                  <span className="text">Năm kinh nghiệm</span>
                </div>
              </div>
            </RevealSection>
            
            <div className="about-content-col">
              <RevealSection>
                <span className="section-label">/ VỀ CHÚNG TÔI</span>
                <h2>Một đầu mối xuyên suốt <span className="highlight">từ ý tưởng đến công trình</span></h2>
              </RevealSection>
              
              <RevealSection delay={100}>
                <p className="about-lead">
                  <strong>CÔNG TY TNHH THIẾT KẾ VÀ XÂY DỰNG HDHOME</strong> tập trung vào 
                  thiết kế kiến trúc, nội thất, thi công, giám sát và quản lý dự án với 
                  tiêu chuẩn chất lượng cao nhất.
                </p>
              </RevealSection>
              
              <RevealSection delay={200}>
                <div className="about-features">
                  {[
                    'Đội ngũ kiến trúc sư giàu kinh nghiệm',
                    'Quy trình chuyên nghiệp, minh bạch',
                    'Bảo hành dài hạn',
                    'Giá cả cạnh tranh nhất thị trường'
                  ].map((feature, i) => (
                    <div key={i} className="feature-item">
                      <Check size={18} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </RevealSection>
              
              <RevealSection delay={300}>
                <div className="about-location">
                  <MapPin size={18} />
                  <span>{companyAddress}</span>
                </div>
              </RevealSection>
              
              <RevealSection delay={400}>
                <Link className="btn btn-outline-dark" to="/about">
                  Tìm hiểu thêm
                  <ArrowRight size={16} />
                </Link>
              </RevealSection>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section-v2">
        <div className="public-container">
          <RevealSection className="section-header-centered">
            <span className="section-label section-label-light">/ DỊCH VỤ CỦA CHÚNG TÔI</span>
            <h2>Giải pháp đồng bộ <br /><span className="gradient-text-light">cho từng giai đoạn</span></h2>
            <p>Chúng tôi cung cấp toàn diện từ ý tưởng đến hoàn thiện công trình</p>
          </RevealSection>

          <div className="services-grid-v2">
            {services.slice(0, 6).map((service, index) => (
              <RevealSection key={service.title} delay={index * 100} className="service-card-v2">
                <div className="service-card-inner">
                  <span className="service-number">{service.index}</span>
                  <div className="service-icon-wrapper">
                    <service.icon size={32} />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <Link to="/services" className="service-link">
                    Tìm hiểu thêm
                    <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="service-card-glow" />
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section-v2">
        <div className="public-container">
          <RevealSection className="section-header-split">
            <div>
              <span className="section-label">/ DỰ ÁN TIÊU BIỂU</span>
              <h2>Những không gian <br />được xây dựng <span className="highlight">có chủ đích</span></h2>
            </div>
            <Link className="btn btn-dark" to="/projects">
              Xem tất cả dự án
              <ArrowRight size={16} />
            </Link>
          </RevealSection>

          {loading ? <LoadingState /> : 
           error ? <ErrorState message={error} onRetry={loadProjects} /> : 
           projects.length ? (
            <div className="projects-grid-v2">
              {projects.map((project, index) => (
                <RevealSection key={project.project_id} delay={index * 150} className="project-card-v2">
                  <ProjectCard project={project} index={index} />
                </RevealSection>
              ))}
            </div>
          ) : (
            <EmptyState title="Chưa có dự án tiêu biểu" />
          )}
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section-v2">
        <div className="public-container">
          <RevealSection className="section-header-centered">
            <span className="section-label">/ QUY TRÌNH LÀM VIỆC</span>
            <h2>Rõ ràng trong <span className="highlight">từng bước triển khai</span></h2>
          </RevealSection>

          <div className="process-timeline">
            {[
              { step: '01', title: 'Tiếp nhận nhu cầu', desc: 'Khảo sát & tư vấn chi tiết' },
              { step: '02', title: 'Đề xuất giải pháp', desc: 'Thiết kế & báo giá' },
              { step: '03', title: 'Lập kế hoạch', desc: 'Triển khai chi tiết' },
              { step: '04', title: 'Giám sát thi công', desc: 'Theo dõi & cập nhật' },
              { step: '05', title: 'Nghiệm thu', desc: 'Bàn giao & bảo hành' }
            ].map((item, index) => (
              <RevealSection key={item.step} delay={index * 120} className="process-step">
                <div className="step-number">{item.step}</div>
                <div className="step-content">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
                {index < 4 && <div className="step-connector" />}
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-v2">
        <div className="cta-bg-pattern" />
        <div className="public-container">
          <RevealSection className="cta-content-v2">
            <span className="section-label section-label-light">/ BẮT ĐẦU DỰ ÁN</span>
            <h2>Bạn đang có một không gian <br /><span className="gradient-text-light">cần được kiến tạo?</span></h2>
            <p>Hãy để HDHOME đồng hành cùng bạn trong hành trình xây dựng không gian mơ ước</p>
            <div className="cta-actions">
              <Link className="btn btn-accent" to="/contact">
                Gửi yêu cầu tư vấn
                <ArrowRight />
              </Link>
              <Link className="btn btn-outline-light" to="/projects">
                Xem dự án đã thực hiện
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>
    </>
  );
}
