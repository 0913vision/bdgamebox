import React, { useState } from "react";
import ModalBase from "./ModalBase";
import { useModalStore } from "@/stores/useModalStore";
import { useLevelStore } from "@/stores/useLevelStore";
import styles from "./Modal.module.css";
import { useRouter } from "next/navigation";

const CompleteModal: React.FC = () => {
  const closeModal = useModalStore((s) => s.closeModal);
  const { level, fetchLevel } = useLevelStore();
  const router = useRouter();

  const handleFirstConfirm = async () => {
    // 레벨을 99로 업데이트
    await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: 99 }),
    });
    await fetchLevel(); // 레벨 업데이트
  };

  const handleFinalConfirm = () => {
    closeModal();
    router.push("/lab"); // 다시 lab으로 이동 (또는 새로고침)
  };

  return (
    <ModalBase onRequestClose={closeModal}>
      {() =>
        level === 99 ? (
          <>
            <h2 className={styles.modalTitle}>
              "부아뜨"의 실험을 마쳤습니다. 연구실 동료가 부아뜨를 수거하였습니다.
              <br />
              연구실 동료에게 연락하여 "부아뜨"의 정체를 확인해보세요.
            </h2>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.modalActionButton} ${styles.modalYes}`}
                onClick={handleFinalConfirm}
              >
                확인했습니다
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className={styles.modalTitle}>
              부아뜨의 성장이 끝났습니다. 실험을 마칠까요?
            </h2>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.modalActionButton} ${styles.modalNo}`}
                onClick={closeModal}
              >
                아니오
              </button>
              <button
                className={`${styles.modalActionButton} ${styles.modalYes}`}
                onClick={handleFirstConfirm}
              >
                예
              </button>
            </div>
          </>
        )
      }
    </ModalBase>
  );
};

export default CompleteModal;
