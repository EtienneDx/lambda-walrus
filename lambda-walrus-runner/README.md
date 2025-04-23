# Lambda Walrus Runner 🦭

[![npm version](https://badge.fury.io/js/@etiennedx%2Flambda-walrus-runner.svg)](https://www.npmjs.com/package/@etiennedx/lambda-walrus-runner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A development server for locally testing Lambda Walrus applications without deploying to AWS. While developed for Lambda Walrus, it can be used with any AWS Lambda function handler.

## Features

- **Local development server**: Test your Lambda Walrus applications without deploying to AWS
- **Hot reloading**: Automatically restart when your code changes
- **API Gateway simulation**: Simulates the AWS API Gateway environment
- **Simple CLI**: Easy to use command line interface

## Installation

```bash
npm install --save-dev @etiennedx/lambda-walrus-runner
```

## Usage

### Command Line

Run your Lambda Walrus application directly:

```bash
npx walrus ./path/to/your/handler.ts
```

### With Nodemon for Hot Reloading

Create a `nodemon.json` file:

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

## Documentation

For complete documentation, examples, and advanced usage, visit:

- [GitHub Repository](https://github.com/EtienneDx/lambda-walrus)
- [Getting Started Guide](https://github.com/EtienneDx/lambda-walrus/blob/main/docs/getting-started.md)
- [Local Development Guide](https://github.com/EtienneDx/lambda-walrus/blob/main/docs/local-development.md)

## Required Dependencies

This package is designed to work with the main Lambda Walrus package:

```bash
npm install @etiennedx/lambda-walrus
```

## License

MIT © [EtienneDx](https://github.com/EtienneDx)
