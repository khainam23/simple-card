import { useNavigate } from 'react-router-dom';
import { Brain, Folder, Layout, Download, Zap, Star, ArrowRight } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain size={32} />,
      title: 'Flashcard Thông Minh',
      description: 'Tạo flashcard với tối đa 5 trường thông tin tùy chỉnh. Linh hoạt cho mọi môn học.'
    },
    {
      icon: <Layout size={32} />,
      title: 'Template Linh Hoạt',
      description: 'Tạo và lưu template để tái sử dụng. Tiết kiệm thời gian khi tạo flashcard mới.'
    },
    {
      icon: <Folder size={32} />,
      title: 'Quản Lý Folder',
      description: 'Tổ chức flashcard theo folder, có thể lồng nhau. Dễ dàng tìm kiếm và quản lý.'
    },
    {
      icon: <Download size={32} />,
      title: 'Export Dữ Liệu',
      description: 'Xuất dữ liệu sang JSON hoặc Excel. Sao lưu và chia sẻ dễ dàng.'
    },
    {
      icon: <Zap size={32} />,
      title: 'Lưu Trữ Vĩnh Viễn',
      description: 'Dữ liệu được lưu trên trình duyệt, không bao giờ bị mất. Không cần đăng nhập.'
    },
    {
      icon: <Star size={32} />,
      title: 'Hoàn Toàn Miễn Phí',
      description: 'Không giới hạn số lượng flashcard. Không quảng cáo. Không cần tài khoản.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Star size={16} />
              <span>Học tập hiệu quả với Flashcard</span>
            </div>
            
            <h1 className="hero-title">
              Học Mọi Thứ Với
              <br />
              <span className="text-gradient">Flashcard Thông Minh</span>
            </h1>
            
            <p className="hero-description">
              Ứng dụng flashcard hiện đại, linh hoạt và hoàn toàn miễn phí.
              Tạo, quản lý và học tập mọi lúc mọi nơi với dữ liệu được lưu trữ vĩnh viễn trên trình duyệt.
            </p>
            
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/app')}>
                Bắt Đầu Ngay
                <ArrowRight size={20} />
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}>
                Tìm Hiểu Thêm
              </button>
            </div>
            
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">∞</div>
                <div className="stat-label">Flashcards</div>
              </div>
              <div className="stat">
                <div className="stat-value">100%</div>
                <div className="stat-label">Miễn Phí</div>
              </div>
              <div className="stat">
                <div className="stat-value">0</div>
                <div className="stat-label">Quảng Cáo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Tính Năng Nổi Bật</h2>
            <p className="section-description">
              Mọi thứ bạn cần để học tập hiệu quả với flashcard
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card card-glass">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Cách Sử Dụng</h2>
            <p className="section-description">
              Chỉ 3 bước đơn giản để bắt đầu học tập
            </p>
          </div>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Tạo Folder & Template</h3>
                <p>Tổ chức flashcard theo folder và tạo template cho các loại flashcard khác nhau</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Thêm Flashcard</h3>
                <p>Tạo flashcard với nội dung tùy chỉnh. Sử dụng template để tạo nhanh hơn</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Học & Ôn Tập</h3>
                <p>Xem lại flashcard, đánh dấu đã học và theo dõi tiến độ của bạn</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Sẵn Sàng Bắt Đầu?</h2>
            <p className="cta-description">
              Tạo flashcard đầu tiên của bạn ngay bây giờ. Hoàn toàn miễn phí!
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/app')}>
              Bắt Đầu Học Ngay
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Brain size={32} />
              <span>FlashCard App</span>
            </div>
            <p className="footer-text">
              Ứng dụng flashcard hiện đại, được xây dựng với React & IndexedDB
            </p>
            <p className="footer-copyright">
              © 2026 FlashCard App. Made with ❤️ for learners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
