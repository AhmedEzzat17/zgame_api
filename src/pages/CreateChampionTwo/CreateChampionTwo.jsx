import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSync } from "react-icons/fa";

export default function CreateChampionTwo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tournamentName, teamNames: incomingTeamNames, selectedTeams } = location.state || {};

  // safety/fallbacks
  const N = selectedTeams || 4;
  const teamNames = useMemo(() => {
    const arr = Array.isArray(incomingTeamNames) ? incomingTeamNames.slice(0, N) : [];
    // fill placeholders if missing
    while (arr.length < N) arr.push(`الفريق ${arr.length + 1}`);
    return arr;
  }, [incomingTeamNames, N]);

  // State that records winners: mapping matchKey -> side (1 or 2)
  const [matchWinners, setMatchWinners] = useState({}); // e.g. { 'r0m0': 1, 'r1m0': 2, ... }
  const [winnerIndices, setWinnerIndices] = useState({}); // e.g. { 'r0m0': 0, ... } (original team index)
  const [running, setRunning] = useState(false);
  const [champ, setChamp] = useState(null);

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
  }, [N]);

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

  const startTournament = () => {
    if (running) {
      reset();
      setTimeout(() => runSequence(), 250);
      return;
    }
    runSequence();
  };

  // helpers to get labels (recursive)
  const getLabelForNode = (node) => {
    if (typeof node === "number") {
      return teamNames[node] || `الفريق ${node + 1}`;
    }
    // node is match key:
    if (winnerIndices[node] !== undefined && winnerIndices[node] !== null) {
      return teamNames[winnerIndices[node]];
    }
    // otherwise return placeholder "الفائز من X و Y"
    const match = matchMap[node];
    if (!match) return "الفائز";
    const left = match.left;
    const right = match.right;
    const leftLabel = typeof left === "number" ? teamNames[left] : getLabelForNode(left);
    const rightLabel = typeof right === "number" ? teamNames[right] : getLabelForNode(right);
    return `الفائز من الفريقين`;
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

  return (
    <div className="tournament-root" dir="rtl">
      <div className="containero">
        <h1 className="title">{tournamentName}</h1>
        <hr />
        <div className="subtitle-container">
          <h2 className="subtitle">
            اعادة تغيير الترتيب التنافسي للفرق
            <FaSync className="sync-icon" />
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
                const label = winnerForThisMatch !== undefined && winnerForThisMatch !== null
                  ? teamNames[winnerForThisMatch]
                  : getLabelForNode(match.key);

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
                      <text className="trophy" x={parentLeftX + (rectW + 40) / 2} y={parentCenterY + (rectH + -75) / 2 + 8} textAnchor="middle">
                        {champ === null ? "🏆" : "🏆"}
                      </text>
                    )}
                  </g>
                );
              })
            )}
          </svg>
        </div>

        <div className="controls">
          <Link to="/OneCreateGame">
          <button className="start-btn" onClick={startTournament}>
            {running ? "إعادة تشغيل" : "ابدأ البطولة"}
          </button>
          </Link>
          <button
            className="start-btn"
            style={{ marginLeft: 12, background: "#888", boxShadow: "none" }}
            onClick={() => {
              reset();
            }}
          >
            إعادة تعيين
          </button>
        </div>
      </div>
    </div>
  );
}
