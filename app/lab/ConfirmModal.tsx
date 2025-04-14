import React from "react";
import ModalBase from "./ModalBase";
import { useModalStore } from "@/stores/useModalStore";
import { useLevelStore } from "@/stores/useLevelStore";
import styles from "./Modal.module.css";
import { useRouter } from "next/navigation";
import { logMessages } from "./logData";


const ConfirmModal: React.FC = () => {
  const { level, loading } = useLevelStore();
  const closeModal = useModalStore((s) => s.closeModal);
  const router = useRouter();

  const handleConfirm = async () => {
    const currentLevel = Number(level);
    if (isNaN(currentLevel)) {
      console.error("Invalid level: must be a number");
      return;
    }
    const content = logMessages[currentLevel] ?? "부아뜨가 성장했습니다.";

    // 1. 로그 삽입
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    // 2. 레벨 증가
    await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: currentLevel + 1 }),
    });

    // 3. 퀘스트 초기화
    await fetch("/api/quest/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    // 4. 새로고침
    window.location.href = "/lab";
  };

  return (
    <ModalBase onRequestClose={closeModal}>
      {(close) => (
        <>
          <h2 className={styles.modalTitle}>
            성장준비가 되었습니다.<br/>"부아뜨"를 성장시킬까요?
          </h2>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.modalActionButton} ${styles.modalNo}`}
              onClick={close}
            >
              아니오
            </button>
            <button
              className={`${styles.modalActionButton} ${styles.modalYes}`}
              onClick={handleConfirm}
            >
              예
            </button>
          </div>
        </>
      )}
    </ModalBase>
  );
};

export default ConfirmModal;
