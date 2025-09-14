import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Profile = ({ user }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "01093388338");
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Handle logout
  const handleLogout = () => {
    window.scrollTo(0, 0);
    localStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/");
  };
  
  // Get user data from localStorage
  const getUserData = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return {
          firstName: parsedUser.user?.first_name || parsedUser.user?.name?.split(' ')[0] || 'مستخدم',
          lastName: parsedUser.user?.last_name || parsedUser.user?.name?.split(' ').slice(1).join(' ') || '',
          email: parsedUser.user?.email || '',
          phone: parsedUser.user?.phone || '',
          dob: parsedUser.user?.birth_date ? new Date(parsedUser.user.birth_date).toLocaleDateString('ar-EG') : 'غير محدد',
          avatar: parsedUser.user?.avatar || null
        };
      }
    } catch (error) {
    }
    // Default values if no user data is found
    return {
      firstName: 'مستخدم',
      lastName: '',
      email: '',
      phone: '',
      dob: 'غير محدد',
      avatar: null
    };
  };

  const userData = getUserData();

  const getInitials = (firstName, lastName) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    
    setIsEditing(false);
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleCancel = () => {
    setPhoneNumber(user?.phone || "01093388338");
    setIsEditing(false);
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        
        {/* Header */}
        <div className="profile-header">
          <h1>الملف الشخصي</h1>
        </div>

        <div className="profile-content">
          
          {/* Left Side - Avatar & Games */}
          <div className="profile-avatar-section">
            
            {/* Profile Avatar */}
            <div className="profile-avatar">
              {userData.avatar ? (
                <img src={userData.avatar} alt="profile" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {getInitials(userData.firstName, userData.lastName || '')}
                </div>
              )}
              <label className="avatar-edit">
                <input type="file" accept="image/*" hidden />
                <span><i className="fas fa-camera"></i></span>
              </label>
            </div>

            <h3 className="profile-name">
              {userData.firstName} {userData.lastName}
            </h3>
            <p className="profile-email">{userData.email}</p>
            <p className="profile-phone">{userData.phone || 'لم يتم إضافة رقم هاتف'}</p>

            {/* Games Button */}
            <Link to="/MyGames">
            <button className="games-btn">
              <i className="fas fa-gamepad"></i>
              ألعابي
            </button>
            </Link>
          </div>

          {/* Right Side - Profile Information */}
          <div className="profile-info-section">
            
            {/* Toggle Tabs */}
            <div className="profile-tabs">
              <button 
                className={`tab-btn ${!isEditing ? 'active' : ''}`}
                onClick={() => setIsEditing(false)}
              >
                معلومات الحساب
              </button>
              <button 
                className={`tab-btn ${isEditing ? 'active' : ''}`}
                onClick={() => setIsEditing(true)}
              >
                تعديل الرقم السري
              </button>
            </div>

            {/* Form Fields */}
            <div className="profile-fields">
              
              {!isEditing && (
                <>
                  <div className="field-row">
                    <div className="profile-field">
                      <label>الاسم الأول</label>
                      <input type="text" value={userData.firstName} readOnly />
                      <span className="field-icon"><i className="fas fa-user"></i></span>
                    </div>
                    
                    <div className="profile-field">
                      <label>اسم العائلة</label>
                      <input type="text" value={userData.lastName} readOnly />
                      <span className="field-icon"><i className="fas fa-user"></i></span>
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>رقم الهاتف</label>
                    <input type="tel" value={userData.phone || 'لم يتم إضافة رقم هاتف'} readOnly />
                    <span className="field-icon"><i className="fas fa-phone"></i></span>
                  </div>

                  <div className="profile-field">
                    <label>البريد الإلكتروني</label>
                    <input type="email" value={userData.email || 'لم يتم إضافة بريد إلكتروني'} readOnly />
                    <span className="field-icon"><i className="fas fa-envelope"></i></span>
                  </div>

                  <div className="profile-field">
                    <label>تاريخ الميلاد</label>
                    <input type="text" value={userData.dob} readOnly />
                    <span className="field-icon"><i className="fas fa-calendar-alt"></i></span>
                  </div>
                </>
              )}

              {isEditing && (
                <>
                  {/* <div className="profile-field">
                    <label>رقم الهاتف</label>
                    <input
                      type="tel"
                      value={userData.phone || ''}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="editing"
                      placeholder="أدخل رقم الهاتف"
                    />
                    <span className="field-icon"><i className="fas fa-phone"></i></span>
                  </div> */}

                  <div className="profile-field">
                    <label>كلمة المرور الحالية</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      placeholder="أدخل كلمة المرور الحالية"
                      className="editing"
                    />
                    <span className="field-icon"><i className="fas fa-lock"></i></span>
                  </div>
                  
                  <div className="profile-field">
                    <label>كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="أدخل كلمة المرور الجديدة"
                      className="editing"
                    />
                    <span className="field-icon"><i className="fas fa-key"></i></span>
                  </div>
                  
                  <div className="profile-field">
                    <label>تأكيد كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                      className="editing"
                    />
                    <span className="field-icon"><i className="fas fa-check"></i></span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button className="btn btn-save" onClick={handleSave}>
                    <i className="fas fa-save"></i>
                    حفظ التغييرات
                  </button>
                  <button className="btn btn-cancel" onClick={handleCancel}>
                    <i className="fas fa-times"></i>
                    إلغاء
                  </button>
                </>
              ) : (
                <button 
                  className="btn btn-logout"
                  onClick={() => setShowLogoutModal(true)}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  تسجيل خروج
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Logout Confirmation Modal */}
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
    </div>
  );
};

export default Profile;
