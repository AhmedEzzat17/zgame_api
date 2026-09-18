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
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [audiencePollUsed, setAudiencePollUsed] = useState(false);

  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [holeActive, setHoleActive] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [originalPoints, setOriginalPoints] = useState(0);

  // Game state from localStorage
  const [gameName, setGameName] = useState("لعبة المعلومات");
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(1); // 1 for team1, 2 for team2
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [holeActivated, setHoleActivated] = useState(false);
  const [holeTeam, setHoleTeam] = useState("");
  const [holeSide, setHoleSide] = useState("");

  // Load selected answers and lifelines from localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem("selectedAnswers");
    if (savedAnswers) {
      setSelectedAnswers(JSON.parse(savedAnswers));
    }
    
    // تحميل وسائل المساعدة المستخدمة
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      try {
        const gameData = JSON.parse(completeGameData);
        if (gameData.gameInfo && gameData.gameInfo.lifelinesUsed) {
          const lifelines = gameData.gameInfo.lifelinesUsed;
          setCallFriendUsed(lifelines.call_friend || false);
          setFiftyFiftyUsed(lifelines.fifty_fifty || false);
          setAudiencePollUsed(lifelines.audience_poll || false);
          console.log('🎯 تم تحميل وسائل المساعدة:', lifelines);
        }
      } catch (error) {
        console.error('خطأ في تحميل وسائل المساعدة:', error);
      }
    }
  }, []);

  // Save selected answers to localStorage
  const saveSelectedAnswers = (answers) => {
    localStorage.setItem("selectedAnswers", JSON.stringify(answers));
    setSelectedAnswers(answers);
  };
  
  // دالة لحفظ وسائل المساعدة في localStorage
  const saveLifelinesUsed = (lifelineType, isUsed = true) => {
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      try {
        const gameData = JSON.parse(completeGameData);
        if (!gameData.gameInfo.lifelinesUsed) {
          gameData.gameInfo.lifelinesUsed = {
            call_friend: false,
            fifty_fifty: false,
            audience_poll: false
          };
        }
        
        // تحديث حالة وسيلة المساعدة المحددة
        gameData.gameInfo.lifelinesUsed[lifelineType] = isUsed;
        
        // حفظ البيانات في localStorage
        localStorage.setItem("completeGameData", JSON.stringify(gameData));
        
        console.log(`🎯 تم حفظ استخدام ${lifelineType}: ${isUsed}`);
        console.log('🎯 حالة جميع وسائل المساعدة:', gameData.gameInfo.lifelinesUsed);
      } catch (error) {
        console.error('خطأ في حفظ وسائل المساعدة:', error);
      }
    }
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

  // دالة لتحديد مفتاح localStorage للأسئلة المستخدمة
  const getUsedQuestionsKey = () => {
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      const tournamentMatch = localStorage.getItem("currentTournamentMatch");
      const tournamentData = localStorage.getItem("tournamentData");
      
      if (tournamentMatch && tournamentData) {
        const tournament = JSON.parse(tournamentData);
        if (tournament.isActive) {
          return 'usedQuestionsTournament';
        }
      }
    }
    return 'usedQuestions';
  };

  // دالة لوضع علامة على السؤال كمستخدم (لن تستخدم هنا لأن العلامة توضع في GameBoard)
  const markQuestionAsUsed = (categoryId, points, side) => {
    const key = getUsedQuestionsKey();
    const usedQuestions = JSON.parse(localStorage.getItem(key) || '[]');
    const questionKey = `${categoryId}-${points}-${side}`; // تغيير التنسيق ليطابق GameBoard
    
    if (!usedQuestions.includes(questionKey)) {
      usedQuestions.push(questionKey);
      localStorage.setItem(key, JSON.stringify(usedQuestions));
      console.log(`تم وضع علامة على السؤال ${questionKey} كمستخدم في ${key}`);
    }
  };

  // دالة لإزالة علامة السؤال كمستخدم (عند الرجوع بدون إجابة)
  const unmarkQuestionAsUsed = (categoryId, points, side) => {
    const key = getUsedQuestionsKey();
    const usedQuestions = JSON.parse(localStorage.getItem(key) || '[]');
    const questionKey = `${categoryId}-${points}-${side}`; // تغيير التنسيق ليطابق GameBoard
    
    const index = usedQuestions.indexOf(questionKey);
    if (index > -1) {
      usedQuestions.splice(index, 1);
      localStorage.setItem(key, JSON.stringify(usedQuestions));
      console.log(`تم إزالة علامة السؤال ${questionKey} من ${key}`);
    }
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
        
        // Load question data from localStorage
        const currentQuestion = localStorage.getItem("currentQuestion");
        if (currentQuestion) {
          const questionInfo = JSON.parse(currentQuestion);
          setQuestionData(questionInfo.question);
          
          // تحميل معلومات الحفرة
          if (questionInfo.holeActive) {
            setHoleActive(true);
            setBonusPoints(questionInfo.bonusPoints || 200);
            setOriginalPoints(questionInfo.originalPoints || parseInt(value));
            console.log(`الحفرة مفعلة! النقاط الأصلية: ${questionInfo.originalPoints}, البونس: ${questionInfo.bonusPoints}`);
          } else {
            setHoleActive(false);
            setBonusPoints(0);
            setOriginalPoints(parseInt(value));
          }
          
          // تنسيق بيانات السؤال
          if (questionInfo.question) {
            const apiQuestion = questionInfo.question;
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
          }
        } else {
          console.log('No currentQuestion found in localStorage');
        }
        
        // تحميل بيانات اللعبة بدون تغيير اللاعب في الناف بار
        const completeData = localStorage.getItem("completeGameData");
        if (completeData) {
          const data = JSON.parse(completeData);
          if (data.gameInfo && data.gameInfo.currentTurn) {
            const turn = data.gameInfo.currentTurn;
            const team1 = data.gameInfo.team1Name || "الفريق الأول";
            const team2 = data.gameInfo.team2Name || "الفريق الثاني";
            // تحديد الفريق الحالي محلياً فقط (بدون تغيير الناف بار)
            setCurrentTeam(turn === 1 ? team1 : team2);
            setCurrentTurn(turn);
            console.log(`TheGame: تم تحميل بيانات اللعبة - الدور الحالي: ${turn === 1 ? team1 : team2} (${turn})`);
          }
        }
        
        // إرسال حالة أن اللاعب دخل على سؤال ولم يجب بعد (بدون تغيير الناف بار)
        const playerStatusEvent = new CustomEvent('playerStatusChanged', {
          detail: { 
            status: 'viewing_question', // يشاهد السؤال
            currentTurn: currentTurn,
            hasAnswered: false,
            keepCurrentPlayer: true // عدم تغيير اللاعب في الناف بار
          }
        });
        window.dispatchEvent(playerStatusEvent);
        
      } catch (error) {
        console.error('Error loading game data:', error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [categoryId, value]);

  // فحص إذا كانت هناك حفرة مفعلة عند تحميل الصفحة
  useEffect(() => {
    const checkForActiveHole = () => {
      const completeData = localStorage.getItem("completeGameData");
      if (completeData) {
        const data = JSON.parse(completeData);
        if (data.gameInfo && data.gameInfo.holeActivated) {
          console.log('TheGame: وجدت حفرة مفعلة - تطبيق فوري!');
          
          setHoleActivated(true);
          setHoleTeam(data.gameInfo.holeTeam || "الفريق الأول");
          setHoleSide(data.gameInfo.currentTeamUsingHole || "left");
          
          // تطبيق تأثير الحفرة فوراً
          applyHoleEffect();
          
          console.log(`TheGame: تم تطبيق الحفرة فوراً لـ ${data.gameInfo.holeTeam}`);
        }
      }
    };
    
    checkForActiveHole();
  }, [categoryId, value]); // يتفعل عند دخول أي سؤال

  // استماع لحدث تفعيل الحفرة من GameBoard
  useEffect(() => {
    const handleHoleActivation = (event) => {
      const { side, activated, immediate } = event.detail;
      console.log('TheGame: تم استقبال حدث تفعيل الحفرة:', event.detail);
      
      if (activated) {
        setHoleActivated(true);
        setHoleSide(side);
        
        // تحديد اسم الفريق
        const teamName = side === "left" ? team1Name : team2Name;
        setHoleTeam(teamName);
        
        if (immediate) {
          // تطبيق فوري عند التفعيل
          applyHoleEffect();
          console.log(`TheGame: تم تطبيق الحفرة فوراً لـ ${teamName}`);
        }
      }
    };

    window.addEventListener("holeActivated", handleHoleActivation);

    return () => {
      window.removeEventListener("holeActivated", handleHoleActivation);
    };
  }, [team1Name, team2Name]);

  // دالة تطبيق تأثير الحفرة
  const applyHoleEffect = () => {
    const basePoints = parseInt(value) || 0;
    const holePoints = basePoints * 2; // مضاعفة النقاط
    
    console.log(`TheGame: تطبيق تأثير الحفرة - النقاط الأساسية: ${basePoints}, نقاط الحفرة: ${holePoints}`);
    
    // حفظ النقاط المضاعفة في localStorage لاستخدامها عند الإجابة
    const completeData = localStorage.getItem("completeGameData");
    if (completeData) {
      const data = JSON.parse(completeData);
      if (data.gameInfo) {
        data.gameInfo.holePoints = holePoints;
        data.gameInfo.holeApplied = true;
        localStorage.setItem("completeGameData", JSON.stringify(data));
        console.log(`✅ تم حفظ نقاط الحفرة: ${basePoints} → ${holePoints}`);
      }
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    
    // وضع علامة على السؤال كمستخدم عند عرض الإجابة (ليس عند دخول السؤال)
    const urlParams = new URLSearchParams(window.location.search);
    const side = urlParams.get('side') || 'left';
    markQuestionAsUsed(categoryId, value, side);
    console.log(`📝 تم وضع علامة على السؤال ${categoryId}-${value}-${side} عند عرض الإجابة`);
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
    
    // Save updated scores to localStorage and switch turn
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      if (currentTurn === 1) {
        gameData.gameInfo.team1Score = newScore;
      } else {
        gameData.gameInfo.team2Score = newScore;
      }
      // تبديل الدور للفريق الآخر
      const newTurn = currentTurn === 1 ? 2 : 1;
      gameData.gameInfo.currentTurn = newTurn;
      // حفظ التقدم مع الاحتفاظ بالأسئلة المستخدمة
      gameData.timestamp = new Date().toISOString();
      localStorage.setItem("completeGameData", JSON.stringify(gameData));
      
      // إرسال حدث تحديث للـ navbar
      const turnChangeEvent = new CustomEvent('turnChanged', {
        detail: { currentTurn: newTurn }
      });
      window.dispatchEvent(turnChangeEvent);
    }
    
    // Navigate back to GameBoard immediately
    navigate("/GameBoard");
  };

  // Handle team answer (correct answer)
  const handleTeamAnswer = (teamNumber) => {
    const basePoints = parseInt(value);
    
    // فحص إذا كانت هناك نقاط مضاعفة من الحفرة
    const completeData = localStorage.getItem("completeGameData");
    let holePoints = basePoints;
    let isHoleApplied = false;
    
    if (completeData) {
      const data = JSON.parse(completeData);
      if (data.gameInfo && data.gameInfo.holeApplied && data.gameInfo.holePoints) {
        holePoints = data.gameInfo.holePoints;
        isHoleApplied = true;
        console.log(`TheGame: تطبيق نقاط الحفرة المضاعفة: ${holePoints}`);
      }
    }
    
    const totalPoints = isHoleApplied ? holePoints : basePoints;
    let newTeam1Score = team1Score;
    let newTeam2Score = team2Score;
    
    if (teamNumber === 1) {
      newTeam1Score = team1Score + totalPoints;
      setTeam1Score(newTeam1Score);
      // إذا كانت الحفرة مفعلة، اطرح نقاط السؤال من الخصم
      if (isHoleApplied) {
        const oldTeam2Score = team2Score;
        newTeam2Score = team2Score - basePoints; // السماح بالسالب
        setTeam2Score(newTeam2Score);
        console.log(`الحفرة: الفريق الثاني خسر ${basePoints} نقطة (${oldTeam2Score} → ${newTeam2Score})`);
      }
    } else {
      newTeam2Score = team2Score + totalPoints;
      setTeam2Score(newTeam2Score);
      // إذا كانت الحفرة مفعلة، اطرح نقاط السؤال من الخصم
      if (isHoleApplied) {
        const oldTeam1Score = team1Score;
        newTeam1Score = team1Score - basePoints; // السماح بالسالب
        setTeam1Score(newTeam1Score);
        console.log(`الحفرة: الفريق الأول خسر ${basePoints} نقطة (${oldTeam1Score} → ${newTeam1Score})`);
      }
    }
    
    // إذا كانت الحفرة مطبقة، أظهر رسالة نجاح وأزل الحفرة
    if (isHoleApplied) {
      const teamName = teamNumber === 1 ? team1Name : team2Name;
      const opponentName = teamNumber === 1 ? team2Name : team1Name;
      console.log(`✨ تم تطبيق الحفرة بنجاح! ✨`);
      console.log(`🏆 ${teamName} حصل على: ${totalPoints} نقطة (مضاعفة!)`);
      console.log(`🕳️ ${opponentName} خسر: ${basePoints} نقطة بسبب الحفرة`);
      console.log(`📊 النتيجة الجديدة: ${team1Name}: ${newTeam1Score}, ${team2Name}: ${newTeam2Score}`);
      
      // إزالة حالة الحفرة بعد الاستخدام
      setHoleActivated(false);
      
      // مسح بيانات الحفرة من localStorage
      const completeData = localStorage.getItem("completeGameData");
      if (completeData) {
        const data = JSON.parse(completeData);
        if (data.gameInfo) {
          data.gameInfo.holeActivated = false;
          data.gameInfo.holeApplied = false;
          data.gameInfo.holePoints = 0;
          localStorage.setItem("completeGameData", JSON.stringify(data));
          console.log('TheGame: تم مسح بيانات الحفرة بعد الاستخدام');
        }
      }
    }
    
    // تأكيد أن السؤال تمت الإجابة عليه (العلامة موضوعة مسبقاً في GameBoard)
    setQuestionAnswered(true);
    
    // إرسال حالة أن اللاعب أجاب على السؤال
    const playerStatusEvent = new CustomEvent('playerStatusChanged', {
      detail: { 
        status: 'answered_question', // أجاب على السؤال
        currentTurn: currentTurn,
        hasAnswered: true,
        teamNumber: teamNumber,
        points: totalPoints
      }
    });
    window.dispatchEvent(playerStatusEvent);
    
    // إرسال تحديث النتائج فوراً للناف بار
    const scoresUpdateEvent = new CustomEvent('scoresUpdated', {
      detail: {
        team1Score: newTeam1Score,
        team2Score: newTeam2Score
      }
    });
    window.dispatchEvent(scoresUpdateEvent);
    console.log(`TheGame: تم إرسال تحديث النتائج فوراً - ${team1Name}: ${newTeam1Score}, ${team2Name}: ${newTeam2Score}`);
    
    // إرسال حدث اكتمال الإجابة لتقليب اللاعب
    const answerCompletedEvent = new CustomEvent('answerCompleted', {
      detail: {
        teamNumber: teamNumber,
        points: totalPoints
      }
    });
    window.dispatchEvent(answerCompletedEvent);
    console.log(`TheGame: تم إرسال حدث اكتمال الإجابة - سيتم تقليب اللاعب من ${currentTurn} إلى ${currentTurn === 1 ? 2 : 1}`);
    
    // Save to localStorage and switch turn
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      gameData.gameInfo.team1Score = newTeam1Score;
      gameData.gameInfo.team2Score = newTeam2Score;
      // تبديل الدور للفريق الآخر
      const newTurn = currentTurn === 1 ? 2 : 1;
      gameData.gameInfo.currentTurn = newTurn;
      
      // إزالة حالة الحفرة بعد الاستخدام
      if (holeActive) {
        // إزالة حالة الحفرة من localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const side = urlParams.get('side') || 'left';
        if (gameData.gameInfo.currentTeamUsingHole === side) {
          gameData.gameInfo.currentTeamUsingHole = null;
        }
      }
      
      gameData.timestamp = new Date().toISOString();
      localStorage.setItem("completeGameData", JSON.stringify(gameData));
      
      // إرسال حدث تحديث للـ navbar
      const turnChangeEvent = new CustomEvent('turnChanged', {
        detail: { currentTurn: newTurn }
      });
      window.dispatchEvent(turnChangeEvent);
    }
    
    // Navigate back to GameBoard immediately
    navigate("/GameBoard");
  };

  // Handle no answer
  const handleNoAnswer = () => {
    console.log('handleNoAnswer: تم استدعاء دالة handleNoAnswer');
    
    // إذا كانت الحفرة مفعلة، لا يحدث شيء (حسب قواعد الحفرة)
    if (holeActive) {
      console.log('الحفرة مفعلة ولم يجاوب أحد - لا يحدث شيء');
      // إزالة حالة الحفرة
      setHoleActive(false);
      setBonusPoints(0);
    }
    
    // تأكيد أن السؤال تمت الإجابة عليه (العلامة موضوعة مسبقاً في GameBoard)
    setQuestionAnswered(true);
    
    // إرسال حالة أن اللاعب لم يجب على السؤال
    const playerStatusEvent = new CustomEvent('playerStatusChanged', {
      detail: { 
        status: 'no_answer', // لم يجب على السؤال
        currentTurn: currentTurn,
        hasAnswered: false
      }
    });
    window.dispatchEvent(playerStatusEvent);
    
    // لا حاجة لإرسال تحديث النتائج هنا لأن النتائج لم تتغير
    
    // إرسال حدث اكتمال الإجابة (عدم إجابة) لتقليب اللاعب
    console.log('DEBUG: currentTurn =', currentTurn);
    const answerCompletedEvent = new CustomEvent('answerCompleted', {
      detail: {
        teamNumber: currentTurn, // تم إصلاح المتغير - استخدام currentTurn
        points: 0 // عدم إجابة
      }
    });
    window.dispatchEvent(answerCompletedEvent);
    console.log(`TheGame: تم إرسال حدث عدم الإجابة - سيتم تقليب اللاعب من ${currentTurn} إلى ${currentTurn === 1 ? 2 : 1}`);
    
    // Save current turn to localStorage and switch turn
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      // تبديل الدور للفريق الآخر
      const newTurn = currentTurn === 1 ? 2 : 1;
      gameData.gameInfo.currentTurn = newTurn;
      
      // إزالة حالة الحفرة بعد الاستخدام (حتى لو لم يجاوب)
      if (holeActive) {
        const urlParams = new URLSearchParams(window.location.search);
        const side = urlParams.get('side') || 'left';
        if (gameData.gameInfo.currentTeamUsingHole === side) {
          gameData.gameInfo.currentTeamUsingHole = null;
        }
      }
      
      // حفظ التقدم مع الاحتفاظ بالأسئلة المستخدمة
      gameData.timestamp = new Date().toISOString();
      localStorage.setItem("completeGameData", JSON.stringify(gameData));
      
      // إرسال حدث تحديث للـ navbar
      const turnChangeEvent = new CustomEvent('turnChanged', {
        detail: { currentTurn: newTurn }
      });
      window.dispatchEvent(turnChangeEvent);
    }
    
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
        {/* <button 
          className="big-button"
          onClick={() => {
            // لا يفعل شيء - المستخدم لا يستطيع تغيير الدور
          }}
        >
          دور فريق
          <br />
          <span className="team-name">{currentTeam}</span>
        </button> */}
        <button className="big-button" onClick={toggleHelp}>
          مساعدة
        </button>
        {showHelp && (
          <div className="help-popup">
            <button
              className="help-box"
              onClick={() => {
                if (!callFriendUsed) {
                  setShowCallFriend(true);
                  setCallFriendUsed(true);
                  saveLifelinesUsed('call_friend', true);
                }
              }}
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
              onClick={() => {
                if (!fiftyFiftyUsed) {
                  setFiftyFiftyUsed(true);
                  saveLifelinesUsed('fifty_fifty', true);
                  // هنا يمكن إضافة منطق إخفاء إجابتين من الخيارات
                  alert('تم استخدام وسيلة 50/50 - سيتم إخفاء إجابتين خاطئتين');
                }
              }}
              disabled={fiftyFiftyUsed}
              style={{
                backgroundColor: fiftyFiftyUsed ? "#ccc" : "",
                cursor: fiftyFiftyUsed ? "not-allowed" : "pointer",
              }}
            >
              <div className="icon">
                <i className="fas fa-hand-peace"></i>
              </div>
              <p>{fiftyFiftyUsed ? "تم الاستخدام" : "50/50"}</p>
            </button>
            <button
              className="help-box"
              onClick={() => {
                if (!audiencePollUsed) {
                  setAudiencePollUsed(true);
                  saveLifelinesUsed('audience_poll', true);
                  // هنا يمكن إضافة منطق عرض نتائج استطلاع الجمهور
                  alert('تم استخدام وسيلة استطلاع الجمهور');
                }
              }}
              disabled={audiencePollUsed}
              style={{
                backgroundColor: audiencePollUsed ? "#ccc" : "",
                cursor: audiencePollUsed ? "not-allowed" : "pointer",
              }}
            >
              <div className="icon">
                <i className="fas fa-users"></i>
              </div>
              <p>{audiencePollUsed ? "تم الاستخدام" : "استطلاع الجمهور"}</p>
            </button>
          </div>
        )}
      </div>

      <div className="containerg">        
        <button
          className="corner-label corner-top-left"
          onClick={() => {
            // إذا لم يتم الإجابة على السؤال، قم بإزالة علامة الاستخدام
            if (!questionAnswered) {
              // الحصول على الجانب من URL
              const urlParams = new URLSearchParams(window.location.search);
              const side = urlParams.get('side') || 'left';
              unmarkQuestionAsUsed(categoryId, value, side);
              
              // إرسال حالة أن اللاعب رجع بدون إجابة
              const playerStatusEvent = new CustomEvent('playerStatusChanged', {
                detail: { 
                  status: 'returned_without_answer', // رجع بدون إجابة
                  currentTurn: currentTurn,
                  hasAnswered: false
                }
              });
              window.dispatchEvent(playerStatusEvent);
            }
            navigate("/GameBoard");
          }}
          aria-label="الخروج للوحة الألعاب"
        >
          الذهاب الى لوحة الألعاب
        </button>

        <div className="corner-label corner-top-right" aria-label="النقاط">
          {holeActive ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                {parseInt(value) * 2} نقطة
              </div>
              <div style={{ fontSize: '12px', color: '#fff' }}>
                ({value} × 2 = {parseInt(value) * 2})
              </div>
              <div style={{ fontSize: '10px', color: '#ffeb3b', marginTop: '2px' }}>
                الخصم يخسر {value}
              </div>
            </div>
          ) : (
            <>{value || 0} نقطة</>
          )}
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
              <div className="media-container" style={{ marginBottom: '20px', textAlign: 'center', width: '350px' }}>
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