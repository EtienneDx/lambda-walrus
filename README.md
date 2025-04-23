# Lambda Walrus 🦭

[![npm version](https://badge.fury.io/js/@etiennedx%2Flambda-walrus.svg)](https://www.npmjs.com/package/@etiennedx/lambda-walrus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, decorator-based framework for AWS Lambda functions that simplifies API Gateway integrations with TypeScript.

## Features

- **Decorator-based routing**: Define HTTP endpoints with simple decorators like `@WalrusGet` and `@WalrusPost`
- **Automatic parameter parsing**: Extract route parameters, JSON bodies, and more with built-in decorators
- **JWT Authentication**: Built-in JWT validation with JWKS support
- **Error handling**: Standardized error responses
- **Development server**: Test your lambdas locally without deploying to AWS
- **Minimal boilerplate**: Focus on your business logic, not Lambda scaffolding

## Quick Start

### Installation

```bash
npm install @etiennedx/lambda-walrus
```

### Basic Usage

```typescript
import { APIGatewayProxyEventV2, Context } from "aws-lambda";
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

### Local Development

Install the Lambda Walrus runner:

```bash
npm install --save-dev @etiennedx/lambda-walrus-runner
```

Create a `nodemon.json` file for hot reloading:

```json
{
  "watch": ["src"],
  "ext": "ts,js,json",
  "ignore": ["node_modules/**"],
  "exec": "npx walrus ./src/index.ts",
  "env": {
    "NODE_ENV": "development"
  }
}
```

Add a start script to your `package.json`:

```json
{
  "scripts": {
    "start": "nodemon --config nodemon.json"
  }
}
```

Run your Lambda locally:

```bash
npm start
```

## Deployment

### Building the Lambda

```bash
npm run build
```

This will compile your TypeScript code to JavaScript in the `dist` directory.

### Deploying to AWS

You can deploy your Lambda using the AWS CLI, AWS CDK, Serverless Framework, or any other deployment tool. Here's a basic example using AWS CLI:

```bash
aws lambda create-function \
  --function-name my-walrus-function \
  --runtime nodejs18.x \
  --handler dist/index.handler \
  --zip-file fileb://$(npm run build && cd dist && zip -r ../function.zip . && echo '../function.zip')
```

## Documentation

For more detailed documentation, check out the [docs](./docs/) directory:

- [Getting Started](./docs/getting-started.md)
- [Decorators Reference](./docs/decorators.md)
- [Authentication](./docs/authentication.md)
- [Error Handling](./docs/error-handling.md)
- [Local Development](./docs/local-development.md)
- [Advanced Usage](./docs/advanced-usage.md)

## License

MIT © [EtienneDx](https://github.com/EtienneDx)
