import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

interface ModelOption { label: string; value: string; }

@Component({
  selector: 'app-chat-topbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule, DropdownModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class ChatTopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() selectedModelChange = new EventEmitter<string>();

  models: ModelOption[] = [
    { label: 'Model 1', value: 'model-1' },
    { label: 'Model 2', value: 'model-2' },
    { label: 'Model 3', value: 'model-3' }
  ];


  selectedModel: string = this.models[0].value;

  selectModel(v: string) {
    this.selectedModel = v;
    this.selectedModelChange.emit(v);
    console.log('Selected Model:', v);
  }
}
