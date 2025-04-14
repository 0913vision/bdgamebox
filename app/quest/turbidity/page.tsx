"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

const TurbidityQuestPage = () => {
  const router = useRouter();

  const [phase, setPhase] = useState<"collect" | "switch" | "analyzing" | "done">("collect");
  const [fill, setFill] = useState(0);
  const [switches, setSwitches] = useState([false, false, false, false, false, false]);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const holdRef = useRef<NodeJS.Timeout | null>(null);

  // 🧪 Sample Collection Hold Logic
  const startHold = () => {
    if (phase !== "collect") return;
    holdRef.current = setInterval(() => {
      setFill((prev) => {
        const next = Math.min(100, prev + 1);
        if (next >= 100) clearHold();
        return next;
      });
    }, 20);
  };

  const clearHold = () => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  };

  const stopHold = () => {
    clearHold();
    if (fill < 100 && phase === "collect") {
      const decay = setInterval(() => {
        setFill((prev) => {
          if (prev <= 0) {
            clearInterval(decay);
            return 0;
          }
          return prev - 2;
        });
      }, 20);
    }
  };

  // 🔬 Phase transition
  useEffect(() => {
    if (fill >= 100 && phase === "collect") {
      setTimeout(() => setPhase("switch"), 500);
    }
  }, [fill, phase]);

  useEffect(() => {
    if (phase === "switch" && switches.every((s) => s)) {
      setTimeout(() => setPhase("analyzing"), 500);
    }
  }, [switches, phase]);

  useEffect(() => {
    if (phase === "analyzing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase("done"), 300);
            return 100;
          }
          return prev + 1;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // ✅ Submit Handler
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/quest", {
        method: "POST",
        body: JSON.stringify({ slug: "turbidity" }),
        headers: { "Content-Type": "application/json" },
      });
      router.replace("/lab");
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background} />
      <div className={styles.gamePanel}>
        {(phase === "collect" || phase === "switch") && (
          <>
            <div className={styles.barWrap}>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${fill}%` }} />
              </div>
              {(phase === "collect") && (
                <button
                  className={styles.holdButton}
                  onPointerDown={startHold}
                  onPointerUp={stopHold}
                  onPointerLeave={stopHold}
                  onPointerCancel={stopHold}
                >
                  꾹 눌러서 샘플 수집
                </button>
              )}              
            </div>
          </>
        )}

        {(phase === "switch") && (
          <div className={styles.switchContainer}>
            <div className={styles.switchRow}>
              {switches.map((on, i) => (
                <div
                  key={i}
                  className={styles.switchBox}
                  style={{ backgroundColor: on ? "#4caf50" : "#d32f2f" }}
                  onPointerDown={(e) => {
                    if (!switches[i] && phase === "switch") {
                      const box = e.currentTarget.getBoundingClientRect();
                      const startY = e.clientY;
                      const move = (ev: PointerEvent) => {
                        const delta = startY - ev.clientY;
                        if (delta > 30) {
                          setSwitches((prev) =>
                            prev.map((v, j) => (j === i ? true : v))
                          );
                          window.removeEventListener("pointermove", move);
                          window.removeEventListener("pointerup", up);
                        }
                      };
                      const up = () => {
                        window.removeEventListener("pointermove", move);
                        window.removeEventListener("pointerup", up);
                      };
                      window.addEventListener("pointermove", move);
                      window.addEventListener("pointerup", up);
                    }
                  }}
                >
                  <div
                    className={styles.switchHandle}
                    style={{ bottom: on ? "80%" : "5%" }}
                  />
                </div>
              ))}
            </div>
            {(phase === "switch") && (
              <div className={styles.switchText}>
                스위치를 올려 분석기 활성화
              </div>
            )}
          </div>
        )}

        {(phase === "analyzing" || phase === "done") && (
          <>
            <h2 className={styles.title}>{phase === "analyzing" ? "분석 중..." : "탁도 측정완료!"}</h2>
            <div className={styles.progressOuter}>
              <div
          className={styles.progressInner}
          style={{ width: `${phase === "analyzing" ? progress : 100}%` }}
              />
            </div>
            <button
              className={styles.submitButton}
              onClick={phase === "done" ? handleSubmit : undefined}
              disabled={phase === "analyzing" || submitting}
            >
              {phase === "analyzing"
          ? "제출하기"
          : submitting
          ? "제출 중..."
          : "제출하기"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TurbidityQuestPage;
