import { unmarshalPublicKey } from '@libp2p/crypto/keys'
import { isPeerId } from '@libp2p/interface'
import { logger } from '@libp2p/logger'
import { peerIdFromBytes, peerIdFromKeys } from '@libp2p/peer-id'
import * as cborg from 'cborg'
import errCode from 'err-code'
import { base36 } from 'multiformats/bases/base36'
import { CID } from 'multiformats/cid'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as ERRORS from './errors.js'
import { IpnsEntry } from './pb/ipns.js'
import type { IPNSRecord, IPNSRecordV2, IPNSRecordData } from './index.js'
import type { PublicKey, PeerId } from '@libp2p/interface'

const log = logger('ipns:utils')
const IPNS_PREFIX = uint8ArrayFromString('/ipns/')
const LIBP2P_CID_CODEC = 114

/**
 * Extracts a public key from the passed PeerId, falling
 * back to the pubKey embedded in the ipns record
 */
export const extractPublicKey = async (peerId: PeerId, record: IPNSRecord | IPNSRecordV2): Promise<PublicKey> => {
  if (record == null || peerId == null) {
    const error = new Error('one or more of the provided parameters are not defined')

    log.error(error)
    throw errCode(error, ERRORS.ERR_UNDEFINED_PARAMETER)
  }

  let pubKey: PublicKey | undefined

  if (record.pubKey != null) {
    try {
      pubKey = unmarshalPublicKey(record.pubKey)
    } catch (err) {
      log.error(err)
      throw err
    }

    const otherId = await peerIdFromKeys(record.pubKey)

    if (!otherId.equals(peerId)) {
      throw errCode(new Error('Embedded public key did not match PeerID'), ERRORS.ERR_INVALID_EMBEDDED_KEY)
    }
  } else if (peerId.publicKey != null) {
    pubKey = unmarshalPublicKey(peerId.publicKey)
  }

  if (pubKey != null) {
    return pubKey
  }

  throw errCode(new Error('no public key is available'), ERRORS.ERR_UNDEFINED_PARAMETER)
}

/**
 * Utility for creating the record data for being signed
 */
export const ipnsRecordDataForV1Sig = (value: Uint8Array, validityType: IpnsEntry.ValidityType, validity: Uint8Array): Uint8Array => {
  const validityTypeBuffer = uint8ArrayFromString(validityType)

  return uint8ArrayConcat([value, validity, validityTypeBuffer])
}

/**
 * Utility for creating the record data for being signed
 */
export const ipnsRecordDataForV2Sig = (data: Uint8Array): Uint8Array => {
  const entryData = uint8ArrayFromString('ipns-signature:')

  return uint8ArrayConcat([entryData, data])
}

export const marshal = (obj: IPNSRecord | IPNSRecordV2): Uint8Array => {
  if ('signatureV1' in obj) {
    return IpnsEntry.encode({
      value: uint8ArrayFromString(obj.value),
      signatureV1: obj.signatureV1,
      validityType: obj.validityType,
      validity: uint8ArrayFromString(obj.validity),
      sequence: obj.sequence,
      ttl: obj.ttl,
      pubKey: obj.pubKey,
      signatureV2: obj.signatureV2,
      data: obj.data
    })
  } else {
    return IpnsEntry.encode({
      pubKey: obj.pubKey,
      signatureV2: obj.signatureV2,
      data: obj.data
    })
  }
}

