import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MarkdownModule } from 'ngx-markdown';
import Prism from 'prismjs';
import { GlobalService } from '../services/global.service';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  isCode?: boolean;
  isTyping?: boolean;
}

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, ButtonModule, MarkdownModule],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent {
  @ViewChild('scrollEl', { static: false }) scrollEl!: ElementRef<HTMLElement>;
  username = 'Pravudatta';

  messages: Message[] = [];
  input = '';

  // Dummy Q&A for testing
  dummyQA: { [key: string]: string } = {
    'hi': 'Hello! I\'m Nilachakra Assistant. How can I help you today?',
    'hello': 'Hi there! Ask me anything about Angular or TypeScript.',
    'what is angular': 'Angular is a TypeScript-based front-end framework for building web applications.',
    'show code': '```ts\nconsole.log("Hello World!");\nfunction sum(a: number, b: number) { return a + b; }\n```'
  };
  constructor(private globalService: GlobalService) { }
  ngOnInit() {
    this.globalService.chat$.subscribe(chat => {
      if (chat === 'newChat') {
        this.messages = [];
      }
    });
  }

  send() {
    const text = this.input?.trim();
    if (!text) return;

    // Push user message
    this.messages.push({ id: this.messages.length, role: 'user', text });
    this.input = '';
    this.scrollToBottom();

    // Simulate assistant response
    this.simulateAssistantResponse(text.toLowerCase());
  }

  simulateAssistantResponse(userText: string) {
    const replyText = this.dummyQA[userText] || 'Sorry, I do not have an answer for that.';
    const isCode = replyText.startsWith('```');

    const msgIndex = this.messages.length;
    const assistantMsg: Message = { id: msgIndex, role: 'assistant', text: '', isCode, isTyping: !isCode };
    this.messages.push(assistantMsg);
    this.scrollToBottom();

    if (isCode) {
      // Render code instantly
      assistantMsg.text = replyText;
      assistantMsg.isTyping = false;
      this.scrollToBottom();
      setTimeout(() => Prism.highlightAll(), 50);
      return;
    }

    // Typewriter effect for plain text
    let i = 0;
    const typingSpeed = 30;
    const interval = setInterval(() => {
      if (i < replyText.length) {
        assistantMsg.text += replyText.charAt(i);
        i++;
        this.scrollToBottom();
      } else {
        clearInterval(interval);
        const msg = this.messages.find(m => m.id === msgIndex);
        if (msg) msg.isTyping = false; // turn off typing dots for this message
      }
    }, typingSpeed);
  }

  scrollToBottom() {
    setTimeout(() => {
      const el = this.scrollEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code.replace(/```[a-z]*\n|```/g, ''));
  }
}
