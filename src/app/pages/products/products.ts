import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsService, Product } from '../../core/products';
import { ProductFormComponent } from './product-form/product-form';
import { AuthService } from '../../core/auth';
import { PermissionService } from '../../core/permission.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.html',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  dataSource = new MatTableDataSource<Product>();
  displayedColumns: string[] = [];
  isAdmin = false;

  private productsService = inject(ProductsService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);

  ngOnInit() {
    this.isAdmin = this.authService.is_admin();
    this.displayedColumns = this.isAdmin
      ? ['id_product', 'name', 'price', 'stock', 'images', 'actions']
      : ['id_product', 'name', 'price', 'stock', 'images'];
    this.loadProducts();
  }

  loadProducts() {
    this.productsService.get_products().subscribe({
      next: (data) => {
        const productsArray = Array.isArray(data) ? data : (data as any)?.data || [];
        this.products = productsArray;
        this.dataSource.data = productsArray;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching products', err)
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }

  goToClients() {
    this.router.navigate(['/clients']);
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  openProductForm(product?: Product) {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '500px',
      data: product ? { product } : {}
    });

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  deleteProduct(product: Product) {
    if (!this.permissionService.canDeleteProduct()) {
      this.snackBar.open('Você não tem permissão para deletar produtos', 'Fechar', { duration: 3000 });
      return;
    }

    if (confirm(`Tem certeza que deseja deletar o produto "${product.name}"?`)) {
      this.productsService.delete_product(product.id_product).subscribe({
        next: () => {
          this.snackBar.open('Produto deletado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadProducts();
        },
        error: (err) => {
          console.error('Erro ao deletar produto', err);
          this.snackBar.open('Erro ao deletar produto. Tente novamente.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  getImagePreview(images?: string[]): string {
    return images && images.length > 0 ? images[0] : '';
  }
}
