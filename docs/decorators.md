# Decorators Reference

Lambda Walrus provides several decorators that simplify Lambda function development. This document provides a comprehensive reference for all available decorators.

## Route Decorators

Route decorators define HTTP endpoints and map them to class methods.

### `@WalrusGet(path)`

Defines a GET endpoint.

```typescript
@WalrusGet("/users")
async getUsers(): Promise<User[]> {
  // Return users
}

@WalrusGet("/users/:id")
async getUser({ id }: { id: string }): Promise<User> {
  // Return user by id
}
```

### `@WalrusPost(path)`

Defines a POST endpoint.

```typescript
@WalrusPost("/users")
@JsonBody
async createUser({ body }: { body: UserInput }): Promise<User> {
  // Create and return a user
}
```

### `@WalrusPut(path)`

Defines a PUT endpoint.

```typescript
@WalrusPut("/users/:id")
@JsonBody
async updateUser({ id, body }: { id: string, body: UserInput }): Promise<User> {
  // Update and return a user
}
```

### `@WalrusDelete(path)`

Defines a DELETE endpoint.

```typescript
@WalrusDelete("/users/:id")
async deleteUser({ id }: { id: string }): Promise<void> {
  // Delete a user
}
```

### `@WalrusPatch(path)`

Defines a PATCH endpoint.

```typescript
@WalrusPatch("/users/:id")
@JsonBody
async patchUser({ id, body }: { id: string, body: Partial<UserInput> }): Promise<User> {
  // Partially update and return a user
}
```

### `@WalrusOptions(path)` and `@WalrusHead(path)`

Define OPTIONS and HEAD endpoints respectively.

## Parameter Decorators

Parameter decorators extract data from requests and provide it to your handlers.

### `@JsonBody`

Parses the request body as JSON and provides it to your handler method.

```typescript
@WalrusPost("/users")
@JsonBody
async createUser({ body }: { body: UserInput }): Promise<User> {
  console.log(body); // The parsed JSON body
  // Create and return a user
}
```

If the request body is not valid JSON, it will return a 400 Bad Request error.

## Metadata Decorators

Metadata decorators configure how your Lambda behaves.

### `@WalrusError(errorMode)`

Configures how errors are returned from your Lambda.

```typescript
@WalrusError(WalrusErrorMode.JSON)
class MyHandler {
  // Methods...
}
```

Error modes:
- `WalrusErrorMode.JSON`: Returns errors as JSON objects with a message
- `WalrusErrorMode.TEXT`: Returns errors as plain text

### `@WalrusMetadata(metadata)`

Provides custom metadata to your handlers.

```typescript
@WalrusMetadata({ version: "1.0.0" })
class MyHandler {
  @WalrusGet("/version")
  async getVersion(_: any, metadata: { version: string }): Promise<string> {
    return metadata.version;
  }
}
```

## Authentication Decorators

### `@JwksSetup(options)`

Configures JWKS (JSON Web Key Set) authentication.

```typescript
@JwksSetup({ jwksUri: "https://example.com/.well-known/jwks.json" })
class MyHandler {
  // Methods...
}
```

### `@CognitoSetup({ region, userPoolId })`

A shorthand for setting up AWS Cognito authentication.

```typescript
@CognitoSetup({ region: "us-east-1", userPoolId: "us-east-1_AbCdEfGhI" })
class MyHandler {
  // Methods...
}
```

### `@JwksUser`

Extracts and validates the JWT token from the Authorization header.

```typescript
@CognitoSetup({ region: "us-east-1", userPoolId: "us-east-1_AbCdEfGhI" })
class MyHandler {
  @WalrusGet("/me")
  @JwksUser
  async getMe({ user }: { user: any }): Promise<any> {
    return user; // The decoded and validated JWT token
  }
}
```

## Creating Custom Decorators

You can create your own decorators to extract custom parameters or add metadata.

### Creating a Custom Parameter Decorator

```typescript
import { WalrusParamProviderDecorator, HandlerParamResult, ParamResult } from "@etiennedx/lambda-walrus";
import { APIGatewayProxyEventV2 } from "aws-lambda";

function QueryParamInner(paramName: string, _: object, __: object, event: APIGatewayProxyEventV2): HandlerParamResult {
  const value = event.queryStringParameters?.[paramName];
  if (!value) {
    return ParamResult.error({ statusCode: 400, body: `Missing required query parameter: ${paramName}` });
  }
  return ParamResult.ok({ [paramName]: value });
}

export const QueryParam = WalrusParamProviderDecorator(QueryParamInner);

// Usage
@WalrusGet("/search")
@QueryParam("q")
async search({ q }: { q: string }): Promise<any> {
  return { results: `Search results for: ${q}` };
}
```
