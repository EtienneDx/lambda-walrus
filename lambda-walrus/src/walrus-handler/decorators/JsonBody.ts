import { APIGatewayProxyEventV2 } from "aws-lambda";
import { WalrusParamProviderDecoratorNoArg } from "./WalrusParamProviderDecorator";
import { CommonErrors } from "../../common_errors";
import { HandlerParamResult, ParamResult } from "../types";

export function JsonBodyInner(_: object, __: object, event: APIGatewayProxyEventV2): HandlerParamResult {
  console.log(typeof event.body, event.body);
  if (!event.body) {
    return ParamResult.error(CommonErrors.BadRequest);
  }
  try {
    return ParamResult.ok({ body: JSON.parse(event.body) });
  } catch {
    return ParamResult.error(CommonErrors.BadRequest);
  }
}

export const JsonBody = WalrusParamProviderDecoratorNoArg(JsonBodyInner);
