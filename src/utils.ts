import errCode from 'err-code'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { IPNSEntry, IPNSEntryData } from './index.js'
import * as ERRORS from './errors.js'
import { unmarshalPublicKey } from '@libp2p/crypto/keys'
import { peerIdFromBytes, peerIdFromKeys } from '@libp2p/peer-id'
import { logger } from '@libp2p/logger'
import { IpnsEntry } from './pb/ipns.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import * as cborg from 'cborg'

const log = logger('ipns:utils')
const IPNS_PREFIX = uint8ArrayFromString('/ipns/')

/**
 * Convert a JavaScript date into an `RFC3339Nano` formatted
 * string
 */
export function toRFC3339 (time: Date) {
  const year = time.getUTCFullYear()
  const month = String(time.getUTCMonth() + 1).padStart(2, '0')
  const day = String(time.getUTCDate()).padStart(2, '0')
  const hour = String(time.getUTCHours()).padStart(2, '0')
  const minute = String(time.getUTCMinutes()).padStart(2, '0')
  const seconds = String(time.getUTCSeconds()).padStart(2, '0')
  const milliseconds = time.getUTCMilliseconds()
  const nanoseconds = milliseconds * 1000 * 1000

  return `${year}-${month}-${day}T${hour}:${minute}:${seconds}.${nanoseconds}Z`
}

/**
 * Parses a date string formatted as `RFC3339Nano` into a
 * JavaScript Date object
 */
export function parseRFC3339 (time: string) {
  const rfc3339Matcher = new RegExp(
    // 2006-01-02T
    '(\\d{4})-(\\d{2})-(\\d{2})T' +
    // 15:04:05
    '(\\d{2}):(\\d{2}):(\\d{2})' +
    // .999999999Z
    '\\.(\\d+)Z'
  )
  const m = String(time).trim().match(rfc3339Matcher)

  if (m == null) {
    throw new Error('Invalid format')
  }

  const year = parseInt(m[1], 10)
  const month = parseInt(m[2], 10) - 1
  const date = parseInt(m[3], 10)
  const hour = parseInt(m[4], 10)
  const minute = parseInt(m[5], 10)
  const second = parseInt(m[6], 10)
  const millisecond = parseInt(m[7].slice(0, -6), 10)

  return new Date(Date.UTC(year, month, date, hour, minute, second, millisecond))
}

/**
 * Extracts a public key from the passed PeerId, falling
 * back to the pubKey embedded in the ipns record
 */
export const extractPublicKey = async (peerId: PeerId, entry: IpnsEntry) => {
  if (entry == null || peerId == null) {
    const error = new Error('one or more of the provided parameters are not defined')

    log.error(error)
    throw errCode(error, ERRORS.ERR_UNDEFINED_PARAMETER)
  }

  let pubKey

  if (entry.pubKey != null) {
    try {
      pubKey = unmarshalPublicKey(entry.pubKey)
    } catch (err) {
      log.error(err)
      throw err
    }

    const otherId = await peerIdFromKeys(entry.pubKey)

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
export const ipnsEntryDataForV1Sig = (value: Uint8Array, validityType: IpnsEntry.ValidityType, validity: Uint8Array): Uint8Array => {
  const validityTypeBuffer = uint8ArrayFromString(validityType)

  return uint8ArrayConcat([value, validity, validityTypeBuffer])
}

/**
 * Utility for creating the record data for being signed
 */
export const ipnsEntryDataForV2Sig = (data: Uint8Array): Uint8Array => {
  const entryData = uint8ArrayFromString('ipns-signature:')

  return uint8ArrayConcat([entryData, data])
}

export const marshal = (obj: IPNSEntry): Uint8Array => {
  return IpnsEntry.encode(obj)
}

export const unmarshal = (buf: Uint8Array): IPNSEntry => {
  const message = IpnsEntry.decode(buf)

  // protobufjs returns bigints as numbers
  if (message.sequence != null) {
    message.sequence = BigInt(message.sequence)
  }

  // protobufjs returns bigints as numbers
  if (message.ttl != null) {
    message.ttl = BigInt(message.ttl)
  }

  return {
    value: message.value ?? new Uint8Array(0),
    signature: message.signature ?? new Uint8Array(0),
    validityType: message.validityType ?? IpnsEntry.ValidityType.EOL,
    validity: message.validity ?? new Uint8Array(0),
    sequence: message.sequence ?? 0n,
    pubKey: message.pubKey,
    ttl: message.ttl ?? undefined,
    signatureV2: message.signatureV2,
    data: message.data
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

export const createCborData = (value: Uint8Array, validity: Uint8Array, validityType: string, sequence: bigint, ttl: bigint): Uint8Array => {
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

export const parseCborData = (buf: Uint8Array): IPNSEntryData => {
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
