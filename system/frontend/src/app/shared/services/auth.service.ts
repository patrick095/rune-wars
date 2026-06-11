import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  access_token: string;
  user_id: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'rw_token';
  private readonly API = environment.apiUrl;

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

  /**
   * Decodes the JWT payload without verifying the signature.
   * Returns null if no token is stored or the token is malformed.
   */
  getDecodedToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload as JwtPayload;
    } catch {
      return null;
    }
  }

  /** Returns true if the current user has admin privileges. */
  isAdmin(): boolean {
    return this.getDecodedToken()?.isAdmin === true;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private storeToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isLoggedIn.set(true);
  }
}
