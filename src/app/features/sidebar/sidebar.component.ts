import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { GlobalService } from '../services/global.service';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { MarkdownModule } from 'ngx-markdown';
import hljs from 'highlight.js';
@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, FormsModule, TableModule, DialogModule, MarkdownModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class ChatSidebarComponent {
  @ViewChild('scrollEl', { static: false }) scrollEl!: ElementRef<HTMLElement>;
  username = "Pravudatta";
  chatHistory: any[] = [];
  historyDialog = false;
  selectedChatDetail: any = null;
  hoveredChat: any = null;
  searchText: string = '';

  constructor(private globalService: GlobalService) { }

  ngAfterViewChecked() {
    const codeBlocks = this.scrollEl?.nativeElement.querySelectorAll('pre code');
    codeBlocks?.forEach(block => hljs.highlightElement(block as HTMLElement));
  }
  startNewChat(historyDialog?: boolean) {
    this.globalService.startNewChat("newChat");
    if (historyDialog) {
      this.historyDialog = false;
    }
  }
  openChatHistoryPanel() {
    this.selectedChatDetail = null;
    this.globalService.getConversationByUserName(this.username).subscribe({
      next: (res) => {
        this.chatHistory = res;
        this.historyDialog = true;
      }
    });
  }

  loadChatDetail(chat: any) {
    this.hoveredChat = chat;
    this.globalService.getChatByConversationId(chat.conversationId).subscribe({
      next: (res) => {
        this.selectedChatDetail = res;
      }
    });
  }

  filteredChatHistory() {
    if (!this.searchText) return this.chatHistory;
    return this.chatHistory.filter(chat => chat.title.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  continueChat() {
    if (this.hoveredChat) {
      this.globalService.continueChat(this.hoveredChat.conversationId);
      this.historyDialog = false;
    }
  }
}
