# Authentication

Lambda Walrus provides robust authentication capabilities through integration with JSON Web Key Set (JWKS) and AWS Cognito. This guide explains how to set up and use authentication in your Lambda functions.

## JWT Authentication with JWKS

JSON Web Key Set (JWKS) is a set of keys containing the public keys used to verify any JSON Web Token (JWT) issued by an authorization server. Lambda Walrus provides built-in support for JWKS authentication.

### Basic JWKS Setup

```typescript
import { walrusify, WalrusGet, JwksSetup, JwksUser } from "@etiennedx/lambda-walrus";

@JwksSetup({ 
  jwksUri: "https://your-auth-server.com/.well-known/jwks.json" 
})
class MyHandler {
  @WalrusGet("/protected")
  @JwksUser
  async protectedEndpoint({ user }: { user: any }): Promise<any> {
    // The 'user' object contains the decoded JWT payload
    return {
      message: "This is a protected endpoint",
      userId: user.sub,
      username: user.preferred_username
    };
  }
}

export const handler = walrusify(new MyHandler());
```

### AWS Cognito Integration

Lambda Walrus provides a convenience decorator for AWS Cognito integration:

```typescript
import { walrusify, WalrusGet, CognitoSetup, JwksUser } from "@etiennedx/lambda-walrus";

@CognitoSetup({ 
  region: "us-east-1",
  userPoolId: "us-east-1_AbCdEfGhI" 
})
class MyHandler {
  @WalrusGet("/protected")
  @JwksUser
  async protectedEndpoint({ user }: { user: any }): Promise<any> {
    return {
      message: "This is a protected endpoint",
      cognitoUserId: user.sub
    };
  }
}

export const handler = walrusify(new MyHandler());
```

## How the JWT Authentication Works

1. The client includes a JWT token in the Authorization header of the request with the format `Authorization: Bearer <token>`
2. The `@JwksUser` decorator extracts the token from the header
3. The token's signature is verified using the JWKS endpoint
4. If the token is valid, the decoded payload is provided to your handler method as the `user` parameter
5. If the token is invalid or missing, a 401 Unauthorized error is returned

## Custom Authentication Logic

You can create your own custom authentication decorators using the `WalrusParamProviderDecorator`:

```typescript
import { WalrusParamProviderDecorator, HandlerParamResult, ParamResult } from "@etiennedx/lambda-walrus";
import { APIGatewayProxyEventV2 } from "aws-lambda";

function ApiKeyAuthInner(_: object, __: object, event: APIGatewayProxyEventV2): HandlerParamResult {
  const apiKey = event.headers["x-api-key"];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return ParamResult.error({ statusCode: 401, body: "Invalid API key" });
  }
  
  return ParamResult.ok({});
}

export const ApiKeyAuth = WalrusParamProviderDecoratorNoArg(ApiKeyAuthInner);

// Usage
@WalrusGet("/secured")
@ApiKeyAuth
async securedEndpoint(): Promise<any> {
  return { message: "This endpoint is secured with an API key" };
}
```

## Best Practices

1. **Environment Variables**: Store sensitive configuration such as JWKS URIs and API keys in environment variables.

2. **Role-Based Access Control**: Implement role checks in your handlers based on JWT claims.

```typescript
@WalrusGet("/admin")
@JwksUser
async adminEndpoint({ user }: { user: any }): Promise<any> {
  // Check if user has admin role
  if (!user.roles || !user.roles.includes("admin")) {
    throw { statusCode: 403, body: "Forbidden" };
  }
  
  return { message: "Welcome, admin!" };
}
```

3. **Token Expiration**: Always set appropriate expiration times on your JWTs to limit the window of opportunity for token misuse.

4. **HTTPS**: Always use HTTPS in production to protect tokens in transit.

## Handling Authentication Errors

By default, authentication errors return a 401 Unauthorized status code. You can customize error handling using the `@WalrusError` decorator:

```typescript
@WalrusError(WalrusErrorMode.JSON)
@CognitoSetup({ region: "us-east-1", userPoolId: "us-east-1_AbCdEfGhI" })
class MyHandler {
  // Methods...
}
```

This will return authentication errors as JSON objects with a message.
