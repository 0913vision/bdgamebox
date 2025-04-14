"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

type Phase =
  | "switch"
  | "progress1"
  | "drag"
  | "progress2"
  | "analyzed"
  | "done";

const GeneAnalysisQuestPage = () => {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("switch");
  const [switchOn, setSwitchOn] = useState(false);
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(10).fill(0));
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dropped, setDropped] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [barPairs, setBarPairs] = useState<{ label: string; value: number }[]>([]);

  const dragRef = useRef<HTMLDivElement | null>(null);
  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const progress1Ref = useRef<NodeJS.Timeout | null>(null);
  const BAR_LABELS = ["C", "Cu", "Si", "Fe", "H", "U", "Rn", "Pu", "Fr", "Tc"]; // 사용자가 교체 가능

  const experimentData = {
    0: [88, 79, 85, 82, 91, 3, 5, 2, 1, 4],
    1: [86, 82, 87, 79, 89, 2, 6, 3, 1, 5],
  };

  useEffect(() => {
    fetch("/api/quest")
      .then((res) => res.json())
      .then((data) => {
        const quests = data.quests; // ✅ 구조 맞게 추출
  
        const currentQuest = quests.find((q: any) => q.slug === "analysis"); // 이 퀘스트의 slug 사용
        if (currentQuest && typeof currentQuest.count === "number") {
          const c = currentQuest.count as keyof typeof experimentData;
  
          if (!(c in experimentData)) {
            console.warn("experimentData not found for count:", c);
            return;
          }
  
          const values = experimentData[c];
          const pairs = BAR_LABELS.map((label, idx) => ({
            label,
            value: values[idx],
          }));
  
          // shuffle
          for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
          }
  
          setBarPairs(pairs);
        } else {
          // fallback
          const fallback = 1;
          const values = experimentData[fallback];
  
          const pairs = BAR_LABELS.map((label, idx) => ({
            label,
            value: values[idx],
          }));
  
          for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
          }
  
          setBarPairs(pairs);
        }
      })
      .catch((err) => {
        console.error("gene quest count fetch error:", err);
      });
  }, []);
  

  // Switch Logic
  const handleSwitch = () => {
    if (!switchOn && phase === "switch") {
      setSwitchOn(true);
      setPhase("progress1");
    }
  };

  // Progress 1
  useEffect(() => {
    if (phase === "progress1") {
      progress1Ref.current = setInterval(() => {
        setProgress1((prev) => {
          if (prev >= 100) {
            clearInterval(progress1Ref.current!);
            setTimeout(() => setPhase("drag"), 500);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => clearInterval(progress1Ref.current!);
  }, [phase]);

  // Drag logic
  const handleTouchStart = (e: React.TouchEvent) => {
    if (phase === "drag" && !dropped) {
      const touch = e.touches[0];
      const el = dragRef.current;
      if (!el) return;
  
      const rect = el.getBoundingClientRect();
      originRef.current = { x: rect.left, y: rect.top };
  
      el.style.position = "fixed";
      el.style.left = `${touch.clientX}px`;
      el.style.top = `${touch.clientY}px`;
      el.style.zIndex = "999";
  
      setDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !dragRef.current) return;
    const touch = e.touches[0];
    dragRef.current.style.left = `${touch.clientX}px`;
    dragRef.current.style.top = `${touch.clientY}px`;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragging || !dragRef.current) return;
  
    const dropZone = document.getElementById("drop-target");
    const rect = dropZone?.getBoundingClientRect();
    const touch = e.changedTouches[0];
  
    if (
      rect &&
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      setDropped(true);
      setDragging(false);
    
      // 🎯 현재 위치 기억해서 고정
      if (dragRef.current) {
        dragRef.current.style.position = "fixed";
        dragRef.current.style.left = `${touch.clientX - 30}px`; // 30 = 반지름 보정
        dragRef.current.style.top = `${touch.clientY - 30}px`;
        dragRef.current.style.zIndex = "999";
      }
    
      // 🎯 그 다음 fade 시작
      setFadingOut(true);
    
      setTimeout(() => {
        setPhase("progress2");
      }, 1000);
    } else {
      // 복귀
      dragRef.current.style.left = `${originRef.current.x}px`;
      dragRef.current.style.top = `${originRef.current.y}px`;
    }
  
    setDragging(false);
  };

  // Progress 2 and visual animation
  useEffect(() => {
    if (phase === "progress2" && barPairs.length === 10) {
      const duration = 15000;
      const start = performance.now();
  
      const targets = barPairs.map((p) => p.value);
  
      // 다양한 easing 함수 세트 정의
      const easeIn = (t: number) => t * t;
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 2);
      const easeInOut = (t: number) =>
        t < 0.5
          ? 2 * t * t
          : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const linear = (t: number) => t;
  
      const easingOptions = [easeIn, easeOut, easeInOut, linear];
  
      // 각 bar에 대해 3-segment 랜덤 easing 함수 조합
      const compositeEasings = Array(10).fill(0).map(() => {
        const e1 = easingOptions[Math.floor(Math.random() * easingOptions.length)];
        const e2 = easingOptions[Math.floor(Math.random() * easingOptions.length)];
        const e3 = easingOptions[Math.floor(Math.random() * easingOptions.length)];
  
        return (t: number) => {
          if (t < 0.33) {
            return e1(t / 0.33) * 0.33;
          } else if (t < 0.66) {
            return 0.33 + e2((t - 0.33) / 0.33) * 0.33;
          } else {
            return 0.66 + e3((t - 0.66) / 0.34) * 0.34;
          }
        };
      });
  
      const animate = () => {
        const now = performance.now();
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
  
        const newBars = targets.map((target, i) =>
          compositeEasings[i](t) * target
        );
  
        setBars(newBars);
        setProgress2(t * 100);
  
        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          setTimeout(() => setPhase("analyzed"), 300);
        }
      };
  
      animate();
    }
  }, [phase, barPairs]);
  
  // Submit Handler
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/quest", {
        method: "POST",
        body: JSON.stringify({ slug: "gene" }),
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
        {phase === "switch" && (
          <>
            <div
              className={`${styles.switchBox} ${switchOn ? styles.switchOn : ""}`}
              onPointerDown={(e) => {
                if (phase !== "switch" || switchOn) return;

                const startY = e.clientY;

                const move = (ev: PointerEvent) => {
                  const delta = startY - ev.clientY;
                  if (delta > 30) {
                    // 1️⃣ 즉시 색상 및 핸들 애니메이션 반영
                    setSwitchOn(true);

                    // 2️⃣ 1초 후에 phase 전환
                    setTimeout(() => {
                      setPhase("progress1");
                    }, 1000);

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
              <div className={styles.switchHandle} style={{ bottom: switchOn ? "75%" : "0%" }} />
              <div className={styles.switchFrontLine} />
              
            </div>
            <div className={styles.switchText}>
                스위치를 올려 분석기 활성화
            </div>
          </>
          
        )}

        {phase === "progress1" && (
          <>
            <h2 className={styles.title}>분석기 가동 중...</h2>
            <div className={styles.progressOuter}>
              <div
                className={styles.progressInner}
                style={{ width: `${progress1}%` }}
              />
            </div>
          </>
        )}

        {phase === "drag" && (
          <>
            <h2 className={styles.title}>샘플을 분석기로 이동</h2>
            <div className={styles.dragWrap}>
              <div
                className={`${styles.sample} ${dragging ? styles.dragging : ""} ${fadingOut ? styles.fadeOut : ""}`}
                ref={dragRef}
                onTouchStart={fadingOut ? undefined : handleTouchStart}
                onTouchMove={fadingOut ? undefined : handleTouchMove}
                onTouchEnd={fadingOut ? undefined : handleTouchEnd}
              >
                🧬
              </div>

              <div className={styles.dropTarget} id="drop-target">
                분석기
              </div>
            </div>
          </>
        )}

        {(phase === "progress2" || phase === "analyzed") && (
          <>
            <h2 className={styles.title}>
              {phase === "progress2" ? "유전자 분석 중..." : "분석 완료!"}
            </h2>

            {phase === "progress2" && (
              <div className={styles.progressOuter}>
                <div
                  className={styles.progressInner}
                  style={{ width: `${progress2}%` }}
                />
              </div>
            )}

            <div className={styles.visualBars}>
              {barPairs.map(({ label }, i) => (
                <div key={i} className={styles.visualBarWrapper}>
                  <div className={styles.visualBar} style={{ height: `${bars[i] ?? 0}%` }} />
                  <div className={styles.barLabel}>{label}</div>
                </div>
              ))}
            </div>


            {phase === "analyzed" && (
              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "제출 중..." : "제출하기"}
              </button>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default GeneAnalysisQuestPage;
