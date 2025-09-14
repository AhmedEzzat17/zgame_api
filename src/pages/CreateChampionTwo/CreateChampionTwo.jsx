import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function CreateChampionTwo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tournamentName, teamNames: incomingTeamNames, selectedTeams } = location.state || {};

  // safety/fallbacks
  const N = selectedTeams || 4;
  const [teamNames, setTeamNames] = useState(() => {
    const arr = Array.isArray(incomingTeamNames) ? incomingTeamNames.slice(0, N) : [];
    // fill placeholders if missing
    while (arr.length < N) arr.push(`الفريق ${arr.length + 1}`);
    return arr;
  });

  // State that records winners: mapping matchKey -> side (1 or 2)
  const [matchWinners, setMatchWinners] = useState({}); // e.g. { 'r0m0': 1, 'r1m0': 2, ... }
  const [winnerIndices, setWinnerIndices] = useState({}); // e.g. { 'r0m0': 0, ... } (original team index)
  const [running, setRunning] = useState(false);
  const [champ, setChamp] = useState(null);
  const [currentMatchTeams, setCurrentMatchTeams] = useState(null);
  const hasLoadedData = useRef(false);

  if (!teamNames || !tournamentName) {
    // رجوع آمن في حال المرور المباشر للصفحة
    // (إذا تحب نستخدم navigate('/') بدل null ممكن)
    // هنا نرجع إلى الصفحة الرئيسية
    // navigate("/"); // لو حبينا نرجع أو نعرض رسالة
    // return null;
  }

  // Build bracket rounds and coordinates
  const { rounds, matchMap, svgWidth, svgHeight, rectW, rectH, x0, colGap } = useMemo(() => {
    const roundsCount = Math.log2(N);
    const rectHeight = N === 16 ? 40 : N === 8 ? 50 : 60;
    const rectWidth = N === 16 ? 140 : N === 8 ? 180 : 200;
    const verticalPadding = N === 16 ? 18 : 20;
    const baseY = 70;
    const leafSpacing = rectHeight + verticalPadding;
    const leafCenters = [];
    for (let i = 0; i < N; i++) {
      leafCenters.push(baseY + i * leafSpacing);
    }

    // dynamic column gap (narrower when more rounds)
    const baseGap = 320;
    const colGap = Math.max(160, baseGap - (roundsCount - 2) * 60);

    const x0 = 40; // leftmost x for team rects
    const rounds = [];
    const matchMap = {};

    // round 0: matches between pairs of teams
    const m0 = [];
    for (let i = 0; i < N / 2; i++) {
      const leftIdx = 2 * i;
      const rightIdx = 2 * i + 1;
      const centerY = (leafCenters[leftIdx] + leafCenters[rightIdx]) / 2;
      const key = `r0m${i}`;
      const x = x0 + colGap; // winners of r0 displayed one column to the right of teams
      const match = { key, left: leftIdx, right: rightIdx, centerY, x, round: 0, idx: i };
      m0.push(match);
      matchMap[key] = match;
    }
    rounds.push(m0);

    // subsequent rounds
    let prev = m0;
    for (let r = 1; r < roundsCount; r++) {
      const cur = [];
      const x = x0 + colGap * (r + 1); // column for round r winners
      for (let i = 0; i < prev.length / 2; i++) {
        const leftChild = prev[2 * i];
        const rightChild = prev[2 * i + 1];
        const centerY = (leftChild.centerY + rightChild.centerY) / 2;
        const key = `r${r}m${i}`;
        const match = { key, left: leftChild.key, right: rightChild.key, centerY, x, round: r, idx: i };
        cur.push(match);
        matchMap[key] = match;
      }
      rounds.push(cur);
      prev = cur;
    }

    // compute svg size
    const lastColumnX = x0 + colGap * (roundsCount + 0); // last round placed at x0 + colGap*roundsCount
    const svgWidth = lastColumnX + rectWidth + 80;
    // svgHeight set to fit leaves
    const svgHeight = Math.max(560, leafCenters[leafCenters.length - 1] + rectHeight + 60);

    return {
      rounds,
      matchMap,
      svgWidth,
      svgHeight,
      rectW: rectWidth,
      rectH: rectHeight,
      x0,
      colGap,
    };
  }, [N, teamNames]);

  // دالة تبديل أسماء الفرق عشوائياً
  const shuffleTeams = () => {
    // فحص إذا كانت البطولة بدأت
    const tournamentData = JSON.parse(localStorage.getItem("tournamentData") || "{}");
    const winners = tournamentData.winners || {};
    
    if (Object.keys(winners).length > 0) {
      alert("لا يمكن إعادة ترتيب الفرق بعد بدء المباريات");
      return;
    }
    
    // إنشاء نسخة من أسماء الفرق وخلطها عشوائياً
    const shuffledTeams = [...teamNames];
    for (let i = shuffledTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]];
    }
    
    // تحديث أسماء الفرق فورياً
    setTeamNames(shuffledTeams);
    
    // حفظ الترتيب الجديد في localStorage
    const updatedTournamentData = {
      ...tournamentData,
      teamNames: shuffledTeams
    };
    localStorage.setItem("tournamentData", JSON.stringify(updatedTournamentData));
    
  };

  const reset = () => {
    setMatchWinners({});
    setWinnerIndices({});
    setChamp(null);
    setRunning(false);
  };

  const runSequence = () => {
    setRunning(true);
    setMatchWinners({});
    setWinnerIndices({});
    setChamp(null);

    const pick = () => (Math.random() > 0.5 ? 1 : 2);

    // We'll create shortcuts
    // rounds is array of arrays built in useMemo
    let totalDelay = 600;
    const newMatchWinners = {};
    const newWinnerIndices = {};

    for (let r = 0; r < rounds.length; r++) {
      const row = rounds[r];
      for (let m = 0; m < row.length; m++) {
        // capture values for closure
        ((r, m) => {
          const match = rounds[r][m];
          setTimeout(() => {
            // compute leftIndex, rightIndex (original team index)
            const getIndexOf = (node) => {
              if (typeof node === "number") return node; // leaf (team index)
              // otherwise node is match key, take its winner index from newWinnerIndices
              return newWinnerIndices[node];
            };

            const leftIndex = getIndexOf(match.left);
            const rightIndex = getIndexOf(match.right);

            // fallback if somehow left/right undefined (shouldn't happen because we schedule in order)
            const li = leftIndex !== undefined ? leftIndex : (typeof match.left === "number" ? match.left : 0);
            const ri = rightIndex !== undefined ? rightIndex : (typeof match.right === "number" ? match.right : 1);

            const w = pick();
            newMatchWinners[match.key] = w;
            const winnerOriginalIndex = w === 1 ? li : ri;
            newWinnerIndices[match.key] = winnerOriginalIndex;

            // push intermediate state so UI updates gradually
            setMatchWinners({ ...newMatchWinners });
            setWinnerIndices({ ...newWinnerIndices });

            // if this is the final match (last round, last match), set champion
            if (r === rounds.length - 1 && m === row.length - 1) {
              setChamp(winnerOriginalIndex);
              setRunning(false);
            }
          }, totalDelay);
        })(r, m);
        totalDelay += 700; // spacing between match reveals
      }
      // small pause between rounds (already achieved by per-match increments)
      totalDelay += 80;
    }
  };

  // دالة لإيجاد المباراة التالية
  const findNextMatch = () => {
    const tournamentData = JSON.parse(localStorage.getItem("tournamentData") || "{}");
    const winners = tournamentData.winners || {};
    
    // البحث عن أول مباراة غير مكتملة
    for (let r = 0; r < rounds.length; r++) {
      for (let m = 0; m < rounds[r].length; m++) {
        const match = rounds[r][m];
        
        // إذا لم تكن هذه المباراة مكتملة
        if (!winners[match.key]) {
          // فحص إذا كانت المباراة جاهزة للعب (المتطلبات متوفرة)
          const canPlay = (() => {
            if (r === 0) {
              // الجولة الأولى - دائماً جاهزة
              return true;
            } else {
              // الجولات التالية - تحتاج فائزين من الجولة السابقة
              const leftChild = match.left;
              const rightChild = match.right;
              return winners[leftChild] && winners[rightChild];
            }
          })();
          
          if (canPlay) {
            return { match, round: r, matchIndex: m };
          }
        }
      }
    }
    
    return null; // لا توجد مباريات متبقية
  };

  // دالة مساعدة للحصول على فهرس الفائز
  const getWinnerIndex = (matchKey) => {
    const tournamentData = JSON.parse(localStorage.getItem("tournamentData") || "{}");
    const winners = tournamentData.winners || {};
    const winnerSide = winners[matchKey];
    const parentMatch = matchMap[matchKey];
    
    if (winnerSide === 1) {
      return typeof parentMatch.left === "number" ? parentMatch.left : getWinnerIndex(parentMatch.left);
    } else {
      return typeof parentMatch.right === "number" ? parentMatch.right : getWinnerIndex(parentMatch.right);
    }
  };

  const startTournament = () => {
    const nextMatchInfo = findNextMatch();
    
    if (!nextMatchInfo) {
      // البطولة مكتملة - إظهار الفائز النهائي
      const tournamentData = JSON.parse(localStorage.getItem("tournamentData") || "{}");
      const winners = tournamentData.winners || {};
      const finalMatch = rounds[rounds.length - 1][0];
      
      if (winners[finalMatch.key]) {
        const winnerSide = winners[finalMatch.key];
        const leftTeam = typeof finalMatch.left === "number" ? finalMatch.left : getWinnerIndex(finalMatch.left);
        const rightTeam = typeof finalMatch.right === "number" ? finalMatch.right : getWinnerIndex(finalMatch.right);
        const championIndex = winnerSide === 1 ? leftTeam : rightTeam;
        const championName = teamNames[championIndex];
        
        alert(`🏆 تهانينا! البطولة مكتملة والفائز هو: ${championName}`);
      } else {
        alert("البطولة مكتملة!");
      }
      return;
    }
    
    const { match, round, matchIndex } = nextMatchInfo;
    
    // حفظ ترتيب الفرق الحالي في localStorage عند بدء المباراة
    const currentTournamentData = JSON.parse(localStorage.getItem("tournamentData") || "{}");
    currentTournamentData.teamNames = teamNames;
    localStorage.setItem("tournamentData", JSON.stringify(currentTournamentData));
    
    // تحديد أسماء الفرق
    const getTeamName = (node) => {
      if (typeof node === "number") {
        return teamNames[node];
      } else {
        // هذا فائز من مباراة سابقة
        const savedTournamentData = JSON.parse(localStorage.getItem("tournamentData") || "{}");
        const winners = savedTournamentData.winners || {};
        const winnerSide = winners[node];
        const parentMatch = matchMap[node];
        
        if (winnerSide === 1) {
          const leftTeam = typeof parentMatch.left === "number" ? parentMatch.left : getWinnerIndex(parentMatch.left);
          return teamNames[leftTeam];
        } else {
          const rightTeam = typeof parentMatch.right === "number" ? parentMatch.right : getWinnerIndex(parentMatch.right);
          return teamNames[rightTeam];
        }
      }
    };
    
    const team1Index = typeof match.left === "number" ? match.left : getWinnerIndex(match.left);
    const team2Index = typeof match.right === "number" ? match.right : getWinnerIndex(match.right);
    
    const matchData = {
      team1Name: getTeamName(match.left),
      team2Name: getTeamName(match.right),
      team1Index,
      team2Index,
      matchKey: match.key,
      round,
      matchIndex,
      tournamentName,
      totalTeams: N
    };
    
    // حفظ بيانات المباراة الحالية
    localStorage.setItem("currentTournamentMatch", JSON.stringify(matchData));
    
    // تحديث بيانات البطولة
    const tournamentData = JSON.parse(localStorage.getItem("tournamentData") || "{}");
    tournamentData.currentRound = round;
    tournamentData.currentMatch = matchIndex;
    tournamentData.currentMatchData = matchData;
    localStorage.setItem("tournamentData", JSON.stringify(tournamentData));
    
    
    // الانتقال لصفحة معلومات الفرق فوراً
    navigate("/OneCreateGame", { replace: true });
  };

  const simulateTournament = () => {
    if (running) {
      reset();
      runSequence();
      return;
    }
    runSequence();
  };

  // helpers to get labels (recursive)
  const getDisplayName = (node) => {
    if (typeof node === "number") {
      return teamNames[node];
    }
    
    // Check if we have winners data from localStorage
    const tournamentData = JSON.parse(localStorage.getItem("tournamentData") || "{}");
    const winners = tournamentData.winners || {};
    
    // If we have a winner name saved, use it
    if (winners[node]) {
      return winners[node];
    }
    
    // If we have winnerIndices, use team name
    if (winnerIndices[node] !== undefined && winnerIndices[node] !== null) {
      return teamNames[winnerIndices[node]];
    }
    
    // Check if this match has child matches that have winners
    const match = matchMap[node];
    if (match) {
      const leftChild = match.left;
      const rightChild = match.right;
      
      // Get names of potential participants
      let leftName = "";
      let rightName = "";
      
      if (typeof leftChild === "number") {
        leftName = teamNames[leftChild];
      } else if (winners[leftChild]) {
        leftName = winners[leftChild];
      }
      
      if (typeof rightChild === "number") {
        rightName = teamNames[rightChild];
      } else if (winners[rightChild]) {
        rightName = winners[rightChild];
      }
      
      // If both participants are known, show them
      if (leftName && rightName) {
        return `${leftName} vs ${rightName}`;
      }
      
      // If only one participant is known
      if (leftName && !rightName) {
        return `${leftName} vs ?`;
      }
      
      if (!leftName && rightName) {
        return `? vs ${rightName}`;
      }
    }
    
    // Default placeholder when no information is available
    return `في انتظار المتأهلين`;
  };

  const connectorActive = (childKey) => {
    // simple rule: mark connector active once that child match/team has produced a winner index
    if (typeof childKey === "number") {
      // leaf always considered available only after its immediate match decides - but we light child->parent when that child's match winner exists.
      // so return false (we highlight based on the child match winner presence).
      return false;
    }
    return Boolean(winnerIndices[childKey] !== undefined && winnerIndices[childKey] !== null);
  };

  // دالة مساعدة للحصول على فهرس الفريق من اسمه
  const getTeamIndexByName = (teamName) => {
    return teamNames.findIndex(name => name === teamName);
  };

  // دالة محسنة للحصول على فهرس الفائز من اسم الفائز
  const getWinnerIndexFromName = (matchKey, winnerName) => {
    const match = matchMap[matchKey];
    if (!match) return null;
    
    // للجولة الأولى، البحث مباشرة في أسماء الفرق
    if (match.round === 0) {
      return getTeamIndexByName(winnerName);
    }
    
    // للجولات التالية، البحث في الفائزين السابقين
    const tournamentData = JSON.parse(localStorage.getItem("tournamentData") || "{}");
    const winners = tournamentData.winners || {};
    
    // البحث في الفائزين من المباريات السابقة
    for (const [prevMatchKey, prevWinnerName] of Object.entries(winners)) {
      if (prevWinnerName === winnerName) {
        const prevMatch = matchMap[prevMatchKey];
        if (prevMatch && prevMatch.round === 0) {
          return getTeamIndexByName(winnerName);
        }
      }
    }
    
    return getTeamIndexByName(winnerName);
  };

  // تحميل بيانات البطولة من localStorage عند تحميل الصفحة
  useEffect(() => {
    if (hasLoadedData.current) return;
    
    const savedTournamentData = localStorage.getItem("tournamentData");
    if (savedTournamentData) {
      try {
        const tournamentData = JSON.parse(savedTournamentData);
        
        // تحديث أسماء الفرق إذا كانت محفوظة
        if (tournamentData.teamNames && Array.isArray(tournamentData.teamNames)) {
          setTeamNames(tournamentData.teamNames);
        }
        
        if (tournamentData.winners && Object.keys(tournamentData.winners).length > 0) {
          // تحديث matchWinners بناءً على أسماء الفائزين
          const newMatchWinners = {};
          const newWinnerIndices = {};
          
          Object.keys(tournamentData.winners).forEach(matchKey => {
            const winnerName = tournamentData.winners[matchKey];
            const match = matchMap[matchKey];
            
            if (match && winnerName) {
              // تحديد أي جانب فاز بناءً على اسم الفائز
              const getTeamNameForSide = (side) => {
                const node = side === 1 ? match.left : match.right;
                if (typeof node === "number") {
                  return tournamentData.teamNames ? tournamentData.teamNames[node] : teamNames[node];
                } else {
                  // البحث في الفائزين السابقين
                  return tournamentData.winners[node] || "";
                }
              };
              
              const leftTeamName = getTeamNameForSide(1);
              const rightTeamName = getTeamNameForSide(2);
              
              if (winnerName === leftTeamName) {
                newMatchWinners[matchKey] = 1;
              } else if (winnerName === rightTeamName) {
                newMatchWinners[matchKey] = 2;
              }
              
              // حفظ فهرس الفائز
              const winnerIndex = getWinnerIndexFromName(matchKey, winnerName);
              if (winnerIndex !== null && winnerIndex !== -1) {
                newWinnerIndices[matchKey] = winnerIndex;
              }
            }
          });
          
          setMatchWinners(newMatchWinners);
          setWinnerIndices(newWinnerIndices);
        }
        
        hasLoadedData.current = true;
      } catch (error) {
      }
    }
  }, [matchMap]);

  return (
    <div className="tournament-root" dir="rtl">
      <div className="containero">
        <h1 className="title">{tournamentName}</h1>
        <hr />
        <div className="subtitle-container">
          <h2 className="subtitle">
            اعادة تغيير الترتيب التنافسي للفرق
            <i 
              className="fa-solid fa-sync sync-icon" 
              onClick={shuffleTeams} 
              style={{ 
                cursor: 'pointer',
                marginRight: '10px',
                color: '#ff6b35',
                fontSize: '20px'
              }} 
              title="اضغط لإعادة ترتيب الفرق عشوائياً"
            ></i>
          </h2>
        </div>

        <div className="bracket-wrap">
          <svg
            className="svg-holder"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* === draw team rects (leaves) === */}
            {teamNames.map((t, i) => {
              const yCenter = (() => {
                // find leaf center: leaf centers were computed in useMemo (not exported) — recompute here (same logic)
                const rectHLocal = rectH;
                const verticalPadding = N === 16 ? 18 : 20;
                const baseY = 70;
                const leafSpacing = rectHLocal + verticalPadding;
                return baseY + i * leafSpacing;
              })();
              const xLeaf = x0;
              return (
                <g key={`team-${i}`}>
                  <rect
                    className={`team-rect`}
                    x={xLeaf}
                    y={yCenter - rectH / 2}
                    width={rectW}
                    height={rectH}
                    rx={10}
                    data-team-index={i}
                  />
                  <text
                    className="team-text"
                    x={xLeaf + rectW / 2}
                    y={yCenter + (rectH > 40 ? 8 : 6)}
                    textAnchor="middle"
                    style={{ fontSize: rectH > 48 ? 14 : 12 }}
                  >
                    {t}
                  </text>
                </g>
              );
            })}

            {/* === draw round matches rectangles and connectors === */}
            {rounds.map((row, r) =>
              row.map((match) => {
                const isFinal = r === rounds.length - 1;
                const leftIsNumber = typeof match.left === "number";
                const rightIsNumber = typeof match.right === "number";

                // child centers:
                const getChildCenter = (child) => {
                  if (typeof child === "number") {
                    const rectHLocal = rectH;
                    const verticalPadding = N === 16 ? 18 : 20;
                    const baseY = 70;
                    const leafSpacing = rectHLocal + verticalPadding;
                    return { x: x0, y: baseY + child * leafSpacing + 0 };
                  }
                  const childMatch = matchMap[child];
                  return { x: childMatch.x, y: childMatch.centerY };
                };

                const leftChildCenter = getChildCenter(match.left);
                const rightChildCenter = getChildCenter(match.right);
                const parentLeftX = match.x;
                const parentCenterY = match.centerY;

                const winnerForThisMatch = winnerIndices[match.key];
                const matchWinnerSide = matchWinners[match.key]; // 1 or 2

                // label (winner name or placeholder)
                // أولاً نتحقق من وجود فائز محفوظ في localStorage
                const tournamentData = JSON.parse(localStorage.getItem("tournamentData") || "{}");
                const winners = tournamentData.winners || {};
                
                const label = winners[match.key] 
                  ? winners[match.key] // اسم الفائز الحقيقي المحفوظ
                  : (winnerForThisMatch !== undefined && winnerForThisMatch !== null
                      ? teamNames[winnerForThisMatch]
                      : getDisplayName(match.key));

                return (
                  <g key={match.key}>
                    {/* connector from left child to parent */}
                    <path
                      d={`M ${leftChildCenter.x + rectW} ${leftChildCenter.y} C ${leftChildCenter.x + rectW + 40} ${leftChildCenter.y}, ${parentLeftX - 40} ${parentCenterY}, ${parentLeftX} ${parentCenterY}`}
                      className={`conn ${connectorActive(typeof match.left === "number" ? matchMap[`r0m${Math.floor(match.left/2)}`]?.key : match.left) ? "active" : ""}`}
                    />
                    {/* connector from right child to parent */}
                    <path
                      d={`M ${rightChildCenter.x + rectW} ${rightChildCenter.y} C ${rightChildCenter.x + rectW + 40} ${rightChildCenter.y}, ${parentLeftX - 40} ${parentCenterY}, ${parentLeftX} ${parentCenterY}`}
                      className={`conn ${connectorActive(typeof match.right === "number" ? matchMap[`r0m${Math.floor(match.right/2)}`]?.key : match.right) ? "active" : ""}`}
                    />

                    {/* parent rect */}
                    <rect
                      className={`${isFinal ? "final-rect" : "winner-rect"} ${winnerForThisMatch !== undefined ? "winner-box" : ""}`}
                      x={parentLeftX}
                      y={parentCenterY - (isFinal ? rectH + 10 : rectH / 2)}
                      width={isFinal ? rectW + 40 : rectW}
                      height={isFinal ? rectH + 20 : rectH}
                      rx={isFinal ? 12 : 10}
                    />
                    <text
                      className={isFinal ? "final-name" : "team-text"}
                      x={parentLeftX + (isFinal ? (rectW + 40) / 2 : rectW / 2)}
                      y={parentCenterY + (isFinal ? -45 : 6)}
                      textAnchor="middle"
                      style={{ fontSize: isFinal ? 15 : (rectH > 48 ? 14 : 12) }}
                    >
                      {label}
                    </text>

                    {/* trophy for final */}
                    {isFinal && (
                      <foreignObject x={parentLeftX + (rectW + 40) / 2 - 15} y={parentCenterY + (rectH + -75) / 2 - 7} width="30" height="30">
                        <i className="fa-solid fa-trophy" style={{ fontSize: '24px', color: 'orange' }}></i>
                      </foreignObject>
                    )}
                  </g>
                );
              })
            )}
          </svg>
        </div>

        <div className="controls">
          <button 
            className="start-btn" 
            onClick={startTournament}
            disabled={!findNextMatch()}
            style={!findNextMatch() ? { backgroundColor: '#ccc', cursor: 'not-allowed' } : {}}
          >
            {findNextMatch() ? "ابدأ المباراة التالية" : "البطولة مكتملة"}
          </button>
          <button
            className="start-btn"
            style={{ marginLeft: 12, background: "#888", boxShadow: "none" }}
            onClick={() => {
              reset();
              // مسح بيانات البطولة
              localStorage.removeItem("tournamentData");
              localStorage.removeItem("currentTournamentMatch");
            }}
          >
            إعادة تعيين البطولة
          </button>
        </div>
      </div>
    </div>
  );
}
