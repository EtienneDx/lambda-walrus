# Error Handling

Lambda Walrus provides a standardized way to handle errors in your Lambda functions. This guide explains how to configure error handling and create custom error responses.

## Built-in Error Handling

Lambda Walrus includes a set of common HTTP errors through the `CommonErrors` export:

```typescript
import { CommonErrors } from "@etiennedx/lambda-walrus";

@WalrusGet("/example")
async exampleMethod(): Promise<any> {
  const userExists = false;
  
  if (!userExists) {
    return CommonErrors.NotFound; // Returns a 404 Not Found response
  }
  
  // Continue with normal processing
}
```

Available common errors:

- `CommonErrors.BadRequest` (400)
- `CommonErrors.Unauthorized` (401)
- `CommonErrors.NotFound` (404)
- `CommonErrors.MethodNotAllowed` (405)
- `CommonErrors.InternalServerError` (500)

## Error Response Format

You can configure how errors are formatted using the `@WalrusError` decorator:

```typescript
import { WalrusError, WalrusErrorMode } from "@etiennedx/lambda-walrus";

@WalrusError(WalrusErrorMode.JSON)
class MyHandler {
  // Methods...
}
```

There are two error modes available:

1. `WalrusErrorMode.JSON`: Returns errors as JSON objects with a message (default)
   ```json
   {
     "message": "Not Found"
   }
   ```

2. `WalrusErrorMode.TEXT`: Returns errors as plain text
   ```
   Not Found
   ```

## Custom Error Responses

You can create custom error responses by returning an object with the appropriate structure:

```typescript
@WalrusGet("/products/:id")
async getProduct({ id }: { id: string }): Promise<any> {
  const product = await findProduct(id);
  
  if (!product) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Product not found",
        productId: id
      })
    };
  }
  
  return product;
}
```

## Handling Errors in Parameter Providers

Parameter provider decorators can return errors using the `ParamResult.error` function:

```typescript
import { WalrusParamProviderDecorator, HandlerParamResult, ParamResult } from "@etiennedx/lambda-walrus";

function RequiredQueryParamInner(paramName: string, _: object, __: object, event: APIGatewayProxyEventV2): HandlerParamResult {
  const value = event.queryStringParameters?.[paramName];
  
  if (!value) {
    return ParamResult.error({
      statusCode: 400,
      body: `Missing required query parameter: ${paramName}`
    });
  }
  
  return ParamResult.ok({ [paramName]: value });
}

export const RequiredQueryParam = WalrusParamProviderDecorator(RequiredQueryParamInner);
```

## Try-Catch Pattern

You can use try-catch blocks to handle exceptions in your Lambda functions:

```typescript
@WalrusGet("/users/:id")
async getUser({ id }: { id: string }): Promise<any> {
  try {
    const user = await fetchUserFromDatabase(id);
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    
    if (error.code === "USER_NOT_FOUND") {
      return CommonErrors.NotFound;
    }
    
    return CommonErrors.InternalServerError;
  }
}
```

## Creating a Custom Error Library

For more complex applications, you might want to create a custom error library:

```typescript
// errors.ts
import { CommonError } from "@etiennedx/lambda-walrus";

export const AppErrors = {
  ...CommonErrors, // Include the common errors
  
  // Add custom errors
  ValidationError: {
    statusCode: 400,
    body: "Validation Error"
  },
  
  PaymentRequired: {
    statusCode: 402,
    body: "Payment Required"
  },
  
  RateLimited: {
    statusCode: 429,
    body: "Too Many Requests"
  },
  
  createValidationError: (details: string): CommonError => ({
    statusCode: 400,
    body: `Validation Error: ${details}`
  }),
  
  createNotFoundError: (resource: string, id: string): CommonError => ({
    statusCode: 404,
    body: `${resource} with ID ${id} not found`
  }),
};
```

Then use it in your handlers:

```typescript
import { AppErrors } from "./errors";

@WalrusGet("/users/:id")
async getUser({ id }: { id: string }): Promise<any> {
  const user = await findUser(id);
  
  if (!user) {
    return AppErrors.createNotFoundError("User", id);
  }
  
  return user;
}
```

## Error Logging

It's a good practice to log errors for debugging purposes:

```typescript
@WalrusGet("/data")
async getData(): Promise<any> {
  try {
    return await fetchData();
  } catch (error) {
    // Log the error for internal visibility
    console.error("Error fetching data:", JSON.stringify({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }));
    
    // Return a sanitized error to the client
    return CommonErrors.InternalServerError;
  }
}
```
