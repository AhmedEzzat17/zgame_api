// src/A-Dashboard/categories/CategoryShow.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryService from "../../services/Categorieservice";

const CategoryShow = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({}); // لتتبع أخطاء الصور

  // تحميل Bootstrap
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

  useEffect(() => {
    fetchCategories(page, search);
  }, [page]);

  const fetchCategories = async (currentPage = 1, searchTerm = "") => {
    try {
      setLoading(true);
      console.log("🔄 بدء تحميل البيانات...");

      const res = await CategoryService.getWithPagination(
        currentPage,
        searchTerm
      );
      console.log("📨 البيانات المستلمة:", res.data);

      // معالجة البيانات بشكل مبسط
      let categoriesData = [];
      let totalPages = 1;

      if (res.data?.data?.data?.data) {
        categoriesData = res.data.data.data.data;
        totalPages = res.data.data.data.last_page || 1;
        console.log("📊 البيانات من المستوى الرابع");
      } else if (res.data?.data?.data) {
        categoriesData = res.data.data.data;
        totalPages = res.data.data.last_page || 1;
        console.log("📊 البيانات من المستوى الثالث");
      } else if (res.data?.data) {
        categoriesData = res.data.data;
        totalPages = res.data.last_page || 1;
        console.log("📊 البيانات من المستوى الثاني");
      }

      console.log("✅ عدد الفئات:", categoriesData?.length);
      console.log("📄 إجمالي الصفحات:", totalPages);

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setLastPage(totalPages);
    } catch (err) {
      console.error("❌ فشل في جلب البيانات:", err);
      console.error("❌ رسالة الخطأ:", err.message);
      console.error("❌ استجابة الخادم:", err.response?.data);

      setCategories([]);
      setLastPage(1);
      showMessage("فشل في تحميل البيانات", "error");
    } finally {
      setLoading(false);
      console.log("🏁 انتهاء تحميل البيانات");
    }
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCategories(1, search);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا القسم؟")) return;

    try {
      console.log("🗑️ حذف القسم:", id);
      await CategoryService.delete(id);

      // حذف القسم من localStorage
      const existingCategories = JSON.parse(
        localStorage.getItem("categories") || "[]"
      );
      const updatedCategories = existingCategories.filter(
        (cat) => cat.id !== parseInt(id)
      );
      localStorage.setItem("categories", JSON.stringify(updatedCategories));

      showMessage("تم حذف القسم بنجاح", "success");
      fetchCategories(page, search);
    } catch (err) {
      console.error("❌ خطأ في الحذف:", err);
      const errorMessage = err.response?.data?.message || "حدث خطأ أثناء الحذف";
      showMessage(errorMessage, "error");
    }
  };

  // دالة بسيطة للصور
  const renderCategoryImage = (cat) => {
    // إذا لا توجد صورة
    if (!cat.image) {
      return (
        <div
          className="text-center p-2 bg-light rounded"
          style={{ minHeight: "50px", minWidth: "50px" }}
        >
          <span className="text-muted small">بدون صورة</span>
        </div>
      );
    }

    // إذا فشلت الصورة في التحميل من قبل
    if (imageErrors[cat.id]) {
      return (
        <div
          className="text-center p-2 bg-danger text-white rounded"
          style={{ minHeight: "50px", minWidth: "50px" }}
        >
          <span className="small">خطأ في الصورة</span>
        </div>
      );
    }

    // تحديد مسار الصورة
    let imagePath = cat.image;
    if (!imagePath.startsWith("http")) {
      imagePath = `https://appgames.fikriti.com/${cat.image}`;

      console.log("🖼️ رابط الصورة:", imagePath);
    }

    console.log(`🖼️ عرض صورة ${cat.name}:`, imagePath);

    return (
      <img
        src={imagePath}
        alt={cat.name}
        className="img-thumbnail"
        style={{
          height: "50px",
          width: "auto",
          minWidth: "50px",
          objectFit: "cover",
        }}
        onLoad={() => {
          console.log(`✅ تم تحميل صورة ${cat.name} بنجاح`);
        }}
        onError={(e) => {
          console.error(`❌ فشل تحميل صورة ${cat.name}:`, imagePath);
          // منع التكرار المستمر
          e.target.onerror = null;

          // إضافة للأخطاء
          setImageErrors((prev) => ({ ...prev, [cat.id]: true }));
        }}
      />
    );
  };

  const printTable = () => {
    const printContents = document.getElementById("printArea").innerHTML;
    const w = window.open("", "", "width=900,height=700");
    w.document.write(`
      <html>
      <head>
        <title>طباعة قائمة الأصناف</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
        <style>
          body { direction: rtl; font-family: Arial, sans-serif; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #000; padding: 10px; text-align: center; }
          th { background-color: #343a40; color: white; }
          tr:nth-child(even) { background-color: #f8f9fa; }
        </style>
      </head>
      <body>
        <h3>قائمة الأصناف</h3>
        ${printContents}
      </body>
      </html>
    `);
    w.document.close();
    w.print();
  };

  // عرض التحميل
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
    <div className="container mt-4" dir="rtl">
      <div className="row justify-content-center">
        <h1 className="text-center mb-4 fw-bold" style={{ color: "#2c3e50" }}>
          إدارة الأقسام
        </h1>
        <div className="col-md-12">
          {message && (
            <div
              className={`alert ${
                message.includes("نجاح") ? "alert-success" : "alert-danger"
              } text-center`}
            >
              {message}
            </div>
          )}

          <div className="card shadow-lg border-0">
            <div
              className="card-header text-white d-flex justify-content-between align-items-center"
              style={{ background: "#2c3e50" }}
            >
              {/* <h4 className="mb-0">قائمة الأقسام ({categories.length})</h4> */}
              <h4 className="mb-0">قائمة الأقسام</h4>
              <Link
                to="/Dashboard/categories/create"
                className="btn btn-light btn-sm text-dark"
              >
                إضافة قسم
              </Link>
            </div>

            <div className="card-body bg-light">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-2">
                <button
                  onClick={printTable}
                  className="btn btn-outline-dark btn-sm shadow-sm"
                  style={{ color: "#fff" }}
                >
                  <i className="bi bi-printer"></i> طباعة
                </button>
                <form className="d-flex w-100" onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder="ابحث عن صنف..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    بحث
                  </button>
                </form>
              </div>

              <div
                id="printArea"
                className="table-responsive bg-white p-4 rounded-4 shadow-sm border"
              >
                <table className="table table-hover table-bordered text-center align-middle mb-0">
                  <thead className="table-light text-dark fw-bold">
                    <tr>
                      <th>#</th>
                      <th>الاسم</th>
                      <th>الوصف</th>
                      <th>الصورة</th>
                      <th>تاريخ الإضافة</th>
                      <th colSpan={2}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map((cat, index) => {
                        console.log(
                          `🏷️ عرض الفئة ${index + 1}:`,
                          cat.name,
                          "الصورة:",
                          cat.image
                        );

                        return (
                          <tr key={cat.id}>
                            <td>{(page - 1) * 10 + index + 1}</td>
                            <td className="fw-semibold">{cat.name}</td>
                            <td className="text-muted">
                              {cat.description || "-"}
                            </td>
                            <td>{renderCategoryImage(cat)}</td>
                            <td className="text-muted">
                              {cat.created_at
                                ? new Date(cat.created_at).toLocaleDateString(
                                    "ar-EG"
                                  )
                                : "-"}
                            </td>
                            <td>
                              <Link
                                to={`/Dashboard/categories/edit/${cat.id}`}
                                className="btn btn-sm"
                                style={{
                                  background:
                                    "linear-gradient(135deg, red 0%, orange 100%)",
                                  color: "#fff",
                                }}
                              >
                                تعديل
                              </Link>
                            </td>
                            <td>
                              <button
                                onClick={() => handleDelete(cat.id)}
                                className="btn btn-sm"
                                style={{ background: "red", color: "#fff" }}
                              >
                                حذف
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-5">
                          <i className="bi bi-info-circle fs-4 text-primary mb-2"></i>
                          <p className="mb-0">لا توجد أصناف حالياً.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {lastPage > 1 && (
                <nav className="mt-2 justify-content-center">
                  <ul className="pagination justify-content-center flex-wrap gap-2 text-center">
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map(
                      (p) => (
                        <li
                          key={p}
                          className={`page-item ${p === page ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryShow;
