import { WalrusMetadataProvider, TargetType, ClassMetadataSymbol } from "../types";


export function WalrusMetadataProviderDecorator(decorator: WalrusMetadataProvider) {
  return function (...args: any[]) {
    return function (constructor: Function) {
      const target: TargetType = constructor.prototype;
      let new_metadata = decorator(...args);
      if (new_metadata instanceof Promise) {
        new_metadata.then((resolved_metadata) => {
          target[ClassMetadataSymbol] = {
            ...target[ClassMetadataSymbol],
            ...resolved_metadata,
          };
        });
      }
      else {
        target[ClassMetadataSymbol] = {
          ...target[ClassMetadataSymbol],
          ...new_metadata,
        };
      }
    };
  };
}
export function WalrusMetadataProviderDecoratorNoArg(decorator: WalrusMetadataProvider) {
  return function (constructor: Function) {
    const target: TargetType = constructor.prototype;
    let new_metadata = decorator();
    if (new_metadata instanceof Promise) {
      new_metadata.then((resolved_metadata) => {
        target[ClassMetadataSymbol] = {
            ...target[ClassMetadataSymbol],
            ...resolved_metadata,
          };
        });
    }
    else {
      target[ClassMetadataSymbol] = {
        ...target[ClassMetadataSymbol],
        ...new_metadata,
      };
    }
  };
}
