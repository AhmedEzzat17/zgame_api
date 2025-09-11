import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../../assets/Css/style.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem("user");
      setUser(userData ? JSON.parse(userData) : null);
    };
  
    // أول تحميل
    loadUser();
  
    // متابعة أي تغيير في localStorage
    const handleStorageChange = () => loadUser();
  
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // اختصار الاسم لأول 10 حروف أو الاسم الأول
  const getDisplayName = (fullName) => {
    if (!fullName) return "";
    
    const firstName = fullName.split(' ')[0];
    return firstName.length <= 10 ? firstName : fullName.substring(0, 10);
  };

  // تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowLogoutModal(false);
    setShowUserMenu(false);
    navigate("/");
  };

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/">
            <div className="logo">
              <img src="images/zGame_All_Pages-removebg-preview.png" alt="سبين جيم" />
            </div>
          </Link>

          {/* Menu Links */}
          <ul className={`nav-links ${isOpen ? "open" : ""}`}>
            <Link to="/OneCreateGame" onClick={() => setIsOpen(false)}>
              <li><a href="#play">العب</a></li>
            </Link>
            <Link to="/Contact" onClick={() => setIsOpen(false)}>
              <li><a href="#contact">تواصل معنا</a></li>
            </Link>
          </ul>

          {/* Mobile Toggle */}
          <div className="menu-toggle ms-left" onClick={() => setIsOpen(!isOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* Login Button أو User Menu */}
          {user ? (
            <div className="ms-auto logout-container user-menu-container" style={{ position: 'relative' }}>
              <div 
                className="user-info" 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd'
                }}
              >
                <span style={{ marginLeft: '8px', fontWeight: '500' }}>
                  {getDisplayName(user.user?.name)}
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>

              {/* قائمة المستخدم */}
              {showUserMenu && (
                <div 
                  className="user-dropdown"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '200px',
                    zIndex: 1000,
                    marginTop: '4px'
                  }}
                >
                  <div className="user-dropdown-header" style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {user.user?.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#fff' }}>
                      {user.user?.email}
                    </div>
                  </div>
                  
                  <div style={{ padding: '0px 0' }}>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // يمكنك إضافة التنقل للملف الشخصي هنا
                        navigate("/profile");
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'right',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#000',
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      الملف الشخصي
                    </button>
                    <hr />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowLogoutModal(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'right',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#dc3545'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="ms-auto logout-container" onClick={() => setIsOpen(false)}>
              <button className="login-btn ms-auto">دخول</button>
            </Link>
          )}
        </div>
      </nav>

      {/* نافذة تأكيد تسجيل الخروج */}
      {showLogoutModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              maxWidth: '400px',
              width: '90%'
            }}
          >
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
    </>
  );
};

export default Navbar;