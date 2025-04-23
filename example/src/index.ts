import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { walrusify, WalrusGet, JsonBody, WalrusError, WalrusErrorMode } from "@etiennedx/lambda-walrus";

@WalrusError(WalrusErrorMode.JSON)
class MyHandler {
  @WalrusGet("/hello")
  async hello(): Promise<string> {
    return "Hello, world!";
  }
  @WalrusGet("/test")
  @JsonBody
  async test({ body }: { body: unknown }): Promise<string> {
    return `Test with body ${body}!`;
  }
  @WalrusGet("/test/abc")
  async testAbc(): Promise<string> {
    return "Surprise ABC test!";
  }
  @WalrusGet("/test/:id")
  async testId({ id } : { id: string }): Promise<string> {
    return `${id} test!`;
  }
}

const test = new MyHandler();

const handler = walrusify(new MyHandler());

export { handler };