"use client";

import React from "react";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { create } from 'zustand';
import { useModalStore } from "./useModalStore";
import ConfirmModal from "./ConfirmModal";

type Log = { content: string; timestamp: string };
type State = {
  logs: Log[];
  fetchLogs: () => Promise<void>;
};

export const useLogStore = create<State>((set) => ({
  logs: [],
  fetchLogs: async () => {
    const res = await fetch('/api/logs');
    const data = await res.json();
    set({ logs: data.logs });
  }
}));

const addLog = async (content: string) => {
  await fetch('/api/logs', {
    method: 'POST',
    body: JSON.stringify({ content }),
    headers: { 'Content-Type': 'application/json' },
  });
  await useLogStore.getState().fetchLogs(); // refresh logs after insertion
};

const LabPage: React.FC = () => {
  const { currentModal, openModal } = useModalStore();
  const [waitingTimer, setWaitingTimer] = useState(true);
  
  useEffect(() => {
    useLogStore.getState().fetchLogs();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.background} />

      {/* 상단 UI 버튼 영역 */}
      <div className={styles.topBar}>
        <button className={styles.uiButton} onClick={() => openModal("report")}>보고서</button>
        <button className={styles.uiButton} onClick={() => openModal("log")}>성장기록</button>
        <button className={styles.uiButton} onClick={() => openModal("quest")}>퀘스트</button>
      </div>

      {currentModal === "confirm" && <ConfirmModal />}
      {/* {currentModal === "report" && <ReportModal />} */}
      {/* {currentModal === "log" && <LogModal />} */}
      {/* {currentModal === "quest" && <QuestModal />} */}

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
