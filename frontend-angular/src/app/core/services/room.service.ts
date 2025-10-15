import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private api = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}
  create(payload: { title: string; description?: string }): Observable<any> {
    return this.http.post(`${this.api}/rooms/create`, payload);
  }
  join(code: string): Observable<any> {
    return this.http.post(`${this.api}/rooms/join`, { code });
  }
  myRooms(): Observable<any> {
    return this.http.get(`${this.api}/rooms`);
  }
  get(id: string): Observable<any> {
    return this.http.get(`${this.api}/rooms/${id}`);
  }
  
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.api}/rooms/${id}`);
  }
}
