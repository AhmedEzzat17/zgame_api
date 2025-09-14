import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "../../assets/Css/style.css";

const OneCreateChampion = () => {
  const navigate = useNavigate();
  return (
    <section className="hero2">
      {/* الصورة تغطي الشاشة كلها */}
      <img
        src="images/ai-generated-trophy-trophy-trophies-with-confetti-free-photo.jpg"
        alt="Trophy"
        className="hero-image2"
      />

      {/* المحتوى فوق الصورة */}
      <div className="content2">
        <div className="icon-box2" onClick={() => navigate("/MyGames")}>
          <FontAwesomeIcon icon={faTrophy} className="fa-icon" />
          <h1 className="title2">البطولات السابقة</h1>
        </div>
      </div>
    </section>
  );
};

export default OneCreateChampion;
