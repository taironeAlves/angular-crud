import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ClientsService, Client } from '../../../core/clients';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface ClientFormData {
  client?: Client;
}

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.html',
  styleUrls: ['./client-form.css'],
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
export class ClientFormComponent {
  form: FormGroup;
  submitting = false;
  loadingCNPJ = false;

  private fb = inject(FormBuilder);
  private clientsService = inject(ClientsService);
  private dialogRef = inject(MatDialogRef<ClientFormComponent>);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  constructor(@Inject(MAT_DIALOG_DATA) public data: ClientFormData) {
    this.form = this.fb.group({
      razao_social: [this.data?.client?.razao_social ?? '', Validators.required],
      cnpj: [{ value: this.data?.client?.cnpj ?? '', disabled: !!this.data?.client }, Validators.required],
      email: [this.data?.client?.email ?? '', [Validators.required, Validators.email]],
      address: [this.data?.client?.address ?? ''],
      password: ['', this.data?.client ? [Validators.minLength(12)] : [Validators.required, Validators.minLength(12)]]
    });
  }

  buscarCNPJ() {
    const cnpj = this.form.get('cnpj')?.value;
    if (!cnpj) {
      this.snackBar.open('Por favor, digite um CNPJ', 'Fechar', { duration: 3000 });
      return;
    }

    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      this.snackBar.open('CNPJ inválido. Deve conter 14 dígitos', 'Fechar', { duration: 3000 });
      return;
    }

    this.loadingCNPJ = true;
    this.http.get<any>(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`).subscribe({
      next: (data) => {
        this.loadingCNPJ = false;
        if (data && data.razao_social) {
          this.form.patchValue({
            razao_social: data.razao_social,
            email: data.estabelecimento?.email || this.form.get('email')?.value,
            address: this.formatarEndereco(data)
          });
          this.snackBar.open('Dados do CNPJ carregados com sucesso!', 'Fechar', { duration: 3000 });
        } else {
          this.snackBar.open('CNPJ não encontrado', 'Fechar', { duration: 3000 });
        }
      },
      error: (err) => {
        this.loadingCNPJ = false;
        console.error('Erro ao buscar CNPJ', err);
        this.snackBar.open('Erro ao buscar CNPJ. Tente novamente.', 'Fechar', { duration: 3000 });
      }
    });
  }

  private formatarEndereco(data: any): string {
    if (!data.estabelecimento) return '';

    const est = data.estabelecimento;
    const partes = [
      est.tipo_logradouro,
      est.logradouro,
      est.numero,
      est.complemento,
      est.bairro,
      est.cidade?.nome,
      est.estado?.sigla,
      est.cep
    ].filter(p => p);

    return partes.join(', ');
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
    const clientData: Partial<Client> = { ...this.form.getRawValue() };

    const hasPassword = clientData.password && clientData.password.trim() !== '';

    if (!hasPassword) {
      delete clientData.password;
    }

    if (this.data?.client) {
      const updateMethod = hasPassword
        ? this.clientsService.update_client_password(this.data.client.id_client, clientData)
        : this.clientsService.update_client(this.data.client.id_client, clientData);

      updateMethod.subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erro ao atualizar cliente', err);
          this.submitting = false;
        }
      });
    } else {
      this.clientsService.create_client(clientData).subscribe({
        next: () => {
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
