import { unmarshalPrivateKey } from '@libp2p/crypto/keys'
import { logger } from '@libp2p/logger'
import * as cborg from 'cborg'
import errCode from 'err-code'
import { Key } from 'interface-datastore/key'
import { base32upper } from 'multiformats/bases/base32'
import * as Digest from 'multiformats/hashes/digest'
import { identity } from 'multiformats/hashes/identity'
import NanoDate from 'timestamp-nano'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as ERRORS from './errors.js'
import { IpnsEntry } from './pb/ipns.js'
import { createCborData, ipnsRecordDataForV1Sig, ipnsRecordDataForV2Sig, parseRFC3339 } from './utils.js'
import type { PrivateKey } from '@libp2p/interface-keys'
import type { PeerId } from '@libp2p/interface-peer-id'

const log = logger('ipns')
const ID_MULTIHASH_CODE = identity.code

export const namespace = '/ipns/'
export const namespaceLength = namespace.length

export class IPNSRecord {
  readonly pb: IpnsEntry
  private readonly data: any

  constructor (pb: IpnsEntry) {
    this.pb = pb

    if (pb.data == null) {
      throw errCode(new Error('Record data is missing'), ERRORS.ERR_INVALID_RECORD_DATA)
    }

    this.data = cborg.decode(pb.data)
  }

  value (): string {
    return uint8ArrayToString(this.data.Value)
  }

  validityType (): IpnsEntry.ValidityType {
    if (this.data.ValidityType === 0) {
      return IpnsEntry.ValidityType.EOL
    } else {
      throw errCode(new Error('Unknown validity type'), ERRORS.ERR_UNRECOGNIZED_VALIDITY)
    }
  }

  validity (): Date {
    const validityType = this.validityType()
    switch (validityType) {
      case IpnsEntry.ValidityType.EOL:
        return parseRFC3339(uint8ArrayToString(this.data.Validity))
      default:
        throw errCode(new Error('Unknown validity type'), ERRORS.ERR_UNRECOGNIZED_VALIDITY)
    }
  }

  sequence (): bigint {
    return BigInt(this.data.Sequence ?? 0n)
  }

  ttl (): bigint {
    return BigInt(this.data.TTL ?? 0n)
  }
}

export interface IDKeys {
  routingPubKey: Key
  pkKey: Key
  routingKey: Key
  ipnsKey: Key
}

export interface CreateOptions {
  v1Compatible?: boolean
}

const defaultCreateOptions: CreateOptions = {
  v1Compatible: true
}

/**
 * Creates a new IPNS record and signs it with the given private key.
 * The IPNS Record validity should follow the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision.
 * Note: This function does not embed the public key. If you want to do that, use `EmbedPublicKey`.
 *
 * @param {PeerId} peerId - peer id containing private key for signing the record.
 * @param {Uint8Array} value - value to be stored in the record.
 * @param {number | bigint} seq - number representing the current version of the record.
 * @param {number} lifetime - lifetime of the record (in milliseconds).
 * @param {CreateOptions} options - additional create options.
 */
export const create = async (peerId: PeerId, value: Uint8Array, seq: number | bigint, lifetime: number, options: CreateOptions = defaultCreateOptions): Promise<IPNSRecord> => {
  // Validity in ISOString with nanoseconds precision and validity type EOL
  const expirationDate = new NanoDate(Date.now() + Number(lifetime))
  const validityType = IpnsEntry.ValidityType.EOL
  const [ms, ns] = lifetime.toString().split('.')
  const lifetimeNs = (BigInt(ms) * BigInt(100000)) + BigInt(ns ?? '0')

  return _create(peerId, value, seq, validityType, expirationDate, lifetimeNs, options)
}

/**
 * Same as create(), but instead of generating a new Date, it receives the intended expiration time
 * WARNING: nano precision is not standard, make sure the value in seconds is 9 orders of magnitude lesser than the one provided.
 *
 * @param {PeerId} peerId - PeerId containing private key for signing the record.
 * @param {Uint8Array} value - value to be stored in the record.
 * @param {number | bigint} seq - number representing the current version of the record.
 * @param {string} expiration - expiration datetime for record in the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision.
 * @param {CreateOptions} options - additional creation options.
 */
export const createWithExpiration = async (peerId: PeerId, value: Uint8Array, seq: number | bigint, expiration: string, options: CreateOptions = defaultCreateOptions): Promise<IPNSRecord> => {
  const expirationDate = NanoDate.fromString(expiration)
  const validityType = IpnsEntry.ValidityType.EOL

  const ttlMs = expirationDate.toDate().getTime() - Date.now()
  const ttlNs = (BigInt(ttlMs) * BigInt(100000)) + BigInt(expirationDate.getNano())

  return _create(peerId, value, seq, validityType, expirationDate, ttlNs, options)
}

const _create = async (peerId: PeerId, value: Uint8Array, seq: number | bigint, validityType: IpnsEntry.ValidityType, expirationDate: NanoDate, ttl: bigint, options: CreateOptions = defaultCreateOptions): Promise<IPNSRecord> => {
  seq = BigInt(seq)
  const isoValidity = uint8ArrayFromString(expirationDate.toString())

  if (peerId.privateKey == null) {
    throw errCode(new Error('Missing private key'), ERRORS.ERR_MISSING_PRIVATE_KEY)
  }

  const privateKey = await unmarshalPrivateKey(peerId.privateKey)
  const data = createCborData(value, isoValidity, validityType, seq, ttl)
  const sigData = ipnsRecordDataForV2Sig(data)
  const signatureV2 = await privateKey.sign(sigData)

  const pb: IpnsEntry = {
    signatureV2,
    data
  }

  if (options.v1Compatible === true) {
    const signatureV1 = await signLegacyV1(privateKey, value, validityType, isoValidity)
    pb.value = value
    pb.validity = isoValidity
    pb.validityType = validityType
    pb.signature = signatureV1
    pb.sequence = seq
    pb.ttl = ttl
  }

  // if we cannot derive the public key from the PeerId (e.g. RSA PeerIDs),
  // we have to embed it in the IPNS record
  if (peerId.publicKey != null) {
    const digest = Digest.decode(peerId.toBytes())

    if (digest.code !== ID_MULTIHASH_CODE || !uint8ArrayEquals(peerId.publicKey, digest.digest)) {
      pb.pubKey = peerId.publicKey
    }
  }

  log('ipns record for %b created', value)
  return new IPNSRecord(pb)
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
