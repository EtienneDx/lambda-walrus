import { WalrusGet, WalrusPost, WalrusPut, WalrusDelete, WalrusPatch, WalrusOptions, WalrusHead } from './WalrusHandlerMethod';
import { Method } from "../../types";
import { HandlerMethodsSymbol, TargetType } from "../types";

describe('WalrusHandlerMethod Decorators', () => {
  function testDecorator(decorator: Function, method: Method, path: string) {
    const propertyKey = 'testHandler';    
    class TestClass {
      @decorator
      testHandler() {}
    }

    expect((TestClass.prototype as unknown as TargetType)[HandlerMethodsSymbol]).toBeDefined();
    expect((TestClass.prototype as unknown as TargetType)[HandlerMethodsSymbol][`${method}/${path}`]).toEqual({
      handler: propertyKey
    });
  }

  it('should register a GET handler', () => {
    testDecorator(WalrusGet('/test'), Method.GET, '/test');
  });

  it('should register a POST handler', () => {
    testDecorator(WalrusPost('/test'), Method.POST, '/test');
  });

  it('should register a PUT handler', () => {
    testDecorator(WalrusPut('/test'), Method.PUT, '/test');
  });

  it('should register a DELETE handler', () => {
    testDecorator(WalrusDelete('/test'), Method.DELETE, '/test');
  });

  it('should register a PATCH handler', () => {
    testDecorator(WalrusPatch('/test'), Method.PATCH, '/test');
  });

  it('should register an OPTIONS handler', () => {
    testDecorator(WalrusOptions('/test'), Method.OPTIONS, '/test');
  });

  it('should register a HEAD handler', () => {
    testDecorator(WalrusHead('/test'), Method.HEAD, '/test');
  });
});
