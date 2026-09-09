export interface Commento {
  id: number;
  testo: string;
  autoreId: number;
  autore?: {
    id: number;
    username: string;
  };
  issueId: number;
  createdAt: string;
  updatedAt: string;
}