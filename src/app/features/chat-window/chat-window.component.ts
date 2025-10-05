import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { GlobalService } from '../services/global.service';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  isCode?: boolean; // indicates code block
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
  isThinking = false;

  // Predefined Q&A (including a code example)
  dummyQA: { [key: string]: string } = {
    'hi': 'Hello! I\'m Nilachakra Assistant. How can I help you today?',
    'hello': 'Hi there! Ask me anything about Angular or TypeScript.',
    'what is angular': 'Angular is a TypeScript-based front-end framework for building web applications.',
    'show code': '```ts\nconsole.log("Hello World!");\nfunction add(a: number, b: number){ return a + b; }\n```'
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

    const userMsg: Message = { role: 'user', text };
    this.messages.push(userMsg);
    this.input = '';
    this.scrollToBottom();

    this.simulateAssistantResponse(text.toLowerCase());
  }

  simulateAssistantResponse(userText: string) {
    const replyText = this.dummyQA[userText] || 'Sorry, I do not have an answer for that.';

    // Detect code block
    const isCode = replyText.startsWith('```');

    const assistantMsg: Message = { role: 'assistant', text: '', isCode };
    this.messages.push(assistantMsg);
    this.scrollToBottom();

    if (isCode) {
      // Render code instantly
      assistantMsg.text = replyText;
      this.isThinking = false;
      this.scrollToBottom();
      return;
    }

    // Typewriter effect for plain text
    this.isThinking = true;
    let i = 0;
    const typingSpeed = 30;

    const interval = setInterval(() => {
      if (i < replyText.length) {
        assistantMsg.text += replyText.charAt(i);
        i++;
        this.scrollToBottom();
      } else {
        clearInterval(interval);
        this.isThinking = false;
      }
    }, typingSpeed);
  }

  scrollToBottom() {
    setTimeout(() => {
      const el = this.scrollEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }


}
