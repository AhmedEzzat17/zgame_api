import React from "react";

const ContactNew = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("تم الإرسال بنجاح!");
  };

  return (
    <div className="contactNew-page">
      <div className="contactNew-card">
        <div className="contactNew-logo">
          <img
            src="images/zGame_All_Pages-removebg-preview.png"
            alt="سبين جيم"
          />
        </div>
        <h2 className="contactNew-title">تواصل معنا الآن</h2>

        <form onSubmit={handleSubmit}>
          {/* الاسم */}
          <input
            type="text"
            placeholder="أدخل اسمك"
            className="contactNew-input"
            required
          />

          {/* البريد الإلكتروني */}
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            className="contactNew-input"
            required
          />

          {/* كود الدولة */}
          <select
            required
            className="contactNew-input"
            defaultValue=""
          >
            <option value="" disabled>
              اختر كود الدولة
            </option>
            <option value="+20">مصر +20</option>
            <option value="+970">فلسطين +970</option>
            <option value="+966">السعودية +966</option>
            <option value="+962">الأردن +962</option>
            <option value="+965">الكويت +965</option>
            <option value="+974">قطر +974</option>
            <option value="+968">عمان +968</option>
            <option value="+971">الإمارات +971</option>
          </select>

          {/* رقم الهاتف */}
          <input
            type="number"
            placeholder="رقم الهاتف"
            className="contactNew-input"
            required
          />

          {/* الرسالة */}
          <textarea
            placeholder="اكتب رسالتك هنا"
            className="contactNew-textarea"
            required
          ></textarea>

          {/* زر الإرسال */}
          <button type="submit" className="contactNew-btn">
            إرسال
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactNew;
