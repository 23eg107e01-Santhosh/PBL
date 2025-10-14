import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private api = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}
  history(roomId: string): Observable<any> {
    return this.http.get(`${this.api}/chat/${roomId}`);
  }
}
