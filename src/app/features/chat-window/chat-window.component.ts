import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';

interface Message { role: 'user' | 'assistant'; text: string; }

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, FormsModule, CardModule],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent {
  @ViewChild('scrollEl', { static: false }) scrollEl!: ElementRef<HTMLElement>;
  username = 'Pravudatta';

  messages: Message[] = [
    // { role: 'assistant', text: 'Hi! I\'m Nilachakra Assistant. Ask me anything.' },
    // { role: 'user', text: 'How do I center a div in CSS?' },
    // { role: 'assistant', text: 'Use flexbox: set parent display:flex; align-items:center; justify-content:center; and set a width/height to the child.' },
    // { role: 'user', text: 'Explain SOLID principles briefly.' },
    // { role: 'assistant', text: 'SOLID: Single responsibility, Open/Closed, Liskov substitution, Interface segregation, Dependency inversion.' }
  ];

  input = '';
  isThinking = false;

  send() {
    const text = this.input && this.input.trim();
    if (!text) return;
    const userMsg: Message = { role: 'user', text };
    this.messages.push(userMsg);
    this.input = '';
    this.scrollToBottom();
    this.simulateAssistantResponse(text);
  }

  sendSuggestion(text: string) {
    this.input = text;
    this.send();
  }

  simulateAssistantResponse(userText: string) {
    this.isThinking = true;
    // simple simulated response logic with delay
    setTimeout(() => {
      const reply: Message = {
        role: 'assistant',
        text: `You asked: "${userText}". This is a simulated reply from Nilachakra Assistant.`
      };
      this.messages.push(reply);
      this.isThinking = false;
      this.scrollToBottom();
    }, 900);
  }

  scrollToBottom() {
    setTimeout(() => {
      try {
        const el = this.scrollEl?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      } catch (e) {
        // ignore
      }
    }, 50);
  }
}
