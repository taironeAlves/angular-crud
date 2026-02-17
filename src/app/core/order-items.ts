import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  id_order_item: number;
  id_order: number;
  id_product: number;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderItemsService {
  private http = inject(HttpClient);
  private api_url = 'http://localhost:3000/api/v1/order-items';

  get_order_items(orderId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.api_url}?id_order=${orderId}`);
  }

  create_order_item(item: Partial<OrderItem>): Observable<OrderItem> {
    return this.http.post<OrderItem>(this.api_url, item);
  }

  delete_order_item(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api_url}/${id}`);
  }
}
