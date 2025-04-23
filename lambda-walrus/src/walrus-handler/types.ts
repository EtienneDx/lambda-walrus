import { APIGatewayProxyEventV2, Context } from "aws-lambda";

export type HandlerMethod = (params: object, metadata: object, event: APIGatewayProxyEventV2, context: Context) => Promise<any>;

export const HandlerMethodsSymbol = Symbol('HandlerMethods');
export const HandlerParamProviderSymbol = Symbol('HandlerParamProvider');
export const ClassMetadataSymbol = Symbol('ClassMetadata');

export type HandlerParamResult = {
  status: "ok";
  params: object;
} | {
  status: "error";
  returnValue: any;
};

export const ParamResult = {
  ok: (params: object): HandlerParamResult => ({ status: "ok", params }),
  error: (returnValue: any): HandlerParamResult => ({ status: "error", returnValue }),
}

export type HandlerMethodDefinition = {
  handler: string;
};
export type HandlerParamProviderFunction = (params: object, metadata: object, event: APIGatewayProxyEventV2, context: Context, ...args: unknown[]) => HandlerParamResult | Promise<HandlerParamResult>;
export type HandlerParamProvider = {
  get_parameters: HandlerParamProviderFunction;
  args: any[];
};

export type WalrusMetadataProvider = (...args: any[]) => object;

export type Metadata = object & {
  errorMode?: WalrusErrorMode;
}

export type TargetType = {
  [HandlerMethodsSymbol]: Record<string, HandlerMethodDefinition>,
  [HandlerParamProviderSymbol]: Record<string, HandlerParamProvider[]>,
  [ClassMetadataSymbol]: object,
};
export enum WalrusErrorMode {
  JSON,
  TEXT
}
