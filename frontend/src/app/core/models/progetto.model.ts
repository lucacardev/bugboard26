export interface Progetto {
  id: number;
  nome: string;
  descrizione: string | null;
  team: {
    id: number;
    nome: string;
    progettoId: number;
  };
  creatoDa: number;
  createdAt: string;
  updatedAt: string;
}