import { WalrusParamProviderDecorator, WalrusParamProviderDecoratorNoArg } from './WalrusParamProviderDecorator';
import { HandlerParamProviderSymbol } from '../types';

describe('WalrusParamProviderDecorator', () => {
  it('should add a parameter provider with arguments', () => {
    const mockDecorator = jest.fn();
    const target: any = {};
    const propertyKey = 'testMethod';
    const descriptor: PropertyDescriptor = {};

    const decorator = WalrusParamProviderDecorator(mockDecorator)('arg1', 'arg2');
    decorator(target, propertyKey, descriptor);

    expect(target[HandlerParamProviderSymbol][propertyKey]).toHaveLength(1);
    expect(target[HandlerParamProviderSymbol][propertyKey][0]).toEqual({
      get_parameters: mockDecorator,
      args: ['arg1', 'arg2'],
    });
  });
});

describe('WalrusParamProviderDecoratorNoArg', () => {
  it('should add a parameter provider without arguments', () => {
    const mockDecorator = jest.fn();
    const target: any = {};
    const propertyKey = 'testMethod';
    const descriptor: PropertyDescriptor = {};

    const decorator = WalrusParamProviderDecoratorNoArg(mockDecorator);
    decorator(target, propertyKey, descriptor);

    expect(target[HandlerParamProviderSymbol][propertyKey]).toHaveLength(1);
    expect(target[HandlerParamProviderSymbol][propertyKey][0]).toEqual({
      get_parameters: mockDecorator,
      args: [],
    });
  });
});
