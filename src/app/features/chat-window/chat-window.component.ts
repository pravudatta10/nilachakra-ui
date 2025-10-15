import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { MarkdownModule } from 'ngx-markdown';
import hljs from 'highlight.js';

import { GlobalService } from '../services/global.service';
import { ChatRequest } from '../interfaces/chat-request';
import { ChatResponse } from '../interfaces/chat-response';
import { ModelDetails } from '../interfaces/ModelDetails';
import { Message } from '../interfaces/Message';
@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    InputTextareaModule,
    OverlayPanelModule,
    TooltipModule,
    MarkdownModule
  ],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, AfterViewChecked {

  @ViewChild('overlayPanel') overlayPanel!: OverlayPanel;
  @ViewChild('scrollEl', { static: false }) scrollEl!: ElementRef<HTMLElement>;

  username = 'Pravudatta';
  messages: Message[] = [];
  userChatMsg = '';
  models: ModelDetails[] = [];
  selectedModel!: ModelDetails;
  queryPayload!: ChatRequest;
  conversationId: number | null = null;
  isSendDisabled = false;

  constructor(private globalService: GlobalService) { }

  ngOnInit() {
    // Subscribe to new chat events
    this.globalService.chat$.subscribe(chat => {
      if (chat === 'newChat') {
        this.messages = [];
        this.conversationId = null;
      }
    });

    // Load models without showing loader
    this.globalService.getModels(false).subscribe(models => {
      this.models = models;
      this.selectedModel = this.models.find(m => m.isDefault) || this.models[0];
    });

    //Load previous chat if any
    this.globalService.continueChat$.subscribe(conversationId => {
      if (conversationId !== 0) {
        this.conversationId = conversationId;
        this.globalService.getChatByConversationId(conversationId).subscribe((history) => {
          history.forEach((msg) => {
            const msgIndex = this.messages.length;
            this.messages.push({ id: msgIndex, role: 'user', text: msg.query });
            this.messages.push({ id: msgIndex + 1, role: 'assistant', text: msg.answer });
            this.selectedModel = this.models.find(m => m.modelName === msg.modelName) || this.models[0];
            this.scrollToBottom();
          });
        });        
      }
    });
  }

  send() {
    const text = this.userChatMsg.trim();
    if (!text) return;

    // Add user message
    this.messages.push({ id: this.messages.length, role: 'user', text });
    this.userChatMsg = '';
    this.scrollToBottom();

    // Add assistant typing message
    const msgIndex = this.messages.length;
    const assistantMsg: Message = { id: msgIndex, role: 'assistant', text: '', isTyping: true };
    this.messages.push(assistantMsg);
    this.scrollToBottom();

    // Prepare payload
    this.queryPayload = {
      query: text,
      modelName: this.selectedModel.modelName,
      modelId: this.selectedModel.modelId,
      conversationId: this.conversationId,
      userName: this.username
    };

    // Call AI query (skip loader)
    this.globalService.aiQueries(this.queryPayload, true).subscribe({
      next: (res: ChatResponse) => this.handleAIResponse(res, assistantMsg),
      error: () => {
        assistantMsg.text = 'Sorry, something went wrong!';
        assistantMsg.isTyping = false;
        this.scrollToBottom();
      }
    });
  }
  private handleAIResponse(res: ChatResponse, assistantMsg: Message) {
    const fullText = res.answer;
    this.conversationId = res.conversationId;
    assistantMsg.isTyping = false;
    this.isSendDisabled = true;
    let i = 0;
    const speed = 15; // typing animation speed
    const interval = setInterval(() => {
      if (i < fullText.length) {
        assistantMsg.text += fullText.charAt(i);
        i++;        
        console.log("printing");        
        this.scrollToBottom();
      } else {
        clearInterval(interval);
        assistantMsg.isTyping = false;
        this.isSendDisabled = false;
        this.scrollToBottom();
      }
    }, speed);
  }

  scrollToBottom() {
    setTimeout(() => {
      const el = this.scrollEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  ngAfterViewChecked() {
    const codeBlocks = this.scrollEl?.nativeElement.querySelectorAll('pre code');
    codeBlocks?.forEach(block => hljs.highlightElement(block as HTMLElement));
  }

  autoGrow(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    const maxHeight = 72;
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
  }

  onEnter(event: any) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  selectModel(model: ModelDetails) {
    this.selectedModel = model;
    this.overlayPanel.hide();
  }

  togglePanel(event: Event) {
    this.overlayPanel.toggle(event);
  }
}
