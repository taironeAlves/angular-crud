import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id_client: number;
  razao_social?: string | null;
  cnpj?: string | null;
  email: string;
  address?: string | null;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  private http = inject(HttpClient);

  private api_url = 'http://localhost:3000/api/v1/clients';

  get_clients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.api_url);
  }

  create_client(client: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(this.api_url, client);
  }

  update_client(id: number, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.api_url}/${id}`, client);
  }

  update_client_password(id: number, client: Partial<Client>): Observable<Client> {
    return this.http.patch<Client>(`${this.api_url}/${id}`, client);
  }

  delete_client(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api_url}/${id}`);
  }
}
