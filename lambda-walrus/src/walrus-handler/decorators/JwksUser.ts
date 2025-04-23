import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { WalrusMetadataProviderDecorator } from './WalrusMetadataProviderDecorator';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { CommonErrors } from '../../common_errors';
import { HandlerParamResult, ParamResult } from '../types';

export const JwksClientSymbol = Symbol('JwksClient');

export function JwksSetupInner(options: jwksClient.Options) {
  return {
    [JwksClientSymbol]: jwksClient(options),
  }
}
export const JwksSetup = WalrusMetadataProviderDecorator(JwksSetupInner);

export function CognitoSetupInner({ region, userPoolId }: { region: string, userPoolId: string }) {
  return {
    [JwksClientSymbol]: jwksClient({
      jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
    }),
  }
}
export const CognitoSetup = WalrusMetadataProviderDecorator(CognitoSetupInner);

export async function JwksUserInner(_params: object, metadata: { [JwksClientSymbol]: jwksClient.JwksClient }, event: APIGatewayProxyEventV2): Promise<HandlerParamResult> {
  const { [JwksClientSymbol]: client } = metadata;
  const token = event.headers.Authorization?.split(' ');
  if (!token || token.length !== 2 || token[0] !== 'Bearer') {
    return ParamResult.error(CommonErrors.Unauthorized);
  }
  
  const decoded = jwt.decode(token[1]);
  if (!decoded || typeof decoded !== 'object') {
    return ParamResult.error(CommonErrors.Unauthorized);
  }

  const kid = decoded.header.kid;
  const key = await client.getSigningKey(kid);
  if (!key) {
    return ParamResult.error(CommonErrors.Unauthorized);
  }
  const signingKey = key.getPublicKey();

  const verifiedToken = jwt.verify(token[1], signingKey, {
    algorithms: ['RS256']
  });

  return ParamResult.ok({ user: verifiedToken });
}

export const JwksUser = WalrusMetadataProviderDecorator(JwksUserInner);