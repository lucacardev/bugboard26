import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

export interface DatiFormProgetto {
  nome: string;
  descrizione: string;
  nomeTeam: string;
}

@Component({
  selector: 'app-progetto-form-dialog',
  imports: [FormsModule, MatDialogModule],
  templateUrl: './progetto-form-dialog.html',
  styleUrl: './progetto-form-dialog.scss',
})
export class ProgettoFormDialog {
  private dialogRef = inject(MatDialogRef<ProgettoFormDialog>);

  dati: DatiFormProgetto = { nome: '', descrizione: '', nomeTeam: '' };

  onSalva(): void {
    if (!this.dati.nome.trim() || !this.dati.nomeTeam.trim()) return;
    this.dialogRef.close(this.dati);
  }

  onAnnulla(): void {
    this.dialogRef.close();
  }
}