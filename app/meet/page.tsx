"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const storyArray = [
  "첫 번째 스토리 내용입니다.",
  "두 번째 스토리 내용입니다.",
  "세 번째 스토리 내용입니다."
];

const buttonArray = [
  "다음 스토리",
  "계속",
  "페이지 이동"
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

  const handleNext = () => {
    if (currentIndex < storyArray.length - 1) {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsFading(false);
      }, 500);
    } else {
      router.push('/nextPage');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}/>
      <div className={styles.popup}>
        <div className={`${styles.popupContent} ${isFading ? styles.fadeOut : ''}`}>
          {typedText}
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
