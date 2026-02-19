import React, { useState, useEffect } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
  Space,
  Typography,
  Popconfirm,
  Select,
  InputNumber,
  message,
} from "antd";

interface Player {
  id: number;
  name: string;
  team: string | null;
  is_admin: boolean;
  created_at: string;
}

interface Clue {
  id: number;
  code_phrase: string;
  title: string;
  content: string;
  page_type: string;
  visible_to_teams: string[] | null;
  visible_to_players: number[] | null;
  required_flags: string[] | null;
  grants_flags: string[] | null;
  sort_order: number;
  created_at: string;
}

interface Progress {
  player: Player;
  flags: string[];
}

// ── Players panel ──────────────────────────────────────────────────────────────

function PlayersPanel() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/players");
    if (res.ok) setPlayers(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (player: Player) => {
    setEditing(player);
    form.setFieldsValue({ name: player.name, pin: "", team: player.team ?? "", is_admin: player.is_admin });
    setModalOpen(true);
  };

  const handleSave = async (values: { name: string; pin?: string; team?: string; is_admin?: boolean }) => {
    const body = {
      name: values.name,
      pin: values.pin ?? "",
      team: values.team?.trim() || null,
      is_admin: values.is_admin ?? false,
    };
    const res = editing
      ? await fetch(`/api/admin/players/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
    if (res.ok) {
      setModalOpen(false);
      load();
    } else {
      const data = await res.json();
      message.error(data.error ?? "Failed to save");
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/players/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else message.error("Failed to delete");
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
      render: (t: string | null) =>
        t ? <Tag>{t}</Tag> : <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: "Admin",
      dataIndex: "is_admin",
      key: "is_admin",
      render: (v: boolean) => (v ? <Tag color="gold">Admin</Tag> : null),
    },
    {
      title: "",
      key: "actions",
      render: (_: unknown, record: Player) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Delete this player?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreate}>
          Add Player
        </Button>
      </div>
      <Table dataSource={players} columns={columns} rowKey="id" loading={loading} size="small" />

      <Modal
        title={editing ? "Edit Player" : "Add Player"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} onFinish={handleSave} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Character Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="pin"
            label="PIN"
            rules={editing ? [] : [{ required: true }]}
            extra={editing ? "Leave blank to keep current PIN" : undefined}
          >
            <Input placeholder={editing ? "(unchanged)" : "e.g. 7421"} />
          </Form.Item>
          <Form.Item name="team" label="Team" extra="Optional — e.g. red, blue">
            <Input placeholder="Leave blank for no team" />
          </Form.Item>
          <Form.Item name="is_admin" label="Admin access" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form>
      </Modal>
    </>
  );
}

// ── Clues panel ────────────────────────────────────────────────────────────────

function csvToArray(v: string | undefined | null): string[] | null {
  if (!v?.trim()) return null;
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function arrayToCsv(arr: string[] | number[] | null | undefined): string {
  return arr?.join(", ") ?? "";
}

function CluesPanel() {
  const [clues, setClues] = useState<Clue[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Clue | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/clues");
    if (res.ok) setClues(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (clue: Clue) => {
    setEditing(clue);
    form.setFieldsValue({
      code_phrase: clue.code_phrase,
      title: clue.title,
      content: clue.content,
      page_type: clue.page_type,
      sort_order: clue.sort_order,
      visible_to_teams: arrayToCsv(clue.visible_to_teams),
      visible_to_players: arrayToCsv(clue.visible_to_players),
      required_flags: arrayToCsv(clue.required_flags),
      grants_flags: arrayToCsv(clue.grants_flags),
    });
    setModalOpen(true);
  };

  const handleSave = async (values: {
    code_phrase: string;
    title: string;
    content?: string;
    page_type?: string;
    sort_order?: number;
    visible_to_teams?: string;
    visible_to_players?: string;
    required_flags?: string;
    grants_flags?: string;
  }) => {
    const body = {
      code_phrase: values.code_phrase.trim().toLowerCase(),
      title: values.title,
      content: values.content ?? "",
      page_type: values.page_type ?? "text",
      sort_order: values.sort_order ?? 0,
      visible_to_teams: csvToArray(values.visible_to_teams),
      visible_to_players: csvToArray(values.visible_to_players)?.map(Number) ?? null,
      required_flags: csvToArray(values.required_flags),
      grants_flags: csvToArray(values.grants_flags),
    };
    const res = editing
      ? await fetch(`/api/admin/clues/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/clues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
    if (res.ok) {
      setModalOpen(false);
      load();
    } else {
      const data = await res.json();
      message.error(data.error ?? "Failed to save");
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/clues/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else message.error("Failed to delete");
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code_phrase",
      key: "code_phrase",
      render: (v: string) => <code style={{ fontSize: 13 }}>{v}</code>,
    },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Type", dataIndex: "page_type", key: "page_type" },
    { title: "Order", dataIndex: "sort_order", key: "sort_order", width: 70 },
    {
      title: "",
      key: "actions",
      render: (_: unknown, record: Clue) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Delete this clue?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreate}>
          Add Clue
        </Button>
      </div>
      <Table dataSource={clues} columns={columns} rowKey="id" loading={loading} size="small" />

      <Modal
        title={editing ? "Edit Clue" : "Add Clue"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={620}
        destroyOnClose
      >
        <Form form={form} onFinish={handleSave} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code_phrase" label="Code Phrase" rules={[{ required: true }]} extra="What players type in (auto-lowercased)">
            <Input placeholder="e.g. butler-did-it" />
          </Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Page heading shown to player" />
          </Form.Item>
          <Form.Item name="content" label="Content">
            <Input.TextArea rows={5} placeholder="Clue text shown to player..." />
          </Form.Item>
          <Form.Item name="page_type" label="Page Type" initialValue="text">
            <Select>
              <Select.Option value="text">Text</Select.Option>
              <Select.Option value="cipher">Cipher</Select.Option>
              <Select.Option value="safecracker">Safecracker</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="sort_order" label="Sort Order" initialValue={0}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="visible_to_teams" label="Visible to Teams" extra="Comma-separated team names, blank = all teams">
            <Input placeholder="red, blue" />
          </Form.Item>
          <Form.Item name="visible_to_players" label="Visible to Player IDs" extra="Comma-separated IDs, blank = all players">
            <Input placeholder="1, 3, 5" />
          </Form.Item>
          <Form.Item name="required_flags" label="Required Flags" extra="Player must have all these flags before unlocking">
            <Input placeholder="found_body, decoded_cipher" />
          </Form.Item>
          <Form.Item name="grants_flags" label="Grants Flags" extra="Flags awarded when this clue is found">
            <Input placeholder="found_key" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form>
      </Modal>
    </>
  );
}

// ── Progress panel ─────────────────────────────────────────────────────────────

function ProgressPanel() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/progress");
    if (res.ok) setProgress(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { title: "Player", dataIndex: ["player", "name"], key: "name" },
    {
      title: "Team",
      dataIndex: ["player", "team"],
      key: "team",
      render: (t: string | null) => t ?? "—",
    },
    {
      title: "Flags",
      key: "flags",
      render: (_: unknown, record: Progress) =>
        record.flags.length === 0 ? (
          <Typography.Text type="secondary">none</Typography.Text>
        ) : (
          <Space wrap size={4}>
            {record.flags.map((f) => (
              <Tag key={f}>{f}</Tag>
            ))}
          </Space>
        ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={load}>Refresh</Button>
      </div>
      <Table
        dataSource={progress}
        columns={columns}
        rowKey={(r) => String(r.player.id)}
        loading={loading}
        size="small"
      />
    </>
  );
}

// ── Main AdminPage ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const items = [
    { key: "players", label: "Players", children: <PlayersPanel /> },
    { key: "clues", label: "Clues", children: <CluesPanel /> },
    { key: "progress", label: "Progress", children: <ProgressPanel /> },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Admin Panel
      </Typography.Title>
      <Tabs items={items} />
    </div>
  );
}
