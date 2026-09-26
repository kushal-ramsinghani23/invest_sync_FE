import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/auth';

  token = signal<string | null>(localStorage.getItem('token'));

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        this.token.set(res.token);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.token.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }
}
