export interface Progetto {
  id: number;
  nome: string;
  descrizione: string | null;
  teamId: number;
  creatoDa: number;
  createdAt: string;
  updatedAt: string;
}