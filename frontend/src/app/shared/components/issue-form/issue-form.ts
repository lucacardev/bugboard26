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
  editableFields = input<string[]>([
    'titolo',
    'descrizione',
    'tipo',
    'priorita',
    'dataInizio',
    'dataScadenza',
  ]);

  valoriIniziali = input<Partial<DatiFormIssue>>({});
  testoBottone = input('Crea issue');

  membriTeam = input<Utente[]>([]);

  salva = output<DatiFormIssue>();
  annulla = output<void>();

  erroreValidazione = '';

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
    this.dati = {
      ...this.dati,
      ...this.valoriIniziali(),
    };
  }

  campoEditabile(nome: string): boolean {
    return this.editableFields().includes(nome);
  }

  onSalva(): void {
    this.erroreValidazione = '';

    const titolo = this.dati.titolo?.trim() ?? '';
    const descrizione = this.dati.descrizione?.trim() ?? '';

    if (this.campoEditabile('titolo') && !titolo) {
      this.erroreValidazione = 'Il titolo è obbligatorio.';
      return;
    }

    if (this.campoEditabile('descrizione') && !descrizione) {
      this.erroreValidazione = 'La descrizione è obbligatoria.';
      return;
    }

    this.salva.emit({
      ...this.dati,

      // Normalizziamo le stringhe prima di inviarle al backend.
      titolo,
      descrizione,

      // Gli input HTML di tipo date restituiscono '' quando vuoti.
      // PostgreSQL invece accetta null per i campi opzionali.
      dataInizio: this.dati.dataInizio || null,
      dataScadenza: this.dati.dataScadenza || null,
    });
  }
}