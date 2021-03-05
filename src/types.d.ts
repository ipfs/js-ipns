
import ValidityType from './pb/ipns'

export interface IPNSEntry {
  value: Uint8Array, // value to be stored in the record
  signature: Uint8Array, // signature of the record
  validityType: ValidityType, // Type of validation being used
  validity: Uint8Array, // expiration datetime for the record in RFC3339 format
  sequence: number // number representing the version of the record
  pubKey?: Uint8Array
}
