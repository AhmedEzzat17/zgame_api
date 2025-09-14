import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegisterService from "../Auth/registerService";
import "../../assets/Css/style.css";

const Register = () => {
  const [agree, setAgree] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    phone: "",
    country_code: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  // أي تغيير في المدخلات
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // مسح الخطأ الخاص بالحقل عند التعديل
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // إرسال البيانات للـ API
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!agree) {
      setMessage({
        text: "يرجى الموافقة على سياسة الخصوصية قبل التسجيل",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });
    setErrors({});

    try {
      const response = await RegisterService.register({
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.phone,
        country_code: formData.country_code,
        birth_date: formData.birth_date,
      });

      
      if (response.data) {
        const { message: responseMessage } = response.data;
        setMessage({
          text: responseMessage || "تم التسجيل بنجاح!",
          type: "success",
        });

        // إعادة تعيين النموذج
        setFormData({
          first_name: "",
          last_name: "",
          birth_date: "",
          phone: "",
          country_code: "",
          email: "",
          password: "",
          password_confirmation: "",
        });
        setAgree(false);

        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      
      // معالجة أخطاء التحقق من الخادم
      if (error.response?.data?.errors) {
        const serverErrors = {};
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          serverErrors[field] = messages[0];
        });
        setErrors(serverErrors);
        setMessage({
          text: "يرجى تصحيح الأخطاء أدناه",
          type: "error",
        });
      } else if (error.response?.data?.message) {
        setMessage({
          text: error.response.data.message,
          type: "error",
        });
      } else {
        setMessage({
          text: "حدثت مشكلة أثناء التسجيل. تحقق من البيانات.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") {
      setShowPrivacy(false);
    }
  };

  return (
    <>
      <div className="register-page">
        <div className="register-card">
          <div className="logo-container">
            <img
              src="images/zGame_All_Pages-removebg-preview.png"
              alt="سبين جيم"
            />
          </div>
          <h2>إنشاء حساب جديد</h2>

          {/* ✅ الرسائل */}
          {message.text && (
            <p
              style={{
                background:
                  message.type === "success" ? "#d4edda" : "#f8d7da",
                color: message.type === "success" ? "#155724" : "#721c24",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              {message.text}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <input
                type="text"
                name="first_name"
                placeholder="الاسم الأول"
                className={`half-input ${errors.name || errors.first_name ? 'input-error' : ''}`}
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="last_name"
                placeholder="اسم العائلة"
                className={`half-input ${errors.name || errors.last_name ? 'input-error' : ''}`}
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
            {(errors.name || errors.first_name || errors.last_name) && (
              <p className="error-text">
                {errors.name || errors.first_name || errors.last_name}
              </p>
            )}

            <input
              type="date"
              name="birth_date"
              className={errors.birth_date ? 'input-error' : ''}
              value={formData.birth_date}
              onChange={handleChange}
              required
            />
            {errors.birth_date && (
              <p className="error-text">{errors.birth_date}</p>
            )}

            <input
              type="number"
              name="phone"
              placeholder="رقم الهاتف"
              className={errors.phone ? 'input-error' : ''}
              value={formData.phone}
              onChange={handleChange}
              required
            />
            {errors.phone && (
              <p className="error-text">{errors.phone}</p>
            )}

            <select
              required
              className={`full-input ${errors.country_code ? 'input-error' : ''}`}
              name="country_code"
              value={formData.country_code}
              onChange={handleChange}
            >
              <option value="" disabled>
                اختر كود الدولة
              </option>
              <option value="+20">مصر +20</option>
              <option value="+970">فلسطين +970</option>
              <option value="+966">السعودية +966</option>
              <option value="+962">الأردن +962</option>
              <option value="+965">الكويت +965</option>
              <option value="+974">قطر +974</option>
              <option value="+968">عمان +968</option>
              <option value="+971">الإمارات +971</option>
            </select>
            {errors.country_code && (
              <p className="error-text">{errors.country_code}</p>
            )}

            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
              className={errors.email ? 'input-error' : ''}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <p className="error-text">{errors.email}</p>
            )}

            <div className="row">
              <input
                type="password"
                name="password"
                placeholder="كلمة المرور"
                className={`half-input ${errors.password ? 'input-error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password_confirmation"
                placeholder="تأكيد كلمة المرور"
                className={`half-input ${errors.password_confirmation ? 'input-error' : ''}`}
                value={formData.password_confirmation}
                onChange={handleChange}
                required
              />
            </div>
            {(errors.password || errors.password_confirmation) && (
              <p className="error-text">
                {errors.password || errors.password_confirmation}
              </p>
            )}

            <div className="privacy-checkbox">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={() => setAgree(!agree)}
                  required
                />
                <span className="checkmark"></span>
                أوافق على{" "}
                <span
                  className="privacy-link"
                  onClick={() => setShowPrivacy(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setShowPrivacy(true);
                  }}
                >
                  سياسة الخصوصية
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={!agree || loading}
            >
              {loading ? "جارٍ التسجيل..." : "تسجيل"}
            </button>
          </form>

          <div className="links">
            <Link to="/login">لديك حساب بالفعل؟ تسجيل الدخول</Link>
          </div>
        </div>
      </div>

      {/* ✅ نافذة سياسة الخصوصية */}
      {showPrivacy && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
          >
            <div className="modal-header">
              <h3 id="modalTitle">سياسة الخصوصية</h3>
              <button
                className="modal-close"
                onClick={() => setShowPrivacy(false)}
                aria-label="إغلاق"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                هذا نص مثال بسيط لسياسة الخصوصية. يمكنك تعديله ليشمل تفاصيلك
                الفعلية.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setAgree(true);
                  setShowPrivacy(false);
                }}
                className="modal-btn modal-btn-primary"
              >
                موافق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;