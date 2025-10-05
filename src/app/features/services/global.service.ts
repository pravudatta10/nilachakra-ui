import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor() { }

  private chatSource = new Subject<string>();
  chat$ = this.chatSource.asObservable();

  startNewChat(chat: string) {
    this.chatSource.next(chat);
  }
}
