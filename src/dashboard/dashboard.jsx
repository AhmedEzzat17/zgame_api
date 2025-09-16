import React, { useState, useRef, useEffect } from 'react';
import './dashboard.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashRoutes from './dashRoutes'; // الاستيراد صحيح

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const profileRef = useRef(null);
  const sidebarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    localStorage.removeItem('token');
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dashboard">
      {/* Navbar - ثابت في كل الصفحات */}
      <nav className="dashboard-navbar">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          position: 'fixed',
          right: '20px',
          // top: '0px',
          zIndex: 1001
        }}>
          <button 
            className="menu-toggle" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              marginLeft: '15px'
            }}
          >
            <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          <Link style={{textDecoration: 'none'}} to="/dashboard" className={location.pathname === '/dashboard' || location.pathname === '/dashboard/' ? 'active' : ''}>
            <h2 style={{ color: 'white', margin: 0}}>لوحة التحكم</h2>
          </Link>
        </div>
        
        <div className="search-container">
          <input type="text" placeholder="ابحث من هنا..." className="search-input1" />
        </div>
        
        <div className="navbar-right">
          <div 
            className="user-profile" 
            ref={profileRef}
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <span>مرحباً، المستخدم</span>
            <div className="avatar">👤</div>
            
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">👤</div>
                  <div>
                    <h4>المستخدم</h4>
                    <p>admin@example.com</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/profile" className="dropdown-item">
                  <span>الملف الشخصي</span>
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <span>الإعدادات</span>
                </Link>
                <div className="dropdown-divider"></div>
                <Link to="/logout" className="dropdown-item logout">
                  <span>تسجيل الخروج</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Sidebar - ثابت في كل الصفحات */}
        <aside 
          className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}
          ref={sidebarRef}
        >
          <div className="sidebar-content">
            <ul className="sidebar-menu">
              <li>
                <Link 
                  to="/dashboard/main" 
                  className={location.pathname === '/dashboard' || location.pathname === '/dashboard/' ? 'active' : ''}
                >
                  <i className="icon-home"></i>
                  <span>الرئيسية</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/categories" 
                  className={location.pathname.includes('/dashboard/categories') ? 'active' : ''}
                >
                  <i className="icon-category"></i>
                  <span>الاقسام</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/countries" 
                  className={location.pathname.includes('/dashboard/countries') ? 'active' : ''}
                >
                  <i className="icon-games"></i>
                  <span>الدول</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/questions" 
                  className={location.pathname.includes('/dashboard/questions') ? 'active' : ''}
                >
                  <i className="icon-categories"></i>
                  <span>الأسئلة</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/contact" 
                  className={location.pathname.includes('/dashboard/contact') ? 'active' : ''}
                >
                  <i className="icon-users"></i>
                  <span>تواصل معنا</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/users" 
                  className={location.pathname.includes('/dashboard/users') ? 'active' : ''}
                >
                  <i className="icon-users"></i>
                  <span>المستخدمين</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/settings" 
                  className={location.pathname.includes('/dashboard/settings') ? 'active' : ''}
                >
                  <i className="icon-settings"></i>
                  <span>الإعدادات</span>
                </Link>
              </li>
            </ul>
            
            <div className="sidebar-footer">
              <div 
                onClick={() => setShowLogoutModal(true)}
                className="logout-btn"
                style={{ cursor: 'pointer' }}
              >
                <i className="icon-logout"></i>
                <span>تسجيل الخروج</span>
              </div>
            </div>

          </div>
        </aside>

        {/* Main Content - هنا هيتغير المحتوى حسب الصفحة */}
        <main className="main-content">
          {/* إزالة Routes من هنا */}
          <DashRoutes />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxWidth: '400px',
            width: '90%',
            direction: 'rtl'
          }}>
            <h3 style={{ margin: '0 0 16px 0', textAlign: 'center' }}>
              تأكيد تسجيل الخروج
            </h3>
            <p style={{ margin: '0 0 24px 0', textAlign: 'center', color: '#666' }}>
              هل أنت متأكد من تسجيل الخروج؟
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                موافق
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;