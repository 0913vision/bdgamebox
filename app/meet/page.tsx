"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useLevelStore } from "@/stores/useLevelStore";

const storyArray = [
  "안녕하세요?\n여기는 미지 생물 연구소입니다.\n우리는 현재 미지의 생물 \"부아뜨\"를 연구하고 있습니다.",
  "부아뜨는 아주 특이한 생물이지만, 우리 연구실에서는 자금 문제로 현재 인력 충원에 어려움을 겪고 있습니다.\n그래서 부아뜨를 연구하기 위해서는 당신의 도움이 필요합니다.",
  "저희 연구실로 안내해드리겠습니다.\n이 연구실에서 주기적으로 실험하며 부아뜨를 성장시켜주세요.\n건투를 빕니다!"
];

const buttonArray = [
  "네, 그런데요?",
  "네, 알겠습니다.",
  "연구실로 이동하기"
];

const meetPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isFading, setIsFading] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 재귀적으로 타이핑 효과를 구현하는 함수
  const typeText = (text: string, index: number = 0) => {
    if (index < text.length) {
      setTypedText(prev => prev + text.charAt(index));
      timeoutRef.current = setTimeout(() => {
        typeText(text, index + 1);
      }, 50); // 타이핑 속도 (50ms)
    }
  };

  // currentIndex가 변경될 때마다 타이핑 애니메이션 시작
  useEffect(() => {
    // 타이핑 전 초기화
    setTypedText('');
    // 이전에 설정된 timeout 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    typeText(storyArray[currentIndex]);

    // Cleanup: 컴포넌트 unmount 또는 currentIndex 변경시 timeout 정리
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex]);

  const handleNext = async () => {
    if (currentIndex < storyArray.length - 1) {
      // 마지막 스토리 직전이면 → level = 1 POST
      if (currentIndex === storyArray.length - 2) {
        await fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level: 1 }),
        });
      }
  
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsFading(false);
      }, 500);
    } else {
      router.replace("/lab");
    }
  };

  const formatText = (text: string) => {
    return text
      .split('\n')                   // 줄바꿈 기준으로 나눔
      .map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}/>
      <div className={styles.popup}>
      <div className={`${styles.popupContent} ${isFading ? styles.fadeOut : ''}`}>
        {formatText(typedText)}
      </div>
        <button className={styles.nextButton} onClick={handleNext}>
          <div className={`${styles.nextButtonContent} ${isFading ? styles.fadeOut : ''}`}>
            {buttonArray[currentIndex]}
          </div>
        </button>
      </div>
    </div>
  );
};

export default meetPage;
