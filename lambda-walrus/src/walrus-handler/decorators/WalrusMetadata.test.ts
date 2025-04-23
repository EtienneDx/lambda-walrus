import { WalrusMetadata, WalrusError } from './WalrusMetadata';
import { ClassMetadataSymbol, TargetType, WalrusErrorMode } from '../types';

describe('WalrusMetadata', () => {
  it('should apply metadata correctly', () => {
    @WalrusMetadata({ test: 'test' })
    class TestClass {}

    expect((TestClass.prototype as TargetType)[ClassMetadataSymbol]).toEqual({ test: 'test' });
  });
});

describe('WalrusError', () => {
  for (const errorMode of Object.values(WalrusErrorMode).filter((v) => typeof v === 'string')) {
    it(`should apply error mode correctly for ${errorMode}`, () => {
      @WalrusError(errorMode)
      class TestClass {}

      expect((TestClass.prototype as TargetType)[ClassMetadataSymbol]).toEqual({ errorMode });
    });
  }
});
