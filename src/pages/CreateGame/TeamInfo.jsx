// ===== TeamInfoV2.jsx =====
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function TeamInfoV2() {
  const [isTournamentMode, setIsTournamentMode] = useState(false);
  const [tournamentData, setTournamentData] = useState(null);
  
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

  // تحميل بيانات البطولة عند تحميل الصفحة
  useEffect(() => {
    const currentTournamentMatch = localStorage.getItem("currentTournamentMatch");
    if (currentTournamentMatch) {
      try {
        const matchData = JSON.parse(currentTournamentMatch);
        setIsTournamentMode(true);
        setTournamentData(matchData);
        setGameName(matchData.tournamentName);
        setTeam1Name(matchData.team1Name);
        setTeam2Name(matchData.team2Name);
        setTeam1Players(1); // في البطولة، كل فريق لاعب واحد
        setTeam2Players(1);
      } catch (error) {
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isTournamentMode) { // فقط احفظ إذا لم نكن في وضع البطولة
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
    }
  }, [gameName, team1Name, team2Name, team1Players, team2Players, isTournamentMode]);

  const validateForm = () => {
    const newErrors = {};
    
    // فحص الفئات في جميع الأوضاع - البطولة واللعبة العادية
    const selectedItems = localStorage.getItem("selectedItems");
    const selected = selectedItems ? JSON.parse(selectedItems) : [];
    
    if (isTournamentMode) {
      // في وضع البطولة، يجب اختيار 6 فئات من صفحة اختيار الفئات
      if (selected.length !== 6) {
        newErrors.categories = `يجب اختيار 6 فئات بالضبط للبطولة - تم اختيار ${selected.length} فقط. الرجاء العودة لصفحة اختيار الفئات.`;
      }
    } else {
      // في اللعبة العادية
      if (selected.length !== 6) {
        newErrors.categories = "يجب اختيار 6 فئات بالضبط من الخيارات فى الأعلى ";
      }
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
    
    let completeGameData;
    
    if (isTournamentMode) {
      // في وضع البطولة، استخدم الفئات الافتراضية
      const defaultCategories = [
        { id: 1, title: "نفط الكويت", img: "images/zGame_All_Pages-_3_-removebg-preview.png" },
        { id: 2, title: "House of the Dragon", img: "images/zGame_All_Pages-_3_-removebg-preview.png" },
        { id: 3, title: "دعایات", img: "images/zGame_All_Pages-_3_-removebg-preview.png" },
        { id: 4, title: "كنة الشام", img: "images/zGame_All_Pages-_3_-removebg-preview.png" },
        { id: 5, title: "مرور الكويت", img: "images/zGame_All_Pages-_3_-removebg-preview.png" },
        { id: 6, title: "مجمعات الكويت", img: "images/zGame_All_Pages-_3_-removebg-preview.png" }
      ];
      
      completeGameData = {
        categories: defaultCategories,
        gameInfo: {
          gameName,
          team1Name,
          team2Name,
          team1Count: team1Players,
          team2Count: team2Players,
          team1Score: 0,
          team2Score: 0,
          currentTurn: 1,
          isTournamentMode: true,
          tournamentData: tournamentData
        },
        usedQuestions: [],
        timestamp: new Date().toISOString(),
        isResumed: false
      };
      
    } else {
      // الوضع العادي - نفس المنطق السابق
      const existingGameData = localStorage.getItem("completeGameData");
      let shouldKeepProgress = false;
      let existingData = null;
      
      if (existingGameData) {
        try {
          existingData = JSON.parse(existingGameData);
          if (existingData.gameInfo && 
              existingData.gameInfo.team1Name === team1Name && 
              existingData.gameInfo.team2Name === team2Name &&
              existingData.gameInfo.gameName === gameName) {
            shouldKeepProgress = true;
          } else {
          }
        } catch (error) {
        }
      }
      
      const selectedItems = localStorage.getItem("selectedItems");
      const selected = selectedItems ? JSON.parse(selectedItems) : [];
      
      completeGameData = {
        categories: selected,
        gameInfo: {
          gameName,
          team1Name,
          team2Name,
          team1Count: team1Players,
          team2Count: team2Players,
          team1Score: shouldKeepProgress ? (existingData.gameInfo.team1Score || 0) : 0,
          team2Score: shouldKeepProgress ? (existingData.gameInfo.team2Score || 0) : 0,
          currentTurn: shouldKeepProgress ? (existingData.gameInfo.currentTurn || 1) : 1,
          isTournamentMode: false
        },
        usedQuestions: shouldKeepProgress ? (existingData.usedQuestions || []) : [],
        timestamp: new Date().toISOString(),
        isResumed: shouldKeepProgress
      };
      
      if (!shouldKeepProgress) {
        localStorage.removeItem("usedQuestions");
        localStorage.removeItem("currentQuestion");
      }
      
    }
    
    localStorage.setItem("completeGameData", JSON.stringify(completeGameData));
  };

  return (
    <div className="team-wrap" dir="rtl">
      <form className="team-card" noValidate>
        <h1 className="team-title">حدد معلومات الفرق</h1>
        
        {/* إظهار رسالة وضع البطولة */}
        {isTournamentMode && (
          <div className="tournament-info" style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            border: '1px solid #c3e6cb'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>مباراة بطولة</h3>
            <p style={{ margin: '0', fontSize: '14px' }}>
              أنت الآن في وضع البطولة. أسماء الفرق واللعبة محددة مسبقاً ولا يمكن تعديلها.
            </p>
          </div>
        )}

        {/* Show categories validation error */}
        {errors.categories && (
          <div className="error-text" style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            border: '1px solid #f5c6cb',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {errors.categories}
            {isTournamentMode && (
              <div style={{ 
                marginTop: '10px', 
                fontSize: '14px', 
                fontWeight: 'normal',
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ffeaa7'
              }}>
               تذكير: في البطولة يجب اختيار 6 فئات من صفحة اختيار الفئات قبل إدخال أسماء الفرق
              </div>
            )}
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
              if (!isTournamentMode) {
                setGameName(e.target.value);
                setErrors((prev) => ({ ...prev, gameName: undefined }));
              }
            }}
            className={errors.gameName ? "input error" : "input"}
            disabled={isTournamentMode}
            style={isTournamentMode ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
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
                if (!isTournamentMode) {
                  setTeam1Name(e.target.value);
                  setErrors((prev) => ({ ...prev, team1Name: undefined }));
                }
              }}
              className={errors.team1Name ? "input error" : "input"}
              disabled={isTournamentMode}
              style={isTournamentMode ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
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
                if (!isTournamentMode) {
                  setTeam2Name(e.target.value);
                  setErrors((prev) => ({ ...prev, team2Name: undefined }));
                }
              }}
              className={errors.team2Name ? "input error" : "input"}
              disabled={isTournamentMode}
              style={isTournamentMode ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
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
