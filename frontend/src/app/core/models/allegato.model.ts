export interface Allegato {
  id: number;
  urlKey: string;
  nomeFile: string;
  tipoMime: string;
  dimensione: number;
  issueId: number;
  caricatoDa: number | null;
  createdAt: string;
  updatedAt: string;
}