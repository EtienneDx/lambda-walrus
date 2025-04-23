import { Method } from "../../types";
import { TargetType, HandlerMethodsSymbol } from "../types";

function WalrusHandlerMethod(method: Method, path: string) {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const target: TargetType = _target;
    target[HandlerMethodsSymbol] = target[HandlerMethodsSymbol] || {};
    target[HandlerMethodsSymbol][`${method}/${path}`] = {
      handler: propertyKey
    };
  };
}

export const WalrusGet = WalrusHandlerMethod.bind(null, Method.GET);
export const WalrusPost = WalrusHandlerMethod.bind(null, Method.POST);
export const WalrusPut = WalrusHandlerMethod.bind(null, Method.PUT);
export const WalrusDelete = WalrusHandlerMethod.bind(null, Method.DELETE);
export const WalrusPatch = WalrusHandlerMethod.bind(null, Method.PATCH);
export const WalrusOptions = WalrusHandlerMethod.bind(null, Method.OPTIONS);
export const WalrusHead = WalrusHandlerMethod.bind(null, Method.HEAD);
