"use client";

import React from "react";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useModalStore } from "@/stores/useModalStore";
import { useLevelStore } from "@/stores/useLevelStore";
import { useLogStore } from "@/stores/useLogStore";
import { clearQuestCookies } from "@/lib/clearQuestCookies";
import { levelQuestMap } from "./QuestMap";

/** Modals */
import ConfirmModal from "./ConfirmModal";
import ReportModal from "./ReportModal";
import GrowthLogModal from "./GrowthLogModal";
import QuestModal from "./QuestModal";
import CompleteModal from "./CompleteModal";
import { useQuestStore } from "@/stores/useQuestStore";

function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(1, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

const LabPage: React.FC = () => {
  const { quests } = useQuestStore();
  const { currentModal, openModal } = useModalStore();
  const { level, loading } = useLevelStore();
  const [waitingTimer, setWaitingTimer] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [allDailyQuestsCompleted, setAllDailyQuestsCompleted] = useState<boolean>(false);

  useEffect(() => {
    useLevelStore.getState().fetchLevel();
    useModalStore.getState().closeModal();
    clearQuestCookies(); // 퀘스트 쿠키 초기화
    useLogStore.getState().fetchLogs();
    useQuestStore.getState().fetchQuests();
  }, []);

  useEffect(() => {
    if (typeof level === "number") {
      const requiredIds = levelQuestMap[level] || [];
      const requiredQuests = quests.filter((q) => requiredIds.includes(q.id));
      const allCompleted = requiredQuests.every((q) => q.count >= q.goal);
      setAllDailyQuestsCompleted(allCompleted);
    }
  }, [level, quests]);

  const isExperimentEnded = typeof level === "number" && level >= 4;
  const isUiDisabled = typeof level === "number" && level === 99;

  useEffect(() => {
    if (!loading && typeof level === "number" && level > 0) {
      fetch(`/api/progress?level=${level}`)
        .then((res) => res.json())
        .then((data) => {
          const target = new Date(data.time).getTime(); // 목표 시간
          const now = Date.now();

          const remaining = Math.max(0, Math.floor((target - now) / 1000));
          setRemainingSeconds(remaining);
          setWaitingTimer(remaining > 0);
        })
        .catch(() => {
          setRemainingSeconds(null);
          setWaitingTimer(true);
        });
    }
  }, [level, loading]);

  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          setWaitingTimer(false);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  const timerText =
  loading || remainingSeconds === null
    ? "남은 시간 계산 중"
    : remainingSeconds > 0
    ? formatSeconds(remainingSeconds)
    : level === 4
    ? "실험 완료하기"
    : level === 99
    ? "실험 종료됨"
    : "성장 시키기";

  const isReady =
    remainingSeconds !== null &&
    remainingSeconds <= 0 &&
    allDailyQuestsCompleted;

  const timerStateClass = isReady && !isUiDisabled ? styles.running : styles.waiting;
  return (
    <div className={styles.container}>
      <div className={styles.background} />

      {/* 상단 UI 버튼 영역 */}
      <div className={styles.topBar}>
        <button className={`${styles.uiButton} ${isUiDisabled ? styles.disabled : ''}`} disabled={isUiDisabled} onClick={() => openModal("report")}>보고서</button>
        <button className={styles.uiButton} onClick={() => openModal("log")}>성장기록</button>
        <button className={`${styles.uiButton} ${isUiDisabled ? styles.disabled : ''}`} disabled={isUiDisabled} onClick={() => openModal("quest")}>퀘스트</button>
      </div>

      {currentModal === "confirm" && <ConfirmModal />}
      {currentModal === "report" && <ReportModal />}
      {currentModal === "log" && <GrowthLogModal />}
      {currentModal === "quest" && <QuestModal />}
      {currentModal === "complete" && <CompleteModal />}

      {/* 중앙 Lottie 애니메이션 영역 (클릭/터치 이벤트 포함) */}
      <div className={styles.centerArea}>
        <div
          className={styles.lottieContainer}
        >
          {loading || typeof level !== "number" ? (
            <div className={styles.dotLoader}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          ) : level===0 ? 
          <div></div>
          : level>0 && level<=4 ? (
            <video
              className={styles.lottieVideo}
              src={`/level_${level}.mp4`}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: 'auto' }}
              onError={(e) => {
                console.error("Video load error", e);
              }}
              onLoadedData={() => {
                console.log("Video loaded successfully");
              }}
            />
          ): (<>부아뜨가 이곳을 떠났습니다.</>)}
        </div>
      </div>

      {/* 하단 Round Timer 버튼 영역 */}
      <div className={styles.bottomBar}>
        <button
          className={`${styles.roundTimerButton} ${timerStateClass}`}
          disabled={!isReady || isUiDisabled}
          onClick={() => {
            console.log(isExperimentEnded, isReady, level); 
            if (isExperimentEnded) {
              console.log("실험이 종료되었습니다.");
              openModal("complete");
            } else if (isReady && typeof level === "number" && level < 4) {
              openModal("confirm");
            }
          }}
        >
          {timerText}
        </button>
      </div>
    </div>
  );
};

export default LabPage;
