import { HandlerParamProviderFunction, TargetType, HandlerParamProviderSymbol } from "../types";


export function WalrusParamProviderDecorator(decorator: HandlerParamProviderFunction) {
  return function (...args: any[]) {
    return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const target: TargetType = _target;
      target[HandlerParamProviderSymbol] = target[HandlerParamProviderSymbol] || {};
      const paramProviders = target[HandlerParamProviderSymbol][propertyKey] || (target[HandlerParamProviderSymbol][propertyKey] = []);
      paramProviders.push({
        get_parameters: decorator,
        args,
      });
    };
  };
}

export function WalrusParamProviderDecoratorNoArg(decorator: HandlerParamProviderFunction) {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const target: TargetType = _target;
    target[HandlerParamProviderSymbol] = target[HandlerParamProviderSymbol] || {};
    const paramProviders = target[HandlerParamProviderSymbol][propertyKey] || (target[HandlerParamProviderSymbol][propertyKey] = []);
    paramProviders.push({
      get_parameters: decorator,
      args: [],
    });
  };
}
