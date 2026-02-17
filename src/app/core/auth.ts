import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface JwtPayload {
  sub?: number;
  id_client?: number;
  email?: string;
  id_permission?: number;
  type?: string;
  iat?: number;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private api_url = 'http://localhost:3000/api/v1/auth/login';

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(this.api_url, data);
  }

  save_token(token: string) {
    localStorage.setItem('access_token', token);
  }

  get_token(): string | null {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
  }

  decode_token(): JwtPayload | null {
    const token = this.get_token();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Erro ao decodificar token', error);
      return null;
    }
  }

  is_admin(): boolean {
    const payload = this.decode_token();
    return payload?.id_permission === 1;
  }

  get_current_user_id(): number | null {
    const payload = this.decode_token();
    return payload?.sub || payload?.id_client || null;
  }

  has_permission(permission: 'admin' | 'client'): boolean {
    if (permission === 'admin') {
      return this.is_admin();
    }
    return !!this.get_token();
  }
}
