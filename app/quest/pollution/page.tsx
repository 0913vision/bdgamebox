"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

type Pollutant = {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  angularVelocity: number;
  isRemoving?: boolean;
};


export default function PollutionQuestPage() {
  const router = useRouter();
  const [pollutants, setPollutants] = useState<Pollutant[]>([]);
  const [removedCount, setRemovedCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const removedSet = useRef<Set<string>>(new Set());

  function generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  

  // 오염물질 이동 루프
  useEffect(() => {
    let animation: number;

    const loop = () => {
      if (removedCount >= 5) return;
      setPollutants((prev) =>
        prev
          .map((p) => 
            p.isRemoving
              ? p
              : {
                ...p,
                x: p.x - p.speed,
                rotation: p.rotation + p.angularVelocity,
              }
          )
          .filter((p) => p.x + p.size > 0)
      );
      animation = requestAnimationFrame(loop);
    };

    animation = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animation);
  }, [removedCount]);

  // 오염물질 생성기
  useEffect(() => {
    const interval = setInterval(() => {
      const id = generateId();
      setPollutants((prev) => {
        if (removedCount >= 5 || prev.length >= 5) return prev;
        return [
          ...prev,
          {
            id,
            x: 100,
            y: Math.random() * 80 + 5, // % 단위 위치
            size: Math.random() * 10 + 5, // vw 단위
            speed: Math.random() * 0.3 + 0.15,
            rotation: Math.random() * 360,
            angularVelocity: Math.random() * 0.5 + 0.5, // deg/frame
          },
      ]});
    }, 1700);
    return () => clearInterval(interval);
  }, [removedCount]);

  // 오염 제거
  const remove = (id: string) => {
    if (removedSet.current.has(id)) return;
    removedSet.current.add(id);
  
    setPollutants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isRemoving: true } : p))
    );
  
    setTimeout(() => {
      setPollutants((prev) => prev.filter((p) => p.id !== id));
      setRemovedCount((c) => c + 1);
    }, 300);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: "pollution" }),
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
        <div className={styles.monitorWrapper}>
          <div className={styles.monitorTitle}>BIOHAZARD MONITOR</div>
          <div className={styles.monitor}>
            {pollutants.map((p) => (
              <div
                key={p.id}
                className={`${styles.pollutant} ${p.isRemoving ? styles.removing : ""}`}
                onClick={() => {
                  if (removedCount >= 5) return;
                  remove(p.id)
                }}
                style={{
                  left: `${p.x}vw`,
                  top: `${p.y}%`,
                  width: `${p.size}vw`,
                  height: `${p.size}vw`,
                  transform: `rotate(${p.rotation}deg)`,
                }}
              >
                {/* 간단한 SVG 오염물질 */}
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.49994 5.93777L7.24994 3.77271M5.93783 8.5L3.77277 7.25M5 12H2.5M5 12C5 15.866 8.13401 19 12 19M5 12C5 8.13401 8.13401 5 12 5M5.93777 15.5L3.77271 16.75M8.49994 18.0623L7.24994 20.2273M12 21.5V19M12 19C15.866 19 19 15.866 19 12M16.7501 20.2273L15.5001 18.0623M20.2273 16.75L18.0622 15.5M21.5 12H19M19 12C19 8.13401 15.866 5 12 5M20.2273 7.25L18.0622 8.5M15 15V15.01M16.7501 3.77271L15.5001 5.93777M12 5V2.5M8 11V11.01M11 15C11 15.5523 10.5523 16 10 16C9.44772 16 9 15.5523 9 15C9 14.4477 9.44772 14 10 14C10.5523 14 11 14.4477 11 15ZM15 10C15 11.1046 14.1046 12 13 12C11.8954 12 11 11.1046 11 10C11 8.89543 11.8954 8 13 8C14.1046 8 15 8.89543 15 10Z"
                    strokeWidth="1.152" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
            ))}
            <div className={styles.monitorStatus}>
              REMOVED: {removedCount} / 5
            </div>
          </div>

          <button
            className={styles.submitButton}
            disabled={removedCount < 5 || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "제출 중..." : "제출하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
