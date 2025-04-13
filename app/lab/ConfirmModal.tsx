import React from "react";
import ModalBase from "./ModalBase";
import { useModalStore } from "./useModalStore";
import styles from "./Modal.module.css";

const ConfirmModal: React.FC = () => {
  const onRequestClose = useModalStore((s) => s.closeModal);

  return (
    <ModalBase onRequestClose={onRequestClose}>
      {(close) => (
        <>
          <h2 style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold' }}>
            정말로 시작하시겠습니까?
          </h2>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.modalActionButton} ${styles.modalNo}`}
              onClick={close}
            >
              아니오
            </button>
            <button className={`${styles.modalActionButton} ${styles.modalYes}`}>
              예
            </button>
            
          </div>
        </>
      )}
    </ModalBase>

  );
};

export default ConfirmModal;
