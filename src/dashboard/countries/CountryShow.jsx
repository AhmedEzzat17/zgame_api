import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CountryService from "../../services/countriesService";

const CountryShow = () => {
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    fetchCountries(page, search);
  }, [page, search]);

  const fetchCountries = async (currentPage = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const res = await CountryService.getWithPagination(
        currentPage,
        searchTerm
      );
      setCountries(res.data.data.data);
      setLastPage(res.data.data.last_page);
    } catch (err) {
      setMessage("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCountries(1, search);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الدولة؟")) return;
    try {
      await CountryService.delete(id);

      // حذف الدولة من localStorage
      const existingCountries = JSON.parse(
        localStorage.getItem("countries") || "[]"
      );
      const updatedCountries = existingCountries.filter(
        (country) => country.id !== parseInt(id)
      );
      localStorage.setItem("countries", JSON.stringify(updatedCountries));

      setMessage("تم حذف الدولة بنجاح");
      setTimeout(() => setMessage(""), 3000);
      fetchCountries(page, search);
    } catch (err) {
      setMessage("حدث خطأ أثناء حذف الدولة");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await CountryService.updateStatus(id, { is_active: !currentStatus });

      // تحديث حالة الدولة في localStorage
      const existingCountries = JSON.parse(
        localStorage.getItem("countries") || "[]"
      );
      const countryIndex = existingCountries.findIndex(
        (country) => country.id === parseInt(id)
      );
      if (countryIndex !== -1) {
        existingCountries[countryIndex].is_active = !currentStatus ? 1 : 0;
        localStorage.setItem("countries", JSON.stringify(existingCountries));
      }

      setMessage(`تم ${currentStatus ? "تعطيل" : "تفعيل"} الدولة بنجاح`);
      setTimeout(() => setMessage(""), 3000);
      fetchCountries(page, search);
    } catch (err) {
      setMessage("حدث خطأ أثناء تحديث حالة الدولة");
    }
  };

  const printTable = () => {
    const printContents = document.getElementById("printArea").innerHTML;
    const w = window.open("", "", "width=900,height=700");
    w.document.write(`
      <html>
      <head>
        <title>طباعة قائمة الدول</title>
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
        <h3>قائمة الدول</h3>
        ${printContents}
      </body>
      </html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="container mt-4" dir="rtl">
      <div className="row justify-content-center">
        <h1 className="text-center mb-4 fw-bold">إدارة الدول</h1>
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
              <h4 className="mb-0">قائمة الدول</h4>
              <Link
                to="/Dashboard/countries/create"
                className="btn btn-light btn-sm text-dark"
              >
                <i className="bi bi-plus-lg me-1"></i> إضافة دولة
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
                    placeholder="ابحث عن دولة..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    بحث
                  </button>
                </form>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">جاري التحميل...</span>
                  </div>
                  <p className="mt-2">جاري تحميل البيانات...</p>
                </div>
              ) : (
                <div
                  id="printArea"
                  className="table-responsive bg-white p-4 rounded-4 shadow-sm border"
                >
                  <table className="table table-hover table-bordered text-center align-middle mb-0 rounded-4 overflow-hidden">
                    <thead className="table-light text-dark fw-bold">
                      <tr>
                        <th>#</th>
                        <th>العلم</th>
                        <th>اسم الدولة</th>
                        <th>الكود</th>
                        <th>كود الهاتف</th>
                        <th>العملة</th>
                        <th>رمز العملة</th>
                        {/* <th>الحالة</th> */}
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {countries.length > 0 ? (
                        countries.map((country, index) => (
                          <tr key={country.id}>
                            <td>{(page - 1) * 10 + index + 1}</td>
                            <td>
                              {country.flag ? (
                                <img
                                  src={`https://appgames.fikriti.com/${country.flag}`}
                                  alt={`علم ${country.name}`}
                                  className="img-fluid border rounded"
                                  style={{
                                    width: "40px",
                                    height: "30px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  className="d-flex align-items-center justify-content-center bg-light border rounded text-muted"
                                  style={{ width: "40px", height: "30px" }}
                                >
                                  <i className="bi bi-flag fs-6"></i>
                                </div>
                              )}
                            </td>
                            <td className="fw-semibold">{country.name}</td>
                            <td>{country.code}</td>
                            <td>{country.phone_code}</td>
                            <td>{country.currency || "-"}</td>
                            <td>{country.currency_symbol || "-"}</td>
                            {/* <td>
                              <button
                                onClick={() =>
                                  toggleStatus(country.id, country.is_active)
                                }
                                className={`btn btn-sm ${
                                  country.is_active
                                    ? "btn-success"
                                    : "btn-secondary"
                                }`}
                              >
                                {country.is_active ? "مفعل" : "معطل"}
                              </button>
                            </td> */}
                            <td>
                              <div className="d-flex justify-content-center gap-2">
                                <Link
                                  to={`/Dashboard/countries/edit/${country.id}`}
                                  className="btn btn-sm"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, red 0%, orange 100%)",
                                    color: "#fff",
                                  }}
                                  title="تعديل"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                                <button
                                  onClick={() => handleDelete(country.id)}
                                  className="btn btn-sm"
                                  style={{ background: "red", color: "#fff" }}
                                  title="حذف"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
                            className="text-center text-muted py-5"
                          >
                            <i className="bi bi-info-circle fs-4 text-primary mb-2"></i>
                            <p>لا توجد بيانات متاحة</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {lastPage > 1 && (
                <nav className="mt-4" aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        السابق
                      </button>
                    </li>

                    {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                      let pageNum;
                      if (lastPage <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= lastPage - 2) {
                        pageNum = lastPage - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <li
                          key={pageNum}
                          className={`page-item ${
                            page === pageNum ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    })}

                    <li
                      className={`page-item ${
                        page === lastPage ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setPage((p) => Math.min(lastPage, p + 1))
                        }
                        disabled={page === lastPage}
                      >
                        التالي
                      </button>
                    </li>
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

export default CountryShow;
