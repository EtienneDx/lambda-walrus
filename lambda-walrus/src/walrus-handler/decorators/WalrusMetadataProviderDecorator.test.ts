import { WalrusMetadataProviderDecorator, WalrusMetadataProviderDecoratorNoArg } from './WalrusMetadataProviderDecorator';
import { ClassMetadataSymbol, TargetType } from '../types';

describe('WalrusMetadataProviderDecorator', () => {
  it('should add metadata to the target class', () => {
    const decoratorInner = jest.fn().mockReturnValue({ key: 'value' });
    const decorator = WalrusMetadataProviderDecorator(decoratorInner);
    @decorator()
    class TestClass {};

    expect((TestClass.prototype as TargetType)[ClassMetadataSymbol]).toEqual({ key: 'value' });
  });

  it('should handle async metadata', async () => {
    const decorator = jest.fn().mockResolvedValue({ key: 'asyncValue' });
    class TestClass {};
    await WalrusMetadataProviderDecorator(decorator)()(TestClass);

    expect((TestClass.prototype as TargetType)[ClassMetadataSymbol]).toEqual({ key: 'asyncValue' });
  });
});

describe('WalrusMetadataProviderDecoratorNoArg', () => {
  it('should add metadata to the target class', () => {
    const decoratorInner = jest.fn().mockReturnValue({ key: 'value' });
    const decorator = WalrusMetadataProviderDecoratorNoArg(decoratorInner);
    @decorator
    class TestClass {};

    expect((TestClass.prototype as TargetType)[ClassMetadataSymbol]).toEqual({ key: 'value' });
  });

  it('should handle async metadata', async () => {
    const decorator = jest.fn().mockResolvedValue({ key: 'asyncValue' });
    class TestClass {};
    await WalrusMetadataProviderDecoratorNoArg(decorator)(TestClass);

    expect((TestClass.prototype as TargetType)[ClassMetadataSymbol]).toEqual({ key: 'asyncValue' });
  });
});
