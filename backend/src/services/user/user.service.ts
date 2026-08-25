// services/user/user.service.ts

import { UserRepository } from '../../repositories/user/user.repository';
import { RuoloUtente, Utente } from '../../models/Utente';

export interface DatiCreazioneUtente {
  cognitoSub: string;
  username: string;
  email: string;
  ruolo: RuoloUtente
}

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUtente(id: number): Promise<Utente> {
    const utente = await this.userRepository.findById(id);
    if (!utente) throw new Error('UTENTE_NON_TROVATO');
    return utente;
  }

  async getUtenteByEmail(email: string): Promise<Utente> {
    const utente = await this.userRepository.findByEmail(email);
    if (!utente) throw new Error('UTENTE_NON_TROVATO');
    return utente;
  }

  async getMembriTeam(teamId: number): Promise<Utente[]> {
    return this.userRepository.findByTeam(teamId);
  }

  /**
   * TODO: quando CognitoService sarà integrato, questo metodo dovrà:
   * 1. Verificare che l'email non sia già in uso (this.userRepository.findByEmail)
   * 2. Chiamare CognitoService.creaUtenteCognito(email) → AdminCreateUser,
   *    che genera cognitoSub e invia la password temporanea
   * 3. Solo allora persistere l'utente qui sotto con il cognitoSub reale
   * Per ora richiede cognitoSub già pronto, per permettere test manuali.
   */
  async creaUtente(dati: DatiCreazioneUtente): Promise<Utente> {
    const esistente = await this.userRepository.findByEmail(dati.email);
    if (esistente) throw new Error('EMAIL_GIA_IN_USO');
    return this.userRepository.create(dati);
  }
}