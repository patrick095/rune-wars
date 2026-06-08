import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface AuthResponse {
  access_token: string;
  user_id: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'rw_token';
  private readonly API = '/api';

  isLoggedIn = signal(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  register(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.API}/auth/register`, { email, password }).pipe(
      tap(res => this.storeToken(res.access_token))
    );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.API}/auth/login`, { email, password }).pipe(
      tap(res => this.storeToken(res.access_token))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private storeToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isLoggedIn.set(true);
  }
}
