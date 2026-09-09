import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { IssueForm, DatiFormIssue } from '../issue-form/issue-form';
import { Utente } from '../../../core/models/utente.model';

export interface IssueFormDialogData {
  titolo: string;
  testoBottone: string;
  editableFields?: string[];
  valoriIniziali?: Partial<DatiFormIssue>;
  membriTeam?: Utente[];
}

@Component({
  selector: 'app-issue-form-dialog',
  imports: [MatDialogModule, IssueForm],
  templateUrl: './issue-form-dialog.html',
  styleUrl: './issue-form-dialog.scss',
})
export class IssueFormDialog {
  private dialogRef = inject(MatDialogRef<IssueFormDialog>);
  data = inject<IssueFormDialogData>(MAT_DIALOG_DATA);

  onSalva(dati: DatiFormIssue): void {
    this.dialogRef.close(dati);
  }

  onAnnulla(): void {
    this.dialogRef.close();
  }
}