import {
  BrowserProvider as EthersBrowserProvider,
  Contract,
  JsonRpcSigner,
} from 'ethers';

type AesAwareSigner = JsonRpcSigner & {
  setAesKey: (key: string) => void;
  getAesKey: () => string | null;
  __cotiAesKey?: string | null;
};

function attachAesKeySupport(signer: JsonRpcSigner): AesAwareSigner {
  const target = signer as AesAwareSigner;

  if (typeof target.setAesKey !== 'function') {
    target.setAesKey = (key: string) => {
      target.__cotiAesKey = key;
    };

    target.getAesKey = () => target.__cotiAesKey ?? null;
  }

  return target;
}

export class BrowserProvider extends EthersBrowserProvider {
  async getSigner(addressOrIndex?: number | string): Promise<AesAwareSigner> {
    const signer = await super.getSigner(addressOrIndex);
    return attachAesKeySupport(signer);
  }
}

export { Contract };

export const itUint = <T extends bigint | number | string>(value: T) => value;
