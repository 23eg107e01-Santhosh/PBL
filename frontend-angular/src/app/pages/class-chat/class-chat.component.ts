import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatApiService } from '../../core/services/chat-api.service';

@Component({
  selector: 'app-class-chat',
  template: `
    <div class="chat-container" *ngIf="roomId">
      <div class="messages" #scrollArea>
        <div class="msg" *ngFor="let m of messages" [class.me]="m.sender === myUserId">
          <div class="meta">
            <span class="sender">{{ m.sender?.email || m.username || (m.sender === myUserId ? 'You' : 'User') }}</span>
            <span class="time">{{ m.createdAt | date:'short' }}</span>
          </div>
          <div class="content" *ngIf="m.messageType !== 'file'">{{ m.message }}</div>
          <div class="content file" *ngIf="m.messageType === 'file'">
            <a [href]="abs(m.fileUrl)" target="_blank">{{ m.fileName || 'Attachment' }}</a>
            <a mat-stroked-button color="primary" [href]="abs(m.fileUrl)" download>Download</a>
          </div>
        </div>
        <div class="typing" *ngIf="typingUsers.size">Someone is typing...</div>
      </div>
      <form [formGroup]="form" (ngSubmit)="send()" class="composer" (keydown)="notifyTyping(true)" (keyup)="notifyTyping(false)">
        <mat-form-field appearance="outline" class="grow">
          <input matInput formControlName="text" placeholder="Type a message" />
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Send</button>
      </form>
    </div>
  `,
  styles: [`
    .chat-container{max-width:1000px;margin:0 auto;display:flex;flex-direction:column;height:calc(100vh - 160px);} 
    .messages{flex:1;overflow:auto;background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;}
    .msg{margin-bottom:12px;padding:8px;background:#111827;border:1px solid rgba(255,255,255,0.06);border-radius:8px;}
    .msg.me{background:#1f2937;}
    .meta{display:flex;justify-content:space-between;color:#9ca3af;font-size:12px;margin-bottom:4px;}
    .content{color:#e5e7eb;}
    .content.file a{margin-right:8px;}
    .composer{display:flex;gap:8px;align-items:center;margin-top:12px;}
    .composer .grow{flex:1;}
    .typing{color:#94a3b8;font-style:italic;}
  `],
  standalone: false
})
export class ClassChatComponent implements OnInit, OnDestroy {
  roomId!: string;
  myUserId!: string;
  messages: any[] = [];
  form!: FormGroup;
  typingUsers = new Set<string>();
  typingTimeout: any = null;
  @ViewChild('scrollArea') scrollArea!: ElementRef<HTMLDivElement>;
  private apiBase = environment.apiUrl.replace(/\/api$/, '');

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private chat: ChatService, private auth: AuthService, private chatApi: ChatApiService) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id')!;
    this.myUserId = this.auth.currentUserValue?.id as string;
    this.form = this.fb.group({ text: ['', Validators.maxLength(2000)] });
    
    // Load chat history first
    this.loadChatHistory();
    
    // Join room and set up real-time listeners
    this.chat.joinRoom(this.roomId, this.myUserId);
    this.chat.onMessage().subscribe(m => { if (m.chatRoom === this.roomId) { this.messages.push(m); this.scrollToBottom(); } });
    this.chat.onFile().subscribe(m => { if (m.chatRoom === this.roomId) { m.messageType = 'file'; this.messages.push(m); this.scrollToBottom(); } });
    this.chat.onTyping().subscribe(ev => { if (ev && ev.userId !== this.myUserId) { if (ev.isTyping) this.typingUsers.add(ev.userId); else this.typingUsers.delete(ev.userId); }});
  }

  loadChatHistory(): void {
    this.chatApi.history(this.roomId).subscribe({
      next: (res: any) => {
        this.messages = res.data?.messages || [];
        this.scrollToBottom();
      },
      error: (err) => console.error('Failed to load chat history:', err)
    });
  }
  ngOnDestroy(): void {}

  scrollToBottom(){ setTimeout(()=>{ if (this.scrollArea) { const el = this.scrollArea.nativeElement; el.scrollTop = el.scrollHeight; } }, 0); }

  notifyTyping(isDown: boolean){
    if (!this.roomId || !this.myUserId) return;
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.chat.emitTyping(this.roomId, this.myUserId, true);
    this.typingTimeout = setTimeout(()=> this.chat.emitTyping(this.roomId, this.myUserId, false), isDown ? 1200 : 300);
  }

  send(): void {
    const text: string = (this.form.value.text || '').trim();
    // Only send text messages
    // Send text message
    if (text) {
      this.chat.sendMessage(this.roomId, this.myUserId, text);
      this.form.reset();
    }
  }
  abs(url: string){ if (!url) return ''; if (/^https?:\/\//i.test(url)) return url; if (url.startsWith('/')) return this.apiBase + url; return this.apiBase + '/' + url; }
}

