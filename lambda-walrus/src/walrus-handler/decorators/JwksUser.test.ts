import { JwksClientSymbol, JwksUserInner, JwksSetupInner, CognitoSetupInner } from './JwksUser';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { CommonErrors } from '../../common_errors';
import { ParamResult } from '../types';

jest.mock('jwks-rsa');
jest.mock('jsonwebtoken');

describe('JwksUserInner', () => {
  const mockGetSigningKey = jest.fn();
  const mockJwksClient = {
    getSigningKey: mockGetSigningKey,
  };

  const metadata = {
    [JwksClientSymbol]: mockJwksClient as unknown as jwksClient.JwksClient,
  };

  const event = {
    headers: {
      Authorization: 'Bearer mockToken',
    },
  } as unknown as APIGatewayProxyEventV2;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw Unauthorized error if Authorization header is missing', async () => {
    const eventWithoutAuth = { ...event, headers: {} };
    await expect(JwksUserInner({}, metadata, eventWithoutAuth)).resolves.toEqual(ParamResult.error(CommonErrors.Unauthorized));
  });

  it('should throw Unauthorized error if token is not Bearer', async () => {
    const eventWithInvalidAuth = { ...event, headers: { Authorization: 'Basic mockToken' } };
    await expect(JwksUserInner({}, metadata, eventWithInvalidAuth)).resolves.toEqual(ParamResult.error(CommonErrors.Unauthorized));
  });

  it('should throw Unauthorized error if token cannot be decoded', async () => {
    (jwt.decode as jest.Mock).mockReturnValue(null);
    await expect(JwksUserInner({}, metadata, event)).resolves.toEqual(ParamResult.error(CommonErrors.Unauthorized));
  });

  it('should throw error if signing key is not found', async () => {
    (jwt.decode as jest.Mock).mockReturnValue({ header: { kid: 'mockKid' } });
    mockGetSigningKey.mockResolvedValue(null);
    await expect(JwksUserInner({}, metadata, event)).resolves.toEqual(ParamResult.error(CommonErrors.Unauthorized));
  });

  it('should return user if token is verified', async () => {
    const mockDecodedToken = { header: { kid: 'mockKid' } };
    const mockSigningKey = { getPublicKey: jest.fn().mockReturnValue('mockPublicKey') };
    const mockVerifiedToken = { sub: 'mockUser' };

    (jwt.decode as jest.Mock).mockReturnValue(mockDecodedToken);
    mockGetSigningKey.mockResolvedValue(mockSigningKey);
    (jwt.verify as jest.Mock).mockReturnValue(mockVerifiedToken);

    const result = await JwksUserInner({}, metadata, event);
    expect(result).toEqual(ParamResult.ok({ user: mockVerifiedToken }));
  });
});

describe('JwksSetupInner', () => {
  it('should return a JwksClient with the provided options', () => {
    const options = { jwksUri: 'https://example.com/.well-known/jwks.json' };
    (jwksClient as unknown as jest.Mock).mockImplementation((opt) => {
      expect(opt).toEqual(options);
      return 'mockJwksClient';
    });
    const result = JwksSetupInner(options);
    expect(result[JwksClientSymbol]).toBe('mockJwksClient');
  });
});

describe('CognitoSetupInner', () => {
  it('should return a JwksClient with the correct Cognito URI', () => {
    const region = 'us-east-1';
    const userPoolId = 'us-east-1_123456789';
    const expectedUri = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
    (jwksClient as unknown as jest.Mock).mockImplementation((opt) => {
      expect(opt.jwksUri).toEqual(expectedUri);
      return 'mockJwksClient';
    });
    const result = CognitoSetupInner({ region, userPoolId });
    expect(result[JwksClientSymbol]).toBe('mockJwksClient');
  });
});
