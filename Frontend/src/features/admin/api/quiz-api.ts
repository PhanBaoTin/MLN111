const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface ParsedQuestion {
  id: string;
  text: string;
  type: 'single_choice';
  timeLimit: number;
  points: number;
  order: number;
  options: { id: string; text: string; isCorrect: boolean }[];
}

export async function parseDocx(file: File): Promise<{ questions: ParsedQuestion[]; warnings: string[] }> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${BASE}/quizzes/parse-docx`, { method: 'POST', body: fd });
  const json = await res.json() as { message: string; data: { questions: ParsedQuestion[]; warnings: string[] } };
  if (!res.ok) throw new Error(json.message || 'Failed to parse docx');
  return json.data;
}

export async function getQuizzes() {
  const res = await fetch(`${BASE}/quizzes`);
  const json = await res.json() as { message: string; data: any[] };
  if (!res.ok) throw new Error(json.message || 'Failed to fetch quizzes');
  return json.data;
}

export async function deleteQuiz(id: string) {
  const res = await fetch(`${BASE}/quizzes/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to delete quiz');
  return json.data;
}

export async function updateQuiz(id: string, payload: any) {
  const res = await fetch(`${BASE}/quizzes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update quiz');
  return json.data;
}
