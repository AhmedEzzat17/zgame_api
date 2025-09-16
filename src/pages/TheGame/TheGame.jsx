import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questionsService from "../../services/questionsservice";

// تم إزالة البيانات الثابتة - سيتم الاعتماد على API فقط

function TheGame() {
  const { categoryId, value } = useParams();
  const navigate = useNavigate();

  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentTeam, setCurrentTeam] = useState("الفريق الأول");
  const [showCallFriend, setShowCallFriend] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});

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

  // Load selected answers from localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem("selectedAnswers");
    if (savedAnswers) {
      setSelectedAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  // Save selected answers to localStorage
  const saveSelectedAnswers = (answers) => {
    localStorage.setItem("selectedAnswers", JSON.stringify(answers));
    setSelectedAnswers(answers);
  };

  // Handle option selection
  const handleOptionSelect = (option, index, questionId) => {
    const questionKey = `${categoryId}_${value}`;
    const newSelectedAnswers = {
      ...selectedAnswers,
      [questionKey]: { option, index }
    };
    saveSelectedAnswers(newSelectedAnswers);
  };

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
            setCurrentTurn(gameData.gameInfo.currentTurn || 1);
            
            // إذا كانت اللعبة مستكملة، اعرض رسالة
            if (gameData.isResumed) {
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
            
            // Format API data with media and options support
            const formattedQuestion = {
              question: apiQuestion.question_text || apiQuestion.question || "سؤال غير متوفر",
              answer: Array.isArray(apiQuestion.correct_answer) ? apiQuestion.correct_answer.join(', ') : (apiQuestion.correct_answer || apiQuestion.answer || "إجابة غير متوفرة"),
              media_url: apiQuestion.question_media_url || null,
              media_type: apiQuestion.type || null,
              media_mime: apiQuestion.media_mime || null,
              type: apiQuestion.question_type || apiQuestion.type || 'text',
              options: [
                apiQuestion.option_a,
                apiQuestion.option_b, 
                apiQuestion.option_c,
                apiQuestion.option_d
              ].filter(option => option && option.trim() !== '')
            };
            
            console.log('Raw API Question from localStorage:', apiQuestion);
            console.log('Question Data from localStorage:', formattedQuestion);
            console.log('Question Type:', formattedQuestion.type);
            console.log('Question Options:', formattedQuestion.options);
            setQuestionData(formattedQuestion);
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
            
            const response = await questionsService.getRandomByCategoryAndPoints(categoryId, value);
            
            if (response.data && response.data.data) {
              const apiQuestion = response.data.data;
              
              // Format API data with media and options support
              const formattedQuestion = {
                question: apiQuestion.question_text || apiQuestion.question || "سؤال غير متوفر",
                answer: Array.isArray(apiQuestion.correct_answer) ? apiQuestion.correct_answer.join(', ') : (apiQuestion.correct_answer || apiQuestion.answer || "إجابة غير متوفرة"),
                media_url: apiQuestion.question_media_url || null,
                media_type: apiQuestion.type || null,
                media_mime: apiQuestion.media_mime || null,
                type: apiQuestion.question_type || apiQuestion.type || 'text',
                options: [
                apiQuestion.option_a,
                apiQuestion.option_b, 
                apiQuestion.option_c,
                apiQuestion.option_d
              ].filter(option => option && option.trim() !== '')
              };
              
              console.log('Raw API Question from API:', apiQuestion);
              console.log('Question Data from API:', formattedQuestion);
              console.log('Question Type:', formattedQuestion.type);
              console.log('Question Options:', formattedQuestion.options);
              setQuestionData(formattedQuestion);
              
              // Save to localStorage for future use
              const gameQuestionData = {
                categoryId: parseInt(categoryId),
                points: parseInt(value),
                question: apiQuestion,
                timestamp: new Date().toISOString()
              };
              localStorage.setItem("currentQuestion", JSON.stringify(gameQuestionData));
              
            } else {
              setQuestionData(null);
            }
          } catch (error) {
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
            {/* عرض الوسائط إذا كانت متوفرة */}
            {questionData && questionData.media_url && (
              <div className="media-container" style={{ marginBottom: '20px', textAlign: 'center' }}>
                {questionData.media_url && questionData.media_mime && questionData.media_mime.startsWith('image') && (
                  <img 
                    src={(() => {
                      const baseUrl = 'https://appgames.fikriti.com';
                      const mediaUrl = questionData.media_url;
                      
                      if (mediaUrl.startsWith('http')) {
                        return mediaUrl;
                      }
                      
                      // ابدأ بالمسار الأكثر احتمالاً للعمل
                      return `${baseUrl}/storage/${mediaUrl}`;
                    })()}
                    alt="صورة السؤال"
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                    onError={(e) => {
                      // تجربة مسارات بديلة بدون console.log متكرر
                      const baseUrl = 'https://appgames.fikriti.com';
                      const mediaUrl = questionData.media_url;
                      const possiblePaths = [
                        `${baseUrl}/storage/${mediaUrl}`,
                        `${baseUrl}/public/storage/${mediaUrl}`,
                        `${baseUrl}/${mediaUrl}`,
                        `${baseUrl}/uploads/${mediaUrl}`,
                        `${baseUrl}/images/${mediaUrl}`
                      ];
                      
                      const currentIndex = possiblePaths.findIndex(path => path === e.target.src);
                      const nextIndex = currentIndex + 1;
                      
                      if (nextIndex < possiblePaths.length) {
                        e.target.src = possiblePaths[nextIndex];
                      } else {
                        e.target.style.display = 'none';
                        const container = e.target.parentElement;
                        if (container && !container.querySelector('.image-error-message')) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'image-error-message';
                          errorDiv.style.cssText = 'padding: 20px; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; text-align: center; color: #6c757d;';
                          errorDiv.innerHTML = '📷 لا يمكن عرض الصورة<br><small>الملف غير متوفر على الخادم</small>';
                          container.appendChild(errorDiv);
                        }
                      }
                    }}
                    onLoad={() => {
                      // تم تحميل الصورة بنجاح - بدون console.log
                    }}
                  />
                )}
                {questionData.media_url && questionData.media_mime && (questionData.media_mime.startsWith('audio') || questionData.media_mime.includes('audio')) && (
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '20px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '12px',
                    border: '2px solid #e9ecef'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '15px',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      🎵 ملف صوتي
                    </div>
                    <audio 
                      controls 
                      style={{ 
                        width: '100%', 
                        height: '50px',
                        borderRadius: '8px'
                      }}
                      src={(() => {
                        const baseUrl = 'https://appgames.fikriti.com';
                        const mediaUrl = questionData.media_url;
                        
                        if (mediaUrl.startsWith('http')) {
                          return mediaUrl;
                        }
                        
                        return `${baseUrl}/storage/${mediaUrl}`;
                      })()}
                      onError={(e) => {
                        const baseUrl = 'https://appgames.fikriti.com';
                        const mediaUrl = questionData.media_url;
                        const possiblePaths = [
                          `${baseUrl}/storage/${mediaUrl}`,
                          `${baseUrl}/public/storage/${mediaUrl}`,
                          `${baseUrl}/${mediaUrl}`,
                          `${baseUrl}/uploads/${mediaUrl}`,
                          `${baseUrl}/images/${mediaUrl}`
                        ];
                        
                        const currentIndex = possiblePaths.findIndex(path => path === e.target.src);
                        const nextIndex = currentIndex + 1;
                        
                        if (nextIndex < possiblePaths.length) {
                          e.target.src = possiblePaths[nextIndex];
                        } else {
                          e.target.style.display = 'none';
                          const container = e.target.parentElement;
                          if (container && !container.querySelector('.audio-error-message')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'audio-error-message';
                            errorDiv.style.cssText = 'padding: 15px; background: #fff3cd; border: 2px dashed #ffc107; border-radius: 8px; text-align: center; color: #856404; margin-top: 10px;';
                            errorDiv.innerHTML = '⚠️ لا يمكن تشغيل الملف الصوتي<br><small>الملف غير متوفر على الخادم</small>';
                            container.appendChild(errorDiv);
                          }
                        }
                      }}
                    />
                  </div>
                )}
                {questionData.media_url && questionData.media_mime && (questionData.media_mime.startsWith('video') || questionData.media_mime.includes('video')) && (
                  <video 
                    controls 
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                    src={(() => {
                      const baseUrl = 'https://appgames.fikriti.com';
                      const mediaUrl = questionData.media_url;
                      
                      if (mediaUrl.startsWith('http')) {
                        return mediaUrl;
                      }
                      
                      return `${baseUrl}/storage/${mediaUrl}`;
                    })()}
                    onError={(e) => {
                      const baseUrl = 'https://appgames.fikriti.com';
                      const mediaUrl = questionData.media_url;
                      const possiblePaths = [
                        `${baseUrl}/storage/${mediaUrl}`,
                        `${baseUrl}/public/storage/${mediaUrl}`,
                        `${baseUrl}/${mediaUrl}`,
                        `${baseUrl}/uploads/${mediaUrl}`,
                        `${baseUrl}/images/${mediaUrl}`
                      ];
                      
                      const currentIndex = possiblePaths.findIndex(path => path === e.target.src);
                      const nextIndex = currentIndex + 1;
                      
                      if (nextIndex < possiblePaths.length) {
                        e.target.src = possiblePaths[nextIndex];
                      } else {
                        e.target.style.display = 'none';
                        const container = e.target.parentElement;
                        if (container && !container.querySelector('.video-error-message')) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'video-error-message';
                          errorDiv.style.cssText = 'padding: 20px; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; text-align: center; color: #6c757d;';
                          errorDiv.innerHTML = '🎬 لا يمكن تشغيل الفيديو<br><small>الملف غير متوفر على الخادم</small>';
                          container.appendChild(errorDiv);
                        }
                      }
                    }}
                  />
                )}
              </div>
            )}
            
            
            {showAnswer ? (
              <h2 className="answer-text">{questionData.answer}</h2>
            ) : (
              <div>
                <h2 className="question-text">{questionData.question}</h2>
                
                {/* عرض خيارات الاختيار من متعدد فقط للأسئلة نوع MCQ */}
                {(() => {
                  console.log('Full questionData object:', JSON.stringify(questionData, null, 2));
                  
                  // إنشاء خيارات افتراضية للأسئلة MCQ إذا لم توجد
                  if (questionData?.type === 'mcq' && (!questionData.options || questionData.options.length === 0)) {
                    console.log('MCQ question without options - creating default options');
                    // إنشاء خيارات افتراضية بناءً على الإجابة الصحيحة
                    const correctAnswer = questionData.answer;
                    const defaultOptions = [
                      correctAnswer,
                      'خيار ب',
                      'خيار ج', 
                      'خيار د'
                    ];
                    questionData.options = defaultOptions;
                    console.log('Created default options:', defaultOptions);
                  }
                  
                  return questionData?.type === 'mcq' && questionData?.options && Array.isArray(questionData.options) && questionData.options.length > 0;
                })() && (
                  <div className="question-options" style={{ 
                    marginTop: '30px',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '15px',
                    width: '100%'
                  }}>
                    {questionData.options.map((option, index) => {
                      const questionKey = `${categoryId}_${value}`;
                      const isSelected = selectedAnswers[questionKey]?.index === index;
                      const isCorrect = option === questionData.answer;
                      
                      return (
                        <div 
                          key={index} 
                          className="option-item" 
                          style={{
                            padding: '18px 25px',
                            background: isSelected 
                              ? 'linear-gradient(to bottom, #ff6b35, orange)' 
                              : '#ffffff',
                            border: `2px solid ${isSelected 
                              ? '#ff6b35' 
                              : '#f0f0f0'}`,
                            borderRadius: '15px',
                            cursor: 'pointer',
                            fontSize: '20px',
                            fontWeight: '600',
                            color: isSelected ? '#ffffff' : '#333333',
                            transition: 'all 0.3s ease',
                            boxShadow: isSelected 
                              ? '0 6px 20px rgba(255,107,53,0.4)' 
                              : '0 2px 8px rgba(0,0,0,0.05)',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            textAlign: 'right',
                            direction: 'rtl',
                            transform: isSelected ? 'translateY(-3px)' : 'translateY(0)'
                          }}
                          onClick={() => handleOptionSelect(option, index)}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.target.style.background = 'linear-gradient(to bottom, #f8f9fa, #e9ecef)';
                              e.target.style.borderColor = '#dee2e6';
                              e.target.style.color = '#495057';
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.target.style.background = '#ffffff';
                              e.target.style.borderColor = '#f0f0f0';
                              e.target.style.color = '#333333';
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                            }
                          }}
                        >
                          <span style={{
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '40px',
                            height: '40px',
                            backgroundColor: isSelected 
                              ? '#ffffff'
                              : '#28a745',
                            color: isSelected ? '#ff6b35' : 'white',
                            borderRadius: '50%',
                            marginLeft: '15px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            flexShrink: 0,
                            transition: 'all 0.3s ease'
                          }}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span style={{ flex: 1, textAlign: 'right' }}>
                            {option}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
