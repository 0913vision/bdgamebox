"use client";

import React, { useState } from "react";

const AdminPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState(false);
  const [log, setLog] = useState("");

  const handleVerify = () => {
    if (password === "loveseoyeon") {
      setOk(true);
      setLog("비밀번호 확인 완료. 리셋 가능.");
    } else {
      setLog("비밀번호가 틀렸습니다.");
    }
  };

  const handleReset = async () => {
    try {
      const res1 = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: 0 }),
      });
      const res2 = await fetch("/api/quest/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res1.ok && res2.ok) {
        setLog("초기화 성공!");
      } else {
        setLog("초기화 실패. API 응답 오류.");
      }
    } catch (err) {
      console.error(err);
      setLog("초기화 중 에러 발생.");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: 400, margin: "auto", textAlign: "center" }}>
      <h2>Admin Reset</h2>
      <input
        type="password"
        value={password}
        placeholder="비밀번호 입력"
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px", width: "100%", marginBottom: "16px" }}
      />
      <br />
      <button onClick={handleVerify} style={{ padding: "10px 20px" }}>
        확인
      </button>
      <br />
      <br />
      <button
        onClick={handleReset}
        disabled={!ok}
        style={{ padding: "12px 24px", background: ok ? "#ff9328" : "#ccc", color: "#fff", border: "none", cursor: ok ? "pointer" : "not-allowed" }}
      >
        전체 초기화
      </button>
      <p style={{ marginTop: "20px", color: "#555" }}>{log}</p>
    </div>
  );
};

export default AdminPage;
