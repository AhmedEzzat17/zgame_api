import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QuestionsService from "../../services/questionsservice";

const QuestionShow = () => {
  const [questions, setQuestions] = useState([]);
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
    fetchQuestions(page, search);
  }, [page, search]);

  const fetchQuestions = async (currentPage = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const res = await QuestionsService.getWithPagination(
        currentPage,
        searchTerm
      );
      setQuestions(res.data.data.data);
      setLastPage(res.data.data.last_page);
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions(1, search);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    try {
      await QuestionsService.delete(id);

      // حذف السؤال من localStorage
      const existingQuestions = JSON.parse(
        localStorage.getItem("questions") || "[]"
      );
      const updatedQuestions = existingQuestions.filter(
        (question) => question.id !== parseInt(id)
      );
      localStorage.setItem("questions", JSON.stringify(updatedQuestions));

      setMessage("تم حذف السؤال بنجاح");
      setTimeout(() => setMessage(""), 3000);
      fetchQuestions(page, search);
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء حذف السؤال");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await QuestionsService.updateStatus(id, { is_active: !currentStatus });

      // تحديث حالة السؤال في localStorage
      const existingQuestions = JSON.parse(
        localStorage.getItem("questions") || "[]"
      );
      const questionIndex = existingQuestions.findIndex(
        (question) => question.id === parseInt(id)
      );
      if (questionIndex !== -1) {
        existingQuestions[questionIndex].is_active = !currentStatus ? 1 : 0;
        localStorage.setItem("questions", JSON.stringify(existingQuestions));
      }

      setMessage(`تم ${currentStatus ? "تعطيل" : "تفعيل"} السؤال بنجاح`);
      setTimeout(() => setMessage(""), 3000);
      fetchQuestions(page, search);
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء تحديث حالة السؤال");
    }
  };

  const printTable = () => {
    const printContents = document.getElementById("printArea").innerHTML;
    const w = window.open("", "", "width=900,height=700");
    w.document.write(`
      <html>
      <head>
        <title>طباعة قائمة الأسئلة</title>
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
        <h3>قائمة الأسئلة</h3>
        ${printContents}
      </body>
      </html>
    `);
    w.document.close();
    w.print();
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'mcq': return 'اختيار متعدد';
      case 'text': return 'نص';
      case 'number': return 'رقم';
      case 'media': return 'وسائط';
      default: return type;
    }
  };

  const getLevelLabel = (level) => {
    switch (level) {
      case 'easy': return 'سهل';
      case 'medium': return 'متوسط';
      case 'hard': return 'صعب';
      default: return level;
    }
  };

  const renderQuestionMedia = (question) => {
    if (!question.question_media_url) {
      return (
        <div
          className="d-flex align-items-center justify-content-center bg-light border rounded text-muted"
          style={{ width: "60px", height: "40px" }}
        >
          <i className="bi bi-file-earmark fs-6"></i>
        </div>
      );
    }

    const mediaUrl = question.question_media_url.startsWith("http") 
      ? question.question_media_url
      : `https://appgames.fikriti.com/${question.question_media_url}`;

    if (question.media_mime && question.media_mime.startsWith('image/')) {
      return (
        <div className="position-relative">
          <img
            src={mediaUrl}
            alt="وسائط السؤال"
            className="img-thumbnail"
            style={{
              width: "60px",
              height: "40px",
              objectFit: "cover",
              cursor: 'pointer'
            }}
            onClick={() => window.open(mediaUrl, '_blank')}
          />
          <div className="position-absolute top-0 start-0 bg-dark bg-opacity-50 text-white px-1 rounded-end" 
               style={{fontSize: '10px'}}>
            صورة
          </div>
        </div>
      );
    }

    return (
      <div className="position-relative">
        <div
          className="d-flex align-items-center justify-content-center bg-info border rounded text-white"
          style={{ 
            width: "60px", 
            height: "40px",
            cursor: 'pointer'
          }}
          onClick={() => window.open(mediaUrl, '_blank')}
        >
          <i className="bi bi-file-earmark-play fs-5"></i>
        </div>
        <div className="position-absolute top-0 start-0 bg-dark bg-opacity-50 text-white px-1 rounded-end" 
             style={{fontSize: '10px'}}>
          {question.media_mime?.includes('video') ? 'فيديو' : 'ملف'}
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4" dir="rtl">
      <div className="row justify-content-center">
        <h1 className="text-center mb-4 fw-bold">إدارة الأسئلة</h1>
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
              <h4 className="mb-0">قائمة الأسئلة</h4>
              <Link
                to="/Dashboard/questions/create"
                className="btn btn-light btn-sm text-dark"
              >
                <i className="bi bi-plus-lg me-1"></i> إضافة سؤال
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
                    placeholder="ابحث عن سؤال..."
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
                        <th>نص السؤال</th>
                        <th>النوع</th>
                        <th>المستوى</th>
                        <th>النقاط</th>
                        <th>الوسائط</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.length > 0 ? (
                        questions.map((question, index) => (
                          <tr key={question.id}>
                            <td>{(page - 1) * 10 + index + 1}</td>
                            <td className="fw-semibold text-start" style={{ maxWidth: "200px" }}>
                              {question.question_text?.length > 50 
                                ? question.question_text.substring(0, 50) + "..." 
                                : question.question_text}
                            </td>
                            <td>
                              <span className={`badge ${
                                question.type === 'mcq' ? 'bg-primary' :
                                question.type === 'text' ? 'bg-success' :
                                question.type === 'number' ? 'bg-warning' :
                                question.type === 'media' ? 'bg-info' : 'bg-secondary'
                              }`}>
                                {getQuestionTypeLabel(question.type)}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                question.level === 'easy' ? 'bg-success' :
                                question.level === 'medium' ? 'bg-warning' :
                                question.level === 'hard' ? 'bg-danger' : 'bg-secondary'
                              }`}>
                                {getLevelLabel(question.level)}
                              </span>
                            </td>
                            <td>{question.points}</td>
                            <td>{renderQuestionMedia(question)}</td>
                            <td>
                              <button
                                onClick={() =>
                                  toggleStatus(question.id, question.is_active)
                                }
                                className={`btn btn-sm ${
                                  question.is_active
                                    ? "btn-success"
                                    : "btn-secondary"
                                }`}
                              >
                                {question.is_active ? "مفعل" : "معطل"}
                              </button>
                            </td>
                            <td>
                              <div className="d-flex justify-content-center gap-2">
                                <Link
                                  to={`/Dashboard/questions/edit/${question.id}`}
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
                                  onClick={() => handleDelete(question.id)}
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
                            colSpan="8"
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

export default QuestionShow;
