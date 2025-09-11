import React from 'react';
import '../dashboard.css';

const Main = () => {
  return (
    <main className="main-content">
      <div className="welcome-banner">
        <h1>مرحباً بك في لوحة تحكم زد جيم</h1>
        <p>إدارة الألعاب والمحتوى الخاص بك</p>
        <div className="banner-overlay"></div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon users">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>إجمالي المستخدمين</h3>
            <p className="stat-number">1,248</p>
            <span className="stat-change positive">+12% عن الشهر الماضي</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon games">
            <i className="fas fa-gamepad"></i>
          </div>
          <div className="stat-info">
            <h3>الألعاب المتاحة</h3>
            <p className="stat-number">47</p>
            <span className="stat-change">+3 ألعاب جديدة</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon categories">
            <i className="fas fa-tags"></i>
          </div>
          <div className="stat-info">
            <h3>الأقسام</h3>
            <p className="stat-number">12</p>
            <span className="stat-change">جميع الأقسام نشطة</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon played">
            <i className="fas fa-trophy"></i>
          </div>
          <div className="stat-info">
            <h3>الجيمز التي لعبت</h3>
            <p className="stat-number">2,487</p>
            <span className="stat-change positive">+24% عن الأسبوع الماضي</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Main;