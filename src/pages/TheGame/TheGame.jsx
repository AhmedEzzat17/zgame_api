import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const questions = {
  1: {
    20: {
      question: "ما هو اسم سيدنا محمد الرباعي؟",
      answer: "محمد بن عبد الله بن عبد المطلب بن هاشم",
    },
    40: {
      question: "ما هي عاصمة دولة الكويت؟",
      answer: "مدينة الكويت",
    },
    60: {
      question: "ما اسم أول رئيس للولايات المتحدة؟",
      answer: "جورج واشنطن",
    },
  },
};

function TheGame() {
  const { categoryId, value } = useParams();
  const navigate = useNavigate();

  const [showAnswer, setShowAnswer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentTeam] = useState("الفريق الأول");
  const [showCallFriend, setShowCallFriend] = useState(false);

  const [hudTime, setHudTime] = useState(0);
  const [hudRunning, setHudRunning] = useState(false);

  const [timer, setTimer] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [doubleAnswerUsed, setDoubleAnswerUsed] = useState(false);
  const [showStartBtn, setShowStartBtn] = useState(true);
  const [callFriendUsed, setCallFriendUsed] = useState(false);

  const gameName = "لعبة المعلومات";
  const data = questions[categoryId]?.[value || ""];

  const handleShowAnswer = () => {
    setShowAnswer(true);
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

  if (!data) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>لا يوجد سؤال لهذه المرحلة</h2>
        <button onClick={() => navigate("/GameBoard")}>الرجوع</button>
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
          onClick={() => navigate("/")}
          aria-label="الخروج من اللعبة"
        >
          الخروج من اللعبة
        </button>

        <div className="game-box">
          <div className="question-area">
            {showAnswer ? (
              <h2 className="answer-text">{data.answer}</h2>
            ) : (
              <h2 className="question-text">{data.question}</h2>
            )}
            {!showAnswer && (
              <button className="show-btn" onClick={handleShowAnswer}>
                أظهر الإجابة
              </button>
            )}
          </div>

          {showAnswer && (
            <div className="answer-details">
              <button className="team-btn">الفريق الأول</button>
              <button className="no-answer">محدش جاوب</button>
              <button className="team-btn">الفريق الثاني</button>
            </div>
          )}

          <div className="score-bar">
            <div className="team-score">
              <span>00</span>Team 01
            </div>
            <div className="team-score">
              Team 02 <span>00</span>
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
    </div>
  );
}

export default TheGame;
