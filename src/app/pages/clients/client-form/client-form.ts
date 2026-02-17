import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ClientsService, Client } from '../../../core/clients';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface ClientFormData {
  client?: Client;
}

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class ClientFormComponent {
  form: FormGroup;
  submitting = false;

  private fb = inject(FormBuilder);
  private clientsService = inject(ClientsService);
  private dialogRef = inject(MatDialogRef<ClientFormComponent, ClientFormData>);

  data: ClientFormData | null = this.dialogRef.componentInstance?.data || null;

  constructor() {
    this.form = this.fb.group({
      razao_social: [this.data?.client?.razao_social ?? '', Validators.required],
      cnpj: [this.data?.client?.cnpj ?? ''],
      email: [this.data?.client?.email ?? '', [Validators.required, Validators.email]],
      address: [this.data?.client?.address ?? '']
    });
  }

  save() {
    if (this.form.invalid) return;

    this.submitting = true;
    const clientData: Partial<Client> = this.form.value;

    if (this.data?.client) {
      this.clientsService.update_client(this.data.client.id_client, clientData).subscribe({
        next: (res) => {
          console.log('Cliente atualizado', res);
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erro ao atualizar cliente', err);
          this.submitting = false;
        }
      });
    } else {
      this.clientsService.create_client(clientData).subscribe({
        next: (res) => {
          console.log('Cliente criado', res);
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erro ao criar cliente', err);
          this.submitting = false;
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
