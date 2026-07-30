
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getAskedQuestions(): string[] {
  try {
    const data = localStorage.getItem('alliance_quiz_asked_questions');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function addAskedQuestion(id: string, text?: string, answer?: string) {
  try {
    const list = getAskedQuestions();
    const itemsToAdd = [id];
    if (text) itemsToAdd.push(text.trim());
    if (answer) itemsToAdd.push(answer.trim());
    const updated = Array.from(new Set([...list, ...itemsToAdd]));
    localStorage.setItem('alliance_quiz_asked_questions', JSON.stringify(updated));
  } catch (e) {}
}

export function clearAskedQuestions() {
  try {
    localStorage.removeItem('alliance_quiz_asked_questions');
  } catch (e) {}
}

