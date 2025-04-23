# Local Development

Lambda Walrus provides a local development server that allows you to test your Lambda functions without deploying them to AWS. This guide explains how to set up and use the local development environment.

## Installation

To use the local development server, you need to install the Lambda Walrus runner:

```bash
npm install --save-dev @etiennedx/lambda-walrus-runner
```

## Configuration

### Nodemon Setup

For hot reloading during development, create a `nodemon.json` file in your project root:

```json
{
  "watch": ["src"],
  "ext": "ts,js,json",
  "ignore": ["node_modules/**"],
  "exec": "npx walrus ./src/index.ts",
  "delay": 100,
  "env": {
    "NODE_ENV": "development"
  }
}
```

This configuration tells Nodemon to:
- Watch for changes in the `src` directory
- Monitor TypeScript, JavaScript, and JSON files
- Run the `walrus` command with your entry file when changes are detected
- Set the `NODE_ENV` to `development`

### Package.json Scripts

Add a start script to your `package.json`:

```json
{
  "scripts": {
    "start": "nodemon --config nodemon.json"
  }
}
```

## Running the Development Server

Start the local development server with:

```bash
npm start
```

The server will start on port 3000 by default. You should see output similar to:

```
[Lambda Walrus] Starting local server on port 3000
[Lambda Walrus] Routes:
[Lambda Walrus] - GET /hello
[Lambda Walrus] - GET /hello/:name
[Lambda Walrus] - GET /data
```

## Testing Your API

You can use tools like cURL, Postman, or your browser to test your API endpoints:

### Browser

For GET requests, simply navigate to:
- http://localhost:3000/hello
- http://localhost:3000/hello/world
- http://localhost:3000/data

### cURL

```bash
# GET request
curl http://localhost:3000/hello

# POST request with JSON body
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Postman

Create a new request:
1. Set the request method (GET, POST, etc.)
2. Enter the URL: `http://localhost:3000/your-endpoint`
3. For POST/PUT requests, add a JSON body in the "Body" tab
4. Click "Send"

## Environment Variables

You can set environment variables for your local development server by:

1. Adding them to the `nodemon.json` file:

```json
{
  "env": {
    "NODE_ENV": "development",
    "API_KEY": "your-api-key",
    "DB_CONNECTION": "your-connection-string"
  }
}
```

2. Using a `.env` file with dotenv (requires additional setup)

3. Setting them directly in the command line:

```bash
API_KEY=your-api-key npm start
```

## Debugging

### VS Code Debugging

Create a `.vscode/launch.json` file:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Lambda",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/nodemon",
      "program": "${workspaceFolder}/node_modules/@etiennedx/lambda-walrus-runner/dist/bin/walrus.js",
      "args": ["${workspaceFolder}/src/index.ts"],
      "restart": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "sourceMaps": true
    }
  ]
}
```

Then press F5 in VS Code to start debugging.

### Console Logging

You can use `console.log` statements in your code to debug:

```typescript
@WalrusGet("/hello/:name")
async hello({ name }: { name: string }): Promise<string> {
  console.log(`Hello endpoint called with name: ${name}`);
  return `Hello, ${name}!`;
}
```

The logs will appear in your terminal where the server is running.

## Testing Different AWS Events

The Lambda Walrus runner translates HTTP requests to API Gateway events, but you might want to test with custom event shapes.

You can create a test file that directly invokes your handler:

```typescript
// test-event.ts
import { handler } from './src/index';

const event = {
  requestContext: {
    http: {
      method: 'GET',
      path: '/hello/world'
    }
  },
  headers: {
    'Content-Type': 'application/json'
  },
  // Add other API Gateway event properties as needed
};

async function testHandler() {
  const response = await handler(event as any, {} as any);
  console.log('Response:', response);
}

testHandler().catch(console.error);
```

Run this test file with:

```bash
ts-node test-event.ts
```

## Proxying to Other Services

If your Lambda function needs to interact with other services, you can either:

1. Connect to actual AWS services (make sure you have proper credentials)
2. Use local alternatives like:
   - LocalStack for AWS services
   - In-memory databases
   - Mock servers

Configure these in your development environment as needed.
