import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ProductsService, Product } from '../../../core/products';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface ProductFormData {
  product?: Product;
}

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class ProductFormComponent {
  form: FormGroup;
  submitting = false;

  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);
  private dialogRef = inject(MatDialogRef<ProductFormComponent>);
  private snackBar = inject(MatSnackBar);

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProductFormData) {
    this.form = this.fb.group({
      name: [this.data?.product?.name ?? '', Validators.required],
      price: [this.data?.product?.price ?? '', [Validators.required, Validators.min(0)]],
      stock: [this.data?.product?.stock ?? '', [Validators.required, Validators.min(0)]],
      images: [this.data?.product?.images?.join(', ') ?? '']
    });
  }

  save() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }

    this.submitting = true;
    const productData: Partial<Product> = {
      name: this.form.value.name,
      price: this.form.value.price,
      stock: this.form.value.stock,
      images: this.form.value.images ? this.form.value.images.split(',').map((img: string) => img.trim()).filter((img: string) => img) : []
    };

    if (this.data?.product) {
      this.productsService.update_product(this.data.product.id_product, productData).subscribe({
        next: (res) => {
          this.snackBar.open('Produto atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erro ao atualizar produto', err);
          this.snackBar.open('Erro ao atualizar produto. Tente novamente.', 'Fechar', { duration: 3000 });
          this.submitting = false;
        }
      });
    } else {
      this.productsService.create_product(productData).subscribe({
        next: (res) => {
          this.snackBar.open('Produto criado com sucesso!', 'Fechar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erro ao criar produto', err);
          this.snackBar.open('Erro ao criar produto. Tente novamente.', 'Fechar', { duration: 3000 });
          this.submitting = false;
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
