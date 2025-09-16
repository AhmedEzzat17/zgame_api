import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import userService from "../../services/userService";

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
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

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

  const validatePasswordData = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'كلمة المرور الحالية مطلوبة';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validatePasswordData()) {
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const requestData = {
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.confirmPassword
      };
      
      await userService.resetPassword(requestData);
      
      setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
      
      // إعادة تعيين النموذج
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      
      // إخفاء الرسالة بعد 3 ثوان
      setTimeout(() => {
        setMessage({ type: '', text: '' });
        setIsEditing(false);
      }, 3000);
      
    } catch (error) {
      console.error('خطأ في تغيير كلمة المرور:', error);
      console.error('تفاصيل الخطأ:', error.response?.data);
      console.error('أخطاء التحقق:', error.response?.data?.errors);
      console.error('البيانات المرسلة:', requestData);
      
      let errorMessage = 'حدث خطأ أثناء تغيير كلمة المرور';
      
      if (error.response?.data?.errors) {
        // معالجة أخطاء التحقق المتعددة
        const errors = error.response.data.errors;
        console.log('Errors object:', errors);
        
        const errorMessages = [];
        Object.keys(errors).forEach(key => {
          if (Array.isArray(errors[key])) {
            errorMessages.push(...errors[key]);
          } else {
            errorMessages.push(errors[key]);
          }
        });
        
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join(' • ');
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMessage = 'كلمة المرور الحالية غير صحيحة';
      } else if (error.response?.status === 422) {
        errorMessage = 'البيانات المدخلة غير صحيحة - تأكد من صحة كلمة المرور الحالية';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
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
    setErrors({});
    setMessage({ type: '', text: '' });
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

            {/* Message Display */}
            {message.text && (
              <div className={`message ${message.type}`} style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center',
                backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                color: message.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                {message.text}
              </div>
            )}

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
                      className={`editing ${errors.currentPassword ? 'error' : ''}`}
                    />
                    <span className="field-icon"><i className="fas fa-lock"></i></span>
                    {errors.currentPassword && (
                      <span className="error-message" style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {errors.currentPassword}
                      </span>
                    )}
                  </div>
                  
                  <div className="profile-field">
                    <label>كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                      className={`editing ${errors.newPassword ? 'error' : ''}`}
                    />
                    <span className="field-icon"><i className="fas fa-key"></i></span>
                    {errors.newPassword && (
                      <span className="error-message" style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {errors.newPassword}
                      </span>
                    )}
                  </div>
                  
                  <div className="profile-field">
                    <label>تأكيد كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                      className={`editing ${errors.confirmPassword ? 'error' : ''}`}
                    />
                    <span className="field-icon"><i className="fas fa-check"></i></span>
                    {errors.confirmPassword && (
                      <span className="error-message" style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button 
                    className="btn btn-save" 
                    onClick={handleSave}
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        حفظ التغييرات
                      </>
                    )}
                  </button>
                  <button 
                    className="btn btn-cancel" 
                    onClick={handleCancel}
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                  >
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
