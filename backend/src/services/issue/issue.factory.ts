import { Issue, TipoIssue } from '../../models/Issue';
import { Bug } from '../../models/Bug';
import { Question } from '../../models/Question';
import { Documentation } from '../../models/Documentation';
import { Feature } from '../../models/Feature';

export interface DatiCreazioneIssue {
  titolo: string;
  descrizione: string;   
  priorita?: string;
  dataInizio?: Date;
  dataScadenza?: Date;
  progettoId: number;
  segnalatoreId: number;
  assegnatarioId?: number;
}

export class IssueFactory {
  /**
   * Istanzia la sottoclasse corretta di Issue in base al tipo richiesto.
   * Restituisce un'istanza costruita in memoria, non ancora persistita:
   * il salvataggio resta responsabilità del Repository.
   */
  static creaIssue(tipo: TipoIssue, dati: DatiCreazioneIssue): Issue {
    const attributi = { ...dati, assegnatarioId: dati.assegnatarioId ?? null, tipo, stato: 'todo' as const };

    switch (tipo) {
      case 'bug':
        return Bug.build(attributi);
      case 'question':
        return Question.build(attributi);
      case 'documentation':
        return Documentation.build(attributi);
      case 'feature':
        return Feature.build(attributi);
    }
  }
}