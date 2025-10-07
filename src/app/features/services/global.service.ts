import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ChatRequest } from '../interfaces/chat-request';
import { ChatResponse } from '../interfaces/chat-response';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private apiUrl = 'https://nilachakra-brain.onrender.com/ai/ask/prompt';

  constructor(private http: HttpClient) { }

  private chatSource = new Subject<string>();
  chat$ = this.chatSource.asObservable();

  startNewChat(chat: string) {
    this.chatSource.next(chat);
  }

  askAI(payload: { query: string; modelName: string; modelFamily: string }): Observable<any> {
    return this.http.post('https://nilachakra-brain.onrender.com/ai/ask/prompt', payload);
  }

}
