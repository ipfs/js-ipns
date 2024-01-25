import { logger } from '@libp2p/logger'
import errCode from 'err-code'
import NanoDate from 'timestamp-nano'
import * as ERRORS from './errors.js'
import { IpnsEntry } from './pb/ipns.js'
import { extractPublicKey, ipnsRecordDataForV2Sig, unmarshal, peerIdFromRoutingKey } from './utils.js'
import type { PublicKey } from '@libp2p/interface'

const log = logger('ipns:validator')

/**
 * Limit valid IPNS record sizes to 10kb
 */
const MAX_RECORD_SIZE = 1024 * 10

/**
 * Validates the given IPNS Record against the given public key. We need a "raw"
 * record in order to be able to access to all of its fields.
 */
export const validate = async (publicKey: PublicKey, buf: Uint8Array): Promise<void> => {
  // unmarshal ensures that (1) SignatureV2 and Data are present, (2) that ValidityType
  // and Validity are of valid types and have a value, (3) that CBOR data matches protobuf
  // if it's a V1+V2 record.
  const record = unmarshal(buf)

  // Validate Signature V2
  let isValid
  try {
    const dataForSignature = ipnsRecordDataForV2Sig(record.data)
    isValid = await publicKey.verify(dataForSignature, record.signatureV2)
  } catch (err) {
    isValid = false
  }
  if (!isValid) {
    log.error('record signature verification failed')
    throw errCode(new Error('record signature verification failed'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  // Validate according to the validity type
  if (record.validityType === IpnsEntry.ValidityType.EOL) {
    if (NanoDate.fromString(record.validity).toDate().getTime() < Date.now()) {
      log.error('record has expired')
      throw errCode(new Error('record has expired'), ERRORS.ERR_IPNS_EXPIRED_RECORD)
    }
  } else if (record.validityType != null) {
    log.error('unrecognized validity type')
    throw errCode(new Error('unrecognized validity type'), ERRORS.ERR_UNRECOGNIZED_VALIDITY)
  }

  log('ipns record for %s is valid', record.value)
}

export async function ipnsValidator (key: Uint8Array, marshalledData: Uint8Array): Promise<void> {
  if (marshalledData.byteLength > MAX_RECORD_SIZE) {
    throw errCode(new Error('record too large'), ERRORS.ERR_RECORD_TOO_LARGE)
  }

  const peerId = peerIdFromRoutingKey(key)
  const receivedRecord = unmarshal(marshalledData)

  // extract public key
  const pubKey = await extractPublicKey(peerId, receivedRecord)

  // Record validation
  await validate(pubKey, marshalledData)
}
