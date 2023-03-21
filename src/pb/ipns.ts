/* eslint-disable import/export */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare */

import { enumeration, encodeMessage, decodeMessage, message } from 'protons-runtime'
import type { Uint8ArrayList } from 'uint8arraylist'
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
    export const codec = (): Codec<ValidityType> => {
      return enumeration<ValidityType>(__ValidityTypeValues)
    }
  }

  let _codec: Codec<IpnsEntry>

  export const codec = (): Codec<IpnsEntry> => {
    if (_codec == null) {
      _codec = message<IpnsEntry>((obj, w, opts = {}) => {
        if (opts.lengthDelimited !== false) {
          w.fork()
        }

        if (obj.value != null) {
          w.uint32(10)
          w.bytes(obj.value)
        }

        if (obj.signature != null) {
          w.uint32(18)
          w.bytes(obj.signature)
        }

        if (obj.validityType != null) {
          w.uint32(24)
          IpnsEntry.ValidityType.codec().encode(obj.validityType, w)
        }

        if (obj.validity != null) {
          w.uint32(34)
          w.bytes(obj.validity)
        }

        if (obj.sequence != null) {
          w.uint32(40)
          w.uint64(obj.sequence)
        }

        if (obj.ttl != null) {
          w.uint32(48)
          w.uint64(obj.ttl)
        }

        if (obj.pubKey != null) {
          w.uint32(58)
          w.bytes(obj.pubKey)
        }

        if (obj.signatureV2 != null) {
          w.uint32(66)
          w.bytes(obj.signatureV2)
        }

        if (obj.data != null) {
          w.uint32(74)
          w.bytes(obj.data)
        }

        if (opts.lengthDelimited !== false) {
          w.ldelim()
        }
      }, (reader, length) => {
        const obj: any = {}

        const end = length == null ? reader.len : reader.pos + length

        while (reader.pos < end) {
          const tag = reader.uint32()

          switch (tag >>> 3) {
            case 1:
              obj.value = reader.bytes()
              break
            case 2:
              obj.signature = reader.bytes()
              break
            case 3:
              obj.validityType = IpnsEntry.ValidityType.codec().decode(reader)
              break
            case 4:
              obj.validity = reader.bytes()
              break
            case 5:
              obj.sequence = reader.uint64()
              break
            case 6:
              obj.ttl = reader.uint64()
              break
            case 7:
              obj.pubKey = reader.bytes()
              break
            case 8:
              obj.signatureV2 = reader.bytes()
              break
            case 9:
              obj.data = reader.bytes()
              break
            default:
              reader.skipType(tag & 7)
              break
          }
        }

        return obj
      })
    }

    return _codec
  }

  export const encode = (obj: IpnsEntry): Uint8Array => {
    return encodeMessage(obj, IpnsEntry.codec())
  }

  export const decode = (buf: Uint8Array | Uint8ArrayList): IpnsEntry => {
    return decodeMessage(buf, IpnsEntry.codec())
  }
}
