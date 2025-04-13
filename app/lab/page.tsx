"use client";

import React from "react";
import { useState } from "react";
import styles from "./page.module.css";

const LabPage: React.FC = () => {
  const [waitingTimer, setWaitingTimer] = useState(true); // "waiting", "running", "paused"
  return (
    <div className={styles.container}>
      {/* 고정 배경 */}
      <div className={styles.background} />

      {/* 상단 UI 버튼 영역 */}
      <div className={styles.topBar}>
        <button className={styles.uiButton}>상태</button>
        <button className={styles.uiButton}>성장기록</button>
        <button className={styles.uiButton}>퀘스트</button>
      </div>

      {/* 중앙 Lottie 애니메이션 영역 (클릭/터치 이벤트 포함) */}
      <div className={styles.centerArea}>
        <div
          className={styles.lottieContainer}
          onClick={() => console.log("Lottie 애니메이션 클릭됨")}
        >
          {/* 실제 Lottie 컴포넌트를 사용하려면 아래 주석 참조 */}
          {/* <Lottie animationData={yourAnimationData} onClick={handleAnimationClick} /> */}
          Lottie Animation
        </div>
      </div>

      {/* 하단 Round Timer 버튼 영역 */}
      <div className={styles.bottomBar}>
        <button className={`${styles.roundTimerButton} ${!waitingTimer ? styles.waiting : styles.running}`}>
          00:00
        </button>
      </div>
    </div>
  );
};

export default LabPage;
