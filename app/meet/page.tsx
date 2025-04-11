'use client'

// page.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

// 스토리 내용 배열
const storyArray = [
  "첫 번째 스토리 내용입니다.",
  "두 번째 스토리 내용입니다.",
  "세 번째 스토리 내용입니다."
];

const Page = () => {
  // 현재 스토리 인덱스와 애니메이션 상태 (fadeIn, fadeOut)를 관리
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState('fadeIn');
  const router = useRouter();

  // [다음] 버튼 클릭 이벤트 핸들러
  const handleNext = () => {
    setFade('fadeOut');  // 현재 텍스트를 fade-out 처리
    // fade-out 애니메이션 시간(0.5초) 후 다음 처리
    setTimeout(() => {
      if (currentIndex < storyArray.length - 1) {
        setCurrentIndex(currentIndex + 1);  // 다음 스토리로 인덱스 갱신
        setFade('fadeIn');                  // fade-in 처리로 전환
      } else {
        // 마지막 내용인 경우 다른 페이지로 라우팅 (예: "/nextPage")
        router.push('/nextPage');
      }
    }, 500); // CSS transition과 동일한 시간 (0.5초)
  };

  return (
    <div className={styles.container}>
      {/* public 폴더에 있는 background.png를 배경으로 설정 */}
      <div className={styles.background} />
      <div className={styles.popup}>
        <div className={`${styles.popupContent} ${styles[fade]}`}>
          {storyArray[currentIndex]}
        </div>
        <button className={styles.nextButton} onClick={handleNext}>
          다음
        </button>
      </div>
    </div>
  );
};

export default Page;
