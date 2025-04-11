"use server";

import styles from './page.module.css';

export default async function Test() {

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>test...</h1>
    </div>
  );
}
