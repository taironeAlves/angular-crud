import { Component, inject, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { OrdersService, Order } from '../../../core/orders';
import { OrderItemsService, OrderItem } from '../../../core/order-items';
import { ProductsService, Product } from '../../../core/products';
import { ClientsService, Client } from '../../../core/clients';
import { AuthService } from '../../../core/auth';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

export interface OrderFormData {
  order?: Order;
  viewOnly?: boolean;
}

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.html',
  styleUrls: ['./order-form.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatIconModule
  ]
})
export class OrderFormComponent implements OnInit {
  form: FormGroup;
  submitting = false;
  products: Product[] = [];
  clients: Client[] = [];
  isAdmin = false;

  private fb = inject(FormBuilder);
  private ordersService = inject(OrdersService);
  private orderItemsService = inject(OrderItemsService);
  private productsService = inject(ProductsService);
  private clientsService = inject(ClientsService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<OrderFormComponent>);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  constructor(@Inject(MAT_DIALOG_DATA) public data: OrderFormData) {
    this.isAdmin = this.authService.is_admin();

    const currentUserId = this.authService.get_current_user_id();

    const clientId = this.data?.order?.id_client
      ? (typeof this.data.order.id_client === 'object' ? this.data.order.id_client.id_client : this.data.order.id_client)
      : (this.isAdmin ? null : currentUserId);

    const idClientValidators = this.isAdmin ? [Validators.required] : [];

    this.form = this.fb.group({
      id_client: [clientId, idClientValidators],
      items: this.fb.array([])
    });

    if (this.data?.viewOnly) {
      this.form.disable();
    } else if (this.data?.order) {
      this.form.get('id_client')?.disable();
    } else {
      this.addItem();
    }
  }

  ngOnInit() {
    this.loadProducts();
    if (this.isAdmin) {
      this.loadClients();
    }

    if (this.data?.order?.orderItems && this.data.order.orderItems.length > 0) {
      this.loadOrderItems();
    }
  }

  loadOrderItems() {
    this.data.order!.orderItems!.forEach(orderItem => {
      const itemGroup = this.fb.group({
        id_product: [orderItem.product.id_product, Validators.required],
        quantity: [parseInt(String(orderItem.total_items)) || 1, [Validators.required, Validators.min(1)]],
        price: [parseFloat(String(orderItem.product.price)), Validators.required],
        isExisting: [true]
      });

      itemGroup.get('id_product')?.disable();
      itemGroup.get('quantity')?.disable();

      itemGroup.get('id_product')?.valueChanges.subscribe((productId: number | null) => {
        const product = this.products.find(p => p.id_product === productId);
        if (product) {
          itemGroup.patchValue({ price: product.price });
        }
      });

      this.items.push(itemGroup);
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  loadProducts() {
    this.productsService.get_products().subscribe({
      next: (data) => {
        this.products = Array.isArray(data) ? data : (data as any)?.data || [];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  loadClients() {
    this.clientsService.get_clients().subscribe({
      next: (data) => {
        this.clients = Array.isArray(data) ? data : (data as any)?.data || [];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading clients', err)
    });
  }

  addItem() {
    const itemGroup = this.fb.group({
      id_product: [null as number | null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, Validators.required],
      isExisting: [false]
    });

    itemGroup.get('id_product')?.valueChanges.subscribe((productId: number | null) => {
      const product = this.products.find(p => p.id_product === productId);
      if (product) {
        itemGroup.patchValue({ price: product.price });
      }
    });

    this.items.push(itemGroup);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  save() {
    if (this.form.invalid || this.items.length === 0) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      this.items.controls.forEach(item => {
        Object.keys((item as FormGroup).controls).forEach(key => {
          item.get(key)?.markAsTouched();
        });
      });
      this.snackBar.open('Preencha todos os campos e adicione pelo menos um produto', 'Fechar', { duration: 3000 });
      return;
    }

    this.submitting = true;

    if (this.data?.order) {
      const allItems = this.items.controls.map(control => control.getRawValue());
      const newItems = allItems.filter((item: any) => !item.isExisting);

      if (newItems.length === 0) {
        this.snackBar.open('Nenhum produto novo adicionado', 'Fechar', { duration: 3000 });
        this.submitting = false;
        return;
      }

      const createObservables = newItems.map((item: any) =>
        this.orderItemsService.create_order_item({
          id_order: this.data.order!.id_order!,
          id_product: item.id_product,
          quantity: item.quantity,
          price: item.price
        })
      );

      forkJoin(createObservables).subscribe({
        next: () => {
          this.snackBar.open('Produtos adicionados ao pedido com sucesso!', 'Fechar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erro ao adicionar produtos', err);
          this.snackBar.open('Erro ao adicionar produtos. Tente novamente.', 'Fechar', { duration: 3000 });
          this.submitting = false;
        }
      });
    } else {
      const formData = this.form.getRawValue();

      if (!formData.id_client) {
        this.snackBar.open('Erro: Cliente não identificado. Faça login novamente.', 'Fechar', { duration: 5000 });
        this.submitting = false;
        return;
      }

      const orderPayload = {
        id_client: formData.id_client,
        total_items: this.items.value.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        orderItems: this.items.value.map((item: any) => ({
          id_product: item.id_product,
          quantity: item.quantity,
          price: item.price
        }))
      };

      this.ordersService.create_order(orderPayload).subscribe({
        next: (response) => {
          this.snackBar.open('Pedido criado com sucesso!', 'Fechar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erro ao criar pedido', err);
          this.snackBar.open('Erro ao criar pedido. Tente novamente.', 'Fechar', { duration: 3000 });
          this.submitting = false;
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
