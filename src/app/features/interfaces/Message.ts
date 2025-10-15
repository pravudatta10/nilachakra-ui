export interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  isTyping?: boolean;
}