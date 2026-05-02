import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/input");
  };

  return (
    <div className="home-container">
      <div className="circle circle-green"></div>
      <div className="circle circle-purple"></div>
      <div className="circle circle-pink"></div>
      <div className="wave-shape"></div>
      <div className="sparkle">✦</div>

      <div className="home-card">
        <h1>
          체형 분석 기반
          <br />
          스타일 추천 시스템
        </h1>

        <button className="start-button" onClick={handleStart}>
          시작하기
        </button>
      </div>
    </div>
  );
}

export default Home;