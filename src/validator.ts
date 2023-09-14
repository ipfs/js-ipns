import { logger } from '@libp2p/logger'
import errCode from 'err-code'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as ERRORS from './errors.js'
import { IpnsEntry } from './pb/ipns.js'
import { parseRFC3339, extractPublicKey, ipnsEntryDataForV2Sig, unmarshal, peerIdFromRoutingKey, parseCborData } from './utils.js'
import type { IPNSEntry } from './index.js'
import type { PublicKey } from '@libp2p/interface/keys'

const log = logger('ipns:validator')

/**
 * Limit valid IPNS record sizes to 10kb
 */
const MAX_RECORD_SIZE = 1024 * 10

/**
 * Validates the given ipns entry against the given public key
 */
export const validate = async (publicKey: PublicKey, entry: IPNSEntry): Promise<void> => {
  const { value, validityType, validity } = entry

  let dataForSignature: Uint8Array
  let signature: Uint8Array

  // Check v2 signature if it's available, otherwise use the v1 signature
  if ((entry.signatureV2 != null) && (entry.data != null)) {
    signature = entry.signatureV2
    dataForSignature = ipnsEntryDataForV2Sig(entry.data)

    validateCborDataMatchesPbData(entry)
  } else {
    throw errCode(new Error('missing data or signatureV2'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  // Validate Signature
  let isValid
  try {
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

  log('ipns entry for %b is valid', value)
}

const validateCborDataMatchesPbData = (entry: IPNSEntry): void => {
  if (entry.data == null) {
    throw errCode(new Error('Record data is missing'), ERRORS.ERR_INVALID_RECORD_DATA)
  }

  const data = parseCborData(entry.data)

  if (!uint8ArrayEquals(data.Value, entry.value)) {
    throw errCode(new Error('Field "value" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (!uint8ArrayEquals(data.Validity, entry.validity)) {
    throw errCode(new Error('Field "validity" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (data.ValidityType !== entry.validityType) {
    throw errCode(new Error('Field "validityType" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (data.Sequence !== entry.sequence) {
    throw errCode(new Error('Field "sequence" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (data.TTL !== entry.ttl) {
    throw errCode(new Error('Field "ttl" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }
}

export async function ipnsValidator (key: Uint8Array, marshalledData: Uint8Array): Promise<void>  {
  if (marshalledData.byteLength > MAX_RECORD_SIZE) {
    throw errCode(new Error('record too large'), ERRORS.ERR_RECORD_TOO_LARGE)
  }

  const peerId = peerIdFromRoutingKey(key)
  const receivedEntry = unmarshal(marshalledData)

  // extract public key
  const pubKey = await extractPublicKey(peerId, receivedEntry)

  // Record validation
  await validate(pubKey, receivedEntry)
}
