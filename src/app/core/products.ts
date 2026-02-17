import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id_product: number;
  name: string;
  price: number;
  stock: number;
  images?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private http = inject(HttpClient);

  private api_url = 'http://localhost:3000/api/v1/products';

  get_products(): Observable<Product[]> {
    return this.http.get<Product[]>(this.api_url);
  }

  create_product(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.api_url, product);
  }

  update_product(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.api_url}/${id}`, product);
  }

  delete_product(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api_url}/${id}`);
  }
}
