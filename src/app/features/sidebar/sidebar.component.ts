import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import hljs from 'highlight.js';
import { MarkdownModule } from 'ngx-markdown';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    AvatarModule,
    FormsModule,
    TableModule,
    DialogModule,
    MarkdownModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class ChatSidebarComponent {
  @ViewChild('scrollEl', { static: false }) scrollEl!: ElementRef<HTMLElement>;
  @ViewChild('menuRef', { static: false }) menuRef!: ElementRef;

  username = 'Pravudatta';
  chatHistory: any[] = [];
  historyDialog = false;
  selectedChatDetail: any = null;
  // hoveredChat: any = null;
  searchText = '';
  editingChatId: number | null = null;
  openMenuId: number | null = null;
  conversationId: number | null = null;
  hoverRow: number | null = null;
  constructor(private globalService: GlobalService, private host: ElementRef) { }

  ngAfterViewChecked() {
    const codeBlocks = this.scrollEl?.nativeElement.querySelectorAll('pre code');
    codeBlocks?.forEach(block => {
      const el = block as HTMLElement;
      if (!el.dataset['highlighted']) {
        hljs.highlightElement(el);
      }
    });
  }

  openChatHistoryPanel() {
    this.selectedChatDetail = null;
    this.globalService.getConversationByUserName(this.username).subscribe({
      next: (res) => {
        this.chatHistory = (res || []).map((c: any) => ({ ...c, editTitle: c.title }));
        this.historyDialog = true;
        this.searchText = '';
      },
      error: () => {
        this.chatHistory = [];
        this.historyDialog = true;
      }
    });
  }

  startNewChat(historyDialog?: boolean) {
    this.globalService.startNewChat('newChat');
    if (historyDialog) this.historyDialog = false;
  }

  loadChatDetail(chat: any) {
    this.conversationId = chat.conversationId;
    this.globalService.getChatByConversationId(chat.conversationId).subscribe({
      next: (res) => {
        this.selectedChatDetail = res;
      },
      error: () => {
        this.selectedChatDetail = null;
      }
    });
  }

  filteredChatHistory() {
    if (!this.searchText) return this.chatHistory;
    const q = this.searchText.toLowerCase();
    return this.chatHistory.filter(chat => chat.title?.toLowerCase().includes(q));
  }

  continueChat() {
    if (this.conversationId && this.selectedChatDetail) {
      this.globalService.continueChat(this.conversationId);
      this.historyDialog = false;
    }
  }

  toggleMenu(chat: any, event: MouseEvent) {
    event.stopPropagation();
    this.editingChatId = null;
    this.openMenuId = this.openMenuId === chat.conversationId ? null : chat.conversationId;
  }

  startEdit(chat: any) {
    this.openMenuId = null;
    this.editingChatId = chat.conversationId;
    chat.editTitle = chat.editTitle ?? chat.title;
    setTimeout(() => {
      const inputSel = `.chat-table .edit-input`;
      const input = document.querySelector(inputSel) as HTMLInputElement | null;
      if (input) input.focus();
      if (input && input.value) {
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 0);
  }

  finishRename(chat: any) {
    if (!chat.editTitle || !chat.editTitle.trim()) {
      chat.editTitle = chat.title;
      this.editingChatId = null;
      return;
    }
    const newTitle = chat.editTitle.trim();
    if (newTitle === chat.title) {
      this.editingChatId = null;
      return;
    }

    this.globalService.renameChat(chat.conversationId, newTitle).subscribe({
      next: () => {
        chat.title = newTitle;
        this.editingChatId = null;
      },
      error: () => {
        chat.editTitle = chat.title;
        this.editingChatId = null;
      }
    });
  }

  deleteChat(chatOrId: any) {
    const conversationId = typeof chatOrId === 'object' ? chatOrId.conversationId : chatOrId;
    this.openMenuId = null;
    this.editingChatId = null;
    this.globalService.deleteChat(conversationId).subscribe({
      next: () => {
        this.chatHistory = this.chatHistory.filter(c => c.conversationId !== conversationId);
        if (this.selectedChatDetail && this.selectedChatDetail.some((x: any) => x.conversationId === conversationId)) {
          this.selectedChatDetail = null;
        }
      },
      error: () => {
        // ignore
      }
    });
  }

  closeMenu(chat: any) {
    if (this.openMenuId === chat.conversationId) {
      this.openMenuId = null;
    }
  }
}
