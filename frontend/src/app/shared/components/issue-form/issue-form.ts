import { Component, input, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TipoIssue } from '../../../core/models/issue.model';
import { Utente } from '../../../core/models/utente.model';

export interface DatiFormIssue {
  titolo: string;
  descrizione: string;
  tipo: TipoIssue;
  priorita: string;
  dataInizio: string | null;
  dataScadenza: string | null;
  assegnatarioId?: number;
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
  // Popolato solo quando 'assegnatario' è tra i campi editabili (Estensione
  // #3, caso d'uso "Segnalare issue": l'admin può assegnare contestualmente
  // alla creazione). Vuoto negli altri contesti d'uso del form condiviso.
  membriTeam = input<Utente[]>([]);

  salva = output<DatiFormIssue>();
  annulla = output<void>();

  dati: DatiFormIssue = {
    titolo: '',
    descrizione: '',
    tipo: 'bug',
    priorita: '',
    dataInizio: '',
    dataScadenza: '',
    assegnatarioId: undefined,
  };

  ngOnInit(): void {
    this.dati = { ...this.dati, ...this.valoriIniziali() };
  }

  campoEditabile(nome: string): boolean {
    return this.editableFields().includes(nome);
  }

  onSalva(): void {
    if (!this.dati.titolo.trim()) return;
    // I campi data, se lasciati intonsi dall'utente, restano '' (stringa
    // vuota) per via del valore iniziale del form — ma '' non è un valore
    // valido per una colonna DATE lato Postgres (a differenza di null, che
    // la colonna accetta essendo opzionale): senza questa normalizzazione,
    // creare una issue senza compilare le date fa fallire l'inserimento a
    // livello di database.
    this.salva.emit({
      ...this.dati,
      dataInizio: this.dati.dataInizio || null,
      dataScadenza: this.dati.dataScadenza || null,
    });
  }
}