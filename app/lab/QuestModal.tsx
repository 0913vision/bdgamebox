import React, { useEffect, useState } from "react";
import ModalBase from "./ModalBase";
import { useModalStore } from "@/stores/useModalStore";
import { useQuestStore, Quest } from "@/stores/useQuestStore";
import { useLevelStore } from "@/stores/useLevelStore";
import styles from "./Modal.module.css";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { clearQuestCookies } from "@/lib/clearQuestCookies";
import { levelQuestMap } from "./QuestMap";

const questRoutes: Record<string, string> = {
  feed: "/quest/feed",
  turbidity: "/quest/turbidity",
  pollution: "/quest/pollution",
  analysis: "/quest/analysis",
  xray: "/quest/xray",
  email: "/quest/email",
  culture: "/quest/culture",
};

const PLACEHOLDER_QUEST: Quest = {
  slug: "loading",
  id: "로딩중...",
  cooldown: 0,
  latestTimestamp: new Date(0),
  count: 0,
  goal: 1,
  icon: "⏳",
};

const formatTimeLeft = (secondsLeft: number) => {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const QuestModal: React.FC = () => {
  const router = useRouter();
  const onRequestClose = useModalStore((s) => s.closeModal);
  const { quests, fetchQuests } = useQuestStore();
  const level = useLevelStore((s) => s.level);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearQuestCookies();
    fetchQuests().finally(() => setLoading(false));
  }, [fetchQuests]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const requiredSlugs: string[] = level !== null ? levelQuestMap[level] || [] : [];
  const filteredQuests: Quest[] = requiredSlugs.map((slug: string) => {
    const found = quests.find((q) => q.slug === slug);
    return found ?? { ...PLACEHOLDER_QUEST, slug };
  });

  const handleQuestClick = (slug: string) => {
    const cookieName = `allow${slug.charAt(0).toUpperCase()}${slug.slice(1)}Access`;
    if (!questRoutes[slug]) return;
    Cookies.set(cookieName, "true");
    router.replace(questRoutes[slug]);
  };

  return (
    <ModalBase onRequestClose={onRequestClose}>
      {() => (
        <>
          <div className={styles.questModalHeader}>
            퀘스트 목록
          </div>
          <div className={styles.questModalGrid}>
            {filteredQuests.map((quest) => {
              const hasData = quest.slug !== "loading";
              const last = new Date(quest.latestTimestamp);
              const elapsed = (now - last.getTime()) / 1000;
              const remaining = Math.max(0, Math.floor(quest.cooldown - elapsed));
              const available = hasData && remaining <= 0 && quest.count < quest.goal;
              const isCompleted = quest.count >= quest.goal;

              return (
                <div key={quest.slug} className={styles.questBox}>
                  <div className={styles.questHeader}>
                    <span className={styles.questIcon}>{quest.icon}</span>
                    <span className={styles.questTitle}>{quest.id}</span>
                  </div>
                  <div className={styles.questCount}>
                    수행 횟수: {hasData ? `${quest.count}/${quest.goal}` : "로딩중..."}
                  </div>
                  <button
                    className={styles.questButton}
                    disabled={!available}
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
