// GameBoard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import questionsService from "../../services/questionsservice";
import gamesService from "../../services/gamesService";

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
  const [currentTurn, setCurrentTurn] = useState(1); // 1 for team1, 2 for team2
  const [currentQuestionPoints, setCurrentQuestionPoints] = useState(0); // نقاط السؤال الحالي
  const [currentGameId, setCurrentGameId] = useState(null); // معرف اللعبة الحالية في API

  // دالة بسيطة لتحديد الحفرة النشطة حسب الدور (بدون تأثير على أي شيء آخر)
  const getActiveHole = () => {
    const activeHole = currentTurn === 1 ? "left" : "right";
    // console.log(`الدور الحالي: ${currentTurn}, الحفرة النشطة: ${activeHole}`);
    return activeHole;
  };

  // دالة للتحقق من أن الحفرة منورة (بغض النظر عن الدور)
  const isHoleVisible = (side) => {
    return !holeUsed[side]; // منورة لو مش مستخدمة
  };

  // دالة للتحقق من أن الحفرة قابلة للتفعيل (حسب الدور)
  const canActivateHole = (side) => {
    const isCurrentTurn = getActiveHole() === side;
    const notUsed = !holeUsed[side];
    const canActivate = isCurrentTurn && notUsed;
    // console.log(
    //   `الحفرة ${side}: قابلة للتفعيل = ${canActivate}, الدور = ${currentTurn}, مستخدمة = ${holeUsed[side]}`
    // );
    return canActivate;
  };

  // تحميل الدور من localStorage عند بدء التطبيق
  const loadCurrentTurn = () => {
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      if (gameData.gameInfo && gameData.gameInfo.currentTurn) {
        const savedTurn = gameData.gameInfo.currentTurn;
        setCurrentTurn(savedTurn);
        // console.log(`GameBoard: تم تحميل الدور من localStorage: ${savedTurn}`);
      }
    }
  };

  // دالة تحميل بيانات اللعبة
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
            img:
              cat.image ||
              cat.img ||
              "images/zGame_All_Pages-_3_-removebg-preview.png",
          }));
          setCategories(loadedCategories);
        }
      } catch (error) {}
    }

    // ثانياً: تحميل بيانات اللعبة من completeGameData
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);

      // تحميل الأقسام من completeGameData إذا لم توجد في selectedItems
      if (
        !selectedItems &&
        gameData.categories &&
        gameData.categories.length === 6
      ) {
        const loadedCategories = gameData.categories.map((cat, index) => ({
          id: index + 1,
          title: cat.title || cat.name,
          img:
            cat.img ||
            cat.image ||
            "images/zGame_All_Pages-_3_-removebg-preview.png",
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
          updates.currentTeamUsingHole =
            gameData.gameInfo.currentTeamUsingHole;
        }

        // Load current turn
        if (gameData.gameInfo.currentTurn) {
          setCurrentTurn(gameData.gameInfo.currentTurn);
          updates.currentTurn = gameData.gameInfo.currentTurn;
        }

        // Load current game ID
        if (gameData.gameInfo.currentGameId) {
          setCurrentGameId(gameData.gameInfo.currentGameId);
          updates.currentGameId = gameData.gameInfo.currentGameId;
        }
        
        // استعادة الأسئلة المستخدمة من البيانات المحفوظة
        if (gameData.gameInfo.usedQuestions && Array.isArray(gameData.gameInfo.usedQuestions)) {
          const savedUsedQuestions = new Set(gameData.gameInfo.usedQuestions);
          setUsedQuestions(savedUsedQuestions);
          console.log(`📝 تم استعادة ${savedUsedQuestions.size} سؤال مستخدم من البيانات المحفوظة`);
          console.log('📝 قائمة الأسئلة المستعادة:', gameData.gameInfo.usedQuestions);
          
          // تحديث فوري متعدد لضمان ظهور الأسئلة
          setTimeout(() => {
            if (typeof forceQuestionsUpdate === 'function') {
              forceQuestionsUpdate();
            }
          }, 10);
          setTimeout(() => {
            if (typeof forceQuestionsUpdate === 'function') {
              forceQuestionsUpdate();
            }
          }, 100);
          setTimeout(() => {
            if (typeof forceQuestionsUpdate === 'function') {
              forceQuestionsUpdate();
            }
          }, 300);
        } else {
          console.log('⚠️ لم توجد أسئلة في gameData.gameInfo.usedQuestions');
          // محاولة تحديث الأسئلة
          setTimeout(() => {
            if (typeof forceQuestionsUpdate === 'function') {
              forceQuestionsUpdate();
            }
          }, 50);
        }
        
        // استعادة وسائل المساعدة المستخدمة
        if (gameData.gameInfo.lifelinesUsed) {
          console.log(`🎯 تم تحميل وسائل المساعدة المستخدمة:`, gameData.gameInfo.lifelinesUsed);
        }
      }
    } else {
      // لا نحتاج لإنشاء اللعبة هنا - سيتم إنشاؤها عند أول سؤال
      console.log('لم توجد بيانات محفوظة - سيتم إنشاء اللعبة عند أول سؤال');
    }

    // عرض معرف اللعبة الحالي إن وجد
    if (!isTournamentMode && currentGameId) {
      console.log(`معرف اللعبة الحالي: ${currentGameId}`);
    } else if (!isTournamentMode) {
      console.log('لا يوجد معرف لعبة - سيتم إنشاء لعبة جديدة عند أول سؤال');
    }
  };

  // Load game data on component mount
  useEffect(() => {
    loadGameData();
    
    // إنشاء معرف لعبة جديد إذا لم يكن موجود
    if (!currentGameId) {
      const newGameId = generateGameId();
      setCurrentGameId(newGameId);
      console.log(`🆕 تم إنشاء معرف لعبة جديد عند البدء: ${newGameId}`);
      
      // حفظ المعرف في localStorage
      const completeGameData = localStorage.getItem("completeGameData");
      if (completeGameData) {
        const gameData = JSON.parse(completeGameData);
        if (gameData.gameInfo) {
          gameData.gameInfo.currentGameId = newGameId;
          localStorage.setItem("completeGameData", JSON.stringify(gameData));
        }
      }
    }
  }, []);

  // Load current turn from localStorage on component mount
  useEffect(() => {
    loadCurrentTurn();
  }, []);

  // Listen for turn changes from navbar
  useEffect(() => {
    const handleTurnChange = (event) => {
      setCurrentTurn(event.detail.currentTurn);
    };

    window.addEventListener("turnChanged", handleTurnChange);

    return () => {
      window.removeEventListener("turnChanged", handleTurnChange);
    };
  }, [currentTurn]);

  // إعادة رسم الواجهة عند تغيير الدور لتحديث حالة الحفرة
  useEffect(() => {
    // console.log(
    //   `تم تحديث الدور في GameBoard: ${currentTurn} - الحفرة النشطة: ${
    //     currentTurn === 1 ? "اليسرى" : "اليمنى"
    //   }`
    // );
  }, [currentTurn]);

  // دالة لإنشاء معرف فريد للعبة
  const generateGameId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `game_${timestamp}_${random}`;
  };

  // دالة لحفظ نتيجة لعبة منفصلة
  const saveIndividualGameScore = (gameId, team1Score, team2Score, isCompleted = false) => {
    try {
      // جلب جميع نتائج الألعاب المحفوظة
      const allGameScores = JSON.parse(localStorage.getItem('allGameScores') || '{}');
      
      // إنشاء أو تحديث نتيجة اللعبة الحالية
      const gameScore = {
        id: gameId,
        team1Name: team1Name,
        team2Name: team2Name,
        team1Score: team1Score,
        team2Score: team2Score,
        isCompleted: isCompleted,
        lastUpdated: new Date().toISOString(),
        usedQuestionsCount: usedQuestions.size,
        totalQuestions: categories.length * values.length * 2,
        progress: Math.round((usedQuestions.size / (categories.length * values.length * 2)) * 100),
        holeUsed: holeUsed,
        currentTurn: currentTurn
      };

      // حفظ نتيجة هذه اللعبة
      allGameScores[gameId] = gameScore;
      
      // حفظ جميع النتائج
      localStorage.setItem('allGameScores', JSON.stringify(allGameScores));
      
      console.log(`💾 تم حفظ نتيجة اللعبة ${gameId}: ${team1Name}(${team1Score}) ضد ${team2Name}(${team2Score})`);
      console.log(`📊 إجمالي الألعاب المحفوظة: ${Object.keys(allGameScores).length}`);
      
      // إرسال إشارة تحديث لصفحة "ألعابي"
      const gameScoreUpdateEvent = new CustomEvent('gameScoreUpdated', {
        detail: {
          gameId: gameId,
          gameScore: gameScore,
          action: 'saved'
        }
      });
      window.dispatchEvent(gameScoreUpdateEvent);
      console.log('📡 تم إرسال إشارة تحديث النقاط الفردية');
      
      return gameScore;
    } catch (error) {
      console.error('خطأ في حفظ نتيجة اللعبة:', error);
      return null;
    }
  };

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
        gameData.gameInfo.currentGameId = currentGameId; // حفظ معرف اللعبة
        gameData.gameInfo.currentTurn = currentTurn; // حفظ الدور الحالي
        gameData.gameInfo.lastPlayed = new Date().toISOString(); // وقت آخر لعب
        
        // حفظ الأسئلة المستخدمة في البيانات الكاملة
        gameData.gameInfo.usedQuestions = Array.from(usedQuestions);
        
        // حفظ وسائل المساعدة المستخدمة (الاحتفاظ بالحالة الموجودة)
        if (!gameData.gameInfo.lifelinesUsed) {
          gameData.gameInfo.lifelinesUsed = {
            call_friend: false,
            fifty_fifty: false,
            audience_poll: false
          };
        }
        // لا نعيد تعيين وسائل المساعدة هنا - نحتفظ بحالتها الحالية
        
        // حفظ حالة اكتمال اللعبة
        const totalQuestions = categories.length * values.length * 2; // 6 categories * 3 values * 2 sides = 36
        gameData.gameInfo.isCompleted = usedQuestions.size >= totalQuestions;
        gameData.gameInfo.progress = Math.round((usedQuestions.size / totalQuestions) * 100);

        // Save to localStorage
        localStorage.setItem("completeGameData", JSON.stringify(gameData));
        
        // حفظ نسخة احتياطية من الأسئلة المستخدمة في مفتاح منفصل
        const storageKey = getUsedQuestionsKey();
        localStorage.setItem(storageKey, JSON.stringify(Array.from(usedQuestions)));
        
        // حفظ نتيجة اللعبة الحالية في النظام الجديد
        if (currentGameId) {
          saveIndividualGameScore(currentGameId, team1Score, team2Score, gameData.gameInfo.isCompleted);
        }
        
        console.log(`💾 تم حفظ حالة اللعبة: ${usedQuestions.size} سؤال مستخدم, التقدم: ${Math.round((usedQuestions.size / totalQuestions) * 100)}%`);
      }
    }
  };

  // دالة لإنشاء لعبة جديدة في API (للألعاب العادية فقط)
  const createGameInAPI = async () => {
    // فحص إذا كانت اللعبة في وضع البطولة - لا ننشئ في API
    if (isTournamentMode) {
      console.log('وضع البطولة - لا يتم إنشاء لعبة في API');
      return;
    }

    // فحص إذا كان هناك معرف لعبة موجود بالفعل
    if (currentGameId) {
      console.log(`لعبة موجودة بالفعل - معرف اللعبة: ${currentGameId}`);
      return;
    }

    // فحص إذا كانت عملية إنشاء اللعبة جارية بالفعل
    if (window.gameCreationInProgress) {
      console.log('عملية إنشاء اللعبة جارية بالفعل - تجاهل الطلب');
      return;
    }

    // فحص إذا كانت هناك لعبة مماثلة في localStorage
    const existingGameKey = `game_${team1Name}_vs_${team2Name}`;
    const reverseGameKey = `game_${team2Name}_vs_${team1Name}`;
    
    if (localStorage.getItem(existingGameKey) || localStorage.getItem(reverseGameKey)) {
      console.log(`🚫 لعبة مماثلة موجودة في localStorage - لن ننشئ لعبة جديدة`);
      return;
    }

    // وضع علامة أن عملية الإنشاء جارية
    window.gameCreationInProgress = true;

    // الحصول على الأسماء الحقيقية واسم البطولة من localStorage
    let actualTeam1Name = team1Name;
    let actualTeam2Name = team2Name;
    let tournamentName = null;
    
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      try {
        const gameData = JSON.parse(completeGameData);
        if (gameData.gameInfo) {
          actualTeam1Name = gameData.gameInfo.team1Name || team1Name;
          actualTeam2Name = gameData.gameInfo.team2Name || team2Name;
          tournamentName = gameData.gameInfo.gameName || null; // اسم البطولة/اللعبة
        }
      } catch (error) {
        console.error('خطأ في قراءة بيانات اللعبة:', error);
      }
    }

    console.log(`أسماء الفرق الحقيقية: ${actualTeam1Name} ضد ${actualTeam2Name}`);
    console.log(`النقاط الحالية: ${actualTeam1Name}: ${scoreLeft}, ${actualTeam2Name}: ${scoreRight}`);
    console.log(`اسم البطولة: ${tournamentName || 'لا يوجد'}`);

    try {
      const gameData = {
        tournament_id: null, // لعبة عادية وليس بطولة
        team_one_name: actualTeam1Name,
        team_two_name: actualTeam2Name,
        team_one_players_count: 1, // افتراضي
        team_two_players_count: 1, // افتراضي
        team_one_score: scoreLeft,
        team_two_score: scoreRight,
        is_completed: false,
        status: 'in_progress',
        call_friend: false,
        fifty_fifty: false,
        audience_poll: false,
        tournament_name: tournamentName, // اسم البطولة/اللعبة
        started_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      console.log('🎮 إنشاء لعبة جديدة في API:', gameData);
        
        // حفظ مفتاح اللعبة في localStorage لمنع التكرار
        localStorage.setItem(existingGameKey, 'true');
      const response = await gamesService.createGame(gameData);
      
      if (response && response.data && response.data.data) {
        const newGameId = response.data.data.id;
        console.log(`✅ تم إنشاء اللعبة بنجاح - معرف اللعبة: ${newGameId}`);
        
        // حفظ معرف اللعبة في localStorage
        const completeGameData = localStorage.getItem("completeGameData");
        if (completeGameData) {
          const gameData = JSON.parse(completeGameData);
          if (gameData.gameInfo) {
            gameData.gameInfo.currentGameId = newGameId;
            localStorage.setItem("completeGameData", JSON.stringify(gameData));
          }
        }
        
        // حفظ معرف اللعبة مع المفتاح
        localStorage.setItem(`${existingGameKey}_id`, newGameId);
        
        console.log(`تم إنشاء اللعبة بنجاح - معرف اللعبة: ${newGameId}`);
      }
    } catch (error) {
      console.error('خطأ في إنشاء اللعبة في API:', error);
      // يمكن للعبة أن تستمر محلياً حتى لو فشل API
    } finally {
      // إزالة علامة أن عملية الإنشاء جارية
      window.gameCreationInProgress = false;
    }
  };

  // دالة للتحقق من انتهاء جميع الأسئلة
  const checkIfAllQuestionsUsed = () => {
    // إجمالي الأسئلة = 6 فئات × 3 أسئلة لكل فئة × 2 جانب = 36 سؤال
    const totalQuestions = 36;
    const usedCount = usedQuestions.size;
    
    console.log(`الأسئلة المستخدمة: ${usedCount} من ${totalQuestions}`);
    
    return usedCount >= totalQuestions;
  };

  // دالة لتحديث بيانات اللعبة في API
  const updateGameInAPI = async (team1Score = scoreLeft, team2Score = scoreRight, isCompleted = false) => {
    // فحص إذا كانت اللعبة في وضع البطولة أو لا يوجد معرف لعبة
    if (isTournamentMode) {
      console.log(`🏆 تجاهل تحديث API - وضع بطولة`);
      return;
    }
    
    if (!currentGameId) {
      console.log(`⚠️ لا يوجد معرف لعبة - جرب إنشاء لعبة جديدة`);
      await createGameInAPI();
      return;
    }

    console.log(`🚀 تحديث النقاط في API - ${team1Name}: ${team1Score}, ${team2Name}: ${team2Score}`);

    // التحقق التلقائي من انتهاء جميع الأسئلة
    if (!isCompleted && checkIfAllQuestionsUsed()) {
      isCompleted = true;
      console.log('تم انتهاء جميع الأسئلة - وضع علامة اللعبة كمنتهية');
    }

    // تأكيد من إرسال النقاط بشكل صحيح
    const finalTeam1Score = parseInt(team1Score) || 0;
    const finalTeam2Score = parseInt(team2Score) || 0;
    
    // الحصول على أسماء الفرق الحقيقية من localStorage
    let actualTeam1Name = team1Name;
    let actualTeam2Name = team2Name;
    
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      try {
        const gameData = JSON.parse(completeGameData);
        if (gameData.gameInfo) {
          actualTeam1Name = gameData.gameInfo.team1Name || team1Name;
          actualTeam2Name = gameData.gameInfo.team2Name || team2Name;
        }
      } catch (error) {
        console.error('خطأ في قراءة بيانات اللعبة:', error);
      }
    }
    
    // إرسال جميع البيانات المطلوبة حسب رسالة الخطأ
    const updateData = {
      team_one_name: actualTeam1Name || 'الفريق الأول',
      team_two_name: actualTeam2Name || 'الفريق الثاني',
      team_one_players_count: 1,
      team_two_players_count: 1,
      team_one_score: finalTeam1Score,
      team_two_score: finalTeam2Score
    };
    
    // إضافة بيانات اختيارية إذا انتهت اللعبة
    if (isCompleted) {
      updateData.is_completed = true;
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    } else {
      updateData.is_completed = false;
      updateData.status = 'in_progress';
    }

    try {

      console.log(`📊 النقاط المرسلة: فريق 1: ${finalTeam1Score}, فريق 2: ${finalTeam2Score}`);
      console.log(`📦 تحديث اللعبة ${currentGameId} في API:`, updateData);
      console.log(`🔄 حالة اللعبة: ${isCompleted ? 'منتهية' : 'جارية'}`);
      console.log(`🎮 معرف اللعبة: ${currentGameId}`);
      console.log(`🏆 وضع البطولة: ${isTournamentMode}`);
      console.log(`📝 أسماء الفرق: ${actualTeam1Name} ضد ${actualTeam2Name}`);
      console.log(`📝 أسماء من state: ${team1Name} ضد ${team2Name}`);
      
      const response = await gamesService.updateGame(currentGameId, updateData);
      console.log('✅ تم تحديث اللعبة بنجاح في API');
      console.log('📊 استجابة API:', response.data);
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في تحديث اللعبة في API:', error.message);
      console.error('❌ كود الخطأ:', error.response?.status);
      console.error('❌ تفاصيل الخطأ:', error.response?.data);
      console.error('❌ رسالة الخطأ:', error.response?.data?.message);
      console.error('❌ الأخطاء التفصيلية:', error.response?.data?.errors);
      console.error('❌ البيانات المرسلة:', updateData);
      console.error('❌ URL الطلب:', error.config?.url);
      console.error('❌ طريقة الطلب:', error.config?.method);
      
      // لا نرمي الخطأ للمستخدم - نترك اللعبة تعمل محلياً
      // يمكن للعبة أن تستمر محلياً حتى لو فشل API
      return null; // عدم رمي الخطأ
    }
  };

  // Save scores to localStorage (kept for backward compatibility)
  const saveScoresToLocalStorage = (team1Score, team2Score) => {
    saveGameState(team1Score, team2Score);
  };

  // دالة لتحديد مفتاح localStorage حسب نوع اللعبة
  const getUsedQuestionsKey = () => {
    return isTournamentMode ? "usedQuestionsTournament" : "usedQuestions";
  };

  // دالة للتحقق من استخدام السؤال مسبقاً
  const isQuestionUsed = (categoryId, points, side) => {
    return usedQuestions.has(`${categoryId}-${points}-${side}`);
  };

  // دالة لحفظ نتيجة اللعبة المنتهية في تاريخ الألعاب
  const saveCompletedGameToHistory = () => {
    try {
      // الحصول على بيانات اللعبة الحالية
      const completeGameData = localStorage.getItem("completeGameData");
      let gameInfo = {};
      
      if (completeGameData) {
        const gameData = JSON.parse(completeGameData);
        gameInfo = gameData.gameInfo || {};
      }

      // إنشاء كائن اللعبة المنتهية
      const completedGame = {
        id: currentGameId || `local_${Date.now()}`,
        tournament_id: null,
        team_one_name: gameInfo.team1Name || team1Name || 'الفريق الأول',
        team_two_name: gameInfo.team2Name || team2Name || 'الفريق الثاني',
        team_one_score: scoreLeft,
        team_two_score: scoreRight,
        is_completed: true,
        status: 'completed',
        started_at: gameInfo.startedAt || new Date().toISOString(),
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source: 'localStorage',
        // بيانات إضافية
        usedQuestions: Array.from(usedQuestions),
        holeUsed: holeUsed,
        currentTurn: currentTurn,
        categories: categories || [],
        winner: getWinner().name,
        winnerScore: getWinner().score
      };

      // جلب تاريخ الألعاب الحالي
      const gamesHistory = JSON.parse(localStorage.getItem('gamesHistory') || '[]');
      
      // فحص إذا كانت اللعبة موجودة بالفعل (تجنب التكرار)
      const existingGameIndex = gamesHistory.findIndex(game => 
        game.id === completedGame.id ||
        (game.team_one_name === completedGame.team_one_name && 
         game.team_two_name === completedGame.team_two_name &&
         Math.abs(new Date(game.started_at) - new Date(completedGame.started_at)) < 60000) // نفس اللعبة خلال دقيقة
      );

      if (existingGameIndex !== -1) {
        // تحديث اللعبة الموجودة
        gamesHistory[existingGameIndex] = completedGame;
        console.log('🔄 تم تحديث اللعبة في تاريخ الألعاب');
      } else {
        // إضافة لعبة جديدة
        gamesHistory.unshift(completedGame); // إضافة في المقدمة (الأحدث أولاً)
        console.log('➕ تم إضافة لعبة جديدة لتاريخ الألعاب');
      }

      // الاحتفاظ بآخر 50 لعبة فقط
      if (gamesHistory.length > 50) {
        gamesHistory.splice(50);
      }

      // حفظ تاريخ الألعاب المحدث
      localStorage.setItem('gamesHistory', JSON.stringify(gamesHistory));
      
      console.log(`💾 تم حفظ نتيجة اللعبة في التاريخ: ${completedGame.team_one_name} (${completedGame.team_one_score}) ضد ${completedGame.team_two_name} (${completedGame.team_two_score})`);
      console.log(`🏆 الفائز: ${completedGame.winner} بـ ${completedGame.winnerScore} نقطة`);
      
      // إرسال إشارة لتحديث صفحة "ألعابي"
      const gameHistoryUpdateEvent = new CustomEvent('gameHistoryUpdated', {
        detail: {
          game: completedGame,
          action: existingGameIndex !== -1 ? 'updated' : 'added'
        }
      });
      window.dispatchEvent(gameHistoryUpdateEvent);
      console.log('📡 تم إرسال إشارة تحديث تاريخ الألعاب');
      
      return completedGame;
    } catch (error) {
      console.error('خطأ في حفظ اللعبة المنتهية:', error);
      return null;
    }
  };

  // دالة لتحديد السؤال كمستخدم
  const markQuestionAsUsed = (categoryId, points, side) => {
    const questionKey = `${categoryId}-${points}-${side}`;
    setUsedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.add(questionKey);

      // حفظ في localStorage حسب نوع اللعبة
      const storageKey = getUsedQuestionsKey();
      localStorage.setItem(storageKey, JSON.stringify(Array.from(newSet)));

      // تحديث اللعبة في API بعد كل سؤال (للتحقق من انتهاء اللعبة)
      if (!isTournamentMode) {
        setTimeout(() => {
          updateGameInAPI();
        }, 100);
      }

      // فحص إذا كانت جميع الأسئلة قد انتهت
      const totalQuestions = categories.length * values.length * 2; // 6 categories * 3 values * 2 sides
      if (newSet.size >= totalQuestions) {
        setGameFinished(true);
        setShowWinnerModal(true);

        // حفظ نتيجة اللعبة في تاريخ الألعاب فوراً
        setTimeout(() => {
          saveCompletedGameToHistory();
        }, 500); // تأخير قصير للتأكد من تحديث جميع البيانات

        // إذا كانت مباراة بطولة، حفظ الفائز تلقائياً
        if (isTournamentMode && tournamentData) {
          setTimeout(() => {
            const winner = getWinner();

            // في حالة التعادل، لا نحفظ شيء
            if (winner.type !== "tie") {
              const savedTournamentData = JSON.parse(
                localStorage.getItem("tournamentData") || "{}"
              );
              if (!savedTournamentData.winners) {
                savedTournamentData.winners = {};
              }

              // حفظ الفائز في المباراة الحالية
              savedTournamentData.winners[tournamentData.matchKey] =
                winner.name;
              localStorage.setItem(
                "tournamentData",
                JSON.stringify(savedTournamentData)
              );
            }
          }, 100);
        } else {
          // للألعاب العادية - تحديث اللعبة كمنتهية في API
          setTimeout(() => {
            updateGameInAPI(scoreLeft, scoreRight, true);
          }, 100);
        }
      }

      return newSet;
    });
  };

  // دالة لتحديد الفائز
  const getWinner = () => {
    if (scoreLeft > scoreRight) {
      return { name: team1Name, score: scoreLeft, type: "winner" };
    } else if (scoreRight > scoreLeft) {
      return { name: team2Name, score: scoreRight, type: "winner" };
    } else {
      return { name: "تعادل", score: scoreLeft, type: "tie" };
    }
  };

  // دالة لإعادة تعيين اللعبة
  const resetGame = () => {
    // حفظ نتيجة اللعبة الحالية قبل إعادة التعيين (إذا لم تكن محفوظة بالفعل)
    if (currentGameId && (scoreLeft > 0 || scoreRight > 0)) {
      console.log('🎮 حفظ نتيجة اللعبة النهائية قبل بدء لعبة جديدة...');
      saveIndividualGameScore(currentGameId, scoreLeft, scoreRight, true);
      saveCompletedGameToHistory();
    }

    // إنشاء معرف جديد للعبة الجديدة
    const newGameId = generateGameId();
    setCurrentGameId(newGameId);
    console.log(`🆕 تم إنشاء معرف لعبة جديد: ${newGameId}`);

    // حذف الأسئلة المستخدمة حسب نوع اللعبة
    const storageKey = getUsedQuestionsKey();
    localStorage.removeItem(storageKey);
    localStorage.removeItem("currentQuestion");

    setUsedQuestions(new Set());
    setScoreLeft(0);
    setScoreRight(0);
    setShowWinnerModal(false);
    setGameFinished(false);

    // تحديث البيانات في localStorage للعبة الجديدة
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      if (gameData.gameInfo) {
        gameData.gameInfo.team1Score = 0;
        gameData.gameInfo.team2Score = 0;
        gameData.gameInfo.currentGameId = newGameId; // معرف اللعبة الجديدة
        gameData.gameInfo.usedQuestions = [];
        gameData.gameInfo.isCompleted = false;
        gameData.gameInfo.progress = 0;
        localStorage.setItem("completeGameData", JSON.stringify(gameData));
      }
    }

    // حفظ نتيجة اللعبة الجديدة (0-0) في النظام الجديد
    saveIndividualGameScore(newGameId, 0, 0, false);

    console.log('🔄 تم إعادة تعيين اللعبة - بدء لعبة جديدة بمعرف منفصل');
  };

  // دالة للتعامل مع انتهاء مباراة البطولة
  const handleTournamentMatchEnd = () => {
    if (!isTournamentMode || !tournamentData) return;

    const winner = getWinner();

    // في حالة التعادل، إعادة المباراة
    if (winner.type === "tie") {
      alert("تعادل! سيتم إعادة المباراة مرة أخرى");
      resetGame();
      return;
    }

    // تحديث بيانات البطولة بالفائز
    const savedTournamentData = JSON.parse(
      localStorage.getItem("tournamentData") || "{}"
    );
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
    localStorage.removeItem("currentQuestion");
    localStorage.removeItem("completeGameData");
    localStorage.removeItem("selectedItems");

    // العودة للصفحة الرئيسية
    navigate("/");
  };

  // دالة للعودة لصفحة التقسيمة (البطولة)
  const handleReturnToTournament = () => {
    // تنظيف بيانات اللعبة الحالية فقط
    const storageKey = getUsedQuestionsKey();
    localStorage.removeItem(storageKey);
    localStorage.removeItem("currentQuestion");
    localStorage.removeItem("completeGameData");
    localStorage.removeItem("currentTournamentMatch");

    // العودة لصفحة التقسيمة
    navigate("/CreateChampionTwo");
  };

  // دالة للتعامل مع الضغط على الأرقام وجلب السؤال من API
  const handleQuestionClick = async (categoryId, points, side) => {
    if (loading || isQuestionUsed(categoryId, points, side)) return; // منع الضغط المتعدد

    setLoading(true);

    try {
      // إنشاء لعبة في API عند أول سؤال (إذا لم تكن موجودة)
      if (!isTournamentMode && !currentGameId) {
        console.log('إنشاء لعبة جديدة عند أول سؤال');
        await createGameInAPI();
      }

      // لا نضع علامة هنا - سيتم وضعها في TheGame عند عرض الإجابة
      // markQuestionAsUsed(categoryId, points, side);

      // تحديد الدور الحالي بناءً على الجانب المضغوط
      const currentTurn = side === "left" ? 1 : 2;

      // العثور على اسم الفئة المختارة
      const selectedCategory = categories.find((cat) => cat.id === categoryId);
      const categoryName = selectedCategory
        ? selectedCategory.title || selectedCategory.name
        : "فئة غير معروفة";

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

      // إرسال حدث تحديث الدور للـ navbar
      const turnChangeEvent = new CustomEvent("turnChanged", {
        detail: { currentTurn: currentTurn },
      });
      window.dispatchEvent(turnChangeEvent);

      // جلب السؤال من API
      const response = await questionsService.getRandomByCategoryAndPoints(
        categoryId,
        points
      );

      if (response.data && response.data.data) {
        const questionData = response.data.data;

        // تحقق من حالة الحفرة قبل إنشاء بيانات السؤال
        const isHoleActiveForSide =
          currentTeamUsingHole === side && holeUsed[side];

        // حفظ بيانات السؤال في localStorage
        const gameQuestionData = {
          categoryId,
          points,
          question: questionData,
          timestamp: new Date().toISOString(),
          // تحديث معلومات الحفرة بشكل فوري
          holeActive: isHoleActiveForSide,
          originalPoints: points,
          bonusPoints: isHoleActiveForSide ? points : 0,
        };

        localStorage.setItem(
          "currentQuestion",
          JSON.stringify(gameQuestionData)
        );

        // console.log(
        //   `تم وضع علامة على السؤال ${categoryId}-${points}-${side} كمستخدم`
        // );

        // الانتقال لصفحة السؤال
        navigate(`/TheGame/${categoryId}/${points}?side=${side}`);
      } else {
        // استخدام سؤال تجريبي كـ fallback
        const mockQuestion = {
          id: Math.random(),
          question_text: `سؤال تجريبي للقسم ${categoryId} بنقاط ${points}`,
          correct_answer: "إجابة تجريبية",
          points: points,
          category_id: categoryId,
        };

        // تحقق من حالة الحفرة قبل إنشاء بيانات السؤال
        const isHoleActiveForSide =
          currentTeamUsingHole === side && holeUsed[side];

        const gameQuestionData = {
          categoryId,
          points,
          question: mockQuestion,
          timestamp: new Date().toISOString(),
          // تحديث معلومات الحفرة بشكل فوري
          holeActive: isHoleActiveForSide,
          originalPoints: points,
          bonusPoints: isHoleActiveForSide ? points : 0,
        };

        localStorage.setItem(
          "currentQuestion",
          JSON.stringify(gameQuestionData)
        );

        // console.log(
        //   `تم وضع علامة على السؤال التجريبي ${categoryId}-${points}-${side} كمستخدم`
        // );

        navigate(`/TheGame/${categoryId}/${points}?side=${side}`);
      }
    } catch (error) {
      // console.error("خطأ في جلب السؤال:", error);

      // في حالة فشل الـ API، استخدم سؤال تجريبي
      const mockQuestion = {
        id: Math.random(),
        question_text: `سؤال تجريبي للقسم ${categoryId} بنقاط ${points}`,
        correct_answer: "إجابة تجريبية",
        points: points,
        category_id: categoryId,
      };

      // تحقق من حالة الحفرة قبل إنشاء بيانات السؤال
      const isHoleActiveForSide =
        currentTeamUsingHole === side && holeUsed[side];

      const gameQuestionData = {
        categoryId,
        points,
        question: mockQuestion,
        timestamp: new Date().toISOString(),
        // تحديث معلومات الحفرة بشكل فوري
        holeActive: isHoleActiveForSide,
        originalPoints: points,
        bonusPoints: isHoleActiveForSide ? points : 0,
      };

      localStorage.setItem("currentQuestion", JSON.stringify(gameQuestionData));

      // console.log(
      //   `تم وضع علامة على السؤال التجريبي (خطأ) ${categoryId}-${points}-${side} كمستخدم`
      // );

      navigate(`/TheGame/${categoryId}/${points}?side=${side}`);
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
  const [forceUpdate, setForceUpdate] = useState(0); // لإجبار إعادة عرض المكون
  const [questionsLoaded, setQuestionsLoaded] = useState(false); // لتتبع حالة تحميل الأسئلة

  // دالة قوية لإجبار تحديث الأسئلة المغمقة
  const forceQuestionsUpdate = () => {
    console.log('🔄 إجبار تحديث الأسئلة المغمقة...');
    
    let foundQuestions = false;
    let allQuestions = new Set();
    
    // 1. تحميل من completeGameData
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      try {
        const gameData = JSON.parse(completeGameData);
        if (gameData.gameInfo && gameData.gameInfo.usedQuestions && Array.isArray(gameData.gameInfo.usedQuestions)) {
          gameData.gameInfo.usedQuestions.forEach(q => allQuestions.add(q));
          console.log(`💾 تم تحميل ${gameData.gameInfo.usedQuestions.length} سؤال من completeGameData`);
          foundQuestions = true;
        }
      } catch (error) {
        console.error('خطأ في تحميل من completeGameData:', error);
      }
    }
    
    // 2. تحميل من المفتاح المنفصل
    const storageKey = getUsedQuestionsKey();
    const savedQuestions = localStorage.getItem(storageKey);
    if (savedQuestions) {
      try {
        const questionsArray = JSON.parse(savedQuestions);
        if (Array.isArray(questionsArray)) {
          questionsArray.forEach(q => allQuestions.add(q));
          console.log(`💾 تم دمج ${questionsArray.length} سؤال من ${storageKey}`);
          foundQuestions = true;
        }
      } catch (error) {
        console.error(`خطأ في تحميل من ${storageKey}:`, error);
      }
    }
    
    if (foundQuestions && allQuestions.size > 0) {
      setUsedQuestions(allQuestions);
      setQuestionsLoaded(true);
      setForceUpdate(prev => prev + 1);
      console.log(`✅ تم تحديث ${allQuestions.size} سؤال مغمق بنجاح!`);
      console.log('📝 قائمة الأسئلة المغمقة:', Array.from(allQuestions));
      
      // فوراً بعد التحديث، إجبار إعادة عرض المكون
      setTimeout(() => {
        setUsedQuestions(new Set(allQuestions));
        setForceUpdate(prev => prev + 1);
      }, 50);
      
      return true;
    } else {
      console.log('⚠️ لم يتم العثور على أسئلة محفوظة');
      setQuestionsLoaded(true);
      return false;
    }
  };

  // دالة لتحميل الأسئلة المستخدمة حسب نوع اللعبة
  const loadUsedQuestions = () => {
    console.log('🔄 بدء تحميل الأسئلة المستخدمة...');
    
    let loadedQuestions = new Set();
    
    // أولاً: محاولة التحميل من completeGameData
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      try {
        const gameData = JSON.parse(completeGameData);
        if (gameData.gameInfo && gameData.gameInfo.usedQuestions) {
          const questionsFromGameData = gameData.gameInfo.usedQuestions;
          if (Array.isArray(questionsFromGameData)) {
            questionsFromGameData.forEach(q => loadedQuestions.add(q));
            console.log(`📝 تم تحميل ${questionsFromGameData.length} سؤال مستخدم من البيانات الكاملة`);
          }
        }
      } catch (error) {
        console.error('خطأ في تحميل الأسئلة من البيانات الكاملة:', error);
      }
    }
    
    // ثانياً: محاولة التحميل من المفتاح المنفصل كـ fallback
    const storageKey = getUsedQuestionsKey();
    const savedUsedQuestions = localStorage.getItem(storageKey);
    if (savedUsedQuestions) {
      try {
        const usedQuestionsArray = JSON.parse(savedUsedQuestions);
        if (Array.isArray(usedQuestionsArray)) {
          usedQuestionsArray.forEach(q => loadedQuestions.add(q));
          console.log(`📝 تم دمج ${usedQuestionsArray.length} سؤال إضافي من المفتاح المنفصل`);
        }
      } catch (error) {
        console.error('خطأ في تحميل الأسئلة من المفتاح المنفصل:', error);
      }
    }
    
    setUsedQuestions(loadedQuestions);
    console.log(`📝 إجمالي الأسئلة المستخدمة المحملة: ${loadedQuestions.size}`);
    console.log(`📝 الأسئلة المستخدمة:`, Array.from(loadedQuestions));
    
    // إجبار إعادة عرض المكون لإظهار الأسئلة المغمقة
    setForceUpdate(prev => prev + 1);
  };

  useEffect(() => {
    // تحميل الأسئلة المستخدمة بعد تحديد نوع اللعبة
    loadUsedQuestions();
  }, [isTournamentMode]); // إعادة التحميل عند تغيير نوع اللعبة
  
  // تحديث الواجهة عند تغيير الأسئلة المستخدمة
  useEffect(() => {
    console.log(`🔄 تم تحديث الأسئلة المستخدمة: ${usedQuestions.size} سؤال`);
    if (usedQuestions.size > 0) {
      console.log('📝 قائمة الأسئلة المغمقة:', Array.from(usedQuestions));
    }
  }, [usedQuestions, forceUpdate]);
  
  // مراقبة تغييرات localStorage وإجبار تحديث الأسئلة
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'completeGameData' || e.key === getUsedQuestionsKey()) {
        console.log('💾 تغيير في localStorage - إجبار تحديث الأسئلة');
        setTimeout(() => {
          forceQuestionsUpdate();
        }, 100);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // تحديث دوري لضمان عرض الأسئلة المغمقة
  useEffect(() => {
    const interval = setInterval(() => {
      if (!questionsLoaded) {
        forceQuestionsUpdate();
      }
    }, 1000); // فحص كل ثانية
    
    return () => clearInterval(interval);
  }, [questionsLoaded]);

  // Save hole state whenever it changes
  useEffect(() => {
    if (holeUsed.left || holeUsed.right || currentTeamUsingHole) {
      saveGameState();
    }
  }, [holeUsed, currentTeamUsingHole]);

  // Save individual game scores whenever scores change
  useEffect(() => {
    if (currentGameId && (scoreLeft > 0 || scoreRight > 0)) {
      console.log(`🎯 تغيير النقاط: ${team1Name}(${scoreLeft}) ضد ${team2Name}(${scoreRight})`);
      saveIndividualGameScore(currentGameId, scoreLeft, scoreRight, false);
    }
  }, [scoreLeft, scoreRight, currentGameId, team1Name, team2Name]);

  // استقبال تغيير الدور من الناف بار (بدون تأثير على أي شيء آخر)
  useEffect(() => {
    const handleTurnChange = (event) => {
      // السماح بتحديث الدور دائماً لتحديث حالة الحفرة
      const newTurn = event.detail.currentTurn;
      setCurrentTurn(newTurn);

      // حفظ الدور الجديد في localStorage أيضاً
      const completeGameData = localStorage.getItem("completeGameData");
      if (completeGameData) {
        const gameData = JSON.parse(completeGameData);
        if (gameData.gameInfo) {
          gameData.gameInfo.currentTurn = newTurn;
          localStorage.setItem("completeGameData", JSON.stringify(gameData));
        }
      }

      // console.log(
      //   `GameBoard: تم تحديث الدور إلى ${
      //     newTurn === 1 ? "الأول" : "الثاني"
      //   } - الحفرة النشطة: ${newTurn === 1 ? "اليسرى" : "اليمنى"}`
      // );
    };

    window.addEventListener("turnChanged", handleTurnChange);

    return () => {
      window.removeEventListener("turnChanged", handleTurnChange);
    };
  }, []);

  // تحديث الدور عند العودة من TheGame
  useEffect(() => {
    const handleFocus = () => {
      // تحميل الدور الحالي من localStorage عند العودة
      const completeGameData = localStorage.getItem("completeGameData");
      if (completeGameData) {
        const gameData = JSON.parse(completeGameData);
        if (gameData.gameInfo && gameData.gameInfo.currentTurn) {
          const newTurn = gameData.gameInfo.currentTurn;
          if (newTurn !== currentTurn) {
            setCurrentTurn(newTurn);
            // console.log(
            //   `GameBoard: تم تحديث الدور عند العودة إلى ${
            //     newTurn === 1 ? "الأول" : "الثاني"
            //   } - الحفرة النشطة: ${newTurn === 1 ? "اليسرى" : "اليمنى"}`
            // );
          }
        }
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [currentTurn]);

  // Load game data from localStorage on component mount and when returning from TheGame
  useEffect(() => {
    loadGameData();
    
    // تحديثات متعددة لضمان ظهور الأسئلة المغمقة
    setTimeout(() => {
      console.log('🔄 تحديث فوري 1');
      forceQuestionsUpdate();
    }, 50);
    
    setTimeout(() => {
      console.log('🔄 تحديث فوري 2');
      forceQuestionsUpdate();
    }, 200);
    
    setTimeout(() => {
      console.log('🔄 تحديث فوري 3');
      forceQuestionsUpdate();
    }, 500);
    
    setTimeout(() => {
      console.log('🔄 تحديث فوري 4');
      forceQuestionsUpdate();
    }, 1000);

    // Listen for focus events to reload data when returning from other pages
    const handleFocus = () => {
      loadGameData();
      // استخدام الدالة القوية عند العودة للصفحة
      setTimeout(() => {
        forceQuestionsUpdate();
      }, 100);
      setTimeout(() => {
        forceQuestionsUpdate();
      }, 300);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Additional useEffect to listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "completeGameData") {
        const gameData = JSON.parse(e.newValue || "{}");
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

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // إظهار نافذة الفائز تلقائياً عند انتهاء جميع الأسئلة
  useEffect(() => {
    if (areAllQuestionsFinished() && !showWinnerModal) {
      // تأخير بسيط لضمان تحديث الواجهة
      const timer = setTimeout(() => {
        setShowWinnerModal(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [usedQuestions, showWinnerModal]);

  return (
    <div className="jeopardy-app">
      <div className="board">
        {categories.map((cat) => (
          <div className="category" key={cat.id}>
            <div className="col">
              {values.map((v) => (
                <div
                  className={`pill ${
                    isQuestionUsed(cat.id, v, "left") ? "pill-used" : ""
                  }`}
                  key={`left-${cat.id}-${v}`}
                  onClick={() => handleQuestionClick(cat.id, v, "left")}
                  style={{
                    cursor:
                      loading || isQuestionUsed(cat.id, v, "left")
                        ? "not-allowed"
                        : "pointer",
                    opacity: isQuestionUsed(cat.id, v, "left") ? 0.4 : 1,
                  }}
                >
                  <span className="value-text">{loading ? "..." : v}</span>
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
                  className={`pill ${
                    isQuestionUsed(cat.id, v, "right") ? "pill-used" : ""
                  }`}
                  key={`right-${cat.id}-${v}`}
                  onClick={() => handleQuestionClick(cat.id, v, "right")}
                  style={{
                    cursor:
                      loading || isQuestionUsed(cat.id, v, "right")
                        ? "not-allowed"
                        : "pointer",
                    opacity: isQuestionUsed(cat.id, v, "right") ? 0.4 : 1,
                  }}
                >
                  <span className="value-text">{loading ? "..." : v}</span>
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
                const newScore = scoreLeft - 100;
                console.log(`🔻 فريق 1 ناقص: ${scoreLeft} -> ${newScore}`);
                setScoreLeft(newScore);
                saveScoresToLocalStorage(newScore, scoreRight);

                // تحديث النتيجة في API للألعاب العادية
                console.log(`🚀 إرسال نقاط لـ API: ${newScore}, ${scoreRight}`);
                updateGameInAPI(newScore, scoreRight);

                // إرسال تحديث النتائج فوراً
                const scoresUpdateEvent = new CustomEvent("scoresUpdated", {
                  detail: {
                    team1Score: newScore,
                    team2Score: scoreRight,
                  },
                });
                window.dispatchEvent(scoresUpdateEvent);
              }}
            >
              −
            </button>
            <div className="score">{scoreLeft}</div>
            <button
              className="plus"
              onClick={() => {
                const newScore = scoreLeft + 100;
                console.log(`🔺 فريق 1 زائد: ${scoreLeft} -> ${newScore}`);
                setScoreLeft(newScore);
                saveScoresToLocalStorage(newScore, scoreRight);

                // تحديث النتيجة في API للألعاب العادية
                console.log(`🚀 إرسال نقاط لـ API: ${newScore}, ${scoreRight}`);
                updateGameInAPI(newScore, scoreRight);

                // إرسال تحديث النتائج فوراً
                const scoresUpdateEvent = new CustomEvent("scoresUpdated", {
                  detail: {
                    team1Score: newScore,
                    team2Score: scoreRight,
                  },
                });
                window.dispatchEvent(scoresUpdateEvent);
              }}
            >
              +
            </button>
          </div>
          <div className="helpers-inline">
            <h3>وسائل المساعدة</h3>
            <div className="icons">
              <div
                className={`icon ${
                  isHoleVisible("left")
                    ? "icon-colored icon-hole-active"
                    : "icon-disabled"
                }`}
                onClick={() => {
                  if (canActivateHole("left")) {
                    setShowHoleModal("left");
                  } else if (isHoleVisible("left")) {
                    // console.log('ليس دورك - لا يمكن تفعيل الحفرة اليسرى');
                  }
                }}
                title={
                  !isHoleVisible("left")
                    ? "تم استخدام الحفرة"
                    : canActivateHole("left")
                    ? "اضغط لتفعيل الحفرة"
                    : "ليس دورك - لا يمكن تفعيل الحفرة"
                }
                style={{
                  color: isHoleVisible("left") ? "#ff6b35" : "",
                  cursor: canActivateHole("left") ? "pointer" : isHoleVisible("left") ? "not-allowed" : "default",
                }}
              >
                <i className="fas fa-sync-alt"></i>
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

        <div className="team team-right">
          <button className="name">{team2Name}</button>
          <div className="score-box">
            <button
              className="minus"
              onClick={() => {
                const newScore = scoreRight - 100;
                console.log(`🔻 فريق 2 ناقص: ${scoreRight} -> ${newScore}`);
                setScoreRight(newScore);
                saveScoresToLocalStorage(scoreLeft, newScore);

                // تحديث النتيجة في API للألعاب العادية
                console.log(`🚀 إرسال نقاط لـ API: ${scoreLeft}, ${newScore}`);
                updateGameInAPI(scoreLeft, newScore);

                // إرسال تحديث النتائج فوراً
                const scoresUpdateEvent = new CustomEvent("scoresUpdated", {
                  detail: {
                    team1Score: scoreLeft,
                    team2Score: newScore,
                  },
                });
                window.dispatchEvent(scoresUpdateEvent);
              }}
            >
              −
            </button>
            <div className="score">{scoreRight}</div>
            <button
              className="plus"
              onClick={() => {
                const newScore = scoreRight + 100;
                console.log(`🔺 فريق 2 زائد: ${scoreRight} -> ${newScore}`);
                setScoreRight(newScore);
                saveScoresToLocalStorage(scoreLeft, newScore);

                // تحديث النتيجة في API للألعاب العادية
                console.log(`🚀 إرسال نقاط لـ API: ${scoreLeft}, ${newScore}`);
                updateGameInAPI(scoreLeft, newScore);

                // إرسال تحديث النتائج فوراً
                const scoresUpdateEvent = new CustomEvent("scoresUpdated", {
                  detail: {
                    team1Score: scoreLeft,
                    team2Score: newScore,
                  },
                });
                window.dispatchEvent(scoresUpdateEvent);
              }}
            >
              +
            </button>
          </div>
          <div className="helpers-inline">
            <h3>وسائل المساعدة</h3>
            <div className="icons">
              <div
                className={`icon ${
                  isHoleVisible("right")
                    ? "icon-colored icon-hole-active"
                    : "icon-disabled"
                }`}
                onClick={() => {
                  if (canActivateHole("right")) {
                    setShowHoleModal("right");
                  } else if (isHoleVisible("right")) {
                    // console.log('ليس دورك - لا يمكن تفعيل الحفرة اليمنى');
                  }
                }}
                title={
                  !isHoleVisible("right")
                    ? "تم استخدام الحفرة"
                    : canActivateHole("right")
                    ? "اضغط لتفعيل الحفرة"
                    : "ليس دورك - لا يمكن تفعيل الحفرة"
                }
                style={{
                  color: isHoleVisible("right") ? "#ff6b35" : "",
                  cursor: canActivateHole("right") ? "pointer" : isHoleVisible("right") ? "not-allowed" : "default",
                }}
              >
                <i className="fas fa-sync-alt"></i>
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
        <div
          className="hole-modal-overlay"
          onClick={() => setShowHoleModal(false)}
        >
          <div className="hole-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hole-modal-header">
              <h3>
                الحفرة - {showHoleModal === "left" ? team1Name : team2Name}
              </h3>
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
                <li>
                  <strong>التأثير:</strong> عند الإجابة على السؤال، تحصل على{" "}
                  <strong>ضعف النقاط</strong> وينقص نقاط السؤال من الخصم
                </li>
                <li>
                  <strong>عدم الإجابة:</strong> لا يحدث شيء
                </li>
              </ul>
              <p
                style={{
                  color: "#ff6b35",
                  fontWeight: "bold",
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                {(() => {
                  const currentQuestion =
                    localStorage.getItem("currentQuestion");
                  let questionPoints = 200;
                  if (currentQuestion) {
                    try {
                      const questionData = JSON.parse(currentQuestion);
                      questionPoints = questionData.points || 200;
                    } catch (e) {}
                  }
                  return `🔥 مثال: سؤال ${questionPoints} → تحصل على ${
                    questionPoints * 2
                  } (${questionPoints}×2) 🔥`;
                })()}
              </p>
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
                  // console.log(`GameBoard: بدء تفعيل الحفرة ${showHoleModal}`);
                  
                  // تحديث localStorage أولاً لضمان التفعيل الفوري
                  const updatedHoleUsed = {
                    ...holeUsed,
                    [showHoleModal]: true
                  };
                  
                  const completeGameData = localStorage.getItem("completeGameData");
                  if (completeGameData) {
                    const gameData = JSON.parse(completeGameData);
                    if (gameData.gameInfo) {
                      gameData.gameInfo.holeUsed = updatedHoleUsed;
                      gameData.gameInfo.currentTeamUsingHole = showHoleModal;
                      gameData.gameInfo.holeActivated = true; // علامة على أن الحفرة مفعلة
                      gameData.gameInfo.holeTeam = showHoleModal === "left" ? gameData.gameInfo.team1Name : gameData.gameInfo.team2Name;
                      localStorage.setItem("completeGameData", JSON.stringify(gameData));
                      // console.log('GameBoard: تم حفظ بيانات الحفرة في localStorage');
                    }
                  }

                  // تحديث state
                  setHoleUsed(updatedHoleUsed);
                  setCurrentTeamUsingHole(showHoleModal);
                  
                  // إرسال حدث لـ TheGame لإعلامه بتفعيل الحفرة فوراً
                  const holeActivatedEvent = new CustomEvent("holeActivated", {
                    detail: {
                      side: showHoleModal,
                      activated: true,
                      immediate: true // تفعيل فوري
                    }
                  });
                  window.dispatchEvent(holeActivatedEvent);
                  
                  // console.log(`GameBoard: تم إرسال حدث تفعيل الحفرة فوراً - ${showHoleModal}`);
                  
                  setShowHoleModal(false);
                }}
              >
                تفعيل
              </button>            </div>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {showWinnerModal && (
        <div
          className="hole-modal-overlay"
          onClick={() => setShowWinnerModal(false)}
        >
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
              {getWinner().type === "tie" ? (
                <>
                  {/* <div className="tie-icon">🤝</div> */}
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
                  {/* <div className="winner-icon">🏆</div> */}
                  <h3>الفائز: {getWinner().name}</h3>
                  <p>بعدد {getWinner().score} نقطة</p>
                  <div className="teams-scores">
                    <div
                      className={`team-result ${
                        scoreLeft > scoreRight ? "winner" : "loser"
                      }`}
                    >
                      <span className="team-name">{team1Name}</span>
                      <span className="team-score">{scoreLeft} نقطة</span>
                    </div>
                    <div
                      className={`team-result ${
                        scoreRight > scoreLeft ? "winner" : "loser"
                      }`}
                    >
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
                  <button className="activate-btn" onClick={resetGame}>
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
