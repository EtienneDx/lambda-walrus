import { APIGatewayProxyEventV2 } from "aws-lambda";
import { JsonBodyInner } from "./JsonBody";
import { CommonErrors } from "../../common_errors";

describe('JsonBodyInner', () => {
  it('should parse JSON body correctly', () => {
    const event = {
      body: JSON.stringify({ key: 'value' })
    } as APIGatewayProxyEventV2;

    const result = JsonBodyInner({}, {}, event);
    expect(result).toEqual({ status: "ok", params: { body: { key: 'value' } } });
  });

  it('should return error if body is missing', () => {
    const event = {
      body: null
    } as unknown as APIGatewayProxyEventV2;

    const result = JsonBodyInner({}, {}, event);
    expect(result).toEqual({ status: "error", returnValue: CommonErrors.BadRequest });
  });

  it('should return error if body is not valid JSON', () => {
    const event = {
      body: "invalid JSON"
    } as APIGatewayProxyEventV2;

    const result = JsonBodyInner({}, {}, event);
    expect(result).toEqual({ status: "error", returnValue: CommonErrors.BadRequest });
  });
});
