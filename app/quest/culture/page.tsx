"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const GRACE_RANGE = 5;

const CultureQuestPage = () => {
  const router = useRouter();
  const [fillValues, setFillValues] = useState([0, 0, 0]);
  const [targets, setTargets] = useState<number[]>([]);
  const [phase, setPhase] = useState<"fill" | "switch" | "progress" | "done">("fill");
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const decayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdRef = useRef<NodeJS.Timeout | null>(null);
  const [switchOn, setSwitchOn] = useState(false);

  const elementSymbols = ["N", "Ca", "Fe"];
  const colors = ["#1e90ff", "#4caf50", "#ff5722"];

  useEffect(() => {
    setTargets(Array.from({ length: 3 }, () => Math.floor(Math.random() * 81) + 10));
  }, []);

  useEffect(() => {
    if (phase === "progress") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setPhase("done");
            return 100;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const isInRange = (val: number, target: number) =>
    Math.abs(val - target) <= GRACE_RANGE;

  const allInRange = () =>
    fillValues.every((val, i) => isInRange(val, targets[i]));

  const startFill = (index: number) => {
    if (phase !== "fill") return;
    if (decayIntervalRef.current) {
      clearInterval(decayIntervalRef.current);
      decayIntervalRef.current = null;
    }
    holdRef.current = setInterval(() => {
      setFillValues((prev) =>
        prev.map((v, i) => (i === index ? Math.min(100, v + 1) : v))
      );
    }, 100);
  };

  const stopFill = () => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  
    // 🔒 decay 중복 방지
    if (decayIntervalRef.current) {
      clearInterval(decayIntervalRef.current);
    }
  
    decayIntervalRef.current = setInterval(() => {
      setFillValues((prev) => prev.map((v) => Math.max(0, v - 0.1)));
    }, 200);
  };

  const handleProceed = () => setPhase("switch");
  const handleSwitch = () => setPhase("progress");

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/quest", {
        method: "POST",
        body: JSON.stringify({ slug: "culture" }),
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
      <div className={styles.backButton} onClick={() => router.replace("/lab")}>
        ← 실험실로 돌아가기
      </div>
      <div className={styles.background} />
      <div className={styles.gamePanel}>
        {phase === "fill" && (
          <>
            <h2 className={styles.title}>배양액을 조건에 맞게 준비</h2>
            <div className={styles.rangeInfo}>
              {targets.map((t, i) => (
                <div key={i}>
                  {elementSymbols[i]}: {t - GRACE_RANGE} ~ {t + GRACE_RANGE}
                </div>
              ))}
            </div>
            <div className={styles.tubeRow}>
              {fillValues.map((val, i) => (
                <div key={i} className={styles.tubeColumn}>
                  <div className={styles.valueText}>{val.toFixed(0)}</div>
                  <div
                    className={styles.testTube}
                    onPointerDown={() => startFill(i)}
                    onPointerUp={stopFill}
                    onPointerLeave={stopFill}
                    onPointerCancel={stopFill}
                  >
                    <div
                      className={styles.fillFluid}
                      style={{ height: `${val}%`, background: colors[i] }}
                    />
                  </div>
                  <div className={styles.symbolText}>{elementSymbols[i]}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#888" }}>
              ※ 기구 노후로 용액이 조금씩 줄어드니 주의
            </div>
            <button
              className={styles.submitButton}
              disabled={!allInRange()}
              onClick={handleProceed}
            >
              배양 시작
            </button>
          </>
        )}

        {phase === "switch" && (
          <>
            <h2 className={styles.title}>배양기 가동</h2>
            <div className={styles.switchContainer}>
              <div 
                className={`${styles.switchBox} ${switchOn ? styles.switchOn : ""}`}
                onPointerDown={(e) => {
                  if (switchOn || phase !== "switch") return;

                  const startY = e.clientY;

                  const move = (ev: PointerEvent) => {
                    const delta = startY - ev.clientY;
                    if (delta > 30) {
                      setSwitchOn(true);
                      window.removeEventListener("pointermove", move);
                      window.removeEventListener("pointerup", up);
                      setTimeout(() => setPhase("progress"), 500);
                    }
                  };

                  const up = () => {
                    window.removeEventListener("pointermove", move);
                    window.removeEventListener("pointerup", up);
                  };

                  window.addEventListener("pointermove", move);
                  window.addEventListener("pointerup", up);
                }}
              >
                <div
                  className={styles.switchHandle}
                  style={{ bottom: switchOn ? "75%" : "0%" }}
                />
                <div className={styles.switchFrontLine} />
              </div>
            </div>
          </>
        )}

        {phase === "progress" && (
          <>
            <h2 className={styles.title}>가동 중...</h2>
            <div className={styles.progressOuter}>
              <div
                className={styles.progressInner}
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}

        {phase === "done" && (
          <>
            <h2 className={styles.title}>배양 시작 완료</h2>
            <button
              className={styles.submitButton}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "처리 중..." : "인수인계"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CultureQuestPage;
