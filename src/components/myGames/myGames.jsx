import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MyGames = () => {
  const navigate = useNavigate();
  
  // Sample games data - replace with actual API call
  const sampleGames = [
    {
      id: 1,
      title: "لعبة الرياضيات",
      description: "لعبة تفاعلية لتعلم الرياضيات بطريقة ممتعة",
      image: "/images/math-game.jpg",
      category: "تعليمي",
      playCount: 25,
      lastPlayed: "2024-01-15",
      difficulty: "متوسط"
    },
    {
      id: 2,
      title: "الكلمات",
      description: "اختبر مهاراتك في اللغة العربية",
      image: "/images/word-game.jpg",
      category: "لغوي",
      playCount: 18,
      lastPlayed: "2024-01-12",
      difficulty: "سهل"
    },
    {
      id: 4,
      title: "جغرافيا العالم",
      description: "اكتشف دول وعواصم العالم",
      image: "/images/geography-game.jpg",
      category: "جغرافيا",
      playCount: 12,
      lastPlayed: "2024-01-10",
      difficulty: "متوسط"
    }
  ];

  const [games, setGames] = useState(sampleGames);

  const handlePlayGame = (gameId) => {
    console.log("Playing game:", gameId);
    // Navigate to game or implement play logic
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="mygames11-container">
      <div className="mygames11-wrapper">
        
        {/* Header */}
        <div className="mygames11-header">
          <h1>ألعابي</h1>
          <p>اكتشف وارجع إلى ألعابك المفضلة</p>
        </div>

        {/* Games Grid */}
        <div className="mygames11-grid">
          {games.length > 0 ? (
            games.map((game) => (
              <div key={game.id} className="mygames11-card">
                
                {/* Game Image */}
                <div className="mygames11-image">
                  <img 
                    src={game.image} 
                    alt={game.title}
                    onError={(e) => {
                      e.target.src = "images/zGame_All_Pages___2_-removebg-preview.png";
                    }}
                  />
                </div>

                {/* Game Content */}
                <div className="mygames11-content">
                  <h3 className="mygames11-title">{game.title}</h3>
                  
                  {/* Play Button */}
                  <button 
                    className="mygames11-play-btn"
                    onClick={() => handlePlayGame(game.id)}
                  >
                    <i className="fas fa-gamepad"></i>
                    العب مرة أخرى
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="mygames11-no-games">
              <div className="mygames11-no-games-icon">
                <i className="fas fa-gamepad"></i>
              </div>
              <h3>لا توجد ألعاب بعد</h3>
              <p>ابدأ بلعب أول لعبة لك لتظهر هنا</p>
              <button 
                className="mygames11-browse-games-btn"
                onClick={() => {
                  navigate("/OneCreateGame");
                  window.scrollTo(0, 0);
                }}
              >
                <i className="fas fa-search"></i>
                تصفح الألعاب
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mygames11-action-buttons">
          <button 
            className="mygames11-new-game-btn"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/OneCreateGame");
            }}
          >
            <i className="fas fa-plus"></i>
            لعبة جديدة
          </button>
          <button 
            className="mygames11-home-btn"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/");
            }}
          >
            <i className="fas fa-home"></i>
            الرجوع إلى الصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyGames;