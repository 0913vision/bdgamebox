import React from 'react';
import styles from './Modal.module.css';
import { useEffect, useState } from 'react';

type Props = {
  onRequestClose: () => void;
  children: (close: () => void) => React.ReactNode;
};

const ModalBase: React.FC<Props> = ({ onRequestClose, children }) => {
  const [closing, setClosing] = useState(false);

  const closeWithAnimation = () => {
    setClosing(true);
  };

  useEffect(() => {
    if (closing) {
      const timer = setTimeout(() => {
        onRequestClose();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [closing, onRequestClose]);

  return (
    <div
      className={`${styles.modalOverlay} ${closing ? styles.fadeOut : ""}`}
      onClick={closeWithAnimation}
    >
      <div
        className={`${styles.modalBox} ${closing ? styles.scaleOut : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.modalCloseButton} onClick={closeWithAnimation}>
          X
        </button>
        {children(closeWithAnimation)}
      </div>
    </div>
  );
};

export default ModalBase;