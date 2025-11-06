import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ResponseHandlerService } from './response-handler.service';
import { GlobalResponse } from '../interfaces/GlobalResponse.model';
import { ChatRequest } from '../interfaces/chat-request';
import { ChatResponse } from '../interfaces/chat-response';
import { ModelDetails } from '../interfaces/ModelDetails';

export type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PUT';

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
  private chatSource = new BehaviorSubject<string>('');
  private continueChatSource = new BehaviorSubject<number>(0);
  private activeStreamId: string | null = null;
  chat$ = this.chatSource.asObservable();
  continueChat$ = this.continueChatSource.asObservable();

  constructor(private http: HttpClient, private responseHandler: ResponseHandlerService, private zone: NgZone) { }

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
      case 'PUT': request$ = this.http.put<GlobalResponse<T>>(`${this.apiBaseUrl}${url}`, body, options); break;
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

  continueChat(conversationId: number) {
    this.continueChatSource.next(conversationId);
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

  renameChat(conversationId: number, newTitle: string, skipLoader: boolean = false): Observable<any> {
    const url = `/conversations/rename?conversationId=${conversationId}&newTitle=${encodeURIComponent(newTitle)}`;
    return this.apiCall<any>(url, 'PUT', undefined, undefined, skipLoader);
  }

  deleteChat(conversationId: number, skipLoader: boolean = false): Observable<any> {
    return this.apiCall<any>(`/chats/delete/${conversationId}`, 'DELETE', undefined, undefined, skipLoader);
  }
  stopStreaming(): Observable<any> {
    if (this.activeStreamId === null) {
      throw new Error('No active stream to stop.');
    }
    return this.apiCall<any>(`/conversations/stop/${this.activeStreamId}`, 'POST');
  }
  // --- STREAMING API ---  
  aiQueriesStream(payload: ChatRequest): Observable<ChatResponse> {
    return new Observable<ChatResponse>(observer => {
      const streamUrl = `${this.apiBaseUrl}/ai/queries/stream`;

      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
      let cancel = false;

      fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(payload)
      })
        .then(response => {
          if (!response.ok || !response.body) {
            throw new Error(`Stream connection failed: ${response.status}`);
          }

          reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');

          const readStream = async () => {
            while (!cancel) {
              const { done, value } = await reader!.read();
              if (done || cancel) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data:')) {
                  const data = line.replace(/^data:\s*/, '');
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.streamId) {
                      this.activeStreamId = parsed.streamId;
                    }
                    if(parsed.answer === '[DONE]') {
                      continue;
                    }
                    observer.next(parsed);
                  } catch { 
                    observer.next(data as unknown as ChatResponse);
                  }
                }
              }
            }
            observer.complete();
          };
          readStream().catch(err => observer.error(err));
        })
        .catch(err => observer.error(err)); 
      return () => {
        cancel = true;
        if (reader) {
          reader.cancel().catch(() => { });
        }
      };
    });
  }
}

