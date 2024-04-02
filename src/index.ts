import { unmarshalPrivateKey } from '@libp2p/crypto/keys'
import { logger } from '@libp2p/logger'
import errCode from 'err-code'
import { Key } from 'interface-datastore/key'
import { base32upper } from 'multiformats/bases/base32'
import * as Digest from 'multiformats/hashes/digest'
import { identity } from 'multiformats/hashes/identity'
import NanoDate from 'timestamp-nano'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as ERRORS from './errors.js'
import { IpnsEntry } from './pb/ipns.js'
import { createCborData, ipnsRecordDataForV1Sig, ipnsRecordDataForV2Sig, normalizeValue } from './utils.js'
import type { PrivateKey, PeerId } from '@libp2p/interface'
import type { CID } from 'multiformats/cid'

const log = logger('ipns')
const ID_MULTIHASH_CODE = identity.code
const DEFAULT_TTL_NS = 60 * 60 * 1e+9 // 1 Hour or 3600 Seconds

export const namespace = '/ipns/'
export const namespaceLength = namespace.length

export interface IPNSRecordV1V2 {
  /**
   * value of the record
   */
  value: string

  /**
   * signature of the record
   */
  signatureV1: Uint8Array

  /**
   * Type of validation being used
   */
  validityType: IpnsEntry.ValidityType

  /**
   * expiration datetime for the record in RFC3339 format
   */
  validity: string

  /**
   * number representing the version of the record
   */
  sequence: bigint

  /**
   * ttl in nanoseconds
   */
  ttl?: bigint

  /**
   * the public portion of the key that signed this record (only present if it was not embedded in the IPNS key)
   */
  pubKey?: Uint8Array

  /**
   * the v2 signature of the record
   */
  signatureV2: Uint8Array

  /**
   * extensible data
   */
  data: Uint8Array
}

export interface IPNSRecordV2 {
  /**
   * value of the record
   */
  value: string

  /**
   * the v2 signature of the record
   */
  signatureV2: Uint8Array

  /**
   * Type of validation being used
   */
  validityType: IpnsEntry.ValidityType

  /**
   * If the validity type is EOL, this is the expiration datetime for the record
   * in RFC3339 format
   */
  validity: string

  /**
   * number representing the version of the record
   */
  sequence: bigint

  /**
   * ttl in nanoseconds
   */
  ttl?: bigint

  /**
   * the public portion of the key that signed this record (only present if it was not embedded in the IPNS key)
   */
  pubKey?: Uint8Array

  /**
   * extensible data
   */
  data: Uint8Array
}

export type IPNSRecord = IPNSRecordV1V2 | IPNSRecordV2

