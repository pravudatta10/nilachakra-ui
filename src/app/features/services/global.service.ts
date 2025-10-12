import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ResponseHandlerService } from './response-handler.service';
import { GlobalResponse } from '../interfaces/GlobalResponse.model';
import { ChatRequest } from '../interfaces/chat-request';
import { ChatResponse } from '../interfaces/chat-response';
import { ModelDetails } from '../interfaces/ModelDetails';

export type HttpMethod = 'GET' | 'POST' | 'DELETE';

@Injectable({ providedIn: 'root' })
export class GlobalService {

  private apiBaseUrl = environment.apiBaseUrl;

  // --- Loader ---
  private loadingCounter = 0;
  loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private showLoader() {
    this.loadingCounter++;
    if (this.loadingCounter === 1) this.loadingSubject.next(true);
  }

  private hideLoader() {
    this.loadingCounter--;
    if (this.loadingCounter <= 0) {
      this.loadingCounter = 0;
      this.loadingSubject.next(false);
    }
  }

  // --- Chat stream ---
  private chatSource = new BehaviorSubject<string>(''); // can use BehaviorSubject for latest value
  chat$ = this.chatSource.asObservable();

  constructor(private http: HttpClient, private responseHandler: ResponseHandlerService) { }

  // --- Generic API call ---
  apiCall<T>(
    url: string,
    method: HttpMethod,
    body?: any,
    params?: HttpParams,
    skipLoader: boolean = false
  ): Observable<T> {
    if (!skipLoader) this.showLoader();

    let request$: Observable<GlobalResponse<T>>;
    const options = { params };

    switch (method) {
      case 'GET': request$ = this.http.get<GlobalResponse<T>>(`${this.apiBaseUrl}${url}`, options); break;
      case 'POST': request$ = this.http.post<GlobalResponse<T>>(`${this.apiBaseUrl}${url}`, body, options); break;
      case 'DELETE': request$ = this.http.delete<GlobalResponse<T>>(`${this.apiBaseUrl}${url}`, options); break;
      default: throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return this.responseHandler.handleResponse(request$).pipe(
      finalize(() => {
        if (!skipLoader) this.hideLoader();
      })
    );
  }

  // --- Chat-specific methods ---
  startNewChat(message: string) {
    this.chatSource.next(message);
  }

  aiQueries(payload: ChatRequest, skipLoader: boolean = false): Observable<ChatResponse> {
    return this.apiCall<ChatResponse>('/ai/queries', 'POST', payload, undefined, skipLoader);
  }

  getModels(skipLoader: boolean = false): Observable<ModelDetails[]> {
    return this.apiCall<ModelDetails[]>('/models', 'GET', undefined, undefined, skipLoader);
  }

  getChatByConversationId(conversationId: number, skipLoader: boolean = false): Observable<ChatResponse[]> {
    return this.apiCall<ChatResponse[]>(`/chats/${conversationId}`, 'GET', undefined, undefined, skipLoader);
  }

  getConversationByUserName(username: string, skipLoader: boolean = false): Observable<any> {
    const params = new HttpParams().set('userName', username);
    return this.apiCall<any>(`/conversations`, 'GET', undefined, params, skipLoader);
  }
}
