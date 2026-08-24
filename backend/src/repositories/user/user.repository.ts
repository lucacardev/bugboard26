import { Utente } from '../../models/Utente';

export class UserRepository {
  /**
   * Cerca un utente tramite il suo id (chiave primaria).
   * Usato ad esempio quando si assegna una issue a un membro del team (§1.5.2).
   */
  async findById(id: number): Promise<Utente | null> {
    return Utente.findByPk(id);
  }

  /**
   * Cerca un utente tramite il cognitoSub, il riferimento all'identità
   * gestita da AWS Cognito. Usato in fase di login/riconoscimento
   * dell'utente autenticato (NFR04: nessuna password gestita internamente).
   */
  async findByCognitoSub(cognitoSub: string): Promise<Utente | null> {
    return Utente.findOne({ where: { cognitoSub } });
  }

  /**
   * Cerca un utente tramite email. Utile per validazioni di unicità
   * prima della creazione (es. verificare se un'email è già in uso).
   */
  async findByEmail(email: string): Promise<Utente | null> {
    return Utente.findOne({ where: { email } });
  }

  /**
   * Salva su database un nuovo utente. Non contatta Cognito: quella
   * responsabilità appartiene a un servizio dedicato (CognitoService),
   * chiamato separatamente da UserService prima di invocare questo metodo.
   */
  async create(dati: { cognitoSub: string; nome: string; email: string }): Promise<Utente> {
    return Utente.create(dati);
  }

  /**
   * Restituisce tutti gli utenti membri di un dato team.
   * Utile per popolare la lista "membri del team" nel caso d'uso
   * Assegnare issue a membro del team 
   */
  async findByTeam(teamId: number): Promise<Utente[]> {
    return Utente.findAll({
      include: [
        {
          association: 'Teams',
          where: { id: teamId },
          attributes: [],
        },
      ],
    });
  }
}