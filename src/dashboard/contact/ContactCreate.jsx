import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import contactService from '../../services/contactService';
import './contact.css';

const ContactCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country_code: '+20',
    phone: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const countryCodes = [
    { code: '+20', name: 'مصر' },
    { code: '+966', name: 'السعودية' },
    { code: '+971', name: 'الإمارات' },
    { code: '+965', name: 'الكويت' },
    { code: '+973', name: 'البحرين' },
    { code: '+974', name: 'قطر' },
    { code: '+968', name: 'عمان' },
    { code: '+962', name: 'الأردن' },
    { code: '+961', name: 'لبنان' },
    { code: '+963', name: 'سوريا' },
    { code: '+964', name: 'العراق' },
    { code: '+212', name: 'المغرب' },
    { code: '+213', name: 'الجزائر' },
    { code: '+216', name: 'تونس' },
    { code: '+218', name: 'ليبيا' }
  ];

    useEffect(() => {
      const bootstrapLink = document.createElement("link");
      bootstrapLink.rel = "stylesheet";
      bootstrapLink.href =
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
      bootstrapLink.id = "bootstrap-css";
  
      const iconLink = document.createElement("link");
      iconLink.rel = "stylesheet";
      iconLink.href =
        "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css";
      iconLink.id = "bootstrap-icons";
  
      document.head.appendChild(bootstrapLink);
      document.head.appendChild(iconLink);
  
      return () => {
        const existingBootstrap = document.getElementById("bootstrap-css");
        const existingIcons = document.getElementById("bootstrap-icons");
        if (existingBootstrap) document.head.removeChild(existingBootstrap);
        if (existingIcons) document.head.removeChild(existingIcons);
      };
    }, []);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // مسح رسالة الخطأ عند التعديل
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^\d{8,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    if (!formData.notes.trim()) {
      newErrors.notes = 'الرسالة مطلوبة';
    } else if (formData.notes.trim().length < 10) {
      newErrors.notes = 'الرسالة يجب أن تكون 10 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      await contactService.post(formData);
      setMessage({ 
        type: 'success', 
        text: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' 
      });
      
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        email: '',
        country_code: '+20',
        phone: '',
        notes: ''
      });
      
      // العودة لصفحة قائمة الرسائل بعد 3 ثوان
      setTimeout(() => {
        navigate('/Dashboard/contact');
      }, 3000);
      
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        setMessage({ 
          type: 'error', 
          text: 'يرجى تصحيح الأخطاء في النموذج.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/contact');
  };

  return (
    <div className="container mt-4" dir="rtl">
      <div className="row justify-content-center">
        <h1 className="text-center mb-4 fw-bold">إضافة رسالة تواصل جديدة</h1>
        <div className="col-md-12">
          {message.text && (
            <div
              className={`alert ${
                message.type === 'success' ? "alert-success" : "alert-danger"
              } text-center`}
            >
              {message.text}
            </div>
          )}

          <div className="card shadow-lg border-0">
            <div
              className="card-header text-white d-flex justify-content-between align-items-center"
              style={{ background: "#2c3e50" }}
            >
              <h4 className="mb-0">إنشاء رسالة تواصل جديدة</h4>
              <button
                type="button"
                className="btn btn-light btn-sm text-dark"
                onClick={() => navigate('/Dashboard/contact')}
              >
                <i className="bi bi-arrow-left me-1"></i> العودة للقائمة
              </button>
            </div>

            <div className="card-body bg-light">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label">
                      الاسم <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">
                      البريد الإلكتروني <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="country_code" className="form-label">
                      كود الدولة <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.country_code ? 'is-invalid' : ''}`}
                      id="country_code"
                      name="country_code"
                      value={formData.country_code}
                      onChange={handleInputChange}
                      required
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code} - {country.name}
                        </option>
                      ))}
                    </select>
                    {errors.country_code && <div className="invalid-feedback">{errors.country_code}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label">
                      رقم الهاتف <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="notes" className="form-label">
                      الرسالة <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className={`form-control ${errors.notes ? 'is-invalid' : ''}`}
                      id="notes"
                      name="notes"
                      rows="5"
                      value={formData.notes}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                    <div className="form-text text-end">
                      {formData.notes.length}/500 حرف
                    </div>
                    {errors.notes && <div className="invalid-feedback">{errors.notes}</div>}
                  </div>

                  <div className="col-12">
                    <div className="d-flex gap-3 justify-content-end">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/Dashboard/contact')}
                        disabled={loading}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        العودة
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-2"></i>
                            حفظ الرسالة
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactCreate;
