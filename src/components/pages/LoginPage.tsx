import React, { useState } from "react";
import { Input, Button, Typography, Card, Form } from "antd";
import { usePlayer } from "../../context/PlayerContext";

export default function LoginPage() {
  const { setPlayer } = usePlayer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { name: string; pin: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name.trim(), pin: values.pin.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlayer(data);
      } else {
        setError(data.error ?? "Login failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Card style={{ width: 360 }}>
        <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 8 }}>
          Murder Mystery
        </Typography.Title>
        <Typography.Text
          type="secondary"
          style={{ display: "block", textAlign: "center", marginBottom: 24 }}
        >
          Enter your character name and PIN to begin
        </Typography.Text>
        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Character Name" rules={[{ required: true, message: "Enter your character name" }]}>
            <Input placeholder="e.g. The Butler" autoComplete="username" />
          </Form.Item>
          <Form.Item name="pin" label="PIN" rules={[{ required: true, message: "Enter your PIN" }]}>
            <Input.Password placeholder="4-digit PIN" autoComplete="current-password" />
          </Form.Item>
          {error && (
            <Typography.Text type="danger" style={{ display: "block", marginBottom: 12 }}>
              {error}
            </Typography.Text>
          )}
          <Button type="primary" htmlType="submit" loading={loading} block>
            Enter
          </Button>
        </Form>
      </Card>
    </div>
  );
}
