
import ValidityType from './pb/ipns'

export interface IPNSEntry {
  value: Uint8Array, // value to be stored in the record
  signature: Uint8Array, // signature of the record
  validityType: ValidityType, // Type of validation being used
  validity: Uint8Array, // expiration datetime for the record in RFC3339 format
  sequence: BigInt // number representing the version of the record
  ttl?: BigInt // ttl in nanoseconds
  pubKey?: Uint8Array
  signatureV2?: Uint8Array // the v2 signature of the record
  data?: Uint8Array // extensible data
}
