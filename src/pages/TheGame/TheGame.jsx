import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questionsService from "../../services/questionsservice";

// تم إزالة البيانات الثابتة - سيتم الاعتماد على API فقط

function TheGame() {
  const { categoryId, value } = useParams();
  const navigate = useNavigate();

  const [showAnswer, setShowAnswer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentTeam, setCurrentTeam] = useState("الفريق الأول");
  const [showCallFriend, setShowCallFriend] = useState(false);

  const [hudTime, setHudTime] = useState(0);
  const [hudRunning, setHudRunning] = useState(false);

  const [timer, setTimer] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [doubleAnswerUsed, setDoubleAnswerUsed] = useState(false);
  const [showStartBtn, setShowStartBtn] = useState(true);
  const [callFriendUsed, setCallFriendUsed] = useState(false);

  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Game state from localStorage
  const [gameName, setGameName] = useState("لعبة المعلومات");
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(1); // 1 for team1, 2 for team2
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // Load game data and question from localStorage
  useEffect(() => {
    const loadGameData = async () => {
      try {
        // Load complete game data
        const completeGameData = localStorage.getItem("completeGameData");
        if (completeGameData) {
          const gameData = JSON.parse(completeGameData);
          
          // Set game info
          if (gameData.gameInfo) {
            setGameName(gameData.gameInfo.gameName || "لعبة المعلومات");
            setTeam1Name(gameData.gameInfo.team1Name || "الفريق الأول");
            setTeam2Name(gameData.gameInfo.team2Name || "الفريق الثاني");
            setTeam1Score(gameData.gameInfo.team1Score || 0);
            setTeam2Score(gameData.gameInfo.team2Score || 0);
            setCurrentTurn(gameData.gameInfo.currentTurn || 1);
            
            // إذا كانت اللعبة مستكملة، اعرض رسالة
            if (gameData.isResumed) {
              console.log("🔄 تم استكمال اللعبة من آخر نقطة توقف");
              console.log(`📊 النقاط الحالية: ${gameData.gameInfo.team1Name}: ${gameData.gameInfo.team1Score} - ${gameData.gameInfo.team2Name}: ${gameData.gameInfo.team2Score}`);
            }
          }
          
          // Load category name from gameInfo (saved from GameBoard)
          let loadedGameName = "لعبة المعلومات"; // default
          
          // Get the selected category name from gameInfo
          if (gameData.gameInfo && gameData.gameInfo.selectedCategoryName) {
            loadedGameName = gameData.gameInfo.selectedCategoryName;
          } else if (gameData.categories && gameData.categories.length > 0) {
            // Fallback: find category by current categoryId
            const currentCategory = gameData.categories.find(cat => cat.id == categoryId);
            if (currentCategory) {
              loadedGameName = currentCategory.name || currentCategory.title || loadedGameName;
            }
          }
          
          setGameName(loadedGameName);
          console.log("🎮 تم تحميل اسم اللعبة:", loadedGameName);
          
          // Load team names and scores
          if (gameData.gameInfo) {
            if (gameData.gameInfo.team1Name) setTeam1Name(gameData.gameInfo.team1Name);
            if (gameData.gameInfo.team2Name) setTeam2Name(gameData.gameInfo.team2Name);
            if (gameData.gameInfo.team1Score !== undefined) setTeam1Score(gameData.gameInfo.team1Score);
            if (gameData.gameInfo.team2Score !== undefined) setTeam2Score(gameData.gameInfo.team2Score);
            if (gameData.gameInfo.currentTurn) setCurrentTurn(gameData.gameInfo.currentTurn);
          }
        }
        
        // Load current question from localStorage first, then try API if needed
        const currentQuestion = localStorage.getItem("currentQuestion");
        if (currentQuestion) {
          const parsedQuestion = JSON.parse(currentQuestion);
          
          // Check if question matches current parameters
          if (parsedQuestion.categoryId == categoryId && parsedQuestion.points == value) {
            const apiQuestion = parsedQuestion.question;
            
            // Format API data
            const formattedQuestion = {
              question: apiQuestion.question_text || apiQuestion.question || "سؤال غير متوفر",
              answer: apiQuestion.correct_answer || apiQuestion.answer || "إجابة غير متوفرة"
            };
            
            setQuestionData(formattedQuestion);
            console.log("✅ تم تحميل السؤال من localStorage:", formattedQuestion);
          } else {
            // Question doesn't match, try to fetch from API directly
            await fetchQuestionFromAPI();
          }
        } else {
          // No question in localStorage, fetch from API directly
          await fetchQuestionFromAPI();
        }
        
        // Function to fetch question directly from API
        async function fetchQuestionFromAPI() {
          try {
            console.log(`🚀 جاري جلب سؤال من API للقسم ${categoryId} بنقاط ${value}`);
            
            const response = await questionsService.getRandomByCategoryAndPoints(categoryId, value);
            
            if (response.data && response.data.data) {
              const apiQuestion = response.data.data;
              
              // Format API data
              const formattedQuestion = {
                question: apiQuestion.question_text || apiQuestion.question || "سؤال غير متوفر",
                answer: apiQuestion.correct_answer || apiQuestion.answer || "إجابة غير متوفرة"
              };
              
              setQuestionData(formattedQuestion);
              console.log("✅ تم جلب السؤال مباشرة من API:", formattedQuestion);
              
              // Save to localStorage for future use
              const gameQuestionData = {
                categoryId: parseInt(categoryId),
                points: parseInt(value),
                question: apiQuestion,
                timestamp: new Date().toISOString()
              };
              localStorage.setItem("currentQuestion", JSON.stringify(gameQuestionData));
              
            } else {
              console.error("❌ لم يتم العثور على سؤال من API");
              setQuestionData(null);
            }
          } catch (error) {
            console.error("❌ خطأ في جلب السؤال من API:", error);
            setQuestionData(null);
          }
        }
        
        // Set current team based on turn
        const completeData = localStorage.getItem("completeGameData");
        if (completeData) {
          const data = JSON.parse(completeData);
          if (data.gameInfo && data.gameInfo.currentTurn) {
            const turn = data.gameInfo.currentTurn;
            const team1 = data.gameInfo.team1Name || "الفريق الأول";
            const team2 = data.gameInfo.team2Name || "الفريق الثاني";
            setCurrentTeam(turn === 1 ? team1 : team2);
          }
        }
        
      } catch (error) {
        console.error("❌ خطأ في تحميل بيانات اللعبة:", error);
        setQuestionData(null);
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [categoryId, value]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  // Function to save scores to localStorage
  const saveScoresToLocalStorage = (newTeam1Score, newTeam2Score) => {
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      if (gameData.gameInfo) {
        gameData.gameInfo.team1Score = newTeam1Score;
        gameData.gameInfo.team2Score = newTeam2Score;
        localStorage.setItem("completeGameData", JSON.stringify(gameData));
        console.log("💾 تم حفظ النقاط:", { team1: newTeam1Score, team2: newTeam2Score });
      }
    }
  };

  // Handle correct answer
  const handleCorrectAnswer = () => {
    const newScore = currentTurn === 1 ? team1Score + 1 : team2Score + 1;
    
    if (currentTurn === 1) {
      setTeam1Score(newScore);
    } else {
      setTeam2Score(newScore);
    }
    
    // Save updated scores to localStorage
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      if (currentTurn === 1) {
        gameData.gameInfo.team1Score = newScore;
      } else {
        gameData.gameInfo.team2Score = newScore;
      }
      gameData.gameInfo.currentTurn = currentTurn === 1 ? 2 : 1;
      // حفظ التقدم مع الاحتفاظ بالأسئلة المستخدمة
      gameData.timestamp = new Date().toISOString();
      localStorage.setItem("completeGameData", JSON.stringify(gameData));
      console.log("💾 تم حفظ التقدم - النقاط المحدثة:", gameData.gameInfo);
    }
    
    // Switch turn
    setCurrentTurn(currentTurn === 1 ? 2 : 1);
    
    // Navigate back to GameBoard immediately
    navigate("/GameBoard");
  };

  // Handle team answer (correct answer)
  const handleTeamAnswer = (teamNumber) => {
    const points = parseInt(value);
    let newTeam1Score = team1Score;
    let newTeam2Score = team2Score;
    
    if (teamNumber === 1) {
      newTeam1Score = team1Score + points;
      setTeam1Score(newTeam1Score);
    } else {
      newTeam2Score = team2Score + points;
      setTeam2Score(newTeam2Score);
    }
    
    // Save to localStorage
    saveScoresToLocalStorage(newTeam1Score, newTeam2Score);
    
    // Navigate back to GameBoard immediately
    navigate("/GameBoard");
  };

  // Handle no answer
  const handleNoAnswer = () => {
    // Save current turn to localStorage
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      gameData.gameInfo.currentTurn = currentTurn === 1 ? 2 : 1;
      // حفظ التقدم مع الاحتفاظ بالأسئلة المستخدمة
      gameData.timestamp = new Date().toISOString();
      localStorage.setItem("completeGameData", JSON.stringify(gameData));
      console.log("💾 تم حفظ التقدم - تبديل الدور");
    }
    
    // Switch turn
    setCurrentTurn(currentTurn === 1 ? 2 : 1);
    
    // Navigate back to GameBoard immediately
    navigate("/GameBoard");
  };
  
  // دالة لتحديد الفائز
  const getWinner = () => {
    if (team1Score > team2Score) {
      return { name: team1Name, score: team1Score, type: 'winner' };
    } else if (team2Score > team1Score) {
      return { name: team2Name, score: team2Score, type: 'winner' };
    } else {
      return { name: 'تعادل', score: team1Score, type: 'tie' };
    }
  };
  
  // Handle exit game (show winner before leaving)
  const handleExitGame = () => {
    setShowWinnerModal(true);
  };
  
  // Handle exit to home after showing winner
  const handleExitToHome = () => {
    navigate("/");
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  const startTimer = () => {
    setTimer(60);
    setTimerRunning(true);
  };

  useEffect(() => {
    setHudRunning(true);
  }, []);

  useEffect(() => {
    let intervalId;
    if (hudRunning) {
      intervalId = setInterval(() => {
        setHudTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [hudRunning]);

  const toggleHudRun = () => setHudRunning((r) => !r);
  const resetHud = () => {
    setHudTime(0);
    setHudRunning(false);
  };

  const formatHud = () => {
    const m = Math.floor(hudTime / 60);
    const s = hudTime % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    let interval;
    if (timerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && timerRunning) {
      setTimerRunning(false);
      setCallFriendUsed(true);
      setShowCallFriend(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timer]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>جاري تحميل السؤال...</h2>
      </div>
    );
  }

  if (!questionData) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>لا يوجد سؤال من API لهذه المرحلة</h2>
        <p>يرجى التأكد من وجود أسئلة في قاعدة البيانات</p>
        <button onClick={() => navigate("/GameBoard")}>الرجوع للوحة</button>
      </div>
    );
  }

  const handleStart = () => {
    startTimer();
    setShowStartBtn(false);
  };

  return (
    <div className="main-wrapper">
      <div className="right-sidebar">
        <button className="big-button">
          دور فريق
          <br />
          <span className="team-name">{currentTeam}</span>
        </button>
        <button className="big-button" onClick={toggleHelp}>
          مساعدة
        </button>
        {showHelp && (
          <div className="help-popup">
            <button
              className="help-box"
              onClick={() => setShowCallFriend(true)}
              disabled={callFriendUsed}
              style={{
                backgroundColor: callFriendUsed ? "#ccc" : "",
                cursor: callFriendUsed ? "not-allowed" : "pointer",
              }}
            >
              <div className="icon">
                <i className="fas fa-phone"></i>
              </div>
              <p>{callFriendUsed ? "تم الاستخدام" : "الاتصال بصديق"}</p>
            </button>
            <button
              className="help-box"
              onClick={() => setDoubleAnswerUsed(true)}
              disabled={doubleAnswerUsed}
              style={{
                backgroundColor: doubleAnswerUsed ? "#ccc" : "",
                cursor: doubleAnswerUsed ? "not-allowed" : "pointer",
              }}
            >
              <div className="icon">
                <i className="fas fa-hand-peace"></i>
              </div>
              <p>{doubleAnswerUsed ? "تم الاستخدام" : "جاوب إجابتين"}</p>
            </button>
          </div>
        )}
      </div>

      <div className="containerg">
        <button
          className="corner-label corner-top-left"
          onClick={() => navigate("/GameBoard")}
          aria-label="الخروج للوحة الألعاب"
        >
          الذهاب الى لوحة الألعاب
        </button>

        <div className="corner-label corner-top-right" aria-label="النقاط">
          {value || 0} نقطة
        </div>

        <div className="top-center-timer" aria-label="عداد الوقت">
          <button
            className="timer-icon left"
            onClick={toggleHudRun}
            aria-label={hudRunning ? "إيقاف الوقت" : "تشغيل الوقت"}
          >
            {hudRunning ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
          </button>

          <div className="timer-text">{formatHud()}</div>

          <button
            className="timer-icon right"
            onClick={resetHud}
            aria-label="إعادة تعيين الوقت"
          >
            <i className="fas fa-undo"></i>
          </button>
        </div>

        {!showAnswer ? (
          <div
            className="corner-label corner-bottom-right"
            aria-label="اسم اللعبة"
          >
            {gameName}
          </div>
        ) : (
          <button
            className="corner-label corner-bottom-right back-to-question"
            onClick={() => setShowAnswer(false)}
            aria-label="الرجوع للسؤال"
          >
            الرجوع للسؤال
          </button>
        )}

        <button
          className="corner-label corner-bottom-left"
          onClick={handleExitGame}
          aria-label="الخروج من اللعبة"
        >
          الخروج من اللعبة
        </button>

        <div className="game-box">
          <div className="question-area">
            {showAnswer ? (
              <h2 className="answer-text">{questionData.answer}</h2>
            ) : (
              <h2 className="question-text">{questionData.question}</h2>
            )}
            {!showAnswer && (
              <button className="show-btn" onClick={handleShowAnswer}>
                أظهر الإجابة
              </button>
            )}
          </div>

          {showAnswer && (
            <div className="answer-details">
              <button 
                className="team-btn"
                onClick={() => handleTeamAnswer(1)}
              >
                {team1Name}
              </button>
              <button 
                className="no-answer"
                onClick={handleNoAnswer}
              >
                محدش جاوب
              </button>
              <button 
                className="team-btn"
                onClick={() => handleTeamAnswer(2)}
              >
                {team2Name}
              </button>
            </div>
          )}

          <div className="score-bar">
            <div className="team-score">
              <span>{team1Score.toString().padStart(2, '0')}</span>{team1Name}
            </div>
            <div className="team-score">
              {team2Name} <span>{team2Score.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>

      {showCallFriend && (
        <div className="overlay" onClick={() => setShowCallFriend(false)}>
          <div
            className="call-friend-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setShowCallFriend(false)}
            >
              <i className="fas fa-times"></i>
            </button>
            <h3>الاتصال بصديق</h3>
            <div className="timer-display">
              {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
            </div>
            {showStartBtn && (
              <button className="start-btn" onClick={handleStart}>
                ابدأ الوقت
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Winner Modal */}
      {showWinnerModal && (
        <div className="overlay" onClick={() => setShowWinnerModal(false)}>
          <div className="winner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="winner-modal-header">
              <h2> نتائج اللعبة</h2>
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
                  {/* <div className="tie-icon">🤝</div> */}
                  <h3>تعادل!</h3>
                  <p>النتيجة: {getWinner().score} نقطة لكل فريق</p>
                  <div className="teams-scores">
                    <div className="team-result">
                      <span className="team-name">{team1Name}</span>
                      <span className="team-score">{team1Score} نقطة</span>
                    </div>
                    <div className="team-result">
                      <span className="team-name">{team2Name}</span>
                      <span className="team-score">{team2Score} نقطة</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* <div className="winner-icon">🏆</div> */}
                  <h3>الفائز هو : {getWinner().name}</h3>
                  <p>بعدد {getWinner().score} نقطة</p>
                  <div className="teams-scores">
                    <div className={`team-result ${team1Score > team2Score ? 'winner' : 'loser'}`}>
                      <span className="team-name">{team1Name}</span>
                      <span className="team-score">{team1Score} نقطة</span>
                    </div>
                    <div className={`team-result ${team2Score > team1Score ? 'winner' : 'loser'}`}>
                      <span className="team-name">{team2Name}</span>
                      <span className="team-score">{team2Score} نقطة</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="winner-modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowWinnerModal(false)}
              >
                متابعة اللعب
              </button>
              <button 
                className="activate-btn"
                onClick={handleExitToHome}
              >
                الخروج من اللعبة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TheGame;
