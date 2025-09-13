import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionsService from "../../services/questionsservice";
import CategoryService from "../../services/Categorieservice";
import { toast } from "react-toastify";

const QuestionEdit = () => {
  const { id } = useParams();
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
    level: "easy", // Uncomment this - it's required
    question_media: null,
    media_mime: "",
    is_active: true,
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const [currentMedia, setCurrentMedia] = useState("");
  const [isMediaRemoved, setIsMediaRemoved] = useState(false);

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
  }, [id]);

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
      console.error("Error fetching categories:", error);
    }
  };

  const fetchQuestion = useCallback(async () => {
    try {
      const response = await QuestionsService.getById(id);
      const question = response.data.data;

      // Parse correct_answer if it's a JSON string
      let correctAnswer = question.correct_answer;
      if (typeof correctAnswer === 'string') {
        try {
          correctAnswer = JSON.parse(correctAnswer);
        } catch (e) {
          correctAnswer = [correctAnswer];
        }
      }

      setFormData({
        category_id: question.category_id || "",
        type: question.type || "mcq",
        question_text: question.question_text || "",
        option_a: question.option_a || "",
        option_b: question.option_b || "",
        option_c: question.option_c || "",
        option_d: question.option_d || "",
        correct_answer: Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer],
        points: question.points || 100,
        level: question.level || "easy", // Uncomment this
        media_mime: question.media_mime || "",
        is_active: question.is_active,
      });

      if (question.question_media_url) {
        setCurrentMedia(question.question_media_url);
        setPreview(question.question_media_url);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      toast.error("حدث خطأ أثناء تحميل بيانات السؤال");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    fetchQuestion();
  }, [fetchQuestion]);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setIsMediaRemoved(false);
        setFormData((prev) => ({ ...prev, media_mime: file.type }));
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
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

  const handleRemoveMedia = () => {
    setFormData((prev) => ({
      ...prev,
      question_media: null,
    }));
    setPreview("");
    setCurrentMedia("");
    setIsMediaRemoved(true);
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

    if (!formData.level) { // Add level validation
      newErrors.level = "المستوى مطلوب";
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
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("question_text", formData.question_text);
      
      // Handle correct_answer based on question type - match QuestionCreate format
      if (formData.type === "mcq") {
        formDataToSend.append("correct_answer", JSON.stringify(formData.correct_answer));
      } else {
        // For text, number, and media types, send as indexed array like in QuestionCreate
        const correctAnswerArray = Array.isArray(formData.correct_answer) 
          ? formData.correct_answer 
          : [formData.correct_answer];
        
        correctAnswerArray.forEach((answer, index) => {
          if (answer !== null && answer !== undefined && answer !== "") {
            formDataToSend.append(`correct_answer[${index}]`, String(answer));
          }
        });
      }
      
      formDataToSend.append("points", formData.points);
      formDataToSend.append("level", formData.level);
      formDataToSend.append("is_active", formData.is_active ? 1 : 0);

      // Add MCQ options if type is mcq
      if (formData.type === "mcq") {
        formDataToSend.append("option_a", formData.option_a || "");
        formDataToSend.append("option_b", formData.option_b || "");
        formDataToSend.append("option_c", formData.option_c || "");
        formDataToSend.append("option_d", formData.option_d || "");
      }

      // Add media mime type if provided
      if (formData.media_mime) {
        formDataToSend.append("media_mime", formData.media_mime);
      }

      // Add user_add_id
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id || user?.user_id || 1;
      formDataToSend.append("user_add_id", userId);

      // Add media file if provided - match QuestionCreate field name
      if (formData.question_media && formData.question_media instanceof File) {
        formDataToSend.append("question_media_url", formData.question_media, formData.question_media.name);
      }

      // If media was removed
      if (isMediaRemoved) {
        formDataToSend.append("remove_media", "1");
      }

      console.log("البيانات المرسلة للتحديث:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const response = await QuestionsService.update(id, formDataToSend);

      toast.success("تم تحديث السؤال بنجاح");

      // Update localStorage with the updated question
      const updatedQuestion = {
        id: parseInt(id),
        category_id: parseInt(formData.category_id),
        type: formData.type,
        question_text: formData.question_text.trim(),
        option_a: formData.option_a.trim(),
        option_b: formData.option_b.trim(),
        option_c: formData.option_c.trim(),
        option_d: formData.option_d.trim(),
        correct_answer: formData.correct_answer,
        points: parseInt(formData.points),
        level: formData.level, // Uncomment this
        is_active: formData.is_active ? 1 : 0,
        question_media_url: response.data?.question_media_url || currentMedia,
        media_mime: formData.media_mime,
      };

      const existingQuestions = JSON.parse(
        localStorage.getItem("questions") || "[]"
      );
      const questionIndex = existingQuestions.findIndex(
        (question) => question.id === parseInt(id)
      );

      if (questionIndex !== -1) {
        existingQuestions[questionIndex] = updatedQuestion;
        localStorage.setItem("questions", JSON.stringify(existingQuestions));
      }

      navigate("/Dashboard/questions");
    } catch (error) {
      console.error("Error updating question:", error);
      console.log("Server validation errors:", error.response?.data?.errors);
      console.log("Full error response:", error.response?.data);
      if (error.response?.data?.errors?.correct_answer) {
        console.log("Correct answer error details:", error.response.data.errors.correct_answer);
      }
      setErrors(error.response?.data?.errors || {});
      toast.error("حدث خطأ أثناء تحديث السؤال");
    } finally {
      setSaving(false);
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

  const renderMediaPreview = () => {
    if (!preview) {
      return (
        <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-muted">
          <i className="bi bi-file-earmark fs-4"></i>
        </div>
      );
    }

    // Handle different URL formats
    let mediaUrl = preview;
    if (!preview.startsWith("http") && !preview.startsWith("data:")) {
      // Remove leading slash if present and construct proper URL
      const cleanPath = preview.startsWith('/') ? preview.substring(1) : preview;
      mediaUrl = `https://appgames.fikriti.com/${cleanPath}`;
    }

    if (formData.media_mime && formData.media_mime.startsWith('image/')) {
      return (
        <img
          src={mediaUrl}
          alt="معاينة الوسائط"
          className="img-fluid h-100 w-100 object-fit-cover"
          onError={(e) => {
            console.error('Image load error:', e.target.src);
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }

    return (
      <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-info text-white">
        <i className="bi bi-file-earmark-play fs-4"></i>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
        <p className="mt-2">جاري تحميل بيانات السؤال...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4" dir="rtl">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: "#2c3e50" }}>
              <h4 className="mb-0">تعديل السؤال</h4>
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

                  {/* <div className="col-md-4 mb-3">
                    <label htmlFor="level" className="form-label">
                      المستوى <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.level ? "is-invalid" : ""}`}
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                    >
                      <option value="easy">سهل</option>
                      <option value="medium">متوسط</option>
                      <option value="hard">صعب</option>
                    </select>
                    {errors.level && (
                      <div className="invalid-feedback">{errors.level}</div>
                    )}
                  </div> */}

                  {/* <div className="col-md-4 mb-3 d-flex align-items-end">
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
                  </div> */}
                </div>

                <div className="mb-4">
                  <label className="form-label">ملف الوسائط (اختياري)</label>
                  <div className="d-flex align-items-center gap-4">
                    <div
                      className="border rounded p-2"
                      style={{ width: "100px", height: "60px" }}
                    >
                      {renderMediaPreview()}
                    </div>
                    <div className="flex-grow-1">
                      <div className="input-group">
                        <input
                          type="file"
                          className={`form-control ${errors.question_media ? "is-invalid" : ""}`}
                          id="question_media"
                          name="question_media"
                          onChange={handleChange}
                          accept="image/*,audio/*,video/*"
                        />
                        {currentMedia && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={handleRemoveMedia}
                            disabled={!currentMedia}
                          >
                            <i className="bi bi-trash" style={{ color: "#fff" }}></i>
                          </button>
                        )}
                      </div>
                      <div className="form-text">يمكن رفع صور، صوت، أو فيديو</div>
                      {errors.question_media && (
                        <div className="invalid-feedback d-block">
                          {errors.question_media}
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

export default QuestionEdit;