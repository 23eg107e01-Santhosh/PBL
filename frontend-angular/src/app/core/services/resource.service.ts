import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private api = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}
  upload(roomId: string, file?: File, linkUrl?: string, description?: string): Observable<any> {
    if (file) {
      const fd = new FormData();
      fd.append('roomId', roomId);
      fd.append('resourceFile', file);
      if (description) fd.append('description', description);
      return this.http.post(`${this.api}/resources/upload`, fd);
    }
    return this.http.post(`${this.api}/resources/upload`, { roomId, linkUrl, description });
  }
  list(roomId: string): Observable<any> {
    return this.http.get(`${this.api}/resources/${roomId}`);
  }
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.api}/resources/${id}`);
  }
}
