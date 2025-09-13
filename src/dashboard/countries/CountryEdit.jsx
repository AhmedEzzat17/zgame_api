import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CountryService from "../../services/countriesService";
import { toast } from "react-toastify";

const CountryEdit = () => {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const [currentFlag, setCurrentFlag] = useState("");
  const [isFlagRemoved, setIsFlagRemoved] = useState(false);

  useEffect(() => {
    // Add Bootstrap CSS
    const bootstrapLink = document.createElement("link");
    bootstrapLink.rel = "stylesheet";
    bootstrapLink.href =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
    bootstrapLink.id = "bootstrap-css";

    // Add Bootstrap Icons
    const iconLink = document.createElement("link");
    iconLink.rel = "stylesheet";
    iconLink.href =
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css";
    iconLink.id = "bootstrap-icons";

    document.head.appendChild(bootstrapLink);
    document.head.appendChild(iconLink);

    // Cleanup
    return () => {
      const existingBootstrap = document.getElementById("bootstrap-css");
      const existingIcons = document.getElementById("bootstrap-icons");
      if (existingBootstrap) document.head.removeChild(existingBootstrap);
      if (existingIcons) document.head.removeChild(existingIcons);
    };
  }, [id]);

  const fetchCountry = useCallback(async () => {
    try {
      const response = await CountryService.getById(id);
      const country = response.data.data;

      setFormData({
        name: country.name || "",
        code: country.code || "",
        phone_code: (country.phone_code || "").replace("+", ""), // شيل + من البيانات المسترجعة
        currency: country.currency || "",
        currency_symbol: country.currency_symbol || "",
        is_active: country.is_active,
      });

      if (country.flag) {
        setCurrentFlag(country.flag);
        setPreview(country.flag);
      }
    } catch (error) {
      console.error("Error fetching country:", error);
      toast.error("حدث خطأ أثناء تحميل بيانات الدولة");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Fetch country data
    fetchCountry();
  }, [fetchCountry]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Create preview for new image
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setIsFlagRemoved(false);
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleRemoveFlag = () => {
    setFormData((prev) => ({
      ...prev,
      flag: null,
    }));
    setPreview("");
    setCurrentFlag("");
    setIsFlagRemoved(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم الدولة مطلوب";
    }

    if (!formData.code) {
      newErrors.code = "كود الدولة مطلوب";
    } else if (formData.code.length < 2 || formData.code.length > 3) {
      newErrors.code = "كود الدولة يجب أن يكون بين 2 و 3 أحرف";
    }

    if (!formData.phone_code) {
      newErrors.phone_code = "كود الهاتف مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("code", formData.code);
      formDataToSend.append("phone_code", `+${formData.phone_code}`);
      formDataToSend.append("currency", formData.currency);
      formDataToSend.append("currency_symbol", formData.currency_symbol);
      formDataToSend.append("is_active", formData.is_active ? 1 : 0);

      // أضف user_add_id
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id || user?.user_id || 1;
      formDataToSend.append("user_add_id", userId);

      // Add flag if it's a new file
      if (formData.flag instanceof File) {
        formDataToSend.append("flag", formData.flag);
      }

      // If flag was removed
      if (isFlagRemoved) {
        formDataToSend.append("remove_flag", "1");
      }

      // للتأكد من البيانات المرسلة
      console.log("البيانات المرسلة للتحديث:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const response = await CountryService.update(id, formDataToSend);

      toast.success("تم تحديث الدولة بنجاح");

      // Update localStorage with the updated country
      const updatedCountry = {
        id: parseInt(id),
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        phone_code: `+${formData.phone_code}`,
        currency: formData.currency.trim(),
        currency_symbol: formData.currency_symbol.trim(),
        is_active: formData.is_active ? 1 : 0,
        flag: response.data?.flag || currentFlag,
      };

      // Get existing countries from localStorage
      const existingCountries = JSON.parse(
        localStorage.getItem("countries") || "[]"
      );
      const countryIndex = existingCountries.findIndex(
        (country) => country.id === parseInt(id)
      );

      if (countryIndex !== -1) {
        existingCountries[countryIndex] = updatedCountry;
        localStorage.setItem("countries", JSON.stringify(existingCountries));
      }

      navigate("/Dashboard/countries");
    } catch (error) {
      console.error("Error updating country:", error);
      console.log("Server validation errors:", error.response?.data?.errors);

      const errorMessage =
        error.response?.data?.message || "حدث خطأ أثناء تحديث الدولة";
      toast.error(errorMessage);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
        <p className="mt-2">جاري تحميل بيانات الدولة...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4" dir="rtl">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: "#2c3e50" }}>
              <h4 className="mb-0">تعديل الدولة</h4>
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
                  {/* الاسم */}
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

                  {/* الكود */}
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
                  {/* كود الهاتف */}
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

                  {/* العملة */}
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
                  {/* رمز العملة */}
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

                  {/* الحالة */}
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

                {/* صورة العلم */}
                <div className="mb-4">
                  <label className="form-label">صورة العلم (اختياري)</label>
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
                      <div className="input-group">
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
                        {currentFlag && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={handleRemoveFlag}
                            disabled={!currentFlag}
                          >
                            <i className="bi bi-trash" style={{ color: "#fff" }}></i>
                          </button>
                        )}
                      </div>
                      <div className="form-text">يُفضل صورة بحجم 4:3</div>
                      {errors.flag && (
                        <div className="invalid-feedback d-block">
                          {errors.flag}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    disabled={saving}
                  >
                    <i className="bi bi-x-lg me-1"></i> إلغاء
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
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
                        <i className="bi bi-save me-1"></i> حفظ التغييرات
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

export default CountryEdit;
