import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/Css/style.css";

const GameNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [gameName, setGameName] = useState("لعبة المعلومات");
  const [currentTeam, setCurrentTeam] = useState("الفريق الأول");
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");
  const [currentTurn, setCurrentTurn] = useState(1);
  const [isInGame, setIsInGame] = useState(false);
  const [playerStatus, setPlayerStatus] = useState("waiting"); // waiting, viewing_question, answered_question, no_answer, returned_without_answer
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [showEndGameModal, setShowEndGameModal] = useState(false);
  const navigate = useNavigate();

  // دالة تنظيف بيانات البطولة
  const handleLogoClick = () => {
    // تنظيف بيانات البطولة عند الضغط على اللوجو
    localStorage.removeItem("currentTournamentMatch");
    localStorage.removeItem("tournamentData");
  };

  // دالة تنظيف بيانات البطولة عند الانتقال للعبة
  const handleGameNavigation = () => {
    // تنظيف بيانات البطولة عند الضغط على "العب"
    localStorage.removeItem("currentTournamentMatch");
    localStorage.removeItem("tournamentData");
    setIsOpen(false);
  };

  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem("user");
      setUser(userData ? JSON.parse(userData) : null);
    };

    // أول تحميل
    loadUser();

    // متابعة أي تغيير في localStorage
    const handleStorageChange = () => loadUser();

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // اختصار الاسم لأول 10 حروف أو الاسم الأول
  const getDisplayName = (fullName) => {
    if (!fullName) return "";

    const firstName = fullName.split(" ")[0];
    return firstName.length <= 10 ? firstName : fullName.substring(0, 10);
  };

  // تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowLogoutModal(false);
    setShowUserMenu(false);
    navigate("/");
  };

  // تحميل بيانات اللعبة من localStorage
  useEffect(() => {
    const loadGameData = () => {
      const completeGameData = localStorage.getItem("completeGameData");
      if (completeGameData) {
        const gameData = JSON.parse(completeGameData);
        if (gameData.gameInfo) {
          const gameName = gameData.gameInfo.gameName || "لعبة المعلومات";
          const team1 = gameData.gameInfo.team1Name || "الفريق الأول";
          const team2 = gameData.gameInfo.team2Name || "الفريق الثاني";
          const turn = gameData.gameInfo.currentTurn || 1;
          const team1Score = gameData.gameInfo.team1Score || 0;
          const team2Score = gameData.gameInfo.team2Score || 0;

          setGameName(gameName);
          setTeam1Name(team1);
          setTeam2Name(team2);
          setCurrentTurn(turn);
          setTeam1Score(team1Score);
          setTeam2Score(team2Score);
        }
      }
    };

    // تحميل اللاعب الثابت أولاً
    const fixedPlayerLoaded = loadFixedPlayer();

    // ثم تحميل باقي بيانات اللعبة
    loadGameData();

    console.log(
      `GameNavbar: تم بدء التطبيق - اللاعب الثابت: ${
        fixedPlayerLoaded ? "محمل" : "غير موجود"
      }`
    );

    // متابعة تغييرات localStorage
    const handleStorageChange = () => {
      console.log("تم تغيير localStorage - إعادة تحميل البيانات");
      loadGameData();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // دالة تغيير اللاعب فقط في حالتين: يدوياً أو بعد الإجابة
  const updatePlayerInNavbar = (newTurn, reason) => {
    const newCurrentTeam = newTurn === 1 ? team1Name : team2Name;
    setCurrentTurn(newTurn);
    setCurrentTeam(newCurrentTeam);

    // حفظ التحديث في localStorage
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      if (gameData.gameInfo) {
        gameData.gameInfo.currentTurn = newTurn;
        localStorage.setItem("completeGameData", JSON.stringify(gameData));
      }
    }

    console.log(
      `GameNavbar: تم تغيير اللاعب ${reason} إلى: ${newCurrentTeam} (${newTurn})`
    );
  };

  // حفظ اللاعب الثابت في localStorage
  const saveFixedPlayer = (teamName, turnNumber) => {
    const fixedPlayerData = {
      currentTeam: teamName,
      currentTurn: turnNumber,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("fixedCurrentPlayer", JSON.stringify(fixedPlayerData));
    console.log(
      `GameNavbar: تم حفظ اللاعب الثابت: ${teamName} (${turnNumber})`
    );
  };

  // تحميل اللاعب الثابت من localStorage
  const loadFixedPlayer = () => {
    const fixedPlayerData = localStorage.getItem("fixedCurrentPlayer");
    if (fixedPlayerData) {
      const data = JSON.parse(fixedPlayerData);
      setCurrentTeam(data.currentTeam);
      setCurrentTurn(data.currentTurn);
      console.log(
        `GameNavbar: تم تحميل اللاعب الثابت: ${data.currentTeam} (${data.currentTurn})`
      );
    } else {
      // إذا لم يكن هناك بيانات محفوظة، نبدأ افتراضياً مع الفريق الأول
      setCurrentTeam("الفريق الأول");
      setCurrentTurn(1);
      saveFixedPlayer("الفريق الأول", 1);
      console.log(`GameNavbar: تم تعيين اللاعب الافتراضي: الفريق الأول (1)`);
    }

    // إرسال حدث لتحديث الحفرة في GameBoard
    setTimeout(() => {
      const turnChangeEvent = new CustomEvent("turnChanged", {
        detail: {
          currentTurn: fixedPlayerData
            ? JSON.parse(fixedPlayerData).currentTurn
            : 1,
        },
      });
      window.dispatchEvent(turnChangeEvent);
    }, 100);

    return true;
  };

  // استماع لحدث الإجابة فقط (ليس كل turnChanged)
  useEffect(() => {
    const handleAnswerCompleted = (event) => {
      // تقليب تلقائي فقط بعد الإجابة
      const newTurn = currentTurn === 1 ? 2 : 1;
      const newCurrentTeam = newTurn === 1 ? team1Name : team2Name;

      setCurrentTurn(newTurn);
      setCurrentTeam(newCurrentTeam);
      saveFixedPlayer(newCurrentTeam, newTurn);

      // حفظ الدور في completeGameData أيضاً
      const completeGameData = localStorage.getItem("completeGameData");
      if (completeGameData) {
        const gameData = JSON.parse(completeGameData);
        if (gameData.gameInfo) {
          gameData.gameInfo.currentTurn = newTurn;
          localStorage.setItem("completeGameData", JSON.stringify(gameData));
        }
      }

      // إرسال حدث لتحديث الحفرة في GameBoard مع تأخير بسيط
      setTimeout(() => {
        const turnChangeEvent = new CustomEvent("turnChanged", {
          detail: { currentTurn: newTurn },
        });
        window.dispatchEvent(turnChangeEvent);
      }, 50);

      console.log(
        `GameNavbar: تقليب بعد الإجابة إلى: ${newCurrentTeam} (${newTurn}) - الحفرة النشطة: ${
          newTurn === 1 ? "اليسرى" : "اليمنى"
        }`
      );
    };

    // استماع لحدث الإجابة فقط
    window.addEventListener("answerCompleted", handleAnswerCompleted);

    return () => {
      window.removeEventListener("answerCompleted", handleAnswerCompleted);
    };
  }, [currentTurn, team1Name, team2Name]);

  // استماع لتغييرات حالة اللاعب
  useEffect(() => {
    const handlePlayerStatusChange = (event) => {
      const { status, currentTurn: eventTurn, hasAnswered } = event.detail;

      setPlayerStatus(status);

      let statusText = "";
      switch (status) {
        case "viewing_question":
          statusText = "يشاهد السؤال";
          break;
        case "answered_question":
          statusText = "أجاب على السؤال";
          break;
        case "no_answer":
          statusText = "لم يجب على السؤال";
          break;
        case "returned_without_answer":
          statusText = "رجع بدون إجابة";
          break;
        default:
          statusText = "في انتظار الدور";
      }

      console.log(`GameNavbar: حالة اللاعب تغيرت إلى: ${statusText}`);
    };

    window.addEventListener("playerStatusChanged", handlePlayerStatusChange);

    return () => {
      window.removeEventListener(
        "playerStatusChanged",
        handlePlayerStatusChange
      );
    };
  }, []);

  // استماع لتحديثات النتائج الفورية
  useEffect(() => {
    const handleScoreUpdate = (event) => {
      const { team1Score: newTeam1Score, team2Score: newTeam2Score } =
        event.detail;

      setTeam1Score(newTeam1Score);
      setTeam2Score(newTeam2Score);

      console.log(
        `GameNavbar: تم تحديث النتائج فوراً - ${team1Name}: ${newTeam1Score}, ${team2Name}: ${newTeam2Score}`
      );
    };

    window.addEventListener("scoresUpdated", handleScoreUpdate);

    return () => {
      window.removeEventListener("scoresUpdated", handleScoreUpdate);
    };
  }, [team1Name, team2Name]);

  // دوال لعرض حالة اللاعب
  const getPlayerStatusText = () => {
    switch (playerStatus) {
      case "viewing_question":
        return "";
      case "answered_question":
        return "";
      case "no_answer":
        return "";
      case "returned_without_answer":
        return "";
      default:
        return "";
    }
  };

  const getPlayerStatusColor = () => {
    switch (playerStatus) {
      case "viewing_question":
        return "#ffa500"; // برتقالي
      case "answered_question":
        return "#28a745"; // أخضر
      case "no_answer":
        return "#dc3545"; // أحمر
      case "returned_without_answer":
        return "#6c757d"; // رمادي
      default:
        return "#007bff"; // أزرق
    }
  };

  // كشف إذا كنا في صفحة TheGame
  useEffect(() => {
    const checkIfInGame = () => {
      const currentPath = window.location.pathname;
      const wasInGame = isInGame;
      const nowInGame = currentPath.includes("/TheGame/");

      setIsInGame(nowInGame);

      // إذا خرج من اللعبة، إعادة تعيين حالة اللاعب
      if (wasInGame && !nowInGame) {
        setPlayerStatus("waiting");
        console.log("GameNavbar: تم إعادة تعيين حالة اللاعب إلى الانتظار");
      }
    };

    checkIfInGame();

    // متابعة تغييرات الـ URL
    const handleLocationChange = () => checkIfInGame();
    window.addEventListener("popstate", handleLocationChange);

    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      if (gameData.gameInfo) {
        const gameName = gameData.gameInfo.gameName || "لعبة المعلومات";
        const team1 = gameData.gameInfo.team1Name || "الفريق الأول";
        const team2 = gameData.gameInfo.team2Name || "الفريق الثاني";
        const turn = gameData.gameInfo.currentTurn || 1;
        const team1Score = gameData.gameInfo.team1Score || 0;
        const team2Score = gameData.gameInfo.team2Score || 0;

        setGameName(gameName);
        setTeam1Name(team1);
        setTeam2Name(team2);
        setCurrentTurn(turn);
        setTeam1Score(team1Score);
        setTeam2Score(team2Score);

        // تحميل اللاعب الثابت أولاً
        const fixedPlayerLoaded = loadFixedPlayer();

        if (!fixedPlayerLoaded) {
          // إذا لم يوجد لاعب ثابت، استخدم بيانات اللعبة
          const currentTeamName = turn === 1 ? team1 : team2;
          setCurrentTeam(currentTeamName);
          setCurrentTurn(turn);
          saveFixedPlayer(currentTeamName, turn);
          console.log(`تم حفظ لاعب جديد: ${currentTeamName} (${turn})`);

          // إرسال حدث لتحديث الحفرة في GameBoard
          setTimeout(() => {
            const turnChangeEvent = new CustomEvent("turnChanged", {
              detail: { currentTurn: turn },
            });
            window.dispatchEvent(turnChangeEvent);
          }, 100);
        }

        console.log(`تم تحميل بيانات اللعبة`);
      }
    } else {
      // إذا لم توجد بيانات لعبة، حمل اللاعب الثابت
      loadFixedPlayer();
    }

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [isInGame]);

  // دالة تغيير دور الفريق يدوياً (وحفظه في localStorage)
  const handleTurnToggle = () => {
    const newTurn = currentTurn === 1 ? 2 : 1;
    const newCurrentTeam = newTurn === 1 ? team1Name : team2Name;

    // تغيير اللاعب وحفظه في localStorage
    setCurrentTurn(newTurn);
    setCurrentTeam(newCurrentTeam);
    saveFixedPlayer(newCurrentTeam, newTurn);

    // حفظ الدور في completeGameData أيضاً
    const completeGameData = localStorage.getItem("completeGameData");
    if (completeGameData) {
      const gameData = JSON.parse(completeGameData);
      if (gameData.gameInfo) {
        gameData.gameInfo.currentTurn = newTurn;
        localStorage.setItem("completeGameData", JSON.stringify(gameData));
      }
    }

    // إرسال حدث بسيط لتحديث الحفرة (بدون تأثير على أي شيء آخر)
    const turnChangeEvent = new CustomEvent("turnChanged", {
      detail: { currentTurn: newTurn },
    });
    window.dispatchEvent(turnChangeEvent);

    console.log(
      `GameNavbar: تم تغيير اللاعب يدوياً إلى: ${newCurrentTeam} (${newTurn}) - الحفرة النشطة: ${
        newTurn === 1 ? "اليسرى" : "اليمنى"
      }`
    );
  };

  // دالة تحديد الفائز
  const getWinner = () => {
    if (team1Score > team2Score) {
      return { name: team1Name, score: team1Score, type: "winner" };
    } else if (team2Score > team1Score) {
      return { name: team2Name, score: team2Score, type: "winner" };
    } else {
      return { name: "تعادل", score: team1Score, type: "tie" };
    }
  };

  // دالة إنهاء اللعبة
  const handleEndGame = () => {
    setShowEndGameModal(true);
    setIsOpen(false);
  };

  // دالة إغلاق modal إنهاء اللعبة
  const handleCloseEndGameModal = () => {
    setShowEndGameModal(false);
  };

  // دالة الخروج من اللعبة
  const handleExitGame = () => {
    setShowEndGameModal(false);
    navigate("/");
  };

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" onClick={handleLogoClick}>
            <div className="logo">
              <img
                src="images/zGame_All_Pages-removebg-preview.png"
                alt="سبين جيم"
              />
            </div>
          </Link>

          {/* اسم البطولة في المنتصف */}
          <div
            className="tournament-name"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "22px",
              fontWeight: "bold",
              color: "#333",
              maxWidth: "300px",
              textAlign: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {gameName}
          </div>

          {/* Menu Links */}
          <ul style={{ listStyle: "none" }}>
            <li className="nav-item">
              {isInGame ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <button
                    className="nav-link disabled"
                    disabled
                    style={{
                      cursor: "not-allowed",
                      fontSize: "16px",
                      opacity: 0.7,
                      marginBottom: "5px",
                    }}
                    title="لا يمكن تغيير الدور أثناء اللعب"
                  >
                    دور فريق
                    <span className=""> {currentTeam}</span>
                  </button>
                  <div
                    style={{
                      fontSize: "12px",
                      color: getPlayerStatusColor(),
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {getPlayerStatusText()}
                  </div>
                </div>
              ) : (
                <button
                  className="nav-link"
                  onClick={handleTurnToggle}
                  style={{ cursor: "pointer", fontSize: "16px" }}
                  title="اضغط لتغيير الدور"
                >
                  دور فريق
                  <span className=""> {currentTeam} </span>
                </button>
              )}
            </li>
          </ul>

          <button
            onClick={handleEndGame}
            style={{
              fontSize: "inherit",
              marginRight: "auto",
            }}
          >
            انهاء اللعبة
          </button>
        </div>
      </nav>

      {/* نافذة تأكيد تسجيل الخروج */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", textAlign: "center" }}>
              تأكيد تسجيل الخروج
            </h3>
            <p
              style={{
                margin: "0 0 24px 0",
                textAlign: "center",
                color: "#666",
              }}
            >
              هل أنت متأكد من تسجيل الخروج؟
            </p>
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                موافق
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إنهاء اللعبة */}
      {showEndGameModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEndGameModal(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              maxWidth: "500px",
              width: "90%",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ margin: "0 0 16px 0", color: "#333" }}>
                نتائج اللعبة
              </h2>
              <button
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "15px",
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
                onClick={() => setShowEndGameModal(false)}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "24px" }}>
              {getWinner().type === "tie" ? (
                <>
                  <h3 style={{ color: "#666", marginBottom: "16px" }}>
                    تعادل!
                  </h3>
                  <p style={{ margin: "0 0 20px 0", color: "#666" }}>
                    النتيجة: {getWinner().score} نقطة لكل فريق
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                        {team1Name}
                      </div>
                      <div style={{ fontSize: "18px", color: "#666" }}>
                        {team1Score} نقطة
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                        {team2Name}
                      </div>
                      <div style={{ fontSize: "18px", color: "#666" }}>
                        {team2Score} نقطة
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 style={{ color: "#28a745", marginBottom: "16px" }}>
                    الفائز: {getWinner().name}
                  </h3>
                  <p style={{ margin: "0 0 20px 0", color: "#666" }}>
                    بعدد {getWinner().score} نقطة
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        textAlign: "center",
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor:
                          team1Score > team2Score ? "#d4edda" : "#f8d7da",
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                        {team1Name}
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          color:
                            team1Score > team2Score ? "#155724" : "#721c24",
                        }}
                      >
                        {team1Score} نقطة
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor:
                          team2Score > team1Score ? "#d4edda" : "#f8d7da",
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                        {team2Name}
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          color:
                            team2Score > team1Score ? "#155724" : "#721c24",
                        }}
                      >
                        {team2Score} نقطة
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                onClick={() => setShowEndGameModal(false)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                متابعة اللعب
              </button>
              <button
                onClick={handleExitGame}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                الخروج من اللعبة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameNavbar;
