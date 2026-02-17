import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id_client: number;
  name: string;
  email: string;
  address: string;
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
}
