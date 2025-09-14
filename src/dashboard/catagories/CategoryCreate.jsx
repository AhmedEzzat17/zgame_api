// src/A-Dashboard/categories/CategoryCreate.js
import React, { useState, useEffect } from "react";
import CategoryService from "../../services/Categorieservice";
import CountryService from "../../services/countriesService";
import { Link, useNavigate } from "react-router-dom";

export default function CategoryCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
    country_id: "",
  });

  const [countries, setCountries] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // تحميل Bootstrap فقط داخل هذا الـ Component
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

    // إزالة الاستايلات عند الخروج من الصفحة
    return () => {
      const existingBootstrap = document.getElementById("bootstrap-css");
      const existingIcons = document.getElementById("bootstrap-icons");

      if (existingBootstrap) document.head.removeChild(existingBootstrap);
      if (existingIcons) document.head.removeChild(existingIcons);
    };
  }, []);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (serverMessage) {
      const timer = setTimeout(() => setServerMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [serverMessage]);

  const fetchCountries = async () => {
    try {
      // First try to get from localStorage
      const savedCountries = localStorage.getItem("countries");
      if (savedCountries) {
        const countriesData = JSON.parse(savedCountries);
        setCountries(Array.isArray(countriesData) ? countriesData : []);
        return;
      }

      // If not in localStorage, fetch from API
      const response = await CountryService.get();
      let countriesData = [];

      if (response?.data?.data?.data) {
        countriesData = response.data.data.data;
      } else if (response?.data?.data) {
        countriesData = response.data.data;
      } else if (response?.data) {
        countriesData = Array.isArray(response.data) ? response.data : [];
      }

      const validCountries = Array.isArray(countriesData) ? countriesData : [];
      setCountries(validCountries);

      // Save to localStorage for future use
      localStorage.setItem("countries", JSON.stringify(validCountries));
    } catch (error) {
      setCountries([]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "الاسم مطلوب";
    if (!formData.description.trim()) newErrors.description = "الوصف مطلوب";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files && files.length > 0 ? files[0] : null;
      setFormData((prev) => ({ ...prev, image: file }));

      // معاينة الصورة
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // إزالة الخطأ عند التعديل
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const submitData = new FormData();
    submitData.append("name", formData.name.trim());
    submitData.append("description", formData.description.trim());

    // إضافة country_id إذا تم اختياره
    if (formData.country_id) {
      submitData.append("country_id", formData.country_id);
    }

    if (formData.image) {
      submitData.append("image", formData.image);
    }

    try {
      const response = await CategoryService.post(submitData, {
        withAuth: true,
        useCredentials: false,
      });

      setServerMessage(response.data.message || "تم إنشاء القسم بنجاح");
      setIsSuccess(true);

      // حفظ القسم الجديد في localStorage
      const newCategory = {
        id: response.data?.id || Date.now(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: response.data?.image || null,
        country_id: formData.country_id || null,
        created_at: new Date().toISOString(),
      };

      // الحصول على الأقسام الموجودة في localStorage
      const existingCategories = JSON.parse(
        localStorage.getItem("categories") || "[]"
      );
      existingCategories.push(newCategory);
      localStorage.setItem("categories", JSON.stringify(existingCategories));

      // إعادة تعيين النموذج
      setFormData({
        name: "",
        description: "",
        image: null,
        country_id: "",
      });
      setImagePreview(null);
      setErrors({});

      // إعادة تعيين حقل الملف
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = "";
      }

      // ✅ بعد النجاح، ارجع لصفحة عرض الأقسام
      setTimeout(() => {
        navigate("/Dashboard/categories");
      }, 1500);
    } catch (error) {
      setIsSuccess(false);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        setServerMessage("تحقق من البيانات المدخلة");
      } else if (error.response?.data?.message) {
        setServerMessage(error.response.data.message);
      } else {
        setServerMessage("حدث خطأ غير متوقع.");
      }
    }
  };

  return (
    <div className="py-5" dir="rtl">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow border-0 rounded-4">
              <div
                className="card-header text-white rounded-top-4"
                style={{ background: "#2c3e50" }}
              >
                <h4 className="mb-0">
                  <i className="bi bi-plus-circle me-2"></i> إضافة قسم جديد
                </h4>
              </div>
              <div className="card-body bg-light">
                {serverMessage && (
                  <div
                    className={`alert ${
                      isSuccess ? "alert-success" : "alert-danger"
                    } text-center`}
                  >
                    {serverMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        اسم القسم <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-control ${
                          errors.name ? "is-invalid" : ""
                        }`}
                        required
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        الدولة <span className="text-muted">- اختياري</span>
                      </label>
                      <select
                        name="country_id"
                        value={formData.country_id}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">-- اختر دولة --</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="form-label fw-bold">
                        الوصف <span className="text-danger">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className={`form-control ${
                          errors.description ? "is-invalid" : ""
                        }`}
                        required
                      ></textarea>
                      {errors.description && (
                        <div className="invalid-feedback">
                          {errors.description}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        الصورة <span className="text-muted">- اختياري</span>
                      </label>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="form-control"
                      />

                      {/* معاينة الصورة */}
                      {imagePreview && (
                        <div className="mt-3">
                          <p className="text-muted mb-2">معاينة الصورة:</p>
                          <img
                            src={imagePreview}
                            alt="معاينة"
                            className="img-thumbnail"
                            style={{ maxHeight: "150px", maxWidth: "200px" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between">
                    <Link
                      to="/Dashboard/categories"
                      className="btn btn-secondary"
                    >
                      <i className="bi bi-arrow-right me-1"></i> رجوع
                    </Link>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check-circle me-1"></i> حفظ القسم
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
