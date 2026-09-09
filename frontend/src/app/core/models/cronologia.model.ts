export interface VoceCronologia {
  id: number;
  descrizione: string;
  issueId: number;
  autoreId: number;
  autore: {
    id: number;
    username: string;
  };
  createdAt: string;
}