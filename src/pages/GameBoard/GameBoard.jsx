// GameBoard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const categories = [
  {
    id: 1,
    title: "نفط الكويت",
    img: "images/zGame_All_Pages-_3_-removebg-preview.png",
  },
  {
    id: 2,
    title: "House of the Dragon",
    img: "images/zGame_All_Pages-_3_-removebg-preview.png",
  },
  {
    id: 3,
    title: "دعایات",
    img: "images/zGame_All_Pages-_3_-removebg-preview.png",
  },
  {
    id: 4,
    title: "كنة الشام",
    img: "images/zGame_All_Pages-_3_-removebg-preview.png",
  },
  {
    id: 5,
    title: "مرور الكويت",
    img: "images/zGame_All_Pages-_3_-removebg-preview.png",
  },
  {
    id: 6,
    title: "مجمعات الكويت",
    img: "images/zGame_All_Pages-_3_-removebg-preview.png",
  },
];

const values = [20, 40, 60];

export default function GameBoard() {
  const [scoreLeft, setScoreLeft] = useState(0);
  const [scoreRight, setScoreRight] = useState(0);

  return (
    <div className="jeopardy-app">
      <div className="board">
        {categories.map((cat) => (
          <div className="category" key={cat.id}>
            <div className="col">
              {values.map((v) => (
                <div className="pill" key={v}>
                  <Link to={`/TheGame/${cat.id}/${v}`}>
                    <span className="value-text">{v}</span>
                  </Link>
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
                <div className="pill" key={v + "r"}>
                  <Link to={`/TheGame/${cat.id}/${v}`}>
                    <span className="value-text">{v}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="controls">
        <div className="team">
          <button className="name">فريق 1</button>
          <div className="score-box">
            <button
              className="minus"
              onClick={() => setScoreLeft(scoreLeft - 10)}
            >
              −
            </button>
            <div className="score">{scoreLeft}</div>
            <button
              className="plus"
              onClick={() => setScoreLeft(scoreLeft + 10)}
            >
              +
            </button>
          </div>
          <div className="helpers-inline">
            <h3>وسائل المساعدة</h3>
            <div className="icons">
              <div className="icon icon-colored">
                <i className="fas fa-sync-alt"></i>
              </div>
              <div className="icon icon-disabled">
                <i className="fas fa-phone"></i>
              </div>
              <div className="icon icon-disabled">
                <i className="fas fa-hand-peace"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="team team-right">
          <button className="name">فريق 2</button>
          <div className="score-box">
            <button
              className="minus"
              onClick={() => setScoreRight(scoreRight - 10)}
            >
              −
            </button>
            <div className="score">{scoreRight}</div>
            <button
              className="plus"
              onClick={() => setScoreRight(scoreRight + 10)}
            >
              +
            </button>
          </div>
          <div className="helpers-inline">
            <h3>وسائل المساعدة</h3>
            <div className="icons">
              <div className="icon icon-colored">
                <i className="fas fa-sync-alt"></i>
              </div>
              <div className="icon icon-disabled">
                <i className="fas fa-phone"></i>
              </div>
              <div className="icon icon-disabled">
                <i className="fas fa-hand-peace"></i>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
