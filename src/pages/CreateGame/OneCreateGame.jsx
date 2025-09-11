import React from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faPlus } from "@fortawesome/free-solid-svg-icons";
// import { faTrophy } from "@fortawesome/free-solid-svg-icons";

const OneCreateGame = () => {
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
              <h1>إنشاء لعبة</h1>
            </div>
            <h2 className="fade-in hero-title">
              لعبة جماعية تفاعلية نختبر فيها معرفتكم و ثقافتكم
            </h2>
            <p className="fade-in hero-subtitle">
              ٦ فئات، ٣٦ سؤال، و معاهم ٣ وسائل مساعدة
            </p>
          </div>
        </div>
      </div>

      {/* <div className="image-grid"> شيل الصورتين
        <div className="grid-item">
          <div className="grid-image-placeholder">
            <img src="images/zGame-All-Pages-_9_-removebg-preview.png" alt="Description of image 1" />
            <FontAwesomeIcon icon={faPlus} className="fa-icon" />

            <h1>إنشاء لعبة</h1>
          </div>
        </div>
        <div className="grid-item">
          <div className="grid-image-placeholder">
            <img src="images/zGame_All_Pages___7_-removebg-preview.png" alt="Description of image 2" />
            <FontAwesomeIcon icon={faTrophy} className="fa-icon" />
            <h1>إنشاء بطولة</h1>
          </div>
        </div>
      </div> */}

    </section>
  );
};

export default OneCreateGame;
