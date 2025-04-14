import React, { useEffect, useState } from "react";
import ModalBase from "./ModalBase";
import { useModalStore } from "@/stores/useModalStore";
import { useQuestStore, Quest } from "@/stores/useQuestStore";
import styles from "./Modal.module.css";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { clearQuestCookies } from "@/lib/clearQuestCookies";

const questRoutes: Record<string, string> = {
  feed: "/quest/feed",
  turbidity: "/quest/turbidity",
  pollution: "/quest/pollution",
};

const defaultQuests = [
  { slug: "feed", id: "영양 보충하기", cooldown: 5400, latestTimestamp: new Date(0), count: 0, goal: 2, icon: "🧪" },
  { slug: "turbidity", id: "탁도 측정하기", cooldown: 3600, latestTimestamp: new Date(0), count: 0, goal: 3, icon: "🔬" },
  { slug: "pollution", id: "오염 제거하기", cooldown: 5400, latestTimestamp: new Date(0), count: 0, goal: 2, icon: "🚨" },
];

const formatTimeLeft = (secondsLeft: number) => {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const QuestModal: React.FC = () => {
  const router = useRouter();
  const onRequestClose = useModalStore((s) => s.closeModal);
  const { quests, fetchQuests } = useQuestStore();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    clearQuestCookies();
  }, []);

  const mergedQuests = defaultQuests.map((q) => {
    const found = quests.find((x) => x.id === q.id);
    return found ? { ...q, ...found } : q;
  });

  const handleQuestClick = (slug: string) => {
    const cookieName = `allow${slug.charAt(0).toUpperCase()}${slug.slice(1)}Access`;
    console.log("cookieName", cookieName);
    if (!questRoutes[slug]) return; // 경로가 없으면 아무것도 하지 않음
    const route = questRoutes[slug];
    Cookies.set(cookieName, "true");
    router.replace(route);
  };

  return (
    <ModalBase onRequestClose={onRequestClose}>
      {() => (
        <>
          <div className={styles.questModalHeader}>
            퀘스트 목록
          </div>
          <div className={styles.questModalGrid}>
            {mergedQuests.map((quest) => {
              const hasData = !!quest.latestTimestamp;
              const last = new Date(quest.latestTimestamp);
              const elapsed = (now - last.getTime()) / 1000;
              const remaining = Math.max(0, Math.floor(quest.cooldown - elapsed));
              const available = remaining <= 0 && quest.count < quest.goal;
              const isCompleted = quest.count >= quest.goal;

              return (
                <div key={quest.id} className={styles.questBox}>
                  <div className={styles.questHeader}>
                    <span className={styles.questIcon}>{quest.icon}</span>
                    <span className={styles.questTitle}>{quest.id}</span>
                  </div>
                  <div className={styles.questCount}>
                    수행 횟수: {quest.count}/{quest.goal}
                  </div>
                  <button
                    className={styles.questButton}
                    disabled={!hasData || !available}
                    onClick={() => handleQuestClick(quest.slug)}
                  >
                    {!hasData
                      ? "Loading..."
                      : available
                      ? "수행하기"
                      : isCompleted
                      ? "완료됨"
                      : formatTimeLeft(remaining)}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </ModalBase>
  );
};

export default QuestModal;
