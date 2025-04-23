# Getting Started with Lambda Walrus

This guide will help you get started with Lambda Walrus, a lightweight decorator-based framework for AWS Lambda functions.

## Prerequisites

- Node.js 16.x or higher
- TypeScript 4.5 or higher
- AWS account (for production deployment)

## Installation

Create a new directory for your project and initialize it:

```bash
mkdir my-walrus-project
cd my-walrus-project
npm init -y
```

Install the required dependencies:

```bash
npm install @etiennedx/lambda-walrus aws-lambda
npm install --save-dev typescript @types/aws-lambda @types/node
```

For local development, also install the Lambda Walrus runner:

```bash
npm install --save-dev @etiennedx/lambda-walrus-runner nodemon
```

## Project Setup

Create a `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "nodemon --config nodemon.json",
    "build": "tsc",
    "clean": "rimraf dist"
  }
}
```

Create a `nodemon.json` file for hot reloading during development:

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

## Create Your First Lambda

Create a `src` directory and add an `index.ts` file:

```typescript
import { walrusify, WalrusGet, JsonBody, WalrusError, WalrusErrorMode } from "@etiennedx/lambda-walrus";

@WalrusError(WalrusErrorMode.JSON)
class MyHandler {
  @WalrusGet("/hello")
  async hello(): Promise<string> {
    return "Hello, world!";
  }
  
  @WalrusGet("/hello/:name")
  async helloName({ name }: { name: string }): Promise<string> {
    return `Hello, ${name}!`;
  }
  
  @WalrusGet("/data")
  async getData(): Promise<object> {
    return {
      message: "This is some data",
      timestamp: new Date().toISOString()
    };
  }
}

// Export the handler
export const handler = walrusify(new MyHandler());
```

## Run Locally

Start the local development server:

```bash
npm start
```

Your Lambda will be available at http://localhost:3000. You can test the endpoints:

- http://localhost:3000/hello
- http://localhost:3000/hello/world
- http://localhost:3000/data

## Building for Deployment

Build your Lambda for deployment:

```bash
npm run build
```

This will compile your TypeScript code to JavaScript in the `dist` directory, which can then be deployed to AWS Lambda.

## Next Steps

- Learn about [decorators](./decorators.md) to enhance your Lambda functions
- Set up [authentication](./authentication.md) for your API
- Explore [error handling](./error-handling.md) strategies
- Check out [advanced usage](./advanced-usage.md) patterns
