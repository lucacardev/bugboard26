import { Component, input, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TipoIssue } from '../../../core/models/issue.model';

export interface DatiFormIssue {
  titolo: string;
  descrizione: string;
  tipo: TipoIssue;
  priorita: string;
  dataInizio: string;
  dataScadenza: string;
}

@Component({
  selector: 'app-issue-form',
  imports: [FormsModule],
  templateUrl: './issue-form.html',
  styleUrl: './issue-form.scss',
})
export class IssueForm implements OnInit {
  editableFields = input<string[]>(['titolo', 'descrizione', 'tipo', 'priorita', 'dataInizio', 'dataScadenza']);
  valoriIniziali = input<Partial<DatiFormIssue>>({});
  testoBottone = input('Crea issue');

  salva = output<DatiFormIssue>();
  annulla = output<void>();

  dati: DatiFormIssue = {
    titolo: '',
    descrizione: '',
    tipo: 'bug',
    priorita: '',
    dataInizio: '',
    dataScadenza: '',
  };

  ngOnInit(): void {
    this.dati = { ...this.dati, ...this.valoriIniziali() };
  }

  campoEditabile(nome: string): boolean {
    return this.editableFields().includes(nome);
  }

  onSalva(): void {
    if (!this.dati.titolo.trim()) return;
    this.salva.emit(this.dati);
  }
}