export function unmarshal (buf: Uint8Array): IPNSRecord {
  const message = IpnsEntry.decode(buf)

  // protobufjs returns bigints as numbers
  if (message.sequence != null) {
    message.sequence = BigInt(message.sequence)
  }

  // protobufjs returns bigints as numbers
  if (message.ttl != null) {
    message.ttl = BigInt(message.ttl)
  }

  // Check if we have the data field. If we don't, we fail. We've been producing
  // V1+V2 records for quite a while and we don't support V1-only records during
  // validation any more
  if (message.signatureV2 == null || message.data == null) {
    throw errCode(new Error('missing data or signatureV2'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  const data = parseCborData(message.data)
  const value = normalizeValue(data.Value)
  const validity = uint8ArrayToString(data.Validity)

  if (message.value != null && message.signatureV1 != null) {
    // V1+V2
    validateCborDataMatchesPbData(message)

    return {
      value,
      validityType: IpnsEntry.ValidityType.EOL,
      validity,
      sequence: data.Sequence,
      ttl: data.TTL,
      pubKey: message.pubKey,
      signatureV1: message.signatureV1,
      signatureV2: message.signatureV2,
      data: message.data
    }
  } else if (message.signatureV2 != null) {
    // V2-only
    return {
      value,
      validityType: IpnsEntry.ValidityType.EOL,
      validity,
      sequence: data.Sequence,
      ttl: data.TTL,
      pubKey: message.pubKey,
      signatureV2: message.signatureV2,
      data: message.data
    }
  } else {
    throw new Error('invalid record: does not include signatureV1 or signatureV2')
  }
}

export const peerIdToRoutingKey = (peerId: PeerId): Uint8Array => {
  return uint8ArrayConcat([
    IPNS_PREFIX,
    peerId.toBytes()
  ])
}

export const peerIdFromRoutingKey = (key: Uint8Array): PeerId => {
  return peerIdFromBytes(key.slice(IPNS_PREFIX.length))
}

export const createCborData = (value: Uint8Array, validityType: IpnsEntry.ValidityType, validity: Uint8Array, sequence: bigint, ttl: bigint): Uint8Array => {
  let ValidityType

  if (validityType === IpnsEntry.ValidityType.EOL) {
    ValidityType = 0
  } else {
    throw errCode(new Error('Unknown validity type'), ERRORS.ERR_UNRECOGNIZED_VALIDITY)
  }

  const data = {
    Value: value,
    Validity: validity,
    ValidityType,
    Sequence: sequence,
    TTL: ttl
  }

  return cborg.encode(data)
}

export const parseCborData = (buf: Uint8Array): IPNSRecordData => {
  const data = cborg.decode(buf)

  if (data.ValidityType === 0) {
    data.ValidityType = IpnsEntry.ValidityType.EOL
  } else {
    throw errCode(new Error('Unknown validity type'), ERRORS.ERR_UNRECOGNIZED_VALIDITY)
  }

  if (Number.isInteger(data.Sequence)) {
    // sequence must be a BigInt, but DAG-CBOR doesn't preserve this for Numbers within the safe-integer range
    data.Sequence = BigInt(data.Sequence)
  }

  if (Number.isInteger(data.TTL)) {
    // ttl must be a BigInt, but DAG-CBOR doesn't preserve this for Numbers within the safe-integer range
    data.TTL = BigInt(data.TTL)
  }

  return data
}

/**
 * Normalizes the given record value. It ensures it is a PeerID, a CID or a
 * string starting with '/'. PeerIDs become `/ipns/${cidV1Libp2pKey}`,
 * CIDs become `/ipfs/${cidAsV1}`.
 */
export const normalizeValue = (value?: CID | PeerId | string | Uint8Array): string => {
  if (value != null) {
    // if we have a PeerId, turn it into an ipns path
    if (isPeerId(value)) {
      return `/ipns/${value.toCID().toString(base36)}`
    }

    // if the value is bytes, stringify it and see if we have a path
    if (value instanceof Uint8Array) {
      const string = uint8ArrayToString(value)

      if (string.startsWith('/')) {
        value = string
      }
    }

    // if we have a path, check it is a valid path
    const string = value.toString().trim()
    if (string.startsWith('/') && string.length > 1) {
      return string
    }

    // if we have a CID, turn it into an ipfs path
    const cid = CID.asCID(value)
    if (cid != null) {
      // PeerID encoded as a CID
      if (cid.code === LIBP2P_CID_CODEC) {
        return `/ipns/${cid.toString(base36)}`
      }

      return `/ipfs/${cid.toV1().toString()}`
    }

    // try parsing what we have as CID bytes or a CID string
    try {
      if (value instanceof Uint8Array) {
        return `/ipfs/${CID.decode(value).toV1().toString()}`
      }

      return `/ipfs/${CID.parse(string).toV1().toString()}`
    } catch {
      // fall through
    }
  }

  throw errCode(new Error('Value must be a valid content path starting with /'), ERRORS.ERR_INVALID_VALUE)
}

const validateCborDataMatchesPbData = (entry: IpnsEntry): void => {
  if (entry.data == null) {
    throw errCode(new Error('Record data is missing'), ERRORS.ERR_INVALID_RECORD_DATA)
  }

  const data = parseCborData(entry.data)

  if (!uint8ArrayEquals(data.Value, entry.value ?? new Uint8Array(0))) {
    throw errCode(new Error('Field "value" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (!uint8ArrayEquals(data.Validity, entry.validity ?? new Uint8Array(0))) {
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
