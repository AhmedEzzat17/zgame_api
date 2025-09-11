// ===== TeamInfoV2.jsx =====
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function TeamInfoV2() {
  const [gameName, setGameName] = useState("");
  const [team1Name, setTeam1Name] = useState("");
  const [team1Players, setTeam1Players] = useState(1);
  const [team2Name, setTeam2Name] = useState("");
  const [team2Players, setTeam2Players] = useState(1);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!gameName.trim() || team1Name.trim().length < 3) {
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
    }
  };

  return (
    <div className="team-wrap" dir="rtl">
      <form className="team-card" noValidate>
        <h1 className="team-title">حدد معلومات الفرق</h1>

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
