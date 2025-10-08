import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import Prism from 'prismjs';
import { GlobalService } from '../services/global.service';
import { Observable } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { ChatResponse } from '../interfaces/chat-response';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  isCode?: boolean;
  isTyping?: boolean;
}

interface AskAIRequest {
  query: string;
  modelName: string;
  modelFamily: string;
}

interface AskAIResponse {
  answer: string;
  modelName: string;
  modelFamily: string;
  promptToken: number;
  completionToken: number;
  totalToken: number;
  error?: any;
  message?: string;
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
  userChatMsg = '';

  constructor(private globalService: GlobalService) { }
  ngOnInit() {
    this.globalService.chat$.subscribe(chat => {
      if (chat === 'newChat') {
        this.messages = [];
      }
    });
  }
  send() {
    const text = this.userChatMsg?.trim();
    if (!text) return;

    // Push user message
    this.messages.push({ id: this.messages.length, role: 'user', text });
    this.userChatMsg = '';
    this.scrollToBottom();

    // Prepare assistant message with typing effect
    const msgIndex = this.messages.length;
    const assistantMsg: Message = { id: msgIndex, role: 'assistant', text: '', isTyping: true };
    this.messages.push(assistantMsg);
    this.scrollToBottom();

    // API call
    this.globalService.askAI({
      query: text,
      modelName: 'Grok',
      modelFamily: 'meta-llama/llama-3.3-8b-instruct:free'
    }).subscribe({
      next: (res: ChatResponse) => {
        const fullText = res.answer;
        assistantMsg.isCode = fullText.startsWith('```');

        // Typewriter effect
        let i = 0;
        const typingSpeed = 20;
        const interval = setInterval(() => {
          if (i < fullText.length) {
            assistantMsg.text += fullText.charAt(i);
            i++;
            this.scrollToBottom();
          } else {
            clearInterval(interval);
            assistantMsg.isTyping = false;

            // Highlight code if present
            if (assistantMsg.isCode) {
              setTimeout(() => Prism.highlightAll(), 50);
            }
          }
        }, typingSpeed);
      },
      error: () => {
        assistantMsg.text = 'Sorry, something went wrong!';
        assistantMsg.isTyping = false;
        this.scrollToBottom();
      }
    });
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
