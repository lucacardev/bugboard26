export type TipoIssue = 'bug' | 'question' | 'documentation' | 'feature';
export type StatoIssue = 'todo' | 'in_progress' | 'done';

export interface Issue {
  id: number;
  titolo: string;
  descrizione: string | null;
  priorita: string | null;
  dataInizio: string | null;
  dataScadenza: string | null;
  progettoId: number;
  progetto?: {
    id: number;
    nome: string;
  };
  segnalatoreId: number;
  assegnatarioId: number | null;
  tipo: TipoIssue;
  stato: StatoIssue;
  createdAt: string;
  updatedAt: string;
}