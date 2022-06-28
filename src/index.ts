import NanoDate from 'timestamp-nano'
import { Key } from 'interface-datastore/key'
import { unmarshalPrivateKey } from '@libp2p/crypto/keys'
import errCode from 'err-code'
import { base32upper } from 'multiformats/bases/base32'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { logger } from '@libp2p/logger'
import { createCborData, ipnsEntryDataForV1Sig, ipnsEntryDataForV2Sig } from './utils.js'
import * as ERRORS from './errors.js'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import * as Digest from 'multiformats/hashes/digest'
import { identity } from 'multiformats/hashes/identity'
import { IpnsEntry } from './pb/ipns.js'
import type { PrivateKey } from '@libp2p/interface-keys'
import type { PeerId } from '@libp2p/interface-peer-id'

const log = logger('ipns')
const ID_MULTIHASH_CODE = identity.code

export const namespace = '/ipns/'
export const namespaceLength = namespace.length

export interface IPNSEntry {
  value: Uint8Array
  signature: Uint8Array // signature of the record
  validityType: IpnsEntry.ValidityType // Type of validation being used
  validity: Uint8Array // expiration datetime for the record in RFC3339 format
  sequence: bigint // number representing the version of the record
  ttl?: bigint // ttl in nanoseconds
  pubKey?: Uint8Array // the public portion of the key that signed this record (only present if it was not embedded in the IPNS key)
  signatureV2?: Uint8Array // the v2 signature of the record
  data?: Uint8Array // extensible data
}

export interface IPNSEntryData {
  Value: Uint8Array
  Validity: Uint8Array
  ValidityType: IpnsEntry.ValidityType
  Sequence: bigint
  TTL: bigint
}

export interface IDKeys {
  routingPubKey: Key
  pkKey: Key
  routingKey: Key
  ipnsKey: Key
}

/**
 * Creates a new ipns entry and signs it with the given private key.
 * The ipns entry validity should follow the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision.
 * Note: This function does not embed the public key. If you want to do that, use `EmbedPublicKey`.
 *
 * @param {PeerId} peerId - peer id containing private key for signing the record.
 * @param {Uint8Array} value - value to be stored in the record.
 * @param {number | bigint} seq - number representing the current version of the record.
 * @param {number} lifetime - lifetime of the record (in milliseconds).
 */
export const create = async (peerId: PeerId, value: Uint8Array, seq: number | bigint, lifetime: number): Promise<IPNSEntry> => {
  // Validity in ISOString with nanoseconds precision and validity type EOL
  const expirationDate = new NanoDate(Date.now() + Number(lifetime))
  const validityType = IpnsEntry.ValidityType.EOL
  const [ms, ns] = lifetime.toString().split('.')
  const lifetimeNs = (BigInt(ms) * BigInt(100000)) + BigInt(ns ?? '0')

  return await _create(peerId, value, seq, validityType, expirationDate, lifetimeNs)
}

/**
 * Same as create(), but instead of generating a new Date, it receives the intended expiration time
 * WARNING: nano precision is not standard, make sure the value in seconds is 9 orders of magnitude lesser than the one provided.
 *
 * @param {PeerId} peerId - PeerId containing private key for signing the record.
 * @param {Uint8Array} value - value to be stored in the record.
 * @param {number | bigint} seq - number representing the current version of the record.
 * @param {string} expiration - expiration datetime for record in the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision.
 */
export const createWithExpiration = async (peerId: PeerId, value: Uint8Array, seq: number | bigint, expiration: string): Promise<IPNSEntry> => {
  const expirationDate = NanoDate.fromString(expiration)
  const validityType = IpnsEntry.ValidityType.EOL

  const ttlMs = expirationDate.toDate().getTime() - Date.now()
  const ttlNs = (BigInt(ttlMs) * BigInt(100000)) + BigInt(expirationDate.getNano())

  return await _create(peerId, value, seq, validityType, expirationDate, ttlNs)
}

const _create = async (peerId: PeerId, value: Uint8Array, seq: number | bigint, validityType: IpnsEntry.ValidityType, expirationDate: NanoDate, ttl: bigint): Promise<IPNSEntry> => {
  seq = BigInt(seq)
  const isoValidity = uint8ArrayFromString(expirationDate.toString())

  if (peerId.privateKey == null) {
    throw errCode(new Error('Missing private key'), ERRORS.ERR_MISSING_PRIVATE_KEY)
  }

  const privateKey = await unmarshalPrivateKey(peerId.privateKey)
  const signatureV1 = await sign(privateKey, value, validityType, isoValidity)
  const data = createCborData(value, isoValidity, validityType, seq, ttl)
  const sigData = ipnsEntryDataForV2Sig(data)
  const signatureV2 = await privateKey.sign(sigData)

  const entry: IPNSEntry = {
    value,
    signature: signatureV1,
    validityType: validityType,
    validity: isoValidity,
    sequence: seq,
    ttl,
    signatureV2,
    data
  }

  // if we cannot derive the public key from the PeerId (e.g. RSA PeerIDs),
  // we have to embed it in the IPNS record
  if (peerId.publicKey != null) {
    const digest = Digest.decode(peerId.toBytes())

    if (digest.code !== ID_MULTIHASH_CODE || !uint8ArrayEquals(peerId.publicKey, digest.digest)) {
      entry.pubKey = peerId.publicKey
    }
  }

  log('ipns entry for %b created', value)
  return entry
}

/**
 * rawStdEncoding with RFC4648
 */
const rawStdEncoding = (key: Uint8Array): string => base32upper.encode(key).slice(1)

/**
 * Get key for storing the record locally.
 * Format: /ipns/${base32(<HASH>)}
 *
 * @param {Uint8Array} key - peer identifier object.
 */
export const getLocalKey = (key: Uint8Array): Key => new Key(`/ipns/${rawStdEncoding(key)}`)

export { unmarshal } from './utils.js'
export { marshal } from './utils.js'
export { peerIdToRoutingKey } from './utils.js'
export { peerIdFromRoutingKey } from './utils.js'

/**
 * Sign ipns record data
 */
const sign = async (privateKey: PrivateKey, value: Uint8Array, validityType: IpnsEntry.ValidityType, validity: Uint8Array) => {
  try {
    const dataForSignature = ipnsEntryDataForV1Sig(value, validityType, validity)

    return await privateKey.sign(dataForSignature)
  } catch (error: any) {
    log.error('record signature creation failed', error)
    throw errCode(new Error('record signature creation failed'), ERRORS.ERR_SIGNATURE_CREATION)
  }
}
