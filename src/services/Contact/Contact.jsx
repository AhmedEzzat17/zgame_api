import React, { useState } from "react";
import contactService from '../contactService';

const ContactNew = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country_code: '+20',
    phone: '',
    notes: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // مسح الخطأ عند التعديل
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
    }
    
    if (!formData.notes.trim()) {
      newErrors.notes = 'الرسالة مطلوبة';
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
      // استخدام API endpoint للمستخدمين العاديين
      const originalEndpoint = contactService.endpoint;
      contactService.endpoint = 'contact-us';
      
      await contactService.post(formData);
      
      // إعادة endpoint الأصلي
      contactService.endpoint = originalEndpoint;
      
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

  return (
    <div className="contactNew-page">
      <div className="contactNew-card">
        <div className="contactNew-logo">
          <img
            src="images/zGame_All_Pages-removebg-preview.png"
            alt="سبين جيم"
          />
        </div>
        <h2 className="contactNew-title">تواصل معنا الآن</h2>

        {/* رسائل النجاح والخطأ */}
        {message.text && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* الاسم */}
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="أدخل اسمك"
            className={`contactNew-input ${errors.name ? 'error' : ''}`}
            required
          />
          {errors.name && <span className="error-message">{errors.name}</span>}

          {/* البريد الإلكتروني */}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="البريد الإلكتروني"
            className={`contactNew-input ${errors.email ? 'error' : ''}`}
            required
          />
          {errors.email && <span className="error-message">{errors.email}</span>}

          {/* كود الدولة */}
          <select
            name="country_code"
            value={formData.country_code}
            onChange={handleInputChange}
            className="contactNew-input"
            required
          >
            <option value="+20">مصر +20</option>
            <option value="+970">فلسطين +970</option>
            <option value="+966">السعودية +966</option>
            <option value="+962">الأردن +962</option>
            <option value="+965">الكويت +965</option>
            <option value="+974">قطر +974</option>
            <option value="+968">عمان +968</option>
            <option value="+971">الإمارات +971</option>
          </select>

          {/* رقم الهاتف */}
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="رقم الهاتف"
            className={`contactNew-input ${errors.phone ? 'error' : ''}`}
            required
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}

          {/* الرسالة */}
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="اكتب رسالتك هنا"
            className={`contactNew-textarea ${errors.notes ? 'error' : ''}`}
            required
          ></textarea>
          {errors.notes && <span className="error-message">{errors.notes}</span>}

          {/* زر الإرسال */}
          <button 
            type="submit" 
            className="contactNew-btn"
            disabled={loading}
          >
            {loading ? 'جاري الإرسال...' : 'إرسال'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactNew;
