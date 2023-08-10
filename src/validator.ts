import { logger } from '@libp2p/logger'
import * as cborg from 'cborg'
import errCode from 'err-code'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as ERRORS from './errors.js'
import { IpnsEntry } from './pb/ipns.js'
import { parseRFC3339, extractPublicKey, ipnsRecordDataForV2Sig, unmarshal, peerIdFromRoutingKey } from './utils.js'
import type { IPNSRecord } from './index.js'
import type { ValidateFn } from '@libp2p/interface-dht'
import type { PublicKey } from '@libp2p/interface-keys'

const log = logger('ipns:validator')

/**
 * Limit valid IPNS record sizes to 10kb
 */
const MAX_RECORD_SIZE = 1024 * 10

/**
 * Validates the given IPNS record against the given public key
 */
export const validate = async (publicKey: PublicKey, record: IPNSRecord): Promise<void> => {
  const { value, validityType, validity } = record.pb

  // Ensure Signature V2 and Data are present and not empty.
  if ((record.pb.signatureV2 == null) || (record.pb.data == null)) {
    throw errCode(new Error('missing data or signatureV2'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  // If Signature V1 is present, ensure that CBOR data matches Protobuf data (IPIP-428).
  if (record.pb.signature != null || record.pb.value != null) {
    validateCborDataMatchesPbData(record)
  }

  // Validate Signature V2
  let isValid
  try {
    const signature = record.pb.signatureV2
    const dataForSignature = ipnsRecordDataForV2Sig(record.pb.data)
    isValid = await publicKey.verify(dataForSignature, signature)
  } catch (err) {
    isValid = false
  }
  if (!isValid) {
    log.error('record signature verification failed')
    throw errCode(new Error('record signature verification failed'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  // Validate according to the validity type
  if (validity != null && validityType === IpnsEntry.ValidityType.EOL) {
    let validityDate

    try {
      validityDate = parseRFC3339(uint8ArrayToString(validity))
    } catch (e) {
      log.error('unrecognized validity format (not an rfc3339 format)')
      throw errCode(new Error('unrecognized validity format (not an rfc3339 format)'), ERRORS.ERR_UNRECOGNIZED_FORMAT)
    }

    if (validityDate.getTime() < Date.now()) {
      log.error('record has expired')
      throw errCode(new Error('record has expired'), ERRORS.ERR_IPNS_EXPIRED_RECORD)
    }
  } else if (validityType != null) {
    log.error('unrecognized validity type')
    throw errCode(new Error('unrecognized validity type'), ERRORS.ERR_UNRECOGNIZED_VALIDITY)
  }

  log('ipns record for %b is valid', value)
}

const validateCborDataMatchesPbData = (record: IPNSRecord): void => {
  if (record.pb.data == null) {
    throw errCode(new Error('Record data is missing'), ERRORS.ERR_INVALID_RECORD_DATA)
  }

  const data = cborg.decode(record.pb.data)

  if (!uint8ArrayEquals(data.Value, record.pb.value ?? new Uint8Array(0))) {
    throw errCode(new Error('Field "value" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (!uint8ArrayEquals(data.Validity, record.pb.validity ?? new Uint8Array(0))) {
    throw errCode(new Error('Field "validity" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (data.ValidityType === 0) {
    data.ValidityType = IpnsEntry.ValidityType.EOL
  } else {
    throw errCode(new Error('Unknown validity type'), ERRORS.ERR_UNRECOGNIZED_VALIDITY)
  }

  if (data.ValidityType !== record.pb.validityType) {
    throw errCode(new Error('Field "validityType" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (Number.isInteger(data.Sequence)) {
    // sequence must be a BigInt, but DAG-CBOR doesn't preserve this for Numbers within the safe-integer range
    data.Sequence = BigInt(data.Sequence)
  }

  if (data.Sequence !== record.pb.sequence) {
    throw errCode(new Error('Field "sequence" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (Number.isInteger(data.TTL)) {
    // ttl must be a BigInt, but DAG-CBOR doesn't preserve this for Numbers within the safe-integer range
    data.TTL = BigInt(data.TTL)
  }

  if (data.TTL !== record.pb.ttl) {
    throw errCode(new Error('Field "ttl" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }
}

export const ipnsValidator: ValidateFn = async (key, marshalledData) => {
  if (marshalledData.byteLength > MAX_RECORD_SIZE) {
    throw errCode(new Error('record too large'), ERRORS.ERR_RECORD_TOO_LARGE)
  }

  const peerId = peerIdFromRoutingKey(key)
  const receivedRecord = unmarshal(marshalledData)

  // extract public key
  const pubKey = await extractPublicKey(peerId, receivedRecord)

  // Record validation
  await validate(pubKey, receivedRecord)
}
