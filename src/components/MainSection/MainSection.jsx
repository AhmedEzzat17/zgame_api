import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const HeroSection = () => {
  // دالة تنظيف بيانات البطولة عند إنشاء لعبة عادية
  const handleCreateGame = () => {
    // تنظيف بيانات البطولة عند الضغط على "إنشاء لعبة"
    localStorage.removeItem("currentTournamentMatch");
    localStorage.removeItem("tournamentData");
    localStorage.removeItem("usedQuestionsTournament"); // مسح أسئلة البطولة المستخدمة
    window.scrollTo(0, 0);
  };

  return (
    <section id="hero" className="hero section dark-background">
      <div className="main-img"></div>
      <div className="container fade-in">
        <div
          className="row justify-content-center text-center"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="col-xl-8 col-lg-6">
            <div className="image-home fade-in">
              <img src="images/zGame_All_Pages-removebg-preview.png" alt="" />
            </div>
            <h2 className="fade-in hero-title">الجواب عليك، و السؤال علينا</h2>
            <p className="fade-in hero-subtitle">
              ٦ فئات، ٣٦ سؤال، و معاهم ٣ وسائل مساعدة
            </p>
          </div>
        </div>
      </div>

      <div className="image-grid">
        <Link
          to="/OneCreateGame"
          onClick={handleCreateGame}
          className="link-wrapper"
        >
          <div className="grid-item">
            <div className="grid-image-placeholder">
              {/* <img src="images/zGame-All-Pages-_9_-removebg-preview.png" alt="Description of image 1" /> */}
              <FontAwesomeIcon icon={faPlus} className="fa-icon" />

              <h1>إنشاء لعبة</h1>
            </div>
          </div>
        </Link>
        <Link
          to="/OneCreateChampion"
          onClick={() => window.scrollTo(0, 0)}
          className="link-wrapper"
        >
          <div className="grid-item">
            <div className="grid-image-placeholder">
              {/* <img src="images/zGame_All_Pages___7_-removebg-preview.png" alt="Description of image 2" /> */}
              <FontAwesomeIcon icon={faTrophy} className="fa-icon" />
              <h1>إنشاء بطولة</h1>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
