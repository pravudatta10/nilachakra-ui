import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatSidebarComponent } from '../sidebar/sidebar.component';
import { ChatTopbarComponent } from '../topbar/topbar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ChatSidebarComponent, ChatTopbarComponent, ChatWindowComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  appName = 'nilachakra';
  mobileSidebarOpen = false;

  toggleMobileSidebar(open?: boolean) {
    if (typeof open === 'boolean') this.mobileSidebarOpen = open;
    else this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  onModelSelected(value: string) {
    console.log('Selected model:', value);
  }
}
