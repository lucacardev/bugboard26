// services/user/cognito.service.ts

import { createHmac } from 'node:crypto';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
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

  async creaUtenteCognito(email: string): Promise<string> {
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