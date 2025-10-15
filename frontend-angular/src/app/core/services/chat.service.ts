import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket!: Socket;
  private base = environment.apiUrl.replace(/\/api$/, '');

  constructor(private http: HttpClient) {}

  connect(): void {
    if (!this.socket) {
      this.socket = io(this.base, { transports: ['websocket'], autoConnect: true, reconnection: true, reconnectionAttempts: Infinity });
    }
  }

  joinRoom(roomId: string, userId: string): void {
    this.connect();
    this.socket.emit('joinRoom', { roomId, userId });
  }

  sendMessage(roomId: string, senderId: string, text: string): void {
    this.socket.emit('message', { roomId, senderId, text });
  }

  onMessage(): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on('message', (msg) => subscriber.next(msg));
    });
  }

  onFile(): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on('fileUpload', (msg) => subscriber.next(msg));
    });
  }

  emitTyping(roomId: string, userId: string, isTyping: boolean): void {
    this.socket.emit('typing', { roomId, userId, isTyping });
  }

  onTyping(): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on('typing', (ev) => subscriber.next(ev));
    });
  }

  uploadAttachment(file: File){
    const fd = new FormData();
    fd.append('attachmentFile', file);
    return this.http.post<any>(`${environment.apiUrl}/chat/upload`, fd);
  }
}
