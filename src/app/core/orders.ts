import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from './clients';

export interface OrderItem {
  id_order_item: number;
  total_items: string | number;
  product: {
    id_product: number;
    name: string;
    price: string | number;
    images: string[];
    stock?: number;
  };
  client: Client;
}

export interface Order {
  id_order: number;
  total_items: string | number;
  id_client: Client | number;
  orderItems?: OrderItem[];
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private http = inject(HttpClient);
  private api_url = 'http://localhost:3000/api/v1/orders';

  get_orders(): Observable<any> {
    return this.http.get<any>(this.api_url);
  }

  create_order(order: any): Observable<any> {
    return this.http.post<any>(this.api_url, order);
  }

  update_order(id: number, order: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.api_url}/${id}`, order);
  }

  delete_order(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api_url}/${id}`);
  }
}
