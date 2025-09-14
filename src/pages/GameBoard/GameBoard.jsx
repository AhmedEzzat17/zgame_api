// GameBoard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import questionsService from "../../services/questionsservice";

// Default fallback categories (will be replaced by localStorage data)
const defaultCategories = [
  {
    id: 1,
    title: "",
    img: "#",
  },
  {
    id: 2,
    title: "",
    img: "#",
  },
  {
    id: 3,
    title: "#",
    img: "#",
  },
  {
    id: 4,
    title: "",
    img: "#",
  },
  {
    id: 5,
    title: "",
    img: "#",
  },
  {
    id: 6,
    title: "",
    img: "#",
  },
];

const values = [200, 400, 600];

export default function GameBoard() {
  const navigate = useNavigate();
  const [scoreLeft, setScoreLeft] = useState(0);
  const [scoreRight, setScoreRight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [showHoleModal, setShowHoleModal] = useState(false);
  const [holeUsed, setHoleUsed] = useState({ left: false, right: false });
  const [currentTeamUsingHole, setCurrentTeamUsingHole] = useState(null);

  // Function to save game state to localStorage
  const saveGameState = (team1Score = scoreLeft, team2Score = scoreRight) => {
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      if (gameData.gameInfo) {
        // Update all game state
        gameData.gameInfo.team1Score = team1Score;
        gameData.gameInfo.team2Score = team2Score;
        gameData.gameInfo.holeUsed = holeUsed;
        gameData.gameInfo.currentTeamUsingHole = currentTeamUsingHole;
        
        // Save to localStorage
        localStorage.setItem("completeGameData", JSON.stringify(gameData));
        
      }
    }
  };
  
  // Save scores to localStorage (kept for backward compatibility)
  const saveScoresToLocalStorage = (team1Score, team2Score) => {
    saveGameState(team1Score, team2Score);
  };

  // دالة لتحديد مفتاح localStorage حسب نوع اللعبة
  const getUsedQuestionsKey = () => {
    return isTournamentMode ? 'usedQuestionsTournament' : 'usedQuestions';
  };

  // دالة للتحقق من استخدام السؤال مسبقاً
  const isQuestionUsed = (categoryId, points, side) => {
    return usedQuestions.has(`${categoryId}-${points}-${side}`);
  };

  // دالة لتحديد السؤال كمستخدم
  const markQuestionAsUsed = (categoryId, points, side) => {
    const questionKey = `${categoryId}-${points}-${side}`;
    setUsedQuestions(prev => {
      const newSet = new Set(prev);
      newSet.add(questionKey);
      
      // حفظ في localStorage حسب نوع اللعبة
      const storageKey = getUsedQuestionsKey();
      localStorage.setItem(storageKey, JSON.stringify(Array.from(newSet)));
      
      
      // فحص إذا كانت جميع الأسئلة قد انتهت
      const totalQuestions = categories.length * values.length * 2; // 6 categories * 3 values * 2 sides
      if (newSet.size >= totalQuestions) {
        setGameFinished(true);
        setShowWinnerModal(true);
        
        // إذا كانت مباراة بطولة، حفظ الفائز تلقائياً
        if (isTournamentMode && tournamentData) {
          setTimeout(() => {
            const winner = getWinner();
            
            // في حالة التعادل، لا نحفظ شيء
            if (winner.type !== 'tie') {
              const savedTournamentData = JSON.parse(localStorage.getItem("tournamentData") || "{}");
              if (!savedTournamentData.winners) {
                savedTournamentData.winners = {};
              }
              
              // حفظ الفائز في المباراة الحالية
              savedTournamentData.winners[tournamentData.matchKey] = winner.name;
              localStorage.setItem("tournamentData", JSON.stringify(savedTournamentData));
              
            }
          }, 100);
        }
      }
      
      return newSet;
    });
  };

  // دالة لتحديد الفائز
  const getWinner = () => {
    if (scoreLeft > scoreRight) {
      return { name: team1Name, score: scoreLeft, type: 'winner' };
    } else if (scoreRight > scoreLeft) {
      return { name: team2Name, score: scoreRight, type: 'winner' };
    } else {
      return { name: 'تعادل', score: scoreLeft, type: 'tie' };
    }
  };

  // دالة لإعادة تعيين اللعبة
  const resetGame = () => {
    // حذف الأسئلة المستخدمة حسب نوع اللعبة
    const storageKey = getUsedQuestionsKey();
    localStorage.removeItem(storageKey);
    localStorage.removeItem('currentQuestion');
    
    
    setUsedQuestions(new Set());
    setScoreLeft(0);
    setScoreRight(0);
    setShowWinnerModal(false);
    setGameFinished(false);
    
    // تحديث النقاط في localStorage
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      if (gameData.gameInfo) {
        gameData.gameInfo.team1Score = 0;
        gameData.gameInfo.team2Score = 0;
        localStorage.setItem("completeGameData", JSON.stringify(gameData));
      }
    }
  };

  // دالة للتعامل مع انتهاء مباراة البطولة
  const handleTournamentMatchEnd = () => {
    if (!isTournamentMode || !tournamentData) return;

    const winner = getWinner();
    
    // في حالة التعادل، إعادة المباراة
    if (winner.type === 'tie') {
      alert("تعادل! سيتم إعادة المباراة مرة أخرى");
      resetGame();
      return;
    }
    
    // تحديث بيانات البطولة بالفائز
    const savedTournamentData = JSON.parse(localStorage.getItem("tournamentData") || "{}");
    if (!savedTournamentData.winners) {
      savedTournamentData.winners = {};
    }
    
    // حفظ الفائز في المباراة الحالية - حفظ اسم الفائز مباشرة
    savedTournamentData.winners[tournamentData.matchKey] = winner.name;
    
    localStorage.setItem("tournamentData", JSON.stringify(savedTournamentData));
    

    // تنظيف بيانات المباراة الحالية
    localStorage.removeItem("currentTournamentMatch");
    localStorage.removeItem("completeGameData");
    localStorage.removeItem("usedQuestionsTournament"); // حذف أسئلة البطولة فقط
    localStorage.removeItem("currentQuestion");
    
    // العودة لشجرة البطولة فوراً
    navigate("/CreateChampionTwo");
  };

  // دالة للتحقق من انتهاء جميع الأسئلة
  const areAllQuestionsFinished = () => {
    const totalQuestions = categories.length * values.length * 2; // 6 categories * 3 values * 2 sides = 36
    return usedQuestions.size >= totalQuestions;
  };

  // دالة للعودة للصفحة الرئيسية
  const handleReturnToHome = () => {
    // تنظيف جميع البيانات
    const storageKey = getUsedQuestionsKey();
    localStorage.removeItem(storageKey);
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('completeGameData');
    localStorage.removeItem('selectedItems');
    
    
    // العودة للصفحة الرئيسية
    navigate('/');
  };

  // دالة للعودة لصفحة التقسيمة (البطولة)
  const handleReturnToTournament = () => {
    // تنظيف بيانات اللعبة الحالية فقط
    const storageKey = getUsedQuestionsKey();
    localStorage.removeItem(storageKey);
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('completeGameData');
    localStorage.removeItem('currentTournamentMatch');
    
    
    // العودة لصفحة التقسيمة
    navigate('/CreateChampionTwo');
  };

  // دالة للتعامل مع الضغط على الأرقام وجلب السؤال من API
  const handleQuestionClick = async (categoryId, points, side) => {
    if (loading || isQuestionUsed(categoryId, points, side)) return; // منع الضغط المتعدد
    
    setLoading(true);
    
    try {
      
      // تحديد الدور الحالي بناءً على الجانب المضغوط
      const currentTurn = side === 'left' ? 1 : 2;
      
      // العثور على اسم الفئة المختارة
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      const categoryName = selectedCategory ? (selectedCategory.title || selectedCategory.name) : "فئة غير معروفة";
      
      // حفظ الدور الحالي واسم الفئة في localStorage
      const completeGameData = localStorage.getItem("completeGameData");
      if (completeGameData) {
        const gameData = JSON.parse(completeGameData);
        if (gameData.gameInfo) {
          gameData.gameInfo.currentTurn = currentTurn;
          gameData.gameInfo.selectedCategoryName = categoryName; // حفظ اسم الفئة المختارة
          localStorage.setItem("completeGameData", JSON.stringify(gameData));
        }
      }
      
      // جلب السؤال من API
      const response = await questionsService.getRandomByCategoryAndPoints(categoryId, points);
      
      if (response.data && response.data.data) {
        const questionData = response.data.data;
        
        // حفظ بيانات السؤال في localStorage
        const gameQuestionData = {
          categoryId,
          points,
          question: questionData,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem("currentQuestion", JSON.stringify(gameQuestionData));
        
        
        // تحديد السؤال المحدد كمستخدم
        markQuestionAsUsed(categoryId, points, side);
        
        // الانتقال لصفحة السؤال
        navigate(`/TheGame/${categoryId}/${points}`);
      } else {
        // استخدام سؤال تجريبي كـ fallback
        const mockQuestion = {
          id: Math.random(),
          question_text: `سؤال تجريبي للقسم ${categoryId} بنقاط ${points}`,
          correct_answer: "إجابة تجريبية",
          points: points,
          category_id: categoryId
        };
        
        const gameQuestionData = {
          categoryId,
          points,
          question: mockQuestion,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem("currentQuestion", JSON.stringify(gameQuestionData));
        
        // تحديد السؤال المحدد كمستخدم
        markQuestionAsUsed(categoryId, points, side);
        
        navigate(`/TheGame/${categoryId}/${points}`);
      }
    } catch (error) {
      
      // في حالة فشل الـ API، استخدم سؤال تجريبي
      const mockQuestion = {
        id: Math.random(),
        question_text: `سؤال تجريبي للقسم ${categoryId} بنقاط ${points}`,
        correct_answer: "إجابة تجريبية",
        points: points,
        category_id: categoryId
      };
      
      const gameQuestionData = {
        categoryId,
        points,
        question: mockQuestion,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem("currentQuestion", JSON.stringify(gameQuestionData));
      
      // تحديد السؤال المحدد كمستخدم
      markQuestionAsUsed(categoryId, points, side);
      
      navigate(`/TheGame/${categoryId}/${points}`);
    } finally {
      setLoading(false);
    }
  };
  const [categories, setCategories] = useState(defaultCategories);
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [isTournamentMode, setIsTournamentMode] = useState(false);
  const [tournamentData, setTournamentData] = useState(null);

  // دالة لتحميل الأسئلة المستخدمة حسب نوع اللعبة
  const loadUsedQuestions = () => {
    const storageKey = getUsedQuestionsKey();
    const savedUsedQuestions = localStorage.getItem(storageKey);
    
    if (savedUsedQuestions) {
      try {
        const usedQuestionsArray = JSON.parse(savedUsedQuestions);
        setUsedQuestions(new Set(usedQuestionsArray));
      } catch (error) {
        setUsedQuestions(new Set());
      }
    } else {
      setUsedQuestions(new Set());
    }
  };

  useEffect(() => {
    // تحميل الأسئلة المستخدمة بعد تحديد نوع اللعبة
    loadUsedQuestions();
  }, [isTournamentMode]); // إعادة التحميل عند تغيير نوع اللعبة

  // Save hole state whenever it changes
  useEffect(() => {
    if (holeUsed.left || holeUsed.right || currentTeamUsingHole) {
      saveGameState();
    }
  }, [holeUsed, currentTeamUsingHole]);

  // Load game data from localStorage on component mount and when returning from TheGame
  useEffect(() => {
    const loadGameData = () => {
      // أولاً: تحميل الأقسام المختارة من selectedItems
      const selectedItems = localStorage.getItem("selectedItems");
      if (selectedItems) {
        try {
          const selectedCategories = JSON.parse(selectedItems);
          if (selectedCategories && selectedCategories.length === 6) {
            const loadedCategories = selectedCategories.map((cat, index) => ({
              id: index + 1,
              title: cat.name || cat.title,
              img: cat.image || cat.img || "images/zGame_All_Pages-_3_-removebg-preview.png"
            }));
            setCategories(loadedCategories);
          }
        } catch (error) {
        }
      }

      // ثانياً: تحميل بيانات اللعبة من completeGameData
      const completeGameData = localStorage.getItem("completeGameData");
      if (completeGameData) {
        const gameData = JSON.parse(completeGameData);
        
        // تحميل الأقسام من completeGameData إذا لم توجد في selectedItems
        if (!selectedItems && gameData.categories && gameData.categories.length === 6) {
          const loadedCategories = gameData.categories.map((cat, index) => ({
            id: index + 1,
            title: cat.title || cat.name,
            img: cat.img || cat.image || "images/zGame_All_Pages-_3_-removebg-preview.png"
          }));
          setCategories(loadedCategories);
        }
        
        // Load team names and scores from localStorage
        if (gameData.gameInfo) {
          const updates = {};
          
          // فحص إذا كانت اللعبة في وضع البطولة
          if (gameData.gameInfo.isTournamentMode) {
            setIsTournamentMode(true);
            setTournamentData(gameData.gameInfo.tournamentData);
            updates.isTournamentMode = true;
            updates.tournamentData = gameData.gameInfo.tournamentData;
          }
          
          if (gameData.gameInfo.team1Name) {
            setTeam1Name(gameData.gameInfo.team1Name);
            updates.team1Name = gameData.gameInfo.team1Name;
          }
          if (gameData.gameInfo.team2Name) {
            setTeam2Name(gameData.gameInfo.team2Name);
            updates.team2Name = gameData.gameInfo.team2Name;
          }
          
          // Load scores - always update to latest values
          if (gameData.gameInfo.team1Score !== undefined) {
            setScoreLeft(gameData.gameInfo.team1Score);
            updates.team1Score = gameData.gameInfo.team1Score;
          }
          if (gameData.gameInfo.team2Score !== undefined) {
            setScoreRight(gameData.gameInfo.team2Score);
            updates.team2Score = gameData.gameInfo.team2Score;
          }
          
          // Load hole state
          if (gameData.gameInfo.holeUsed) {
            setHoleUsed(gameData.gameInfo.holeUsed);
            updates.holeUsed = gameData.gameInfo.holeUsed;
          }
          if (gameData.gameInfo.currentTeamUsingHole) {
            setCurrentTeamUsingHole(gameData.gameInfo.currentTeamUsingHole);
            updates.currentTeamUsingHole = gameData.gameInfo.currentTeamUsingHole;
          }
          
        }
      } else {
      }
    };

    loadGameData();
    
    // Listen for focus events to reload data when returning from other pages
    const handleFocus = () => {
      loadGameData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Additional useEffect to listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'completeGameData') {
        const gameData = JSON.parse(e.newValue || '{}');
        if (gameData.gameInfo) {
          if (gameData.gameInfo.team1Score !== undefined) {
            setScoreLeft(gameData.gameInfo.team1Score);
          }
          if (gameData.gameInfo.team2Score !== undefined) {
            setScoreRight(gameData.gameInfo.team2Score);
          }
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="jeopardy-app">
      <div className="board">
        {categories.map((cat) => (
          <div className="category" key={cat.id}>
            <div className="col">
              {values.map((v) => (
                <div 
                  className={`pill ${isQuestionUsed(cat.id, v, 'left') ? 'pill-used' : ''}`}
                  key={`left-${cat.id}-${v}`}
                  onClick={() => handleQuestionClick(cat.id, v, 'left')}
                  style={{ 
                    cursor: loading || isQuestionUsed(cat.id, v, 'left') ? 'not-allowed' : 'pointer',
                    opacity: isQuestionUsed(cat.id, v, 'left') ? 0.4 : 1 
                  }}
                >
                  <span className="value-text">{loading ? '...' : v}</span>
                </div>
              ))}
            </div>

            <div className="center-card">
              <div className="image-wrap">
                <img src={cat.img} alt={cat.title} />
              </div>
              <div className="label">{cat.title}</div>
            </div>

            <div className="col">
              {values.map((v) => (
                <div 
                  className={`pill ${isQuestionUsed(cat.id, v, 'right') ? 'pill-used' : ''}`}
                  key={`right-${cat.id}-${v}`}
                  onClick={() => handleQuestionClick(cat.id, v, 'right')}
                  style={{ 
                    cursor: loading || isQuestionUsed(cat.id, v, 'right') ? 'not-allowed' : 'pointer',
                    opacity: isQuestionUsed(cat.id, v, 'right') ? 0.4 : 1 
                  }}
                >
                  <span className="value-text">{loading ? '...' : v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="controls">
        <div className="team">
          <button className="name">{team1Name}</button>
          <div className="score-box">
            <button
              className="minus"
              onClick={() => {
                const newScore = scoreLeft - 200;
                setScoreLeft(newScore);
                saveScoresToLocalStorage(newScore, scoreRight);
              }}
            >
              −
            </button>
            <div className="score">{scoreLeft}</div>
            <button
              className="plus"
              onClick={() => {
                const newScore = scoreLeft + 200;
                setScoreLeft(newScore);
                saveScoresToLocalStorage(newScore, scoreRight);
              }}
            >
              +
            </button>
          </div>
          <div className="helpers-inline">
            <h3>وسائل المساعدة</h3>
            <div className="icons">
              <div 
                className={`icon ${holeUsed.left ? 'icon-disabled' : 'icon-colored'}`}
                onClick={() => {
                  if (!holeUsed.left) {
                    setShowHoleModal('left');
                  }
                }}
              >
                <i className="fas fa-sync-alt" title={holeUsed.left ? 'تم استخدام الحفرة' : 'الحفرة'}></i>
              </div>
              <div className="icon icon-disabled">
                <i className="fas fa-phone" title="اتصال بصديق"></i>
              </div>
              <div className="icon icon-disabled">
                <i className="fas fa-hand-peace" title="اجابة إجابتين"></i>
              </div>
            </div>
          </div>
        </div>

        {/* زر العودة - يظهر فقط بعد انتهاء جميع الأسئلة */}
        {areAllQuestionsFinished() && (
          <div className="center-return-button">
            <button 
              className="return-button"
              onClick={isTournamentMode ? handleReturnToTournament : handleReturnToHome}
            >
              {isTournamentMode ? 'العودة إلى صفحة التقسيمة' : 'العودة للصفحة الرئيسية'}
            </button>
          </div>
        )}

        <div className="team team-right">
          <button className="name">{team2Name}</button>
          <div className="score-box">
            <button
              className="minus"
              onClick={() => {
                const newScore = scoreRight - 200;
                setScoreRight(newScore);
                saveScoresToLocalStorage(scoreLeft, newScore);
              }}
            >
              −
            </button>
            <div className="score">{scoreRight}</div>
            <button
              className="plus"
              onClick={() => {
                const newScore = scoreRight + 200;
                setScoreRight(newScore);
                saveScoresToLocalStorage(scoreLeft, newScore);
              }}
            >
              +
            </button>
          </div>
          <div className="helpers-inline">
            <h3>وسائل المساعدة</h3>
            <div className="icons">
              <div 
                className={`icon ${holeUsed.right ? 'icon-disabled' : 'icon-colored'}`}
                onClick={() => {
                  if (!holeUsed.right) {
                    setShowHoleModal('right');
                  }
                }}
              >
                <i className="fas fa-sync-alt" title={holeUsed.right ? 'تم استخدام الحفرة' : 'الحفرة'}></i>
              </div>
              <div className="icon icon-disabled">
                <i className="fas fa-phone" title="اتصال بصديق"></i>
              </div>
              <div className="icon icon-disabled">
                <i className="fas fa-hand-peace" title="اجابة إجابتين"></i>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal للحفرة */}
      {showHoleModal && (
        <div className="hole-modal-overlay" onClick={() => setShowHoleModal(false)}>
          <div className="hole-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hole-modal-header">
              <h3>الحفرة - {showHoleModal === 'left' ? team1Name : team2Name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowHoleModal(false)}
              >
                ×
              </button>
            </div>
            <div className="hole-modal-content">
              <p>الحفرة هي عبارة عن:</p>
              <ul>
                <li>إذا جاوب اللاعب عن السؤال: يزيد 200 وينقص 200 من الخصم</li>
                <li>إذا لم يجاوب: لا يحدث شيء</li>
              </ul>
            </div>
            <div className="hole-modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowHoleModal(false)}
              >
                إلغاء
              </button>
              <button 
                className="activate-btn"
                onClick={() => {
                  const updatedHoleUsed = {
                    ...holeUsed,
                    [showHoleModal]: true
                  };
                  setHoleUsed(updatedHoleUsed);
                  setCurrentTeamUsingHole(showHoleModal);
                  
                  // Save to localStorage immediately
                  const completeGameData = localStorage.getItem("completeGameData");
                  if (completeGameData) {
                    const gameData = JSON.parse(completeGameData);
                    if (gameData.gameInfo) {
                      gameData.gameInfo.holeUsed = updatedHoleUsed;
                      gameData.gameInfo.currentTeamUsingHole = showHoleModal;
                      localStorage.setItem("completeGameData", JSON.stringify(gameData));
                    }
                  }
                  
                  setShowHoleModal(false);
                }}
              >
                تفعيل
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Winner Modal */}
      {showWinnerModal && (
        <div className="hole-modal-overlay" onClick={() => setShowWinnerModal(false)}>
          <div className="winner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="winner-modal-header">
              <h2>🏆 نتائج اللعبة</h2>
              <button 
                className="close-btn"
                onClick={() => setShowWinnerModal(false)}
              >
                ×
              </button>
            </div>
            <div className="winner-modal-content">
              {getWinner().type === 'tie' ? (
                <>
                  <div className="tie-icon">🤝</div>
                  <h3>تعادل!</h3>
                  <p>النتيجة: {getWinner().score} نقطة لكل فريق</p>
                  <div className="teams-scores">
                    <div className="team-result">
                      <span className="team-name">{team1Name}</span>
                      <span className="team-score">{scoreLeft} نقطة</span>
                    </div>
                    <div className="team-result">
                      <span className="team-name">{team2Name}</span>
                      <span className="team-score">{scoreRight} نقطة</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="winner-icon">🏆</div>
                  <h3>الفائز: {getWinner().name}</h3>
                  <p>بعدد {getWinner().score} نقطة</p>
                  <div className="teams-scores">
                    <div className={`team-result ${scoreLeft > scoreRight ? 'winner' : 'loser'}`}>
                      <span className="team-name">{team1Name}</span>
                      <span className="team-score">{scoreLeft} نقطة</span>
                    </div>
                    <div className={`team-result ${scoreRight > scoreLeft ? 'winner' : 'loser'}`}>
                      <span className="team-name">{team2Name}</span>
                      <span className="team-score">{scoreRight} نقطة</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="winner-modal-actions">
              {isTournamentMode ? (
                <>
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowWinnerModal(false)}
                  >
                    إغلاق
                  </button>
                  <button 
                    className="activate-btn"
                    onClick={handleTournamentMatchEnd}
                  >
                    العودة للبطولة
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowWinnerModal(false)}
                  >
                    إغلاق
                  </button>
                  <button 
                    className="activate-btn"
                    onClick={resetGame}
                  >
                    لعبة جديدة
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
