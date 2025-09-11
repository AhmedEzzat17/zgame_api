import React from "react";
import "../../assets/Css/style.css";
import { Link } from "react-router-dom";

const GameSection = () => {

  return (
    <div className="containere" id="AboutUs">
      <div className="about-us">
        <div className="image-box fade-in">
          <img loading="lazy" src="images/story-2.png" alt="About Us" />
        </div>

        <div className="info-box fade-in">
          <h1 data-i18n="aboutus_title" className="fade-in">
            اختبر معلوماتك
          </h1>
          <p className="fade-in" data-i18n="aboutus_paragraph">
            هي لعبة ثقافية ممتعة مناسبة لجميع الاعمار فيها تختبر معلومات جمعتكم،
            اللعبة تشمل جميع انواع الاسئلة حسب الفئة المختارة.{" "}
          </p>

            <Link to="/OneCreateGame" onClick={() => window.scrollTo(0, 0)}>
            <button>إنشاء لعبة</button>
            </Link>

        </div>
      </div>
    </div>
  );
};

export default GameSection;
