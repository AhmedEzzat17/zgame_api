// ===== TeamInfoV2.jsx =====
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function TeamInfoV2() {
  const [gameName, setGameName] = useState(() => {
    const stored = localStorage.getItem("gameInfo");
    return stored ? JSON.parse(stored).gameName || "" : "";
  });
  const [team1Name, setTeam1Name] = useState(() => {
    const stored = localStorage.getItem("gameInfo");
    return stored ? JSON.parse(stored).team1Name || "" : "";
  });
  const [team1Players, setTeam1Players] = useState(() => {
    const stored = localStorage.getItem("gameInfo");
    return stored ? JSON.parse(stored).team1Count || 1 : 1;
  });
  const [team2Name, setTeam2Name] = useState(() => {
    const stored = localStorage.getItem("gameInfo");
    return stored ? JSON.parse(stored).team2Name || "" : "";
  });
  const [team2Players, setTeam2Players] = useState(() => {
    const stored = localStorage.getItem("gameInfo");
    return stored ? JSON.parse(stored).team2Count || 1 : 1;
  });
  const [errors, setErrors] = useState({});

  // Save to localStorage whenever data changes
  useEffect(() => {
    const gameInfo = {
      gameName,
      team1Name,
      team2Name,
      team1Count: team1Players,
      team2Count: team2Players,
      team1Score: 0,
      team2Score: 0
    };
    localStorage.setItem("gameInfo", JSON.stringify(gameInfo));
  }, [gameName, team1Name, team2Name, team1Players, team2Players]);

  const validateForm = () => {
    const newErrors = {};
    
    // Check if 6 categories are selected
    const selectedItems = localStorage.getItem("selectedItems");
    const selected = selectedItems ? JSON.parse(selectedItems) : [];
    if (selected.length !== 6) {
      newErrors.categories = "يجب اختيار 6 فئات بالضبط من الخيارات فى الأعلى ";
    }
    
    if (!gameName.trim() || gameName.trim().length < 3) {
      newErrors.gameName = "الرجاء إدخال اسم اللعبة";
    }
    if (!team1Name.trim() || team1Name.trim().length < 3) {
      newErrors.team1Name = "اسم الفريق الأول يجب أن يكون أكثر من حرفين";
    }
    if (!team2Name.trim() || team2Name.trim().length < 3) {
      newErrors.team2Name = "اسم الفريق الثاني يجب أن يكون أكثر من حرفين";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const changePlayers = (team, delta) => {
    if (team === 1) {
      setTeam1Players((prev) => Math.max(1, Math.min(99, prev + delta)));
    } else {
      setTeam2Players((prev) => Math.max(1, Math.min(99, prev + delta)));
    }
  };

  const handleClick = (e) => {
    if (!validateForm()) {
      e.preventDefault(); // يمنع الانتقال
      return;
    }
    
    // فحص إذا كانت الأسماء نفسها للاحتفاظ بالتقدم
    const existingGameData = localStorage.getItem("completeGameData");
    let shouldKeepProgress = false;
    let existingData = null;
    
    if (existingGameData) {
      try {
        existingData = JSON.parse(existingGameData);
        // فحص إذا كانت الأسماء متطابقة
        if (existingData.gameInfo && 
            existingData.gameInfo.team1Name === team1Name && 
            existingData.gameInfo.team2Name === team2Name &&
            existingData.gameInfo.gameName === gameName) {
          shouldKeepProgress = true;
          console.log("🔄 تم العثور على تقدم سابق بنفس الأسماء - سيتم الاحتفاظ بالتقدم");
        } else {
          console.log("🆕 أسماء مختلفة - سيتم البدء من جديد");
        }
      } catch (error) {
        console.log("❌ خطأ في قراءة البيانات السابقة:", error);
      }
    }
    
    // Save complete game data to localStorage
    const selectedItems = localStorage.getItem("selectedItems");
    const selected = selectedItems ? JSON.parse(selectedItems) : [];
    
    const completeGameData = {
      categories: selected,
      gameInfo: {
        gameName,
        team1Name,
        team2Name,
        team1Count: team1Players,
        team2Count: team2Players,
        // إذا كانت الأسماء نفسها، احتفظ بالنقاط والدور، وإلا ابدأ من جديد
        team1Score: shouldKeepProgress ? (existingData.gameInfo.team1Score || 0) : 0,
        team2Score: shouldKeepProgress ? (existingData.gameInfo.team2Score || 0) : 0,
        currentTurn: shouldKeepProgress ? (existingData.gameInfo.currentTurn || 1) : 1
      },
      // إذا كانت الأسماء نفسها، احتفظ بالأسئلة المستخدمة، وإلا ابدأ من جديد
      usedQuestions: shouldKeepProgress ? (existingData.usedQuestions || []) : [],
      timestamp: new Date().toISOString(),
      isResumed: shouldKeepProgress // علامة للإشارة إلى أنه تم استكمال اللعبة
    };
    
    // إذا لم نحتفظ بالتقدم، امسح البيانات القديمة
    if (!shouldKeepProgress) {
      localStorage.removeItem("usedQuestions");
      localStorage.removeItem("currentQuestion");
    }
    
    localStorage.setItem("completeGameData", JSON.stringify(completeGameData));
    console.log(shouldKeepProgress ? "🎮 تم استكمال اللعبة بالتقدم السابق:" : "🎮 تم بدء لعبة جديدة:", completeGameData);
  };

  return (
    <div className="team-wrap" dir="rtl">
      <form className="team-card" noValidate>
        <h1 className="team-title">حدد معلومات الفرق</h1>
        
        {/* Show categories validation error */}
        {errors.categories && (
          <div className="error-text" style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {errors.categories}
          </div>
        )}

        {/* اسم اللعبة */}
        <div className="field">
          <label htmlFor="gameName">اسم اللعبة</label>
          <input
            id="gameName"
            name="gameName"
            type="text"
            value={gameName}
            placeholder="الرجاء إدخال اسم اللعبة"
            onChange={(e) => {
              setGameName(e.target.value);
              setErrors((prev) => ({ ...prev, gameName: undefined }));
            }}
            className={errors.gameName ? "input error" : "input"}
          />
          {errors.gameName && (
            <div className="error-text">{errors.gameName}</div>
          )}
        </div>

        <div className="teams-grid">
          {/* الفريق الأول */}
          <section className="team-box">
            <h2 className="team-sub">الفريق الأول</h2>
            <input
              id="team1Name"
              name="team1Name"
              type="text"
              placeholder="الرجاء إدخال اسم الفريق الأول"
              value={team1Name}
              onChange={(e) => {
                setTeam1Name(e.target.value);
                setErrors((prev) => ({ ...prev, team1Name: undefined }));
              }}
              className={errors.team1Name ? "input error" : "input"}
            />
            {errors.team1Name && (
              <div className="error-text">{errors.team1Name}</div>
            )}
            <div className="counter">
              <button type="button" onClick={() => changePlayers(1, -1)}>
                -
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={team1Players}
                onChange={(e) =>
                  setTeam1Players(Math.max(1, parseInt(e.target.value || "1")))
                }
                className="input num"
              />
              <button type="button" onClick={() => changePlayers(1, +1)}>
                +
              </button>
            </div>
          </section>

          {/* الفريق الثاني */}
          <section className="team-box">
            <h2 className="team-sub">الفريق الثاني</h2>
            <input
              id="team2Name"
              name="team2Name"
              type="text"
              placeholder="الرجاء إدخال اسم الفريق الثاني"
              value={team2Name}
              onChange={(e) => {
                setTeam2Name(e.target.value);
                setErrors((prev) => ({ ...prev, team2Name: undefined }));
              }}
              className={errors.team2Name ? "input error" : "input"}
            />
            {errors.team2Name && (
              <div className="error-text">{errors.team2Name}</div>
            )}
            <div className="counter">
              <button type="button" onClick={() => changePlayers(2, -1)}>
                -
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={team2Players}
                onChange={(e) =>
                  setTeam2Players(Math.max(1, parseInt(e.target.value || "1")))
                }
                className="input num"
              />
              <button type="button" onClick={() => changePlayers(2, +1)}>
                +
              </button>
            </div>
          </section>
        </div>

        {/* زر البدء */}
        <div className="actions">
          <Link to="/GameBoard" onClick={handleClick}>
            <button type="button" className="primary">
              ابدأ اللعب
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
