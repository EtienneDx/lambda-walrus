# Lambda Walrus 🦭

[![npm version](https://badge.fury.io/js/@etiennedx%2Flambda-walrus.svg)](https://www.npmjs.com/package/@etiennedx/lambda-walrus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, decorator-based framework for AWS Lambda functions that simplifies API Gateway integrations with TypeScript.

## Features

- **Decorator-based routing**: Define HTTP endpoints with simple decorators like `@WalrusGet` and `@WalrusPost`
- **Automatic parameter parsing**: Extract route parameters, JSON bodies, and more with built-in decorators
- **JWT Authentication**: Built-in JWT validation with JWKS support
- **Error handling**: Standardized error responses
- **Minimal boilerplate**: Focus on your business logic, not Lambda scaffolding

## Installation

```bash
npm install @etiennedx/lambda-walrus
```

## Basic Usage

```typescript
import { walrusify, WalrusGet, JsonBody, WalrusError, WalrusErrorMode } from "@etiennedx/lambda-walrus";

@WalrusError(WalrusErrorMode.JSON)
class MyHandler {
  @WalrusGet("/hello")
  async hello(): Promise<string> {
    return "Hello, world!";
  }

  @WalrusGet("/users/:id")
  async getUser({ id }: { id: string }): Promise<string> {
    return `Getting user ${id}`;
  }

  @WalrusPost("/users")
  @JsonBody
  async createUser({ body }: { body: unknown }): Promise<string> {
    return `Created user with data: ${JSON.stringify(body)}`;
  }
}

// Create the Lambda handler function
export const handler = walrusify(new MyHandler());
```

## Documentation

For complete documentation, examples, and advanced usage, visit:

- [GitHub Repository](https://github.com/EtienneDx/lambda-walrus)
- [Getting Started Guide](https://github.com/EtienneDx/lambda-walrus/blob/main/docs/getting-started.md)
- [Decorators Reference](https://github.com/EtienneDx/lambda-walrus/blob/main/docs/decorators.md)
- [Error Handling](https://github.com/EtienneDx/lambda-walrus/blob/main/docs/error-handling.md)
- [Advanced Usage](https://github.com/EtienneDx/lambda-walrus/blob/main/docs/advanced-usage.md)

## Local Development

For local development, use our companion package:

```bash
npm install --save-dev @etiennedx/lambda-walrus-runner
```

## License

MIT © [EtienneDx](https://github.com/EtienneDx)
