import { APIGatewayProxyEventV2, Context, Handler } from "aws-lambda";
import { HandlerMethodsSymbol, HandlerMethodDefinition, HandlerParamProviderSymbol, ClassMetadataSymbol, Metadata } from "./types";
import { CommonError, CommonErrors } from "../common_errors";
import { Method } from "../types";
import { WalrusErrorMode } from "./types";


export function walrusify(target: any): Handler {
  const handlerMethods = target[HandlerMethodsSymbol];
  if (!handlerMethods || typeof handlerMethods !== 'object') {
    console.warn("No handlers found, make sure to use the proper walrus decorators to mark handlers.");
  }
  const handlers: Record<string, HandlerMethodDefinition> = handlerMethods || {};
  const paths = Object.keys(handlers);

  const metadata: Metadata = target[ClassMetadataSymbol] || {};
  const errorMode = metadata?.errorMode || WalrusErrorMode.JSON;

  return async (event: APIGatewayProxyEventV2, context: Context) => {
    const parts = event.requestContext.http.path.split('/');
    const method = event.requestContext.http.method as Method;

    const resolvedPath = resolvePath(paths, [method, ...parts]);
    if (!resolvedPath) {
      return CommonErrors.NotFound;
    }
    let [path, params] = resolvedPath;
    const handler = handlers[path];

    const paramProviders = target[HandlerParamProviderSymbol][handler.handler] || [];
    for (const provider of paramProviders) {
      try {
        let newParams = provider.get_parameters(params, metadata, event, context, ...provider.args);
        if (newParams instanceof Promise) {
          newParams = await newParams;
        }
        if (newParams.status === "ok") {
          params = { ...params, ...newParams.params };
        } else if (newParams.status === "error") {
          return transformError(newParams.returnValue, errorMode);
        }
      } catch (e: any) {
        console.error(e);
        return transformError(CommonErrors.InternalServerError, errorMode);
      }
    }
    
    return await target[handler.handler](params, metadata, event, context);
  };
}

function transformError(error: CommonError, errorMode: WalrusErrorMode): any {
  if (errorMode === WalrusErrorMode.JSON) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({ message: error.body }),
    };
  }
  return error;
}

function resolvePath(availablePaths: string[], parts: string[]): [string, Record<string, string>] | null {
  for (const path of availablePaths) {
    const pathParts = path.split('/');
    if (pathParts.length !== parts.length) {
      continue;
    }
    console.log(pathParts, parts);
    let valid = true;
    const params: Record<string, string> = {};
    for (let i = 0; i < pathParts.length; i++) {
      if (pathParts[i].startsWith(':')) {
        params[pathParts[i].substring(1)] = parts[i];
      } else if (pathParts[i] !== parts[i]) {
        valid = false;
        break;
      }
    }
    if (!valid) {
      continue;
    }
    return [path, params];
  }
  return null;
}