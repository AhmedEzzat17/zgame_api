import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gamesService from "../../services/gamesService";
import "./myGames.css";

const MyGames = () => {
  const navigate = useNavigate();
  
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // جلب الألعاب من localStorage والـ API وتاريخ الألعاب
  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('جلب الألعاب من جميع المصادر...');
      
      // أولاً: جلب الألعاب من النظام الجديد (الأولوية الأولى)
      const individualGames = getAllIndividualGames();
      console.log('الألعاب من النظام الجديد:', individualGames);
      
      // ثانياً: جلب الألعاب من تاريخ الألعاب المحفوظة
      const historyGames = getGamesFromHistory();
      console.log('الألعاب من التاريخ:', historyGames);
      
      // ثالثاً: جلب الألعاب الجارية من localStorage
      const localGames = getLocalGames();
      console.log('الألعاب المحلية الجارية:', localGames);
      
      // ثالثاً: جلب الألعاب من API
      let apiGames = [];
      try {
        const response = await gamesService.getGames({ per_page: 50 });
        console.log('استجابة API للألعاب:', response);
        
        if (response && response.data && response.data.data) {
          const gamesData = response.data.data.data || response.data.data;
          console.log('بيانات الألعاب من API:', gamesData);
          
          // فلترة الألعاب العادية فقط (بدون بطولة) وإضافة مصدر البيانات
          apiGames = gamesData
            .filter(game => game.tournament_id === null)
            .map(game => ({
              ...game,
              source: 'api' // تحديد مصدر البيانات
            }));
        }
      } catch (apiError) {
        console.log('خطأ في جلب الألعاب من API:', apiError.message);
      }
      
      // دمج جميع الألعاب: النظام الجديد + التاريخ + المحلية + API
      let allGames = [...individualGames, ...historyGames, ...localGames, ...apiGames];
      
      // إزالة الألعاب المتكررة بناءً على أسماء الفرق
      const uniqueGames = removeDuplicateGames(allGames);
      
      setGames(uniqueGames);
      console.log(`📊 إجمالي الألعاب: ${individualGames.length} من النظام الجديد + ${historyGames.length} من التاريخ + ${localGames.length} محلية + ${apiGames.length} من API`);
      console.log(`✨ بعد إزالة التكرار: ${uniqueGames.length} لعبة فريدة`);
      
      // عرض بيانات أول لعبة للتحقق من النقاط
      if (uniqueGames.length > 0) {
        console.log('🎮 بيانات أول لعبة:', uniqueGames[0]);
        console.log(`📊 النقاط الحقيقية: ${uniqueGames[0].team_one_name}: ${uniqueGames[0].team_one_score}, ${uniqueGames[0].team_two_name}: ${uniqueGames[0].team_two_score}`);
        console.log(`🔄 حالة اللعبة: ${uniqueGames[0].is_completed ? 'منتهية' : 'جارية'}`);
        console.log(`📚 مصدر البيانات: ${uniqueGames[0].source}`);
      }
      
      if (uniqueGames.length === 0) {
        console.log('لا توجد ألعاب في أي من المصادر');
        setGames([]);
      }
    } catch (error) {
      console.error('خطأ في جلب الألعاب:', error);
      
      // تحديد نوع الخطأ وعرض رسالة مناسبة
      let errorMessage = 'حدث خطأ في تحميل الألعاب';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'انتهت مهلة الاتصال بالسيرفر. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.';
      } else if (error.response?.status === 401) {
        errorMessage = 'انتهت صلاحية تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.';
      } else if (error.response?.status === 404) {
        errorMessage = 'لم يتم العثور على خدمة الألعاب.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'خطأ في السيرفر. يرجى المحاولة لاحقاً.';
      } else if (!navigator.onLine) {
        errorMessage = 'لا يوجد اتصال بالإنترنت. تأكد من اتصالك وحاول مرة أخرى.';
      }
      
      setError(errorMessage);
      
      // عرض بيانات تجريبية كـ fallback
      console.log('عرض بيانات تجريبية كـ fallback...');
      const mockGames = [
        {
          id: 1,
          tournament_id: null,
          team_one_name: "الفريق الأحمر",
          team_two_name: "الفريق الأزرق", 
          team_one_score: 800,
          team_two_score: 600,
          is_completed: true,
          status: "completed",
          tournament_name: "بطولة الثقافة العامة",
          started_at: "2025-09-19T10:00:00.000000Z",
          completed_at: "2025-09-19T10:30:00.000000Z"
        },
        {
          id: 2,
          tournament_id: null,
          team_one_name: "فريق النجوم",
          team_two_name: "فريق الأبطال",
          team_one_score: 400,
          team_two_score: 400,
          is_completed: true,
          status: "completed",
          tournament_name: "تحدي المعرفة",
          started_at: "2025-09-18T15:00:00.000000Z",
          completed_at: "2025-09-18T15:25:00.000000Z"
        },
        {
          id: 3,
          tournament_id: null,
          team_one_name: "الفريق الذهبي",
          team_two_name: "الفريق الفضي",
          team_one_score: 200,
          team_two_score: 600,
          is_completed: false,
          status: "in_progress",
          tournament_name: "لعبة سريعة",
          started_at: "2025-09-19T14:00:00.000000Z"
        }
      ];
      
      setGames(mockGames);
      console.log('تم عرض البيانات التجريبية');
    } finally {
      setLoading(false);
    }
  };

  // دالة لتنظيف اسم الفريق
  const normalizeTeamName = (name) => {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  // دالة لإزالة الألعاب المتكررة مع إعطاء الأولوية للألعاب من التاريخ
  const removeDuplicateGames = (games) => {
    const gameMap = new Map();
    
    // ترتيب الألعاب حسب الأولوية: individual_scores > history > localStorage > API
    const sortedGames = games.sort((a, b) => {
      const priorityOrder = { 'individual_scores': 1, 'history': 2, 'localStorage': 3, 'api': 4 };
      return (priorityOrder[a.source] || 4) - (priorityOrder[b.source] || 4);
    });
    
    sortedGames.forEach(game => {
      // تنظيف أسماء الفرق
      const team1 = normalizeTeamName(game.team_one_name || '');
      const team2 = normalizeTeamName(game.team_two_name || '');
      
      // إنشاء مفتاح فريد - مع مراعاة أن الفريق الأول ضد الثاني = الثاني ضد الأول
      const gameKey1 = `${team1}_vs_${team2}`;
      const gameKey2 = `${team2}_vs_${team1}`;
      
      // فحص إذا كانت اللعبة موجودة بأي من المفتاحين
      const existingKey = gameMap.has(gameKey1) ? gameKey1 : gameMap.has(gameKey2) ? gameKey2 : null;
      
      if (!existingKey) {
        // لعبة جديدة
        gameMap.set(gameKey1, game);
        console.log(`➕ إضافة لعبة جديدة: ${game.team_one_name} ضد ${game.team_two_name} (من ${game.source})`);
      } else {
        // لعبة موجودة - فحص الأولوية والتاريخ
        const existingGame = gameMap.get(existingKey);
        
        // إعطاء الأولوية للألعاب من النظام الجديد
        if (game.source === 'individual_scores' && existingGame.source !== 'individual_scores') {
          gameMap.delete(existingKey);
          gameMap.set(gameKey1, game);
          console.log(`🔄 تحديث لعبة بأولوية النظام الجديد: ${game.team_one_name} ضد ${game.team_two_name}`);
        } else if (game.source === 'history' && existingGame.source !== 'history' && existingGame.source !== 'individual_scores') {
          gameMap.delete(existingKey);
          gameMap.set(gameKey1, game);
          console.log(`🔄 تحديث لعبة بأولوية التاريخ: ${game.team_one_name} ضد ${game.team_two_name}`);
        } else if (game.source === existingGame.source) {
          // نفس المصدر - فحص التاريخ
          const currentDate = new Date(game.updated_at || game.created_at || game.completed_at);
          const existingDate = new Date(existingGame.updated_at || existingGame.created_at || existingGame.completed_at);
          
          if (currentDate > existingDate) {
            gameMap.delete(existingKey);
            gameMap.set(gameKey1, game);
            console.log(`🔄 تحديث لعبة (أحدث): ${game.team_one_name} ضد ${game.team_two_name}`);
          } else {
            console.log(`⏭️ تجاهل لعبة قديمة: ${game.team_one_name} ضد ${game.team_two_name}`);
          }
        } else {
          console.log(`⏭️ تجاهل لعبة (أولوية أقل): ${game.team_one_name} ضد ${game.team_two_name} (${game.source})`);
        }
      }
    });
    
    // تحويل Map إلى array وترتيب حسب آخر تحديث
    const uniqueGames = Array.from(gameMap.values()).sort((a, b) => {
      // الألعاب الجارية أولاً، ثم المنتهية
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }
      
      // ترتيب حسب التاريخ (الأحدث أولاً)
      const dateA = new Date(a.updated_at || a.created_at || a.completed_at);
      const dateB = new Date(b.updated_at || b.created_at || b.completed_at);
      return dateB - dateA;
    });
    
    console.log(`🔄 تم إزالة ${games.length - uniqueGames.length} لعبة متكررة`);
    console.log(`🏆 عدد الألعاب الفريدة: ${uniqueGames.length}`);
    console.log(`📊 توزيع المصادر:`, uniqueGames.reduce((acc, game) => {
      acc[game.source] = (acc[game.source] || 0) + 1;
      return acc;
    }, {}));
    
    return uniqueGames;
  };

  // تحميل الألعاب عند تحميل الصفحة
  useEffect(() => {
    fetchGames();
    
    // استماع لتحديثات النقاط من GameBoard
    const handleScoreUpdate = (event) => {
      console.log('📊 تم استلام تحديث النقاط في myGames:', event.detail);
      
      // إعادة تحميل الألعاب بعد تأخير قصير
      setTimeout(() => {
        console.log('🔄 إعادة تحميل الألعاب بعد تحديث النقاط...');
        fetchGames();
      }, 1000);
    };

    // استماع لتحديثات تاريخ الألعاب من GameBoard
    const handleGameHistoryUpdate = (event) => {
      console.log('📚 تم استلام تحديث تاريخ الألعاب في myGames:', event.detail);
      
      // إعادة تحميل الألعاب فوراً لعرض اللعبة المنتهية
      setTimeout(() => {
        console.log('🔄 إعادة تحميل الألعاب بعد تحديث التاريخ...');
        fetchGames();
      }, 500);
    };

    // استماع لتحديثات النقاط الفردية من GameBoard
    const handleGameScoreUpdate = (event) => {
      console.log('🎯 تم استلام تحديث النقاط الفردية في myGames:', event.detail);
      
      // إعادة تحميل الألعاب فوراً لعرض النقاط المحدثة
      setTimeout(() => {
        console.log('🔄 إعادة تحميل الألعاب بعد تحديث النقاط الفردية...');
        fetchGames();
      }, 200);
    };
    
    window.addEventListener('scoresUpdated', handleScoreUpdate);
    window.addEventListener('gameHistoryUpdated', handleGameHistoryUpdate);
    window.addEventListener('gameScoreUpdated', handleGameScoreUpdate);
    
    // تنظيف المستمعين عند إلغاء المكون
    return () => {
      window.removeEventListener('scoresUpdated', handleScoreUpdate);
      window.removeEventListener('gameHistoryUpdated', handleGameHistoryUpdate);
      window.removeEventListener('gameScoreUpdated', handleGameScoreUpdate);
    };
  }, []);

  // دالة لجلب الألعاب من تاريخ الألعاب المحفوظة
  const getGamesFromHistory = () => {
    try {
      const gamesHistory = localStorage.getItem('gamesHistory');
      console.log('📚 محتوى gamesHistory من localStorage:', gamesHistory);
      
      if (!gamesHistory) {
        console.log('📚 لا يوجد تاريخ ألعاب في localStorage');
        return [];
      }
      
      const historyGames = JSON.parse(gamesHistory);
      console.log(`📚 تم جلب ${historyGames.length} لعبة من تاريخ الألعاب:`, historyGames);
      
      return historyGames.map(game => ({
        ...game,
        source: 'history' // تمييز الألعاب من التاريخ
      }));
    } catch (error) {
      console.error('خطأ في قراءة تاريخ الألعاب:', error);
      return [];
    }
  };

  // دالة لجلب جميع الألعاب من النظام الجديد
  const getAllIndividualGames = () => {
    try {
      const allGameScores = localStorage.getItem('allGameScores');
      if (!allGameScores) return [];
      
      const gamesData = JSON.parse(allGameScores);
      const games = Object.values(gamesData).map(game => ({
        id: game.id,
        tournament_id: null,
        team_one_name: game.team1Name,
        team_two_name: game.team2Name,
        team_one_score: game.team1Score,
        team_two_score: game.team2Score,
        is_completed: game.isCompleted,
        status: game.isCompleted ? 'completed' : 'in_progress',
        started_at: game.lastUpdated,
        updated_at: game.lastUpdated,
        source: 'individual_scores',
        progress: game.progress || 0,
        usedQuestionsCount: game.usedQuestionsCount || 0,
        totalQuestions: game.totalQuestions || 36
      }));
      
      console.log(`🎯 تم جلب ${games.length} لعبة من النظام الجديد`);
      return games;
    } catch (error) {
      console.error('خطأ في قراءة الألعاب من النظام الجديد:', error);
      return [];
    }
  };

  // دالة لجلب الألعاب المحلية من localStorage (اللعبة الجارية فقط)
  const getLocalGames = () => {
    try {
      const completeGameData = localStorage.getItem('completeGameData');
      if (!completeGameData) return [];
      
      const gameData = JSON.parse(completeGameData);
      if (!gameData.gameInfo) return [];
      
      // فحص إذا كانت اللعبة جارية فقط (لها نقاط أو أسئلة مستخدمة)
      const hasProgress = (gameData.gameInfo.team1Score > 0) || 
                         (gameData.gameInfo.team2Score > 0) || 
                         (gameData.gameInfo.usedQuestions && gameData.gameInfo.usedQuestions.length > 0);
      
      if (!hasProgress) {
        console.log('لا توجد لعبة جارية في localStorage');
        return [];
      }
      
      // إنشاء لعبة من البيانات المحلية
      const localGame = {
        id: gameData.gameInfo.currentGameId || `local_${Date.now()}`,
        tournament_id: null,
        team_one_name: gameData.gameInfo.team1Name || 'الفريق الأول',
        team_two_name: gameData.gameInfo.team2Name || 'الفريق الثاني',
        team_one_score: gameData.gameInfo.team1Score || 0,
        team_two_score: gameData.gameInfo.team2Score || 0,
        is_completed: gameData.gameInfo.isCompleted || false,
        status: gameData.gameInfo.isCompleted ? 'completed' : 'in_progress',
        started_at: gameData.gameInfo.startedAt || new Date().toISOString(),
        updated_at: gameData.gameInfo.lastPlayed || new Date().toISOString(),
        source: 'localStorage',
        // حفظ البيانات الإضافية للاستكمال
        usedQuestions: gameData.gameInfo.usedQuestions || [],
        holeUsed: gameData.gameInfo.holeUsed || { left: false, right: false },
        currentTurn: gameData.gameInfo.currentTurn || 1,
        categories: gameData.categories || []
      };
      
      console.log(`🎮 لعبة جارية: ${localGame.team_one_name} (${localGame.team_one_score}) ضد ${localGame.team_two_name} (${localGame.team_two_score})`);
      return [localGame];
    } catch (error) {
      console.error('خطأ في قراءة الألعاب المحلية:', error);
      return [];
    }
  };
  
  // دالة مساعدة لتحديد مصدر اللعبة
  const determineGameSource = (game) => {
    if (game.source) return game.source;
    if (game.winner || game.completed_at) return 'history';
    if (game.id && game.id.toString().startsWith('local_')) return 'localStorage';
    return 'api';
  };

  // دالة اختبار لحفظ لعبة في التاريخ (للاختبار فقط)
  const testSaveGameToHistory = () => {
    const testGame = {
      id: `test_${Date.now()}`,
      tournament_id: null,
      team_one_name: 'فريق الاختبار 1',
      team_two_name: 'فريق الاختبار 2',
      team_one_score: 800,
      team_two_score: 600,
      is_completed: true,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: 'history',
      winner: 'فريق الاختبار 1',
      winnerScore: 800
    };

    try {
      const gamesHistory = JSON.parse(localStorage.getItem('gamesHistory') || '[]');
      gamesHistory.unshift(testGame);
      localStorage.setItem('gamesHistory', JSON.stringify(gamesHistory));
      console.log('✅ تم حفظ لعبة اختبار في التاريخ:', testGame);
      
      // إعادة تحميل الألعاب
      setTimeout(() => {
        fetchGames();
      }, 100);
    } catch (error) {
      console.error('❌ خطأ في حفظ لعبة الاختبار:', error);
    }
  };

  // دالة اختبار لحفظ لعبة في النظام الجديد (للاختبار فقط)
  const testSaveGameToNewSystem = () => {
    const testGameId = `test_${Date.now()}`;
    const testGame = {
      id: testGameId,
      team1Name: 'فريق النظام الجديد 1',
      team2Name: 'فريق النظام الجديد 2',
      team1Score: 1000,
      team2Score: 800,
      isCompleted: true,
      lastUpdated: new Date().toISOString(),
      usedQuestionsCount: 36,
      totalQuestions: 36,
      progress: 100,
      holeUsed: { left: true, right: false },
      currentTurn: 1
    };

    try {
      const allGameScores = JSON.parse(localStorage.getItem('allGameScores') || '{}');
      allGameScores[testGameId] = testGame;
      localStorage.setItem('allGameScores', JSON.stringify(allGameScores));
      console.log('✅ تم حفظ لعبة اختبار في النظام الجديد:', testGame);
      
      // إعادة تحميل الألعاب
      setTimeout(() => {
        fetchGames();
      }, 100);
    } catch (error) {
      console.error('❌ خطأ في حفظ لعبة الاختبار في النظام الجديد:', error);
    }
  };

  // دالة لمسح جميع البيانات وإعادة البدء (للاختبار فقط)
  const clearAllGameData = () => {
    try {
      // مسح جميع البيانات المتعلقة بالألعاب
      localStorage.removeItem('allGameScores');
      localStorage.removeItem('gamesHistory');
      localStorage.removeItem('completeGameData');
      localStorage.removeItem('usedQuestions');
      localStorage.removeItem('usedQuestionsTournament');
      localStorage.removeItem('currentQuestion');
      localStorage.removeItem('selectedItems');
      localStorage.removeItem('myLocalGames');
      
      console.log('🧹 تم مسح جميع بيانات الألعاب');
      
      // إعادة تحميل الألعاب
      setTimeout(() => {
        fetchGames();
      }, 100);
    } catch (error) {
      console.error('❌ خطأ في مسح البيانات:', error);
    }
  };

  // دالة لعرض جميع البيانات المحفوظة (للتشخيص)
  const showAllStoredData = () => {
    console.log('📊 جميع البيانات المحفوظة:');
    console.log('🎯 allGameScores:', localStorage.getItem('allGameScores'));
    console.log('📚 gamesHistory:', localStorage.getItem('gamesHistory'));
    console.log('🎮 completeGameData:', localStorage.getItem('completeGameData'));
    console.log('❓ usedQuestions:', localStorage.getItem('usedQuestions'));
    console.log('🏆 usedQuestionsTournament:', localStorage.getItem('usedQuestionsTournament'));
    console.log('📝 currentQuestion:', localStorage.getItem('currentQuestion'));
    console.log('📋 selectedItems:', localStorage.getItem('selectedItems'));
    console.log('🎲 myLocalGames:', localStorage.getItem('myLocalGames'));
  };

  // إضافة الدوال للـ window للاختبار
  window.testSaveGameToHistory = testSaveGameToHistory;
  window.testSaveGameToNewSystem = testSaveGameToNewSystem;
  window.clearAllGameData = clearAllGameData;
  window.showAllStoredData = showAllStoredData;

  const handlePlayGame = (game) => {
    // إذا كانت اللعبة منتهية، عرض النتيجة فقط
    if (game.is_completed) {
      const winner = getWinner(game);
      let message = `نتيجة اللعبة:\n${game.team_one_name}: ${game.team_one_score} نقطة\n${game.team_two_name}: ${game.team_two_score} نقطة\n\n`;
      
      if (winner.name === 'تعادل') {
        message += '🤝 النتيجة: تعادل!';
      } else {
        message += `🏆 الفائز: ${winner.name} بـ ${winner.score} نقطة`;
      }
      
      alert(message);
      return;
    }
    
    // إذا كانت اللعبة جارية، تحضير البيانات للاستكمال
    console.log('🎮 استكمال اللعبة:', game);
    
    // دمج البيانات من API و localStorage للحصول على أحدث البيانات
    const currentLocalData = localStorage.getItem('completeGameData');
    let existingGameData = null;
    if (currentLocalData) {
      try {
        existingGameData = JSON.parse(currentLocalData);
      } catch (error) {
        console.error('خطأ في قراءة البيانات المحلية:', error);
      }
    }
    
    // تحضير بيانات اللعبة للاستكمال مع دمج البيانات الموجودة
    const gameDataForContinue = {
      gameInfo: {
        team1Name: game.team_one_name,
        team2Name: game.team_two_name,
        team1Score: game.team_one_score,
        team2Score: game.team_two_score,
        currentGameId: game.id,
        currentTurn: game.currentTurn || (existingGameData?.gameInfo?.currentTurn) || 1,
        holeUsed: game.holeUsed || (existingGameData?.gameInfo?.holeUsed) || { left: false, right: false },
        isCompleted: game.is_completed,
        startedAt: game.started_at,
        lastPlayed: new Date().toISOString(),
        progress: game.progress || 0,
        // حفظ الأسئلة المستخدمة من مصادر مختلفة
        usedQuestions: game.usedQuestions || (existingGameData?.gameInfo?.usedQuestions) || [],
        // حفظ وسائل المساعدة المستخدمة من مصادر مختلفة
        lifelinesUsed: game.lifelinesUsed || (existingGameData?.gameInfo?.lifelinesUsed) || {
          call_friend: false,
          fifty_fifty: false,
          audience_poll: false
        }
      },
      categories: game.categories || (existingGameData?.categories) || []
    };
    
    // حفظ البيانات في localStorage
    localStorage.setItem('completeGameData', JSON.stringify(gameDataForContinue));
    
    // حفظ الأسئلة المستخدمة في localStorage منفصل للعبة العادية
    if (gameDataForContinue.gameInfo.usedQuestions && gameDataForContinue.gameInfo.usedQuestions.length > 0) {
      localStorage.setItem('usedQuestions', JSON.stringify(gameDataForContinue.gameInfo.usedQuestions));
      console.log(`📝 تم استعادة ${gameDataForContinue.gameInfo.usedQuestions.length} سؤال مستخدم`);
      console.log(`📝 الأسئلة المستخدمة:`, gameDataForContinue.gameInfo.usedQuestions);
    }
    
    // عرض معلومات التشخيص لوسائل المساعدة
    console.log(`🎯 وسائل المساعدة المحفوظة:`, gameDataForContinue.gameInfo.lifelinesUsed);
    console.log(`🕳️ حالة الحفرة:`, gameDataForContinue.gameInfo.holeUsed);
    console.log(`🎮 الدور الحالي: ${gameDataForContinue.gameInfo.currentTurn}`);
    console.log(`📈 التقدم: ${gameDataForContinue.gameInfo.progress}%`);
    
    console.log('💾 تم تحضير بيانات اللعبة للاستكمال:', gameDataForContinue);
    
    // الانتقال لصفحة اللعبة
    navigate('/GameBoard');
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'غير محدد';
    }
  };

  // تحديد الفائز
  const getWinner = (game) => {
    if (game.team_one_score > game.team_two_score) {
      return { name: game.team_one_name, score: game.team_one_score };
    } else if (game.team_two_score > game.team_one_score) {
      return { name: game.team_two_name, score: game.team_two_score };
    } else {
      return { name: 'تعادل', score: game.team_one_score };
    }
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
          {loading ? (
            <div className="mygames11-loading">
              <div className="mygames11-spinner"></div>
              <p>جاري تحميل الألعاب...</p>
            </div>
          ) : error ? (
            <div className="mygames11-error">
              <div className="mygames11-error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>مشكلة في الاتصال</h3>
              <p>{error}</p>
              <div className="mygames11-error-note">
                <p><strong>ملاحظة:</strong> يتم عرض بيانات تجريبية حالياً لتجربة الواجهة</p>
              </div>
              <button 
                className="mygames11-retry-btn"
                onClick={fetchGames}
              >
                <i className="fas fa-redo"></i>
                إعادة المحاولة
              </button>
            </div>
          ) : games.length > 0 ? (
            games.map((game) => (
              <div key={game.id} className="mygames11-card">
                
                {/* Game Status Badge */}
                <div className={`mygames11-status-badge ${game.is_completed ? 'completed' : 'in-progress'}`}>
                  {game.is_completed ? 'منتهية' : 'جارية'}
                </div>

                {/* Game Image */}
                <div className="mygames11-image">
                  <img 
                    src="images/zGame_All_Pages___2_-removebg-preview.png"
                    alt="لعبة"
                    onError={(e) => {
                      e.target.src = "images/zGame_All_Pages___2_-removebg-preview.png";
                    }}
                  />
                </div>

                {/* Game Content */}
                <div className="mygames11-content">
                  {/* Tournament Name */}
                  {game.tournament_name && (
                    <div className="mygames11-tournament-name">
                      <i className="fas fa-trophy"></i>
                      {game.tournament_name}
                    </div>
                  )}
                  
                  <h3 className="mygames11-title">
                    {game.team_one_name} ضد {game.team_two_name}
                  </h3>
                  
                  {/* Game Info */}
                  <div className="mygames11-info">
                    <div className="mygames11-scores">
                      <span className="team-score">
                        {game.team_one_name} : {game.team_one_score}
                      </span>
                      <span className="vs">&#x2003;VS&#x2003;</span>
                      <span className="team-score">
                        {game.team_two_score} : {game.team_two_name}
                      </span>
                    </div>
                    
                    {game.is_completed && (
                      <div className="mygames11-winner">
                        <i className="fas fa-trophy"></i>
                        الفائز: {getWinner(game).name}
                      </div>
                    )}
                    
                    <div className="mygames11-date">
                      <i className="fas fa-calendar"></i>
                      {formatDate(game.started_at)}
                    </div>
                  </div>
                  
                  {/* Play Button */}
                  <button 
                    className={`mygames11-play-btn ${game.is_completed ? 'completed' : 'in-progress'}`}
                    onClick={() => handlePlayGame(game)}
                  >
                    <i className={`fas ${game.is_completed ? 'fa-eye' : 'fa-gamepad'}`}></i>
                    {game.is_completed ? 'عرض النتيجة' : 'العب مرة أخرى'}
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