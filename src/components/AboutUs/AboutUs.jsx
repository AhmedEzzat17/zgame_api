import React from "react";
import "../../assets/Css/style.css";

const AboutUs = () => {
  const words = ["تحدي", "ذكاء", "متعة", "ترفيه"];

  return (
    <div className="containere" id="AboutUs">
      <div className="about-us">
        <div className="info-box fade-in">
          <h1 data-i18n="aboutus_title" className="fade-in">
            نبذة عن ذاللعبة
          </h1>
          <p className="fade-in" data-i18n="aboutus_paragraph">
            "ذاللعبة" هو وجهتك المثالية لاكتشاف مجموعة واسعة ومتنوعة من الألعاب
            الممتعة والمسلية. سواء كنت تبحث عن ألعاب أكشن مثيرة، أو ألغاز ذهنية
            تتحدى ذكائك، أو حتى ألعاب كلاسيكية تعيد لك ذكريات الماضي، فإن "ذ
            اللعبة" يجمع كل ما تحبه في مكان واحد. يتميز الموقع بواجهة سهلة
            الاستخدام تتيح لك العثور على لعبتك المفضلة بسرعة. استمتع بتجربة لعب
            سلسة ومباشرة دون الحاجة للتنزيل، وابدأ مغامرتك فورًا.!
          </p>

          {/* الدوائر */}
          <div className="circles-container">
            {words.map((word, i) => (
              <div className="circle" key={i}>
                <span className="circle-text">{word}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="image-box fade-in">
          <img
            loading="lazy"
            src="images/zGame_All_Pages-removebg-preview.png"
            alt="About Us"
          />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
