# Advanced Usage

This guide covers advanced usage patterns and techniques for the Lambda Walrus framework.

## Custom Parameter Decorators

Creating your own parameter decorators allows you to extract and validate custom data from requests.

### Creating a Query Parameter Decorator

```typescript
import { WalrusParamProviderDecorator, HandlerParamResult, ParamResult } from "@etiennedx/lambda-walrus";
import { APIGatewayProxyEventV2 } from "aws-lambda";

export function QueryParamInner(paramName: string, _: object, __: object, event: APIGatewayProxyEventV2): HandlerParamResult {
  const value = event.queryStringParameters?.[paramName];
  if (value === undefined) {
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

### Header Parameter Decorator

```typescript
import { WalrusParamProviderDecorator, HandlerParamResult, ParamResult } from "@etiennedx/lambda-walrus";
import { APIGatewayProxyEventV2 } from "aws-lambda";

export function HeaderInner(headerName: string, _: object, __: object, event: APIGatewayProxyEventV2): HandlerParamResult {
  const value = event.headers?.[headerName] || event.headers?.[headerName.toLowerCase()];
  if (!value) {
    return ParamResult.error({ statusCode: 400, body: `Missing required header: ${headerName}` });
  }
  return ParamResult.ok({ [headerName.replace(/-/g, "_")]: value });
}

export const Header = WalrusParamProviderDecorator(HeaderInner);

// Usage
@WalrusGet("/api-version")
@Header("API-Version")
async getVersion({ API_Version }: { API_Version: string }): Promise<string> {
  return `Using API version: ${API_Version}`;
}
```

## Middleware Pattern

You can implement middleware-like functionality using parameter decorators:

```typescript
import { WalrusParamProviderDecoratorNoArg, HandlerParamResult, ParamResult } from "@etiennedx/lambda-walrus";
import { APIGatewayProxyEventV2 } from "aws-lambda";

// Rate limiting middleware
export function RateLimitInner(_: object, __: object, event: APIGatewayProxyEventV2): HandlerParamResult {
  const ip = event.requestContext.http.sourceIp;
  const now = Date.now();
  
  // Simple in-memory rate limiting (for illustration - use Redis or similar in production)
  if (!global.rateLimitMap) {
    global.rateLimitMap = {};
  }
  
  const requests = global.rateLimitMap[ip] || [];
  // Keep only requests from the last minute
  const recentRequests = requests.filter(timestamp => now - timestamp < 60000);
  
  if (recentRequests.length >= 10) {
    return ParamResult.error({ statusCode: 429, body: "Too Many Requests" });
  }
  
  recentRequests.push(now);
  global.rateLimitMap[ip] = recentRequests;
  
  return ParamResult.ok({});
}

export const RateLimit = WalrusParamProviderDecoratorNoArg(RateLimitInner);

// Usage
@WalrusGet("/limited-endpoint")
@RateLimit
async limitedEndpoint(): Promise<string> {
  return "This endpoint is rate limited";
}
```

## Multiple Handlers in One Lambda

You can use multiple handler classes in a single Lambda to organize your code better:

```typescript
// users.ts
import { WalrusGet, WalrusPost, JsonBody } from "@etiennedx/lambda-walrus";

export class UserHandler {
  @WalrusGet("/users")
  async getUsers(): Promise<any[]> {
    // Return users
    return [];
  }
  
  @WalrusGet("/users/:id")
  async getUser({ id }: { id: string }): Promise<any> {
    // Return user
    return { id };
  }
  
  @WalrusPost("/users")
  @JsonBody
  async createUser({ body }: { body: any }): Promise<any> {
    // Create user
    return body;
  }
}

// products.ts
import { WalrusGet, WalrusPost, JsonBody } from "@etiennedx/lambda-walrus";

export class ProductHandler {
  @WalrusGet("/products")
  async getProducts(): Promise<any[]> {
    // Return products
    return [];
  }
  
  @WalrusGet("/products/:id")
  async getProduct({ id }: { id: string }): Promise<any> {
    // Return product
    return { id };
  }
}

// index.ts
import { walrusify, WalrusError, WalrusErrorMode } from "@etiennedx/lambda-walrus";
import { UserHandler } from "./users";
import { ProductHandler } from "./products";

@WalrusError(WalrusErrorMode.JSON)
class ApiHandler {
  constructor() {
    // Merge the prototype methods and decorators
    Object.assign(this, new UserHandler());
    Object.assign(this, new ProductHandler());
  }
}

export const handler = walrusify(new ApiHandler());
```

## Integration with Database Services

Example integration with DynamoDB:

```typescript
import { DynamoDB } from "aws-sdk";
import { walrusify, WalrusGet, WalrusPost, JsonBody } from "@etiennedx/lambda-walrus";

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = "Users";

class UserService {
  async getUsers(): Promise<any[]> {
    const result = await dynamodb.scan({ TableName: TABLE_NAME }).promise();
    return result.Items || [];
  }
  
  async getUser(id: string): Promise<any> {
    const result = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { id }
    }).promise();
    return result.Item;
  }
  
  async createUser(user: any): Promise<any> {
    const newUser = {
      id: Date.now().toString(),
      ...user,
      createdAt: new Date().toISOString()
    };
    
    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: newUser
    }).promise();
    
    return newUser;
  }
}

