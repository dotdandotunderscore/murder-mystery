import React, { useState } from "react";
import { ConfigProvider, theme, Input, Button, Typography, Spin } from "antd";
import { usePlayer } from "../context/PlayerContext";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/adminPage";
import HomePage from "./pages/homePage";

interface ClueResult {
  id: number;
  code_phrase: string;
  title: string;
  content: string;
  page_type: string;
}

export default function App() {
  const { player, loading, logout } = usePlayer();
  const [codeInput, setCodeInput] = useState("");
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [clue, setClue] = useState<ClueResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <Spin size="large" />
        </div>
      </ConfigProvider>
    );
  }

  if (!player) {
    return (
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <LoginPage />
      </ConfigProvider>
    );
  }

  const handleSubmit = async () => {
    if (!codeInput.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/clues/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_phrase: codeInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setClue(data);
        setCurrentPage("clue");
      } else {
        setError(data.error ?? "Invalid code");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentPage(null);
    setClue(null);
    setCodeInput("");
    setError(null);
  };

  const renderPage = () => {
    if (currentPage === "admin" && player.is_admin) return <AdminPage />;
    if (currentPage === "clue" && clue) {
      return (
        <div style={{ textAlign: "left" }}>
          <Typography.Title level={2}>{clue.title}</Typography.Title>
          <Typography.Paragraph style={{ whiteSpace: "pre-wrap", fontSize: 16 }}>
            {clue.content}
          </Typography.Paragraph>
          <Button onClick={handleBack}>Back</Button>
        </div>
      );
    }
    return <HomePage />;
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 20px" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Typography.Text type="secondary">
            Logged in as <strong>{player.name}</strong>
            {player.team ? ` (${player.team})` : ""}
          </Typography.Text>
          <div style={{ display: "flex", gap: 8 }}>
            {player.is_admin && (
              <Button
                size="small"
                onClick={() => setCurrentPage(currentPage === "admin" ? null : "admin")}
              >
                {currentPage === "admin" ? "Home" : "Admin"}
              </Button>
            )}
            <Button size="small" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Code entry — hidden while in admin or viewing a clue */}
        {currentPage !== "admin" && currentPage !== "clue" && (
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Input
              placeholder="Enter code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              onPressEnter={handleSubmit}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              style={{ marginLeft: 8 }}
            >
              Submit
            </Button>
            {error && (
              <Typography.Text type="danger" style={{ display: "block", marginTop: 8 }}>
                {error}
              </Typography.Text>
            )}
          </div>
        )}

        {renderPage()}
      </div>
    </ConfigProvider>
  );
}
