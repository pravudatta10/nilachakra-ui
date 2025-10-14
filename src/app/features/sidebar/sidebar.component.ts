import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { GlobalService } from '../services/global.service';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, FormsModule, TableModule, DialogModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class ChatSidebarComponent {
  constructor(private globalService: GlobalService) { }
  username = "Pravudatta";
  chatHistory: any[] = [];
  historyDialog = false;
  selectedChatDetail: any = null;
  hoveredChat: any = null;
  searchText: string = '';
  startNewChat() {
    this.globalService.startNewChat("newChat");
  }
  openChatHistoryPanel() {
    this.globalService.getConversationByUserName(this.username).subscribe({
      next: (res) => {
        this.chatHistory = res;
        this.historyDialog = true;
      }
    });
  }

  loadChatDetail(chat: any) {
    // this.hoveredChat = chat;
    // this.globalService.getChatDetailById(chat.id).subscribe({
    //   next: (res) => {
    //     this.selectedChatDetail = res;
    //   }
    // });
  }

  filteredChatHistory() {
    if (!this.searchText) return this.chatHistory;
    return this.chatHistory.filter(chat => chat.title.toLowerCase().includes(this.searchText.toLowerCase()));
  }
}
