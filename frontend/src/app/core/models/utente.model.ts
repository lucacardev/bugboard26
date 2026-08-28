export type RuoloUtente = 'normale' | 'amministratore';

export interface Utente {
  id: number;
  cognitoSub: string;
  username: string;
  email: string;
  ruolo: RuoloUtente;
  createdAt: string;
  updatedAt: string;
}