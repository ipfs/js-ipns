
import ValidityType from './pb/ipns'

export interface IPNSEntry {
  value: Uint8Array // value to be stored in the record
  signature: Uint8Array // signature of the record
  validityType: ValidityType // Type of validation being used
  validity: Uint8Array // expiration datetime for the record in RFC3339 format
  sequence: bigint // number representing the version of the record
  ttl?: bigint // ttl in nanoseconds
  pubKey?: Uint8Array // the public portion of the key that signed this record (only present if it was not embedded in the IPNS key)
  signatureV2?: Uint8Array // the v2 signature of the record
  data?: Uint8Array // extensible data
}
