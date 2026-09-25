import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Company } from './company';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket = io('http://localhost:3000');

  onCompanyCreated(): Observable<Company> {
    return new Observable((observer) => {
      this.socket.on('companyCreated', (data: Company) => observer.next(data));
    });
  }

  onCompanyUpdated(): Observable<Company> {
    return new Observable((observer) => {
      this.socket.on('companyUpdated', (data: Company) => observer.next(data));
    });
  }

  onCompanyDeleted(): Observable<Company> {
    return new Observable((observer) => {
      this.socket.on('companyDeleted', (data: Company) => observer.next(data));
    });
  }

  onConnectionChange(): Observable<boolean> {
    return new Observable((observer) => {
      this.socket.on('connect', () => observer.next(true));
      this.socket.on('disconnect', () => observer.next(false));
    });
  }

  onActivityLogged(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('activityLogged', (data: any) => observer.next(data));
    });
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
