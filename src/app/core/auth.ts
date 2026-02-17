import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
