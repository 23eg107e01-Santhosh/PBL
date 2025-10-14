import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket!: Socket;

  connect(): void {
    if (!this.socket) {
      const base = environment.apiUrl.replace(/\/api$/, '');
      this.socket = io(base, { transports: ['websocket'] });
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
}
