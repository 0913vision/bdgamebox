"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkCondition() {
      try {
        const response = await fetch('/api/check');
        if (response.ok) {
          const data = await response.json();
          // API가 조건에 따라 redirectUrl을 반환한다고 가정합니다.
          if (data.redirectUrl) {
            router.push(data.redirectUrl);
          }
        } else {
          console.error('API 호출 실패');
        }
      } catch (error) {
        console.error('조건 체크 중 에러 발생:', error);
      }
    }

    checkCondition();
  }, [router]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>로딩중...</h1>
    </div>
  );
}
