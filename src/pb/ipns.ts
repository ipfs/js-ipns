/* eslint-disable import/export */
/* eslint-disable @typescript-eslint/no-namespace */

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
    export const codec = () => {
      return enumeration<ValidityType>(__ValidityTypeValues)
    }
  }

  let _codec: Codec<IpnsEntry>

  export const codec = (): Codec<IpnsEntry> => {
    if (_codec == null) {
      _codec = message<IpnsEntry>((obj, writer, opts = {}) => {
        if (opts.lengthDelimited !== false) {
          writer.fork()
        }

        if (obj.value != null) {
          writer.uint32(10)
          writer.bytes(obj.value)
        }

        if (obj.signature != null) {
          writer.uint32(18)
          writer.bytes(obj.signature)
        }

        if (obj.validityType != null) {
          writer.uint32(24)
          IpnsEntry.ValidityType.codec().encode(obj.validityType, writer)
        }

        if (obj.validity != null) {
          writer.uint32(34)
          writer.bytes(obj.validity)
        }

        if (obj.sequence != null) {
          writer.uint32(40)
          writer.uint64(obj.sequence)
        }

        if (obj.ttl != null) {
          writer.uint32(48)
          writer.uint64(obj.ttl)
        }

        if (obj.pubKey != null) {
          writer.uint32(58)
          writer.bytes(obj.pubKey)
        }

        if (obj.signatureV2 != null) {
          writer.uint32(66)
          writer.bytes(obj.signatureV2)
        }

        if (obj.data != null) {
          writer.uint32(74)
          writer.bytes(obj.data)
        }

        if (opts.lengthDelimited !== false) {
          writer.ldelim()
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
