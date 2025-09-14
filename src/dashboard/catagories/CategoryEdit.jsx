import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import CategoryService from "../../services/Categorieservice";
import CountryService from "../../services/countriesService";

export default function CategoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
    country_id: "",
  });

  const [oldImage, setOldImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [countries, setCountries] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);

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
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [editRes, allCountries] = await Promise.all([
        CategoryService.edit(id),
        fetchCountries(),
      ]);

      const data = editRes.data.data;
      setFormData({
        name: data.name || "",
        description: data.description || "",
        image: null,
        country_id: data.country_id || "",
      });

      setOldImage(data.image || null);

      // تحديد معاينة الصورة القديمة
      if (data.image) {
        const imageUrl = data.image.startsWith("http")
          ? data.image
          : `https://appgames.fikriti.com/storage/${data.image}`;
        setImagePreview(imageUrl);
      }
    } catch (err) {
      showMessage("فشل تحميل بيانات القسم", "error");
    } finally {
      setLoading(false);
    }
  };

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

  const showMessage = (msg, type = "success") => {
    setServerMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setServerMessage("");
      setMessageType("");
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files && files.length > 0 ? files[0] : null;
      setFormData((prev) => ({ ...prev, image: file }));

      // معاينة الصورة الجديدة
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        // العودة للصورة القديمة أو إزالة المعاينة
        if (oldImage) {
          const imageUrl = oldImage.startsWith("http")
            ? oldImage
            : `https://appgames.fikriti.com/storage/${oldImage}`;
          setImagePreview(imageUrl);
        } else {
          setImagePreview(null);
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // إزالة الخطأ عند التعديل
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "الاسم مطلوب";
    if (!formData.description.trim()) newErrors.description = "الوصف مطلوب";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const updateData = new FormData();
    updateData.append("name", formData.name.trim());
    updateData.append("description", formData.description.trim() || "");

    // إضافة country_id إذا تم اختياره
    if (formData.country_id) {
      updateData.append("country_id", formData.country_id);
    }

    // إضافة الصورة إذا تم اختيار صورة جديدة
    if (formData.image) {
      updateData.append("image", formData.image);
    }

    // إضافة _method للـ PATCH
    updateData.append("_method", "PATCH");

    try {
      const response = await CategoryService.patchPOST(id, updateData);
      showMessage(response.data.message || "تم تحديث القسم بنجاح", "success");

      // تحديث localStorage بالقسم المحدث
      const updatedCategory = {
        id: parseInt(id),
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: response.data?.image || oldImage,
        country_id: formData.country_id || null,
        updated_at: new Date().toISOString(),
      };

      // الحصول على الأقسام الموجودة في localStorage
      const existingCategories = JSON.parse(
        localStorage.getItem("categories") || "[]"
      );
      const categoryIndex = existingCategories.findIndex(
        (cat) => cat.id === parseInt(id)
      );

      if (categoryIndex !== -1) {
        existingCategories[categoryIndex] = {
          ...existingCategories[categoryIndex],
          ...updatedCategory,
        };
        localStorage.setItem("categories", JSON.stringify(existingCategories));
      }

      setTimeout(() => {
        navigate("/Dashboard/categories");
      }, 2000);
    } catch (err) {

      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        showMessage("يرجى تصحيح الأخطاء", "error");
      } else {
        const errorMessage =
          err.response?.data?.message || "حدث خطأ أثناء الحفظ";
        showMessage(errorMessage, "error");
      }
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جارٍ التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5" dir="rtl" style={{ backgroundColor: "#f7f9fc" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow border-0 rounded-4">
              <div
                className="card-header rounded-top-4"
                style={{
                  background: "#2c3e50",
                  color: "#fff",
                }}
              >
                <h4 className="mb-0">
                  <i className="bi bi-pencil-square me-2"></i> تعديل بيانات
                  القسم
                </h4>
              </div>

              <div className="card-body bg-light p-4">
                {serverMessage && (
                  <div
                    className={`alert text-center ${
                      messageType === "error" ? "alert-danger" : "alert-success"
                    }`}
                  >
                    {serverMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="row gy-3">
                    {/* الاسم */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        الاسم <span className="text-danger">*</span>
                        {errors.name && (
                          <span className="text-danger small d-block mt-1">
                            {errors.name}
                          </span>
                        )}
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
                    </div>

                    {/* الدولة */}
                    <div className="col-md-6">
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

                    {/* الوصف */}
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">
                        الوصف <span className="text-danger">*</span>
                        {errors.description && (
                          <span className="text-danger small d-block mt-1">
                            {errors.description}
                          </span>
                        )}
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={`form-control ${
                          errors.description ? "is-invalid" : ""
                        }`}
                        rows="3"
                        required
                      ></textarea>
                    </div>

                    {/* الصورة */}
                    <div className="col-md-6">
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
                            alt="معاينة الصورة"
                            className="img-thumbnail"
                            style={{ maxHeight: "150px", maxWidth: "200px" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150x100?text=صورة+غير+متوفرة";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="d-flex justify-content-between">
                    <Link
                      to="/Dashboard/categories"
                      className="btn btn-outline-secondary"
                    >
                      <i className="bi bi-arrow-right me-1"></i> رجوع
                    </Link>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check-circle me-1"></i> حفظ التعديلات
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
