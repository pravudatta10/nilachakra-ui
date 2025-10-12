import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GlobalResponse } from '../interfaces/GlobalResponse.model';

@Injectable({ providedIn: 'root' })
export class ResponseHandlerService {

  constructor() { }

  handleResponse<T>(obs: Observable<GlobalResponse<T>>): Observable<T> {
    return obs.pipe(
      map(res => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          return res.data;
        } else {
          console.error('API Error:', res.message, res.error);
          throw new Error(res.message || 'Unknown API error');
        }
      }),
      catchError(err => {
        console.error('HTTP or processing error:', err);
        return throwError(() => err);
      })
    );
  }
}
