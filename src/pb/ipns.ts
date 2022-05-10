/* eslint-disable import/export */
/* eslint-disable @typescript-eslint/no-namespace */

import { enumeration, encodeMessage, decodeMessage, message, bytes, uint64 } from 'protons-runtime'
import type { Codec } from 'protons-runtime'

export interface IpnsEntry {
  value?: Uint8Array
  signature?: Uint8Array
  validityType?: IpnsEntry.ValidityType
  validity?: Uint8Array
  sequence?: bigint
  ttl?: bigint
  pubKey?: Uint8Array
  signatureV2?: Uint8Array
  data?: Uint8Array
}

export namespace IpnsEntry {
  export enum ValidityType {
    EOL = 'EOL'
  }

  enum __ValidityTypeValues {
    EOL = 0
  }

  export namespace ValidityType {
    export const codec = () => {
      return enumeration<typeof ValidityType>(__ValidityTypeValues)
    }
  }

  export const codec = (): Codec<IpnsEntry> => {
    return message<IpnsEntry>({
      1: { name: 'value', codec: bytes, optional: true },
      2: { name: 'signature', codec: bytes, optional: true },
      3: { name: 'validityType', codec: IpnsEntry.ValidityType.codec(), optional: true },
      4: { name: 'validity', codec: bytes, optional: true },
      5: { name: 'sequence', codec: uint64, optional: true },
      6: { name: 'ttl', codec: uint64, optional: true },
      7: { name: 'pubKey', codec: bytes, optional: true },
      8: { name: 'signatureV2', codec: bytes, optional: true },
      9: { name: 'data', codec: bytes, optional: true }
    })
  }

  export const encode = (obj: IpnsEntry): Uint8Array => {
    return encodeMessage(obj, IpnsEntry.codec())
  }

  export const decode = (buf: Uint8Array): IpnsEntry => {
    return decodeMessage(buf, IpnsEntry.codec())
  }
}
