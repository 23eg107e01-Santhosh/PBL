import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private api = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}
  upload(roomId: string, file?: File, linkUrl?: string): Observable<any> {
    if (file) {
      const fd = new FormData();
      fd.append('roomId', roomId);
      fd.append('resourceFile', file);
      return this.http.post(`${this.api}/resources/upload`, fd);
    }
    return this.http.post(`${this.api}/resources/upload`, { roomId, linkUrl });
  }
  list(roomId: string): Observable<any> {
    return this.http.get(`${this.api}/resources/${roomId}`);
  }
}