class MyHandler {
  private userService = new UserService();
  
  @WalrusGet("/users")
  async getUsers(): Promise<any[]> {
    return await this.userService.getUsers();
  }
  
  @WalrusGet("/users/:id")
  async getUser({ id }: { id: string }): Promise<any> {
    const user = await this.userService.getUser(id);
    if (!user) {
      return { statusCode: 404, body: "User not found" };
    }
    return user;
  }
  
  @WalrusPost("/users")
  @JsonBody
  async createUser({ body }: { body: any }): Promise<any> {
    return await this.userService.createUser(body);
  }
}

export const handler = walrusify(new MyHandler());
```

## Dependency Injection Pattern

You can implement a simple dependency injection pattern:

```typescript
// services/user-service.ts
export interface UserService {
  getUsers(): Promise<any[]>;
  getUser(id: string): Promise<any>;
  createUser(user: any): Promise<any>;
}

// services/dynamo-user-service.ts
import { DynamoDB } from "aws-sdk";
import { UserService } from "./user-service";

export class DynamoUserService implements UserService {
  private dynamodb = new DynamoDB.DocumentClient();
  private TABLE_NAME = "Users";
  
  async getUsers(): Promise<any[]> {
    const result = await this.dynamodb.scan({ TableName: this.TABLE_NAME }).promise();
    return result.Items || [];
  }
  
  async getUser(id: string): Promise<any> {
    const result = await this.dynamodb.get({
      TableName: this.TABLE_NAME,
      Key: { id }
    }).promise();
    return result.Item;
  }
  
  async createUser(user: any): Promise<any> {
    const newUser = {
      id: Date.now().toString(),
      ...user,
      createdAt: new Date().toISOString()
    };
    
    await this.dynamodb.put({
      TableName: this.TABLE_NAME,
      Item: newUser
    }).promise();
    
    return newUser;
  }
}

// handlers/user-handler.ts
import { WalrusGet, WalrusPost, JsonBody } from "@etiennedx/lambda-walrus";
import { UserService } from "../services/user-service";

export class UserHandler {
  constructor(private userService: UserService) {}
  
  @WalrusGet("/users")
  async getUsers(): Promise<any[]> {
    return await this.userService.getUsers();
  }
  
  @WalrusGet("/users/:id")
  async getUser({ id }: { id: string }): Promise<any> {
    const user = await this.userService.getUser(id);
    if (!user) {
      return { statusCode: 404, body: "User not found" };
    }
    return user;
  }
  
  @WalrusPost("/users")
  @JsonBody
  async createUser({ body }: { body: any }): Promise<any> {
    return await this.userService.createUser(body);
  }
}

// index.ts
import { walrusify } from "@etiennedx/lambda-walrus";
import { UserHandler } from "./handlers/user-handler";
import { DynamoUserService } from "./services/dynamo-user-service";

// Production handler
const userService = new DynamoUserService();
const handler = walrusify(new UserHandler(userService));

export { handler };
```

## Testing Strategies

### Unit Testing Handlers

```typescript
// user-handler.test.ts
import { UserHandler } from './user-handler';

describe('UserHandler', () => {
  let mockUserService;
  let userHandler;
  
  beforeEach(() => {
    mockUserService = {
      getUsers: jest.fn(),
      getUser: jest.fn(),
      createUser: jest.fn()
    };
    userHandler = new UserHandler(mockUserService);
  });
  
  describe('getUser', () => {
    it('should return user when found', async () => {
      const mockUser = { id: '123', name: 'Test User' };
      mockUserService.getUser.mockResolvedValue(mockUser);
      
      const result = await userHandler.getUser({ id: '123' });
      
      expect(result).toEqual(mockUser);
      expect(mockUserService.getUser).toHaveBeenCalledWith('123');
    });
    
    it('should return 404 when user not found', async () => {
      mockUserService.getUser.mockResolvedValue(null);
      
      const result = await userHandler.getUser({ id: '123' });
      
      expect(result).toEqual({ statusCode: 404, body: "User not found" });
      expect(mockUserService.getUser).toHaveBeenCalledWith('123');
    });
  });
});
```

### Integration Testing

Use the Lambda Walrus runner for integration tests:

```typescript
// integration.test.ts
import axios from 'axios';
import { spawn } from 'child_process';

describe('API Integration Tests', () => {
  let server;
  const baseUrl = 'http://localhost:3000';
  
  beforeAll((done) => {
    // Start the Lambda Walrus server
    server = spawn('npx', ['walrus', './src/index.ts']);
    
    // Wait for server to start
    setTimeout(done, 2000);
  });
  
  afterAll(() => {
    // Stop the server
    server.kill();
  });
  
  it('should get user data', async () => {
    const response = await axios.get(`${baseUrl}/users/123`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', '123');
  });
  
  it('should create a new user', async () => {
    const newUser = { name: 'Test User', email: 'test@example.com' };
    const response = await axios.post(`${baseUrl}/users`, newUser);
    
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(newUser);
    expect(response.data).toHaveProperty('id');
  });
});
```

## Note

While reviewed manually, this document was generated from the codebase and may contain errors. Please point them out in issues or submit PRs to improve the documentation.