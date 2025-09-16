import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function TwoCreateChampion() {
  const [selectedTeams, setSelectedTeams] = useState(4);
  const [tournamentName, setTournamentName] = useState("");
  const [teamNames, setTeamNames] = useState(Array(4).fill(""));
  const [lastTeamNames, setLastTeamNames] = useState(Array(4).fill(""));
  const [errors, setErrors] = useState({ tournamentName: "", teamNames: [] });
  const navigate = useNavigate();

  const handleTeamNameChange = (index, value) => {
    const updatedTeamNames = [...teamNames];
    updatedTeamNames[index] = value;
    setTeamNames(updatedTeamNames);

    const updatedErrors = { ...errors };
    if (updatedErrors.teamNames[index]) {
      updatedErrors.teamNames[index] = "";
      setErrors(updatedErrors);
    }
  };

  // تحميل آخر أسماء فرق محفوظة عند تحميل الصفحة
  useEffect(() => {
    const savedTeamNames = localStorage.getItem("lastTeamNames");
    const savedTournamentName = localStorage.getItem("lastTournamentName");
    
    if (savedTeamNames) {
      try {
        const parsedNames = JSON.parse(savedTeamNames);
        setLastTeamNames(parsedNames);
        // إذا كان عدد الفرق مطابق، استخدم الأسماء المحفوظة
        if (parsedNames.length === selectedTeams) {
          setTeamNames([...parsedNames]);
        }
      } catch (e) {
        // console.log("خطأ في تحميل أسماء الفرق المحفوظة");
      }
    }
    
    if (savedTournamentName) {
      setTournamentName(savedTournamentName);
    }
  }, []);

  const handleTeamsChange = (num) => {
    setSelectedTeams(num);
    
    // إذا كان لدينا أسماء محفوظة بنفس العدد، استخدمها
    if (lastTeamNames.length === num) {
      setTeamNames([...lastTeamNames]);
    } else {
      // إنشاء array جديد بالعدد المطلوب
      const newTeamNames = Array(num).fill("");
      // نسخ الأسماء المحفوظة إذا كانت متاحة
      for (let i = 0; i < Math.min(num, lastTeamNames.length); i++) {
        if (lastTeamNames[i]) {
          newTeamNames[i] = lastTeamNames[i];
        }
      }
      setTeamNames(newTeamNames);
    }
    
    setErrors({ tournamentName: "", teamNames: [] });
  };

  const validate = () => {
    const newErrors = { tournamentName: "", teamNames: [] };

    const allNames = [tournamentName.trim(), ...teamNames.map((n) => n.trim())];
    const nameCounts = {};

    allNames.forEach((name) => {
      if (name) {
        nameCounts[name] = (nameCounts[name] || 0) + 1;
      }
    });

    if (tournamentName.trim() === "") {
      newErrors.tournamentName = "اسم البطولة مطلوب";
    } else if (tournamentName.trim().length < 3) {
      newErrors.tournamentName = "اسم البطولة يجب أن يكون أكثر من حرفين";
    } else if (nameCounts[tournamentName.trim()] > 1) {
      newErrors.tournamentName = "اسم البطولة مكرر مع اسم فريق";
    }

    newErrors.teamNames = teamNames.map((name) => {
      const trimmed = name.trim();
      if (trimmed === "") return "اسم الفريق مطلوب";
      if (trimmed.length < 3) return "يجب أن يكون الاسم أكثر من حرفين";
      if (nameCounts[trimmed] > 1) return "اسم الفريق مكرر";
      return "";
    });

    setErrors(newErrors);

    return !(
      newErrors.tournamentName || newErrors.teamNames.some((e) => e !== "")
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // حفظ آخر أسماء فرق واسم بطولة لاستخدامها في المرات القادمة
      localStorage.setItem("lastTeamNames", JSON.stringify(teamNames));
      localStorage.setItem("lastTournamentName", tournamentName);
      
      // حفظ بيانات البطولة في localStorage
      const tournamentData = {
        tournamentName,
        teamNames,
        selectedTeams,
        timestamp: new Date().toISOString(),
        currentRound: 0,
        currentMatch: 0,
        winners: {},
        isActive: true
      };
      
      localStorage.setItem("tournamentData", JSON.stringify(tournamentData));
      
      navigate("/CreateChampionTwo", {
        state: {
          tournamentName,
          teamNames,
          selectedTeams,
        },
      });
    }
  };

  const renderTeamInputs = () =>
    teamNames.map((name, i) => (
      <div className="team-input-item" key={i}>
        <input
          type="text"
          placeholder={lastTeamNames[i] || `فريق ${i + 1}`}
          value={name}
          onChange={(e) => handleTeamNameChange(i, e.target.value)}
          required
        />
        {errors.teamNames[i] && (
          <span style={{ color: "red" }}>{errors.teamNames[i]}</span>
        )}
      </div>
    ));

  return (
    <div className="containera TwoCreateChampion">
      <h1>اختر نظام البطولة</h1>
      <p>اصنع بطولتك وتحدّاهم، حان وقت التحدي مع ذاللعبة</p>

      <div className="tournament-selection">
        <div className="tournament-options">
          <button
            className={`option-button ${selectedTeams === 4 ? "active" : ""}`}
            onClick={() => handleTeamsChange(4)}
          >
            4 فرق
          </button>
          <button
            className={`option-button ${selectedTeams === 8 ? "active" : ""}`}
            onClick={() => handleTeamsChange(8)}
          >
            8 فرق
          </button>
          <button
            className={`option-button ${selectedTeams === 16 ? "active" : ""}`}
            onClick={() => handleTeamsChange(16)}
          >
            16 فريق
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>اسم البطولة</label>
          <input
            type="text"
            placeholder="اسم البطولة"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            required
          />
          {errors.tournamentName && (
            <span style={{ color: "red" }}>{errors.tournamentName}</span>
          )}
        </div>

        <div className="team-inputs">
          <h1>أسماء الفرق</h1>
          <div className="team-inputs-grid">{renderTeamInputs()}</div>
        </div>

        <button className="submit-button" type="submit">
          أعطني التقسيمة
        </button>
      </form>
    </div>
  );
}

export default TwoCreateChampion;
