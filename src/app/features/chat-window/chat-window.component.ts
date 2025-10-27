import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import hljs from 'highlight.js';
import { MarkdownModule } from 'ngx-markdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';

import { ChatRequest } from '../interfaces/chat-request';
import { ChatResponse } from '../interfaces/chat-response';
import { Message } from '../interfaces/Message';
import { ModelDetails } from '../interfaces/ModelDetails';
import { GlobalService } from '../services/global.service';
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
  autoScroll = true;
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
        this.messages = [];
        this.globalService.getChatByConversationId(conversationId).subscribe((history) => {
          history.forEach((msg) => {
            const msgIndex = this.messages.length;
            this.messages.push({ id: msgIndex, role: 'user', text: msg.query });
            this.messages.push({ id: msgIndex + 1, role: 'assistant', text: msg.answer, modelName: msg.modelName, userQuery: msg.query, showThreeDots: false });
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
    const assistantMsg: Message = { id: msgIndex, role: 'assistant', text: '', isTyping: true, modelName: this.selectedModel.displayName, userQuery: text, showThreeDots: true };
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
  private handleAIResponse(response: ChatResponse, assistantMessage: Message): void {
    const answerText = response.answer;
    this.conversationId = response.conversationId;

    assistantMessage.showThreeDots = false;
    assistantMessage.isTyping = true;
    this.isSendDisabled = true;

    let charIndex = 0;
    const typingSpeed = 15; // milliseconds per character

    const typingInterval = setInterval(() => {
      if (charIndex < answerText.length) {
        assistantMessage.text += answerText.charAt(charIndex);
        charIndex++;

        // Scroll every few characters to prevent flickering
        if (charIndex % 2 === 0) {
          this.scrollToBottom();
        }
      } else {
        clearInterval(typingInterval);
        assistantMessage.isTyping = false;
        this.isSendDisabled = false;
        this.scrollToBottom();
      }
    }, typingSpeed);
  }

  scrollToBottom(): void {
    if (!this.autoScroll) return;

    setTimeout(() => {
      const scrollContainer = this.scrollEl?.nativeElement;
      if (!scrollContainer) return;

      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }, 50);
  }

  ngAfterViewChecked() {
    const codeBlocks = this.scrollEl?.nativeElement.querySelectorAll('pre code');
    codeBlocks?.forEach(block => {
      const el = block as HTMLElement;
      if (!el.dataset['highlighted']) {
        hljs.highlightElement(el);
      }
    });
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
    this.autoScroll = true;
    this.scrollToBottom();
    this.overlayPanel.hide();
  }

  togglePanel(event: Event) {
    this.overlayPanel.toggle(event);
  }

  likeMessage(msg: Message) {
    // You can send this info to server if needed
  }

  dislikeMessage(msg: Message) {
    // You can send this info to server if needed
  }

  regenerateMessage(msg: Message) {
    if (!msg.text) return;
    this.userChatMsg = msg.userQuery || '';
    this.autoScroll = true;
    this.send();
    this.scrollToBottom();
  }

  onScroll() {
    const scrollElement = this.scrollEl?.nativeElement;
    if (!scrollElement) return;
    const atBottom =
      scrollElement.scrollHeight - scrollElement.scrollTop <=
      scrollElement.clientHeight + 1;
    this.autoScroll = atBottom;
  }
}
