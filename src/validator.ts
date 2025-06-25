import { publicKeyFromMultihash } from '@libp2p/crypto/keys'
import { logger } from '@libp2p/logger'
import NanoDate from 'timestamp-nano'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { InvalidEmbeddedPublicKeyError, RecordExpiredError, RecordTooLargeError, SignatureVerificationError, UnsupportedValidityError } from './errors.js'
import { IpnsEntry } from './pb/ipns.js'
import { extractPublicKeyFromIPNSRecord, ipnsRecordDataForV2Sig, isCodec, multihashFromIPNSRoutingKey, multihashToIPNSRoutingKey, unmarshalIPNSRecord } from './utils.js'
import type { IPNSRecord } from './index.js'
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
export async function validate (publicKey: PublicKey, marshalledRecord: Uint8Array): Promise<void> {
  // unmarshal ensures that (1) SignatureV2 and Data are present, (2) that ValidityType
  // and Validity are of valid types and have a value, (3) that CBOR data matches protobuf
  // if it's a V1+V2 record.
  const record = unmarshalIPNSRecord(marshalledRecord)

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
    throw new SignatureVerificationError('Record signature verification failed')
  }

  // Validate according to the validity type
  if (record.validityType === IpnsEntry.ValidityType.EOL) {
    if (NanoDate.fromString(record.validity).toDate().getTime() < Date.now()) {
      log.error('record has expired')
      throw new RecordExpiredError('record has expired')
    }
  } else if (record.validityType != null) {
    log.error('the validity type is unsupported')
    throw new UnsupportedValidityError('The validity type is unsupported')
  }

  log('ipns record for %s is valid', record.value)
}

/**
 * Validate the given IPNS record against the given routing key.
 *
 * @see https://specs.ipfs.tech/ipns/ipns-record/#routing-record for the binary format of the routing key
 *
 * @param routingKey - The routing key in binary format: binary(ascii(IPNS_PREFIX) + multihash(public key))
 * @param marshalledRecord - The marshalled record to validate.
 */
export async function ipnsValidator (routingKey: Uint8Array, marshalledRecord: Uint8Array): Promise<void> {
  if (marshalledRecord.byteLength > MAX_RECORD_SIZE) {
    throw new RecordTooLargeError('The record is too large')
  }

  // try to extract public key from routing key
  const routingMultihash = multihashFromIPNSRoutingKey(routingKey)
  let routingPubKey: PublicKey | undefined

  // identity hash
  if (isCodec(routingMultihash, 0x0)) {
    routingPubKey = publicKeyFromMultihash(routingMultihash)
  }

  // extract public key from record
  const receivedRecord = unmarshalIPNSRecord(marshalledRecord)
  const recordPubKey = extractPublicKeyFromIPNSRecord(receivedRecord) ?? routingPubKey

  if (recordPubKey == null) {
    throw new InvalidEmbeddedPublicKeyError('Could not extract public key from IPNS record or routing key')
  }

  const expectedRoutingKey = multihashToIPNSRoutingKey(recordPubKey.toMultihash())

  if (!uint8ArrayEquals(expectedRoutingKey, routingKey)) {
    throw new InvalidEmbeddedPublicKeyError('Embedded public key did not match routing key')
  }

  // Record validation
  await validate(recordPubKey, marshalledRecord)
}

/**
 * Returns the number of milliseconds until the record expires.
 * If the record is already expired, returns 0.
 *
 * @param record - The IPNS record to validate.
 * @returns The number of milliseconds until the record expires, or 0 if the record is already expired.
 */
export function validFor (record: IPNSRecord): number {
  if (record.validityType !== IpnsEntry.ValidityType.EOL) {
    throw new UnsupportedValidityError()
  }

  if (record.validity == null) {
    throw new UnsupportedValidityError()
  }

  const validUntil = NanoDate.fromString(record.validity).toDate().getTime()
  const now = Date.now()

  if (validUntil < now) {
    return 0
  }

  return validUntil - now
}
