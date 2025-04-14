import { useLevelStore } from "@/stores/useLevelStore";
import { reports } from "./reportData";
import ModalBase from "./ModalBase";
import { useModalStore } from "@/stores/useModalStore";
import styles from "./Modal.module.css";

const ReportModal: React.FC = () => {
  const onRequestClose = useModalStore((s) => s.closeModal);
  const { level, loading } = useLevelStore();

  const report = typeof level === "number"
  ? reports.find((r) => r.id === level)
  : reports.find((r) => r.id === 99);

  return (
    <ModalBase onRequestClose={onRequestClose}>
      {() => (
        <div className={styles.reportPaper}>
          {loading && <p>로딩 중...</p>}
          {!loading && report && (
            <>
              <h2>{report.title}</h2>
              <ul>
                {report.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </>
          )}
          {!loading && !report && <p>보고서를 찾을 수 없습니다.</p>}
        </div>
      )}
    </ModalBase>
  );
};

export default ReportModal;