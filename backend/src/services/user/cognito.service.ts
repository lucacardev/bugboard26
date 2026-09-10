// services/user/cognito.service.ts

import { createHmac } from 'node:crypto';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  UsernameExistsException,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  AuthFlowType,
  ChallengeNameType,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET!;

export interface TokenAutenticazione {
  richiedeNuovaPassword: false;
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface SfidaPrimoAccesso {
  richiedeNuovaPassword: true;
  session: string;
}

export class CognitoService {
  private calcolaSecretHash(username: string): string {
    return createHmac('sha256', CLIENT_SECRET)
      .update(username + CLIENT_ID)
      .digest('base64');
  }

  /**
   * Stessa idempotenza già motivata su creaUtenteCognitoConPassword: un
   * amministratore potrebbe ricreare un utente con un'email già orfana su
   * Cognito (es. dopo un reset del solo database locale) — senza questo
   * fallback, l'operazione fallirebbe con UsernameExistsException anche
   * se dal punto di vista dell'amministratore sta semplicemente "creando
   * un utente che non vede più nella sua lista".
   */
  async creaUtenteCognito(email: string): Promise<string> {
    try {
      const comando = new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
        ],
      });
      const risposta = await cognitoClient.send(comando);
      const subAttribute = risposta.User?.Attributes?.find((a) => a.Name === 'sub');
      if (!subAttribute?.Value) throw new Error('COGNITO_SUB_MANCANTE');
      return subAttribute.Value;
    } catch (errore) {
      if (!(errore instanceof UsernameExistsException)) throw errore;

      const comandoGet = new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: email });
      const utenteEsistente = await cognitoClient.send(comandoGet);
      const subAttribute = utenteEsistente.UserAttributes?.find((a) => a.Name === 'sub');
      if (!subAttribute?.Value) throw new Error('COGNITO_SUB_MANCANTE');
      return subAttribute.Value;
    }
  }

  /**
   * Variante usata dallo script di seed dell'admin di default (punto 1
   * traccia: "credenziali di default"). A differenza di creaUtenteCognito,
   * qui la password temporanea è nota ed esplicita (non generata da Cognito),
   * e MessageAction: 'SUPPRESS' evita il tentativo di invio email — l'email
   * di default può essere un placeholder (es. admin@bugboard26.local) che
   * non riceverebbe comunque nulla.
   *
   * Idempotente rispetto a Cognito: se l'utente esiste già lì (tipico dopo
   * un reset del solo database locale — `docker compose down -v` cancella
   * Postgres, ma Cognito è un servizio esterno e resta invariato — oppure
   * in caso di doppia esecuzione accidentale dello script di seed),
   * recupera il `sub` già esistente e riporta anche la password al valore
   * di default, invece di fallire: le credenziali stampate a schermo da
   * seed-admin.ts devono restare sempre valide, sia per un account nuovo
   * sia per uno solo ricollegato.
   */
  async creaUtenteCognitoConPassword(email: string, passwordTemporanea: string): Promise<string> {
    try {
      const comando = new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        TemporaryPassword: passwordTemporanea,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
        ],
      });
      const risposta = await cognitoClient.send(comando);
      const subAttribute = risposta.User?.Attributes?.find((a) => a.Name === 'sub');
      if (!subAttribute?.Value) throw new Error('COGNITO_SUB_MANCANTE');
      return subAttribute.Value;
    } catch (errore) {
      if (!(errore instanceof UsernameExistsException)) throw errore;

      // A differenza di creaUtenteCognito (utenti reali, la cui password
      // scelta dall'utente non va mai toccata), qui il chiamante è sempre
      // e solo seed-admin.ts: le credenziali stampate a schermo devono
      // essere sempre valide, sia che l'account sia nuovo sia che venga
      // solo ricollegato dopo un reset del database locale — quindi la
      // password va riportata esplicitamente al valore di default,
      // mantenendo lo stesso stato "cambio obbligatorio al primo accesso"
      // (Permanent: false) di un account davvero appena creato.
      const comandoGet = new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: email });
      const utenteEsistente = await cognitoClient.send(comandoGet);
      const subAttribute2 = utenteEsistente.UserAttributes?.find((a) => a.Name === 'sub');
      if (!subAttribute2?.Value) throw new Error('COGNITO_SUB_MANCANTE');

      const comandoSetPassword = new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        Password: passwordTemporanea,
        Permanent: false,
      });
      await cognitoClient.send(comandoSetPassword);

      return subAttribute2.Value;
    }
  }

  async login(email: string, password: string): Promise<TokenAutenticazione | SfidaPrimoAccesso> {
    const comando = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: this.calcolaSecretHash(email),
      },
    });
    const risposta = await cognitoClient.send(comando);

    if (risposta.ChallengeName === ChallengeNameType.NEW_PASSWORD_REQUIRED) {
      if (!risposta.Session) throw new Error('SESSION_MANCANTE');
      return { richiedeNuovaPassword: true, session: risposta.Session };
    }
    return this.estraiToken(risposta.AuthenticationResult);
  }

  async completaPrimoAccesso(email: string, nuovaPassword: string, session: string): Promise<TokenAutenticazione> {
    const comando = new RespondToAuthChallengeCommand({
      ClientId: CLIENT_ID,
      ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
      Session: session,
      ChallengeResponses: {
        USERNAME: email,
        NEW_PASSWORD: nuovaPassword,
        SECRET_HASH: this.calcolaSecretHash(email),
      },
    });
    const risposta = await cognitoClient.send(comando);
    return this.estraiToken(risposta.AuthenticationResult);
  }

  private estraiToken(risultato?: { AccessToken?: string; IdToken?: string; RefreshToken?: string }): TokenAutenticazione {
    if (!risultato?.AccessToken || !risultato.IdToken || !risultato.RefreshToken) {
      throw new Error('AUTENTICAZIONE_FALLITA');
    }
    return {
      richiedeNuovaPassword: false,
      accessToken: risultato.AccessToken,
      idToken: risultato.IdToken,
      refreshToken: risultato.RefreshToken,
    };
  }
}