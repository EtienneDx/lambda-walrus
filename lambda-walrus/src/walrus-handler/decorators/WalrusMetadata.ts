import { WalrusErrorMode } from "../types";
import { WalrusMetadataProviderDecorator } from "./WalrusMetadataProviderDecorator";

function WalrusMetadataInner(metadata: object) {
  return metadata;
}
export const WalrusMetadata = WalrusMetadataProviderDecorator(WalrusMetadataInner);
function WalrusErrorInner(errorMode: WalrusErrorMode) {
  return {
    errorMode,
  };
}
export const WalrusError = WalrusMetadataProviderDecorator(WalrusErrorInner);
