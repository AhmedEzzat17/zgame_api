import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CategoryService from "../../services/Categorieservice";

const QuestionCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category_id: "",
    type: "mcq",
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: [],
    points: 100,
    level: "easy",
    question_media_url: null,
    media_mime: "",
    is_active: true,
  });
  const [categories, setCategories] = useState([]);
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

    // Load categories
    fetchCategories();

    return () => {
      const existingBootstrap = document.getElementById("bootstrap-css");
      const existingIcons = document.getElementById("bootstrap-icons");
      if (existingBootstrap) document.head.removeChild(existingBootstrap);
      if (existingIcons) document.head.removeChild(existingIcons);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.get();
      let categoriesData = [];
      
      if (res.data?.data?.data?.data) {
        categoriesData = res.data.data.data.data;
      } else if (res.data?.data?.data) {
        categoriesData = res.data.data.data;
      } else if (res.data?.data) {
        categoriesData = res.data.data;
      }
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل الأقسام");
    }
  };

  const getToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.token || null;
    } catch {
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (type === "file") {
      const file = files[0];
      
      if (file) {
        // Set the actual file object to question_media_url
        setFormData((prev) => ({ 
          ...prev, 
          question_media_url: file,
          media_mime: file.type
        }));

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        // Clear file data
        setFormData((prev) => ({ 
          ...prev, 
          question_media_url: null,
          media_mime: ""
        }));
        setPreview("");
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "correct_answer_single") {
      // For single MCQ answer
      setFormData((prev) => ({ ...prev, correct_answer: [value] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleMultipleCorrectAnswers = (option) => {
    setFormData((prev) => {
      const currentAnswers = prev.correct_answer || [];
      const newAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter(ans => ans !== option)
        : [...currentAnswers, option];
      
      return { ...prev, correct_answer: newAnswers };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category_id) newErrors.category_id = "القسم مطلوب";
    if (!formData.question_text.trim()) newErrors.question_text = "نص السؤال مطلوب";
    if (!formData.type) newErrors.type = "نوع السؤال مطلوب";
    
    if (formData.type === "mcq") {
      if (!formData.option_a.trim()) newErrors.option_a = "الخيار أ مطلوب";
      if (!formData.option_b.trim()) newErrors.option_b = "الخيار ب مطلوب";
    }
    
    if (!formData.correct_answer || formData.correct_answer.length === 0) {
      newErrors.correct_answer = "الإجابة الصحيحة مطلوبة";
    }
    
    if (!formData.points || formData.points <= 0) {
      newErrors.points = "النقاط يجب أن تكون أكبر من صفر";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitData = async (data, isFormData = false) => {
    try {
      const token = getToken();
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Don't set Content-Type header for FormData - let the browser set it with the correct boundary
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }


      const response = await fetch('https://appgames.fikriti.com/api/v1/dashboard/questions', {
        method: 'POST',
        headers: headers,
        body: isFormData ? data : JSON.stringify(data),
        credentials: 'include'
      });

      // Log response for debugging
      const responseText = await response.text();
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        
        const error = new Error(result.message || 'Request failed');
        error.response = {
          status: response.status,
          data: result
        };
        throw error;
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id || user?.user_id || 1;

      // Format correct_answer properly
      let correctAnswerFormatted;
      if (formData.type === "number") {
        // For numbers, convert to number inside array
        correctAnswerFormatted = [Number(formData.correct_answer[0])];
      } else {
        // For text and MCQ, keep as is
        correctAnswerFormatted = formData.correct_answer;
      }

      const questionData = {
        category_id: parseInt(formData.category_id),
        type: formData.type,
        question_text: formData.question_text.trim(),
        points: parseInt(formData.points),
        level: formData.level,
        is_active: formData.is_active ? 1 : 0,
        user_add_id: userId,
      };

      // Add MCQ options if type is mcq
      if (formData.type === "mcq") {
        questionData.option_a = formData.option_a.trim();
        questionData.option_b = formData.option_b.trim();
        if (formData.option_c.trim()) questionData.option_c = formData.option_c.trim();
        if (formData.option_d.trim()) questionData.option_d = formData.option_d.trim();
      }


      let response;
      
      if (formData.question_media_url && formData.question_media_url instanceof File) {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        
        // Add all base data fields
        Object.entries(questionData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formDataToSend.append(key, value);
          }
        });
        
        // Add correct_answer as array
        if (Array.isArray(correctAnswerFormatted)) {
          correctAnswerFormatted.forEach((answer, index) => {
            if (answer !== null && answer !== undefined) {
              formDataToSend.append(`correct_answer[${index}]`, String(answer));
            }
          });
        }
        
        // Add the file - this is the key part for file handling
        formDataToSend.append("question_media_url", formData.question_media_url, formData.question_media_url.name);
        
        // Add media mime type
        if (formData.media_mime) {
          formDataToSend.append("media_mime", formData.media_mime);
        }


        // Submit with FormData
        response = await submitData(formDataToSend, true);
      } else {
        // Without file - JSON
        baseData.correct_answer = correctAnswerFormatted;
        
        // If there's a question_media_url, include it
        if (formData.question_media_url) {
          baseData.question_media_url = formData.question_media_url;
        }
        
        response = await submitData(baseData, false);
      }

      toast.success("تمت إضافة السؤال بنجاح");

      // Update localStorage with the new question
      const responseData = response.data?.data || response.data || response;
      const newQuestion = {
        id: responseData?.id || Date.now(),
        category_id: parseInt(formData.category_id),
        type: formData.type,
        question_text: formData.question_text.trim(),
        option_a: formData.option_a?.trim() || "",
        option_b: formData.option_b?.trim() || "",
        option_c: formData.option_c?.trim() || "",
        option_d: formData.option_d?.trim() || "",
        correct_answer: correctAnswerFormatted,
        points: parseInt(formData.points),
        level: formData.level,
        is_active: formData.is_active ? 1 : 0,
        question_media_url: responseData?.question_media_url || formData.question_media_url || null,
        media_mime: formData.media_mime,
      };

      const existingQuestions = JSON.parse(
        localStorage.getItem("questions") || "[]"
      );
      existingQuestions.push(newQuestion);
      localStorage.setItem("questions", JSON.stringify(existingQuestions));

      navigate("/Dashboard/questions");
    } catch (error) {

      let errorMessage = "حدث خطأ أثناء إضافة السؤال";

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

  const renderMediaPreview = () => {
    if (!preview && !formData.question_media_url) {
      return (
        <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-muted">
          <i className="bi bi-file-earmark fs-4"></i>
        </div>
      );
    }

    const mediaUrl = preview || formData.question_media_url;
    const mediaType = formData.media_mime || '';

    if (mediaType.startsWith('image/')) {
      return (
        <img
          src={mediaUrl}
          alt="معاينة الصورة"
          className="img-fluid h-100 w-100 object-fit-cover rounded"
        />
      );
    } else if (mediaType.startsWith('video/')) {
      return (
        <video
          src={mediaUrl}
          className="w-100 h-100 object-fit-cover rounded"
          controls
        />
      );
    } else if (mediaType.startsWith('audio/')) {
      return (
        <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light rounded">
          <div className="text-center">
            <i className="bi bi-music-note-beamed fs-2 text-primary"></i>
            <div className="small text-muted mt-1">ملف صوتي</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-muted rounded">
          <div className="text-center">
            <i className="bi bi-file-earmark-play fs-4"></i>
            <div className="small mt-1">ملف وسائط</div>
          </div>
        </div>
      );
    }
  };

  const renderCorrectAnswerInput = () => {
    if (formData.type === "mcq") {
      return (
        <div className="mb-3">
          <label className="form-label">
            الإجابة الصحيحة <span className="text-danger">*</span>
          </label>
          <div className="mb-2">
            <small className="text-muted">يمكنك اختيار إجابة واحدة أو أكثر:</small>
          </div>
          <div className="row">
            {["A", "B", "C", "D"].map((option) => (
              <div key={option} className="col-6 mb-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`correct_${option}`}
                    checked={formData.correct_answer.includes(option)}
                    onChange={() => handleMultipleCorrectAnswers(option)}
                  />
                  <label className="form-check-label" htmlFor={`correct_${option}`}>
                    الخيار {option}
                  </label>
                </div>
              </div>
            ))}
          </div>
          {errors.correct_answer && (
            <div className="text-danger small">{errors.correct_answer}</div>
          )}
        </div>
      );
    } else {
      return (
        <div className="mb-3">
          <label htmlFor="correct_answer_text" className="form-label">
            الإجابة الصحيحة <span className="text-danger">*</span>
          </label>
          <input
            type={formData.type === "number" ? "number" : "text"}
            className={`form-control ${errors.correct_answer ? "is-invalid" : ""}`}
            id="correct_answer_text"
            value={formData.correct_answer[0] || ""}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              correct_answer: [e.target.value] 
            }))}
            placeholder={
              formData.type === "number" ? "أدخل الرقم الصحيح" : "أدخل الإجابة الصحيحة"
            }
          />
          {errors.correct_answer && (
            <div className="invalid-feedback">{errors.correct_answer}</div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="container mt-4" dir="rtl">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-lg border-0">
            <div
              className="card-header text-white d-flex justify-content-between align-items-center"
              style={{ background: "#2c3e50" }}
            >
              <h4 className="mb-0">إضافة سؤال جديد</h4>
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
                    <label htmlFor="category_id" className="form-label">
                      القسم <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.category_id ? "is-invalid" : ""}`}
                      id="category_id"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                    >
                      <option value="">اختر القسم</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <div className="invalid-feedback">{errors.category_id}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="type" className="form-label">
                      نوع السؤال <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.type ? "is-invalid" : ""}`}
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="mcq">اختيار متعدد</option>
                      <option value="text">نص</option>
                      <option value="number">رقم</option>
                      <option value="media">وسائط</option>
                    </select>
                    {errors.type && (
                      <div className="invalid-feedback">{errors.type}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="question_text" className="form-label">
                    نص السؤال <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${errors.question_text ? "is-invalid" : ""}`}
                    id="question_text"
                    name="question_text"
                    rows="3"
                    value={formData.question_text}
                    onChange={handleChange}
                    placeholder="أدخل نص السؤال"
                  />
                  {errors.question_text && (
                    <div className="invalid-feedback">{errors.question_text}</div>
                  )}
                </div>

                {formData.type === "mcq" && (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="option_a" className="form-label">
                        الخيار أ <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.option_a ? "is-invalid" : ""}`}
                        id="option_a"
                        name="option_a"
                        value={formData.option_a}
                        onChange={handleChange}
                        placeholder="أدخل الخيار الأول"
                      />
                      {errors.option_a && (
                        <div className="invalid-feedback">{errors.option_a}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="option_b" className="form-label">
                        الخيار ب <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.option_b ? "is-invalid" : ""}`}
                        id="option_b"
                        name="option_b"
                        value={formData.option_b}
                        onChange={handleChange}
                        placeholder="أدخل الخيار الثاني"
                      />
                      {errors.option_b && (
                        <div className="invalid-feedback">{errors.option_b}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="option_c" className="form-label">
                        الخيار ج (اختياري)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="option_c"
                        name="option_c"
                        value={formData.option_c}
                        onChange={handleChange}
                        placeholder="أدخل الخيار الثالث"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="option_d" className="form-label">
                        الخيار د (اختياري)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="option_d"
                        name="option_d"
                        value={formData.option_d}
                        onChange={handleChange}
                        placeholder="أدخل الخيار الرابع"
                      />
                    </div>
                  </div>
                )}

                {renderCorrectAnswerInput()}

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="points" className="form-label">
                      النقاط <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.points ? "is-invalid" : ""}`}
                      id="points"
                      name="points"
                      value={formData.points}
                      onChange={handleChange}
                    >
                      <option value="200">200</option>
                      <option value="400">400</option>
                      <option value="600">600</option>
                    </select>
                    {errors.points && (
                      <div className="invalid-feedback">{errors.points}</div>
                    )}
                  </div>
                </div>

                  {/* <div className="col-md-4 mb-3">
                    <label htmlFor="level" className="form-label">
                    المستوى
                    </label>
                    <select
                      className="form-select"
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      >
                      <option value="easy">سهل</option>
                      <option value="medium">متوسط</option>
                      <option value="hard">صعب</option>
                      </select> 
                      */}

                {/* <div className="row">

                  <div className="col-md-4 mb-3 d-flex align-items-end">
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
                </div> */}

                <div className="mb-4">
                  <label htmlFor="question_media" className="form-label">
                    ملف الوسائط (اختياري)
                  </label>
                  
                
                  {/* File upload and preview */}
                  <div className="d-flex align-items-start gap-4">
                    <div
                      className="border rounded p-2 flex-shrink-0"
                      style={{ width: "120px", height: "80px" }}
                    >
                      {renderMediaPreview()}
                    </div>
                    
                    <div className="flex-grow-1">
                      <input
                        type="file"
                        className={`form-control ${errors.question_media_url ? "is-invalid" : ""}`}
                        id="question_media"
                        name="question_media_url"
                        onChange={handleChange}
                        accept="image/*,audio/*,video/*"
                      />
                      <div className="form-text">
                        يمكن رفع صور، صوت، أو فيديو (أو استخدم الرابط أعلاه)
                      </div>
                      {formData.question_media_url && (
                        <div className="small text-info mt-2">
                          <i className="bi bi-file-earmark-check me-1"></i>
                          تم اختيار الملف: {formData.question_media_url.name}
                        </div>
                      )}
                      {errors.question_media_url && (
                        <div className="invalid-feedback">{errors.question_media_url}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Media type info */}
                  {formData.media_mime && (
                    <div className="mt-2">
                      <small className="text-muted">
                        نوع الملف: {formData.media_mime}
                      </small>
                    </div>
                  )}
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

export default QuestionCreate;