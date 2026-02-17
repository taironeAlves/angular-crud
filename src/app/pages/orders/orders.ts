import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrdersService, Order } from '../../core/orders';
import { OrderFormComponent } from './order-form/order-form';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  dataSource = new MatTableDataSource<Order>();
  displayedColumns = ['id_order', 'id_client', 'total_items', 'actions'];
  isAdmin = false;

  private ordersService = inject(OrdersService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.isAdmin = this.authService.is_admin();
    this.loadOrders();
  }

  loadOrders() {
    this.ordersService.get_orders().subscribe({
      next: (data) => {
        const ordersArray = Array.isArray(data) ? data : (data as any)?.data || [];

        if (!this.isAdmin) {
          const currentUserId = this.authService.get_current_user_id();
          this.orders = ordersArray.filter((o: Order) => {
            const clientId = typeof o.id_client === 'object' ? o.id_client.id_client : o.id_client;
            return clientId === currentUserId;
          });
        } else {
          this.orders = ordersArray;
        }

        this.dataSource.data = this.orders;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: (err) => console.error('Error fetching orders', err)
    });
  }

  getClientName(order: Order): string {
    if (typeof order.id_client === 'object') {
      return order.id_client.razao_social || order.id_client.email || `Cliente #${order.id_client.id_client}`;
    }
    return `Cliente #${order.id_client}`;
  }

  logout() {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  goToClients() {
    this.router.navigate(['/clients']);
  }

  openOrderForm(order?: Order) {
    const viewOnly = !this.isAdmin && !!order;
    const dialogRef = this.dialog.open(OrderFormComponent, {
      width: '600px',
      data: order ? { order, viewOnly } : {}
    });

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      if (result) {
        this.loadOrders();
      }
    });
  }

  deleteOrder(order: Order) {
    if (!this.isAdmin) {
      this.snackBar.open('Você não tem permissão para deletar pedidos', 'Fechar', { duration: 3000 });
      return;
    }

    if (confirm(`Tem certeza que deseja deletar o pedido #${order.id_order}?`)) {
      this.ordersService.delete_order(order.id_order).subscribe({
        next: () => {
          this.snackBar.open('Pedido deletado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadOrders();
        },
        error: (err) => {
          console.error('Erro ao deletar pedido', err);
          this.snackBar.open('Erro ao deletar pedido. Tente novamente.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}
