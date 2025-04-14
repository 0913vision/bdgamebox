import React, { useEffect } from "react";
import ModalBase from "./ModalBase";
import { useModalStore } from "@/stores/useModalStore";
import { useLogStore } from "@/stores/useLogStore";
import styles from "./Modal.module.css";

// 추가 로그 작성 함수 (원래 page.tsx에 있던 것)
const addLog = async (content: string) => {
  await fetch("/api/logs", {
    method: "POST",
    body: JSON.stringify({ content }),
    headers: { "Content-Type": "application/json" },
  });
  await useLogStore.getState().fetchLogs(); // 추가 후 즉시 갱신
};

const formatTimestamp = (ts: string) => {
  const date = new Date(ts);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const GrowthLogModal: React.FC = () => {
  const onRequestClose = useModalStore((s) => s.closeModal);
  const { logs, fetchLogs } = useLogStore();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <ModalBase onRequestClose={onRequestClose}>
      {() => (
        <div className={styles.growthLogContainer}>
          <div className={styles.logHintMessage}>
            성장기록은 최신 항목부터 표시됩니다.
          </div>
          {logs.length === 0 ? (
            <div className={styles.logHintMessage}>
              아직 등록된 성장기록이 없습니다.
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={styles.growthLogCard}>
                <div className={styles.timestamp}>{formatTimestamp(log.timestamp)}</div>
                <div className={styles.logContent}>{log.content}</div>
              </div>
            ))
          )}
        </div>
      )}
    </ModalBase>
  );
};

export default GrowthLogModal;
