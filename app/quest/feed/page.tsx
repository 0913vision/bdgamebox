"use client";

import React, { useEffect, useState, useRef, use } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
const DELTA = 1;
const GRACE_RANGE = 7;

const FeedQuestPage = () => {
  const router = useRouter();
  const [values, setValues] = useState([0, 0, 0]);
  const [topBars, setTopBars] = useState<number[]>([]);
  const [percent, setPercent] = useState(0);
  const [targets, setTargets] = useState([0, 0, 0]);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  // 실제 % 계산 로직 (placeholder)
  useEffect(() => {  
    const percent = computePercent(values, targets);
    setPercent(percent);
  }, [...values, ...targets]);
  
  useEffect(() => {
    const newBars = Array.from({ length: 15 }, () => {
      if (percent === 100) return 100;
      const offset = Math.floor(Math.random() * 30 - 15);
      return Math.min(100, Math.max(0, percent + offset));
    });
    setTopBars(newBars);
  }, [percent]);

  useEffect(() => {
    const newTargets = Array.from({ length: 3 }, () =>
      Math.floor(Math.random() * 41 + 50) // 50~90 사이 적정값
    );
    setTargets(newTargets);
  }, []);

  const startHolding = (index: number, delta: number) => {
    if (isHoldingRef.current) return; // 중복 방지
  
    isHoldingRef.current = true;
    adjustValue(index, delta);
  
    holdIntervalRef.current = setInterval(() => {
      adjustValue(index, delta);
    }, 50);
  };
  
  const stopHolding = () => {
    isHoldingRef.current = false;
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const adjustValue = (index: number, delta: number) => {
    setValues((prev) =>
      prev.map((v, i) =>
        i === index ? Math.max(0, Math.min(100, v + delta)) : v
      )
    );
  };

  const computePercent = (values: number[], targets: number[]) => {
    const scores = values.map((val, i) => {
      const diff = Math.abs(val - targets[i]);
      if (diff <= GRACE_RANGE) return 1; // 정답 범위 내면 full 점수
  
      const maxError = 100 - GRACE_RANGE;
      const norm = Math.min(1, (diff - GRACE_RANGE) / maxError);
  
      // 개별 점수: 극적으로 깎기 위해 지수/제곱 적용
      return Math.max(0, 1 - Math.pow(norm, 2)); // or exp(-k * norm)
    });
  
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avgScore * 100);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: "feed" }),
      });
  
      const data = await res.json();
      console.log("제출 성공:", data);
  
      router.replace("/lab");
    } catch (err) {
      console.error("제출 실패:", err);
      setSubmitting(false); // 실패 시 버튼 다시 활성화
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background} />

      <div className={styles.gamePanel}>
        <div className={styles.topSection}>
          <div className={styles.monitorBox}>
            <div className={styles.percent}>{percent}<span>%</span></div>
            <div className={styles.visualBars}>
              {topBars.map((h, i) => (
                <div key={i} className={styles.visualBar} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.controlSection}>
          {values.map((val, index) => (
            <div key={index} className={styles.controlColumn}>
              <div className={styles.labelText}>
                {["A", "B", "C"][index]}
              </div>
              <div className={styles.fillBarContainer}>
                <div className={styles.fillBar} style={{ height: `${val}%` }} />
              </div>
              <button
                className={styles.triangleButton}
                onPointerDown={() => startHolding(index, +DELTA)}
                onPointerUp={stopHolding}
                onPointerLeave={stopHolding}
                onPointerCancel={stopHolding}
              >
                <svg viewBox="0 0 24 24"><path d="M12 6l-8 12h16z" /></svg>
              </button>
              <button
                className={styles.triangleButton}
                onPointerDown={() => startHolding(index, -DELTA)}
                onPointerUp={stopHolding}
                onPointerLeave={stopHolding}
                onPointerCancel={stopHolding}
              >
                <svg
                  viewBox="0 0 24 24"
                  style={{ transform: "rotate(180deg)" }}
                >
                  <path d="M12 6l-8 12h16z" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button
          className={styles.submitButton}
          disabled={percent !== 100 || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "로딩 중..." : "제출하기"}
        </button>
      </div>
    </div>
  );
};

export default FeedQuestPage;
