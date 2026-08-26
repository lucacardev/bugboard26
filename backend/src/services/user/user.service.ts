// services/user/user.service.ts

import { UserRepository } from '../../repositories/user/user.repository';
import { CognitoService } from './cognito.service';
import { RuoloUtente, Utente } from '../../models/Utente';

export interface DatiCreazioneUtente {
  username: string;
  email: string;
  ruolo: RuoloUtente;
}

export class UserService {
  constructor(private userRepository: UserRepository, private cognitoService: CognitoService) {}

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

  async creaUtente(dati: DatiCreazioneUtente): Promise<Utente> {
    const esistente = await this.userRepository.findByEmail(dati.email);
    if (esistente) throw new Error('EMAIL_GIA_IN_USO');
    const cognitoSub = await this.cognitoService.creaUtenteCognito(dati.email);
    return this.userRepository.create({ cognitoSub, username: dati.username, email: dati.email, ruolo: dati.ruolo });
  }
}