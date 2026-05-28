const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const API_BASE = BASE;

export interface JoinRoomResult {
  room: { _id: string; pin: string };
  hostToken: string;
}

export async function quickCreateRoom(payload: {
  title: string;
  pin: string;
  visibility?: 'public' | 'private';
  imageBase64?: string;
  questions: any[];
  shuffleQuestions?: boolean;
}) {
  const res = await fetch(`${API_BASE}/rooms/quick-create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json() as { message: string; data: JoinRoomResult };
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json.data;
}

export async function launchExistingRoom(payload: { quizId: string; pin: string; shuffleQuestions?: boolean }) {
  const res = await fetch(`${API_BASE}/rooms/launch-existing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json() as {
    message: string;
    data: {
      quiz: any;
      room: { _id: string; pin: string };
      hostToken: string;
    };
  };
  if (!res.ok) throw new Error(json.message || 'Failed to launch existing room');
  return json.data;
}
