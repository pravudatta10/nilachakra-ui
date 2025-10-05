import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class ChatSidebarComponent {
  constructor(private globalService: GlobalService) {}
  startNewChat() {
    this.globalService.startNewChat("newChat");
  }
}
