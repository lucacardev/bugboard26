export interface Notifica {
  id: number;
  utenteId: number;
  messaggio: string;
  letta: boolean;
  issueId: number | null;
  createdAt: string;
  updatedAt: string;
}