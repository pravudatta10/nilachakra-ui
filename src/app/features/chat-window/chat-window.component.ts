import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MarkdownModule } from 'ngx-markdown';
import hljs from 'highlight.js';
import { GlobalService } from '../services/global.service';
import { ChatResponse } from '../interfaces/chat-response';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  isTyping?: boolean;
}

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    MarkdownModule,
  ],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements AfterViewChecked {
  @ViewChild('scrollEl', { static: false }) scrollEl!: ElementRef<HTMLElement>;
  username = 'Pravudatta';
  messages: Message[] = [];
  userChatMsg = '';

  constructor(private globalService: GlobalService) { }

  ngOnInit() {
    this.globalService.chat$.subscribe(chat => {
      if (chat === 'newChat') this.messages = [];
    });
  }

  send() {
    const text = this.userChatMsg.trim();
    if (!text) return;

    this.messages.push({ id: this.messages.length, role: 'user', text });
    this.userChatMsg = '';
    this.scrollToBottom();

    const msgIndex = this.messages.length;
    const assistantMsg: Message = { id: msgIndex, role: 'assistant', text: '', isTyping: true };
    this.messages.push(assistantMsg);
    this.scrollToBottom();

    this.globalService.askAI({
      query: text,
      modelName: 'Grok',
      modelFamily: 'meta-llama/llama-3.3-8b-instruct:free'
    }).subscribe({
      next: (res: ChatResponse) => {
        const fullText = res.answer;
        let i = 0;
        const speed = 15;
        const interval = setInterval(() => {
          if (i < fullText.length) {
            assistantMsg.text += fullText.charAt(i);
            i++;
            assistantMsg.isTyping = false;
            this.scrollToBottom();
          } else {
            clearInterval(interval);
            assistantMsg.isTyping = false;
            this.scrollToBottom();
          }
        }, speed);
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

  ngAfterViewChecked() {
    // Highlight all code blocks
    const codeBlocks = this.scrollEl?.nativeElement.querySelectorAll('pre code');
    codeBlocks?.forEach((block) => {
      const codeEl = block as HTMLElement; // <-- cast to HTMLElement
      hljs.highlightElement(codeEl);

      // Add copy button if not already added
      // const pre = codeEl.parentElement;
      // if (pre && !pre.querySelector('.copy-btn')) {
      //   const btn = document.createElement('button');
      //   btn.innerText = 'Copy';
      //   btn.classList.add('copy-btn');
      //   btn.addEventListener('click', () => {
      //     navigator.clipboard.writeText(codeEl.textContent || '');
      //     btn.innerText = 'Copied!';
      //     setTimeout(() => (btn.innerText = 'Copy'), 1000);
      //   });
      //   pre.appendChild(btn);
      // }
    });
  }

}
