// CountryCreate.jsx - الحل النهائي
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CountryCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    phone_code: "",
    flag: null,
    currency: "",
    currency_symbol: "",
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");

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

  const getToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.token || null;
    } catch {
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview("");
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "اسم الدولة مطلوب";
    if (!formData.code) {
      newErrors.code = "كود الدولة مطلوب";
    } else if (formData.code.length < 2 || formData.code.length > 3) {
      newErrors.code = "كود الدولة يجب أن يكون بين 2 و 3 أحرف";
    }
    if (!formData.phone_code) newErrors.phone_code = "كود الهاتف مطلوب";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitData = async (data, isFormData = false) => {
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(
      "https://appgames.fikriti.com/api/v1/dashboard/countries",
      {
        method: "POST",
        headers,
        body: isFormData ? data : JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      const error = new Error("Request failed");
      error.response = {
        status: response.status,
        data: result,
      };
      throw error;
    }

    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id || user?.user_id || 1;

      const baseData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        phone_code: formData.phone_code.startsWith("+")
          ? formData.phone_code
          : `+${formData.phone_code}`,
        currency: formData.currency.trim(),
        currency_symbol: formData.currency_symbol.trim(),
        is_active: formData.is_active ? 1 : 0, // إرسال كرقم
        user_add_id: userId,
      };


      let response;
      if (formData.flag) {
        // مع الصورة - FormData
        const formDataToSend = new FormData();
        Object.keys(baseData).forEach((key) => {
          formDataToSend.append(key, baseData[key]);
        });
        formDataToSend.append("flag", formData.flag);

        response = await submitData(formDataToSend, true);
      } else {
        // بدون صورة - JSON
        response = await submitData(baseData, false);
      }

      toast.success("تمت إضافة الدولة بنجاح");

      // Update localStorage with the new country
      const newCountry = {
        id: response.data?.id || Date.now(), // Use server ID or fallback to timestamp
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        phone_code: formData.phone_code.startsWith("+")
          ? formData.phone_code
          : `+${formData.phone_code}`,
        currency: formData.currency.trim(),
        currency_symbol: formData.currency_symbol.trim(),
        is_active: formData.is_active ? 1 : 0,
        flag: response.data?.flag || null,
      };

      // Get existing countries from localStorage
      const existingCountries = JSON.parse(
        localStorage.getItem("countries") || "[]"
      );
      existingCountries.push(newCountry);
      localStorage.setItem("countries", JSON.stringify(existingCountries));

      navigate("/Dashboard/countries");
    } catch (error) {

      let errorMessage = "حدث خطأ أثناء إضافة الدولة";

      if (error.response?.status === 422 && error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        if (Array.isArray(firstError)) errorMessage = firstError[0];
        setErrors(error.response.data.errors);
      } else if (error.response?.status === 500) {
        errorMessage = "خطأ في الخادم - تحقق مع مطور الـ Backend";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" dir="rtl">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0">
            <div
              className="card-header text-white d-flex justify-content-between align-items-center"
              style={{ background: "#2c3e50" }}
            >
              <h4 className="mb-0">إضافة دولة جديدة</h4>
              <button
                className="btn btn-light btn-sm text-light"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-right me-1"></i> رجوع
              </button>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">
                      اسم الدولة <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="أدخل اسم الدولة"
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="code" className="form-label">
                      كود الدولة (ISO) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.code ? "is-invalid" : ""
                      }`}
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="مثال: EGY"
                      maxLength="3"
                      style={{ textTransform: "uppercase" }}
                    />
                    <small className="text-muted">
                      2-3 أحرف (مثل: EG, USA, KSA)
                    </small>
                    {errors.code && (
                      <div className="invalid-feedback">{errors.code}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone_code" className="form-label">
                      كود الهاتف <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">+</span>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.phone_code ? "is-invalid" : ""
                        }`}
                        id="phone_code"
                        name="phone_code"
                        value={formData.phone_code}
                        onChange={handleChange}
                        placeholder="مثال: 20"
                      />
                      {errors.phone_code && (
                        <div className="invalid-feedback">
                          {errors.phone_code}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="currency" className="form-label">
                      العملة
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      placeholder="مثال: EGP"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="currency_symbol" className="form-label">
                      رمز العملة
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="currency_symbol"
                      name="currency_symbol"
                      value={formData.currency_symbol}
                      onChange={handleChange}
                      placeholder="مثال: ج.م أو $"
                      maxLength="3"
                    />
                  </div>

                  <div className="col-md-6 mb-3 d-flex align-items-end">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="is_active">
                        {formData.is_active ? "مفعل" : "معطل"}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="flag" className="form-label">
                    صورة العلم (اختياري)
                  </label>
                  <div className="d-flex align-items-center gap-4">
                    <div
                      className="border rounded p-2"
                      style={{ width: "100px", height: "60px" }}
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="معاينة صورة العلم"
                          className="img-fluid h-100 w-100 object-fit-cover"
                        />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-muted">
                          <i className="bi bi-flag fs-4"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <input
                        type="file"
                        className={`form-control ${
                          errors.flag ? "is-invalid" : ""
                        }`}
                        id="flag"
                        name="flag"
                        onChange={handleChange}
                        accept="image/*"
                      />
                      <div className="form-text">يُفضل صورة بحجم 4:3</div>
                      {errors.flag && (
                        <div className="invalid-feedback">{errors.flag}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    <i className="bi bi-x-lg me-1"></i> إلغاء
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-1"></i> حفظ
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryCreate;
