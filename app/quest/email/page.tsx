"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Person = {
  name: string;
  affiliation: string;
  email: string;
  role: string;
};

const PERSON_LIST: Person[] = [
  { name: "Alice Johnson", affiliation: "Cadeau Research Lab", email: "alice@cadeau.org", role: "Researcher" },
  { name: "Bob Smith", affiliation: "Cadeau Research Lab", email: "bob@cadeau.org", role: "Researcher" },
  { name: "Carol Lee", affiliation: "Cadeau Research Lab", email: "carol@cadeau.org", role: "Researcher" },
  { name: "David Kim", affiliation: "Cadeau Research Lab", email: "david@cadeau.org", role: "Researcher" },
  { name: "Eve Torres", affiliation: "QuantumTech", email: "eve@quantum.tech", role: "Master" },
  { name: "Frank Yang", affiliation: "QuantumTech", email: "frank@quantum.tech", role: "Engineer" },
  { name: "Grace Liu", affiliation: "BioNova", email: "grace@bionova.bio", role: "Master" },
  { name: "Henry Cho", affiliation: "BioNova", email: "henry@bionova.bio", role: "Analyst" },
  { name: "Irene Park", affiliation: "XenoDynamics", email: "irene@xenodyne.com", role: "Intern" },
  { name: "Jake Miller", affiliation: "XenoDynamics", email: "jake@xenodyne.com", role: "Intern" },
];

const QUESTIONS: Record<number, { question: string; answerFn: (p: Person) => boolean }> = {
  0: {
    question: "우리 연구소 소속에게 메일을 보내자.",
    answerFn: (p) => p.affiliation === "Cadeau Research Lab",
  },
  1: {
    question: "Master인 사람들에게 메일을 보내자.",
    answerFn: (p) => p.role === "Master",
  },
};

const EmailQuestPage = () => {
  const router = useRouter();
  const [phase, setPhase] = useState<"question" | "sending" | "done">("question");
  const [people, setPeople] = useState<Person[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [count, setCount] = useState<number|null>(null);
  const [progress, setProgress] = useState(0);
  const [fill, setFill] = useState(0);
  const holdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const shuffled = [...PERSON_LIST].sort(() => Math.random() - 0.5);
    setPeople(shuffled);
    setChecked(new Array(shuffled.length).fill(false));
  }, []);

  useEffect(() => {
    fetch("/api/quest")
      .then((res) => res.json())
      .then((data) => {
        const quests = data.quests;
        const emailQuest = quests.find((q: any) => q.slug === "email");
        if (emailQuest && typeof emailQuest.count === "number") {
          console.log("email quest count:", emailQuest.count);
          setCount(emailQuest.count);
        } else {
          console.warn("email quest not found, using fallback count = 0");
          setCount(null);
        }
      })
      .catch((err) => {
        console.error("email count fetch error:", err);
        setCount(null);
      });
  }, []);

  useEffect(() => {
    if (phase === "sending") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase("done"), 300);
            return 100;
          }
          return prev + 1;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const isCorrect = () => {
    const answerFn = typeof count === 'number' ? QUESTIONS[count]?.answerFn : null;
    return answerFn ? people.every((p, i) => answerFn(p) === checked[i]) : false;
  };

  const clearHold = () => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  };

  const startHold = () => {
    if (!isCorrect()) return;
    clearHold();
    holdRef.current = setInterval(() => {
      setFill((prev) => {
        const next = Math.min(100, prev + 1);
        if (next >= 100) {
          clearHold();
          setTimeout(() => {
            setPhase("sending"); // ✅ 0.5초 후 phase 전환
          }, 500);
        }
        return next;
      });
    }, 15);
  };

  const stopHold = () => {
    clearHold();
    if (fill < 100) {
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

  const handleDone = async () => {
    try {
      const res = await fetch("/api/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: "email" }),
      });

      const data = await res.json();
      console.log("제출 성공:", data);

      router.replace("/lab");
    } catch (e) {
      console.error("제출 실패:", e);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backButton} onClick={() => router.replace("/lab")}>
        ← 실험실로 돌아가기
      </div>
      <div className={styles.background} />
      <div className={styles.gamePanel}>
        {phase === "question" && (
          <>
            <div className={styles.emailQuestion}>
              {typeof count === 'number' ? QUESTIONS[count]?.question : "문제를 불러오는 중..."}
            </div>
            <div className={styles.emailList}>
              {people.map((p, i) => (
                <div key={i} className={styles.emailCard}>
                  <div className={styles.emailInfo}>
                    <div className={styles.emailName}>{p.name}</div>
                    <div>{p.affiliation} / {p.role}</div>
                    <div>{p.email}</div>
                  </div>
                  <button
                    className={`${styles.toggleButton} ${checked[i] ? styles.active : ""}`}
                    onClick={() => {
                      const next = [...checked];
                      next[i] = !next[i];
                      setChecked(next);
                    }}
                  >
                    {checked[i] ? "선택됨" : "선택"}
                  </button>
                </div>
              ))}
            </div>
            <button
              className={`${styles.holdButton} ${isCorrect() ? styles.active : styles.inactive}`}
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              disabled={!isCorrect()}
            >
              <div className={styles.holdFill} style={{ width: `${fill}%` }} />
              <span className={styles.holdText}>{isCorrect() ? "꾹 눌러서 전송하기" : "조건이 충족되지 않음"}</span>
            </button>
          </>
        )}

        {phase === "sending" && (
          <>
            <h2 className={styles.title}>이메일 전송 중...</h2>
            <div className={styles.progressOuter}>
              <div className={styles.progressInner} style={{ width: `${progress}%` }} />
            </div>
          </>
        )}

        {phase === "done" && (
          <>
            <h2 className={styles.title}>전송 완료!</h2>
            <button className={styles.submitButton} onClick={handleDone}>
              완료
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailQuestPage;
