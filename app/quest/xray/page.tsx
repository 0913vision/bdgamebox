// /app/quest/xray/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const GRACE_RANGE = 5;

const XrayQuestPage = () => {
  const router = useRouter();
  const [lensValues, setLensValues] = useState([0, 100]);
  const [targets, setTargets] = useState([0, 0]);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [phase, setPhase] = useState<"switch" | "progress1" | "adjust" | "scanning" | "done">("switch");
  const [switchStates, setSwitchStates] = useState([false, false]);
  const [progress1, setProgress1] = useState(0);
  const [fill, setFill] = useState(0);
  const holdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTargets([randTarget(), randTarget()]);
  }, []);

  useEffect(() => {
    fetch("/api/quest")
      .then((res) => res.json())
      .then((data) => {
        const quests = data.quests; // ✅ 응답 구조에 맞게 추출
  
        const xrayQuest = quests.find((q: any) => q.slug === "xray");
        if (xrayQuest && typeof xrayQuest.count === "number") {
          setCount(xrayQuest.count);
        } else {
          // ✅ fallback 디버깅용
          console.warn("xray quest not found, using fallback count = 0");
          setCount(0);
        }
      })
      .catch((err) => {
        console.error("xray count fetch error:", err);
        setCount(0); // ✅ 에러 시에도 fallback
      });
  }, []);

  useEffect(() => {
    if (phase === "switch" && switchStates.every((v) => v)) {
      setTimeout(() => {
        setPhase("progress1");
      }, 1000);
    }
  }, [switchStates, phase]);

  useEffect(() => {
    if (phase === "progress1") {
      const interval = setInterval(() => {
        setProgress1((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase("adjust"), 500);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase]);


  useEffect(() => {
    if (phase === "scanning") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase("done"), 300);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const randTarget = () => Math.floor(Math.random() * 81) + 10; // 10~90

  const getBlur = () => {
    const diffs = lensValues.map((val, i) => Math.abs(val - targets[i]));
  
    const allCorrect = diffs.every((d) => d <= GRACE_RANGE);
    if (allCorrect) return 0;
  
    const maxBlur = 8;
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  
    // soft step function (blur는 거의 max 유지하다가, 정확히 맞췄을 때만 뚝 떨어짐)
    const sharpness = 3.5; // 조절 가능
    const normalized = Math.min(1, avgDiff / (100 - GRACE_RANGE));
    const blur = maxBlur * (1 - Math.exp(-sharpness * normalized));
  
    return Math.round(blur);
  };

  const isAligned = () => {
    return lensValues.every((val, i) => Math.abs(val - targets[i]) <= GRACE_RANGE);
  };

  const adjustLens = (index: number, delta: number) => {
    setLensValues((prev) =>
      prev.map((v, i) => (i === index ? Math.max(0, Math.min(100, v + delta)) : v))
    );
  };

  const videoSrc = count === 0 ? "/xray_1.mp4" : "/xray_2.mp4";
  const resultImgSrc = count === 0 ? "/xray_1.png" : "/xray_2.png";

  const startHold = () => {
    if (phase !== "adjust" || !isAligned()) return;
    holdRef.current = setInterval(() => {
      setFill((prev) => {
        const next = Math.min(100, prev + 1);
        if (next >= 100) {
          clearHold();
          handleCapture(); // ✅ 자동 촬영
        }
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
    if (fill < 100 && phase === "adjust") {
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
  

  const handleCapture = () => {
    setPhase("scanning");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/quest", {
        method: "POST",
        body: JSON.stringify({ slug: "xray" }),
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
      <div className={styles.backButton} onClick={() => router.replace("/lab")}>← 실험실로 돌아가기</div>
      <div className={styles.background} />
      <div className={styles.gamePanel}>
        {phase === "switch" && (
          <>
            <div className={styles.switchContainer}>
              <div className={styles.switchRow}>
                {["방사선", "모니터"].map((label, idx) => (
                  <div key={idx} className={styles.switchColumn}>
                    <div
                      className={`${styles.switchBox} ${switchStates[idx] ? styles.switchOn : ""}`}
                      onPointerDown={(e) => {
                        if (phase !== "switch" || switchStates[idx]) return;

                        const startY = e.clientY;

                        const move = (ev: PointerEvent) => {
                          const delta = startY - ev.clientY;
                          if (delta > 30) {
                            setSwitchStates((prev) => {
                              const next = [...prev];
                              next[idx] = true;
                              return next;
                            });

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
                      }}
                    >
                      <div
                        className={styles.switchHandle}
                        style={{ bottom: switchStates[idx] ? "75%" : "0%" }}
                      />
                      <div className={styles.switchFrontLine} />
                    </div>
                    <div className={styles.switchLabel}>{label}</div>
                  </div>
                ))}
              </div>
              <div className={styles.switchText}>스위치를 올려 X-ray 촬영 시작</div>
            </div>
          </>
        )}
        {phase === "progress1" && (
          <>
            <h2 className={styles.title}>X-ray 가동 중...</h2>
            <div className={styles.progressOuter}>
              <div
                className={styles.progressInner}
                style={{ width: `${progress1}%` }}
              />
            </div>
          </>
        )}
        {phase === "adjust" && (
          <>
            <div className={styles.monitorBox}>
              <div className={styles.monitorContent} style={{ filter: `blur(${getBlur()}px)` }}>
                <video
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover", scale: "0.8" }}
                />
              </div>
            </div>
            <div className={styles.controlSection}>
              {["전방렌즈 초점", "후방렌즈 초점"].map((label, i) => (
                <div key={i} className={styles.controlColumn}>
                  <div className={styles.labelText}>{label}</div>
                  <input
                    type="range"
                    className={styles.rangeInput}
                    min={0}
                    max={100}
                    value={lensValues[i]}
                    onChange={(e) =>
                      adjustLens(i, Number(e.target.value) - lensValues[i])
                    }
                  />
                </div>
              ))}
            </div>
            <button
              className={`${styles.holdButton} ${isAligned() ? styles.active : styles.inactive}`}
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              disabled={!isAligned()}
            >
              <div className={styles.holdFill} style={{ width: `${fill}%` }} />
              <span className={styles.holdText}>{isAligned() ? `꾹 눌러서 촬영하기` : `사물을 인식할 수 없음`}</span>
            </button>
          </>
        )}

        {(phase === "scanning") && (
          <>
            <h2 className={styles.title}>촬영 중...</h2>
            <div className={styles.progressOuter}>
              <div
                className={styles.progressInner}
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}

        {(phase === "done") && (
          <>
            <h2 className={styles.title}>촬영 완료</h2>
            <div className={styles.monitorBox} style={{ position: "relative" }}>
              <button
                className={styles.downloadButton}
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = resultImgSrc;
                  a.download = typeof count === 'number' ? `xray_result_${count+1}.png` : `xray_result.png`;
                  a.click();
                }}
              >
                ⬇
              </button>
              <img className={styles.xrayImage} src={resultImgSrc} alt="결과 이미지" style={{ width: "100%" }} />
            </div>
            <button
              className={styles.submitButton}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "제출 중..." : "제출하기"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default XrayQuestPage;
