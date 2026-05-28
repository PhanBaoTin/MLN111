/** Types specific to the admin feature */

export type Tab = 'create' | 'library' | 'live';

export interface QuestionDraft {
  id: string;
  text: string;
  timeLimit: number;
  points: number;
  options: { id: string; text: string; isCorrect: boolean }[];
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export function blankQuestion(): QuestionDraft {
  return {
    id: uid(),
    text: '',
    timeLimit: 30,
    points: 100,
    options: [
      { id: uid(), text: '', isCorrect: true },
      { id: uid(), text: '', isCorrect: false },
      { id: uid(), text: '', isCorrect: false },
      { id: uid(), text: '', isCorrect: false },
    ],
  };
}
