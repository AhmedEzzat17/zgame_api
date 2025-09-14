import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginService from "../Auth/loginService";
import "../../assets/Css/style.css";

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // إزالة الخطأ عند الكتابة
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage("");

    // التحقق من بيانات الأدمن
    if (formData.email === "admin@gmail.com" && formData.password === "123456789") {
      localStorage.setItem("user", JSON.stringify({
        token: "admin_token",
        user: {
          name: "Admin",
          email: "admin@gmail.com",
          isAdmin: true
        }
      }));
      
      // إرسال حدث للنافذة لتحديث الـ Navbar
      window.dispatchEvent(new Event('storage'));
      
      setMessage("تم تسجيل الدخول بنجاح! جاري التحويل...");
      
      setTimeout(() => {
        navigate("/Dashboard");
      }, 1500);
      
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await LoginService.login(formData);
      
      if (response.data.token) {
        localStorage.setItem("user", JSON.stringify({
          token: response.data.token,
          user: {
            ...response.data.user,
            isAdmin: response.data.user?.email === "admin@gmail.com" // أو حسب الباك إند
          }
        }));
        
        // إرسال حدث للنافذة لتحديث الـ Navbar
        window.dispatchEvent(new Event('storage'));
        
        setMessage("تم تسجيل الدخول بنجاح! جاري التحويل...");
        
        setTimeout(() => {
          const user = JSON.parse(localStorage.getItem("user"));
          if (user?.user?.isAdmin) {
            navigate("/Dashboard");
          } else {
            navigate("/");
          }
        }, 1500);
      }
      
  
    } 
    catch (error) {
  
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage(error.response?.data?.message || "خطأ في البريد الإلكتروني أو كلمة المرور");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-container">
          <img
            src="images/zGame_All_Pages-removebg-preview.png"
            alt="سبين جيم"
          />
        </div>
        <h2>تسجيل الدخول</h2>
        
        {/* عرض الرسائل */}
        {message && (
          <div className={`alert ${message.includes("بنجاح") ? "success" : "error"}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="البريد الإلكتروني" 
            required
            className={errors.email ? "error" : ""}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
          
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="كلمة المرور" 
            required
            className={errors.password ? "error" : ""}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
          
          <button 
            type="submit" 
            className="login-btn-l"
            disabled={isLoading}
          >
            {isLoading ? "جاري تسجيل الدخول..." : "دخول"}
          </button>
        </form>
        
        <div className="links">
          <a href="#">نسيت كلمة المرور؟</a>
          <Link to="/register">إنشاء حساب جديد</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;