export interface IPNSRecordData {
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

export interface CreateOptions {
  ttlNs?: number | bigint
  v1Compatible?: boolean
}

export interface CreateV2OrV1Options {
  v1Compatible: true
}

export interface CreateV2Options {
  v1Compatible: false
}

const defaultCreateOptions: CreateOptions = {
  v1Compatible: true,
  ttlNs: DEFAULT_TTL_NS
}

/**
 * Creates a new IPNS record and signs it with the given private key.
 * The IPNS Record validity should follow the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision.
 * Note: This function does not embed the public key. If you want to do that, use `EmbedPublicKey`.
 *
 * The passed value can be a CID, a PeerID or an arbitrary string path.
 *
 * * CIDs will be converted to v1 and stored in the record as a string similar to: `/ipfs/${cid}`
 * * PeerIDs will create recursive records, eg. the record value will be `/ipns/${cidV1Libp2pKey}`
 * * String paths will be stored in the record as-is, but they must start with `"/"`
 *
 * @param {PeerId} peerId - peer id containing private key for signing the record.
 * @param {CID | PeerId | string} value - content to be stored in the record.
 * @param {number | bigint} seq - number representing the current version of the record.
 * @param {number} lifetime - lifetime of the record (in milliseconds).
 * @param {CreateOptions} options - additional create options.
 */
export async function create (peerId: PeerId, value: CID | PeerId | string, seq: number | bigint, lifetime: number, options?: CreateV2OrV1Options): Promise<IPNSRecordV1V2>
export async function create (peerId: PeerId, value: CID | PeerId | string, seq: number | bigint, lifetime: number, options: CreateV2Options): Promise<IPNSRecordV2>
export async function create (peerId: PeerId, value: CID | PeerId | string, seq: number | bigint, lifetime: number, options: CreateOptions): Promise<IPNSRecordV1V2>
export async function create (peerId: PeerId, value: CID | PeerId | string, seq: number | bigint, lifetime: number, options: CreateOptions = defaultCreateOptions): Promise<IPNSRecord> {
  // Validity in ISOString with nanoseconds precision and validity type EOL
  const expirationDate = new NanoDate(Date.now() + Number(lifetime))
  const validityType = IpnsEntry.ValidityType.EOL
  const ttlNs = BigInt(options.ttlNs != null ? options.ttlNs : DEFAULT_TTL_NS)

  return _create(peerId, value, seq, validityType, expirationDate.toString(), ttlNs, options)
}

/**
 * Same as create(), but instead of generating a new Date, it receives the intended expiration time
 * WARNING: nano precision is not standard, make sure the value in seconds is 9 orders of magnitude lesser than the one provided.
 *
 * The passed value can be a CID, a PeerID or an arbitrary string path.
 *
 * * CIDs will be converted to v1 and stored in the record as a string similar to: `/ipfs/${cid}`
 * * PeerIDs will create recursive records, eg. the record value will be `/ipns/${cidV1Libp2pKey}`
 * * String paths will be stored in the record as-is, but they must start with `"/"`
 *
 * @param {PeerId} peerId - PeerId containing private key for signing the record.
 * @param {CID | PeerId | string} value - content to be stored in the record.
 * @param {number | bigint} seq - number representing the current version of the record.
 * @param {string} expiration - expiration datetime for record in the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision.
 * @param {CreateOptions} options - additional creation options.
 */
export async function createWithExpiration (peerId: PeerId, value: CID | PeerId | string, seq: number | bigint, expiration: string, options?: CreateV2OrV1Options): Promise<IPNSRecordV1V2>
export async function createWithExpiration (peerId: PeerId, value: CID | PeerId | string, seq: number | bigint, expiration: string, options: CreateV2Options): Promise<IPNSRecordV2>
export async function createWithExpiration (peerId: PeerId, value: CID | PeerId | string, seq: number | bigint, expiration: string, options: CreateOptions): Promise<IPNSRecordV1V2>
export async function createWithExpiration (peerId: PeerId, value: CID | PeerId | string, seq: number | bigint, expiration: string, options: CreateOptions = defaultCreateOptions): Promise<IPNSRecord> {
  const expirationDate = NanoDate.fromString(expiration)
  const validityType = IpnsEntry.ValidityType.EOL
  const ttlNs = BigInt(options.ttlNs != null ? options.ttlNs : DEFAULT_TTL_NS)

  return _create(peerId, value, seq, validityType, expirationDate.toString(), ttlNs, options)
}

const _create = async (peerId: PeerId, value: CID | PeerId | string, seq: number | bigint, validityType: IpnsEntry.ValidityType, validity: string, ttl: bigint, options: CreateOptions = defaultCreateOptions): Promise<IPNSRecord> => {
  seq = BigInt(seq)
  const isoValidity = uint8ArrayFromString(validity)
  const normalizedValue = normalizeValue(value)
  const encodedValue = uint8ArrayFromString(normalizedValue)

  if (peerId.privateKey == null) {
    throw errCode(new Error('Missing private key'), ERRORS.ERR_MISSING_PRIVATE_KEY)
  }

  const privateKey = await unmarshalPrivateKey(peerId.privateKey)
  const data = createCborData(encodedValue, validityType, isoValidity, seq, ttl)
  const sigData = ipnsRecordDataForV2Sig(data)
  const signatureV2 = await privateKey.sign(sigData)
  let pubKey: Uint8Array | undefined

  // if we cannot derive the public key from the PeerId (e.g. RSA PeerIDs),
  // we have to embed it in the IPNS record
  if (peerId.publicKey != null) {
    const digest = Digest.decode(peerId.toBytes())

    if (digest.code !== ID_MULTIHASH_CODE || !uint8ArrayEquals(peerId.publicKey, digest.digest)) {
      pubKey = peerId.publicKey
    }
  }

  if (options.v1Compatible === true) {
    const signatureV1 = await signLegacyV1(privateKey, encodedValue, validityType, isoValidity)

    const record: IPNSRecord = {
      value: normalizedValue,
      signatureV1,
      validity,
      validityType,
      sequence: seq,
      ttl,
      signatureV2,
      data
    }

    if (pubKey != null) {
      record.pubKey = pubKey
    }

    return record
  } else {
    const record: IPNSRecordV2 = {
      value: normalizedValue,
      validity,
      validityType,
      sequence: seq,
      ttl,
      signatureV2,
      data
    }

    if (pubKey != null) {
      record.pubKey = pubKey
    }

    return record
  }
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
export { extractPublicKey } from './utils.js'

/**
 * Sign ipns record data using the legacy V1 signature scheme
 */
const signLegacyV1 = async (privateKey: PrivateKey, value: Uint8Array, validityType: IpnsEntry.ValidityType, validity: Uint8Array): Promise<Uint8Array> => {
  try {
    const dataForSignature = ipnsRecordDataForV1Sig(value, validityType, validity)

    return await privateKey.sign(dataForSignature)
  } catch (error: any) {
    log.error('record signature creation failed', error)
    throw errCode(new Error('record signature creation failed'), ERRORS.ERR_SIGNATURE_CREATION)
  }
}
