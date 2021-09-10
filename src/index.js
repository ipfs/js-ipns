
import NanoDate from 'timestamp-nano'
import { Key } from 'interface-datastore/key'
import crypto from 'libp2p-crypto'
import PeerId from 'peer-id'
import * as Digest from 'multiformats/hashes/digest'
import { identity } from 'multiformats/hashes/identity'
import errCode from 'err-code'
import { base32upper } from 'multiformats/bases/base32'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import * as cborg from 'cborg'
import Long from 'long'
import debug from 'debug'
import { IpnsEntry as ipnsEntryProto } from './pb/ipns.js'
import { parseRFC3339 } from './utils.js'
import * as ERRORS from './errors.js'

const log = Object.assign(debug('jsipns'), {
  error: debug('jsipns:error')
})

const ID_MULTIHASH_CODE = identity.code
const IPNS_PREFIX = uint8ArrayFromString('/ipns/')

export const namespace = '/ipns/'
export const namespaceLength = namespace.length

/**
 * @typedef {import('./types').IPNSEntry} IPNSEntry
 * @typedef {import('libp2p-crypto').PublicKey} PublicKey
 * @typedef {import('libp2p-crypto').PrivateKey} PrivateKey
 */

/**
 * Creates a new ipns entry and signs it with the given private key.
 * The ipns entry validity should follow the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision.
 * Note: This function does not embed the public key. If you want to do that, use `EmbedPublicKey`.
 *
 * @param {PrivateKey} privateKey - private key for signing the record.
 * @param {Uint8Array} value - value to be stored in the record.
 * @param {number | bigint} seq - number representing the current version of the record.
 * @param {number} lifetime - lifetime of the record (in milliseconds).
 */
export const create = (privateKey, value, seq, lifetime) => {
  // Validity in ISOString with nanoseconds precision and validity type EOL
  const expirationDate = new NanoDate(Date.now() + Number(lifetime))
  const validityType = ipnsEntryProto.ValidityType.EOL
  const [ms, ns] = lifetime.toString().split('.')
  const lifetimeNs = (BigInt(ms) * BigInt(100000)) + BigInt(ns || 0)

  return _create(privateKey, value, seq, validityType, expirationDate, lifetimeNs)
}

/**
 * Same as create(), but instead of generating a new Date, it receives the intended expiration time
 * WARNING: nano precision is not standard, make sure the value in seconds is 9 orders of magnitude lesser than the one provided.
 *
 * @param {PrivateKey} privateKey - private key for signing the record.
 * @param {Uint8Array} value - value to be stored in the record.
 * @param {number | bigint} seq - number representing the current version of the record.
 * @param {string} expiration - expiration datetime for record in the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision.
 */
export const createWithExpiration = (privateKey, value, seq, expiration) => {
  const expirationDate = NanoDate.fromString(expiration)
  const validityType = ipnsEntryProto.ValidityType.EOL

  const ttlMs = expirationDate.toDate().getTime() - Date.now()
  const ttlNs = (BigInt(ttlMs) * BigInt(100000)) + BigInt(expirationDate.getNano())

  return _create(privateKey, value, seq, validityType, expirationDate, ttlNs)
}

/**
 * @param {PrivateKey} privateKey
 * @param {Uint8Array} value
 * @param {number | bigint} seq
 * @param {number} validityType
 * @param {NanoDate} expirationDate
 * @param {bigint} ttl
 * @returns {Promise<IPNSEntry>}
 */
const _create = async (privateKey, value, seq, validityType, expirationDate, ttl) => {
  seq = BigInt(seq)
  const isoValidity = uint8ArrayFromString(expirationDate.toString())
  const signatureV1 = await sign(privateKey, value, validityType, isoValidity)
  const data = createCborData(value, isoValidity, validityType, seq, ttl)
  const sigData = ipnsEntryDataForV2Sig(data)
  const signatureV2 = await privateKey.sign(sigData)

  const entry = {
    value,
    signature: signatureV1,
    validityType: validityType,
    validity: isoValidity,
    sequence: seq,
    ttl,
    signatureV2,
    data
  }

  log(`ipns entry for ${value} created`)
  return entry
}

/**
 * @param {Uint8Array} value
 * @param {Uint8Array} validity
 * @param {number} validityType
 * @param {bigint} sequence
 * @param {bigint} ttl
 */
const createCborData = (value, validity, validityType, sequence, ttl) => {
  const data = {
    Value: value,
    Validity: validity,
    ValidityType: validityType,
    Sequence: sequence,
    TTL: ttl
  }

  return cborg.encode(data)
}

/**
 * Validates the given ipns entry against the given public key.
 *
 * @param {PublicKey} publicKey - public key for validating the record.
 * @param {IPNSEntry} entry - ipns entry record.
 */
export const validate = async (publicKey, entry) => {
  const { value, validityType, validity } = entry

  /** @type {Uint8Array} */
  let dataForSignature
  let signature

  // Check v2 signature if it's available, otherwise use the v1 signature
  if (entry.signatureV2 && entry.data) {
    signature = entry.signatureV2
    dataForSignature = ipnsEntryDataForV2Sig(entry.data)

    validateCborDataMatchesPbData(entry)
  } else {
    signature = entry.signature
    dataForSignature = ipnsEntryDataForV1Sig(value, validityType, validity)
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
  if (validityType === ipnsEntryProto.ValidityType.EOL) {
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
  } else if (validityType) {
    log.error('unrecognized validity type')
    throw errCode(new Error('unrecognized validity type'), ERRORS.ERR_UNRECOGNIZED_VALIDITY)
  }

  log(`ipns entry for ${value} is valid`)
}

/**
 * @param {IPNSEntry} entry
 */
const validateCborDataMatchesPbData = (entry) => {
  if (!entry.data) {
    throw errCode(new Error('Record data is missing'), ERRORS.ERR_INVALID_RECORD_DATA)
  }

  const data = cborg.decode(entry.data)

  if (Number.isInteger(data.Sequence)) {
    // sequence must be a BigInt, but DAG-CBOR doesn't preserve this for Numbers within the safe-integer range
    data.Sequence = BigInt(data.Sequence)
  }

  if (Number.isInteger(data.TTL)) {
    // ttl must be a BigInt, but DAG-CBOR doesn't preserve this for Numbers within the safe-integer range
    data.TTL = BigInt(data.TTL)
  }

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

/**
 * Embed the given public key in the given entry. While not strictly required,
 * some nodes (eg. DHT servers) may reject IPNS entries that don't embed their
 * public keys as they may not be able to validate them efficiently.
 * As a consequence of nodes needing to validate a record upon receipt, they need
 * the public key associated with it. For old RSA keys, it is easier if we just
 * send this as part of the record itself. For newer ed25519 keys, the public key
 * can be embedded in the peerId.
 *
 * @param {PublicKey} publicKey - public key to embed.
 * @param {IPNSEntry} entry - ipns entry record.
 */
export const embedPublicKey = async (publicKey, entry) => {
  if (!publicKey || !publicKey.bytes || !entry) {
    const error = new Error('one or more of the provided parameters are not defined')
    log.error(error)
    throw errCode(error, ERRORS.ERR_UNDEFINED_PARAMETER)
  }

  // Create a peer id from the public key.
  let peerId
  try {
    peerId = await PeerId.createFromPubKey(publicKey.bytes)
  } catch (err) {
    throw errCode(err, ERRORS.ERR_PEER_ID_FROM_PUBLIC_KEY)
  }

  // Try to extract the public key from the ID. If we can, no need to embed it
  let extractedPublicKey
  try {
    extractedPublicKey = extractPublicKeyFromId(peerId)
  } catch (err) {
    log.error(err)
    throw errCode(err, ERRORS.ERR_PUBLIC_KEY_FROM_ID)
  }

  if (extractedPublicKey) {
    return null
  }

  // If we failed to extract the public key from the peer ID, embed it in the record.
  try {
    entry.pubKey = crypto.keys.marshalPublicKey(publicKey)
  } catch (err) {
    log.error(err)
    throw err
  }
  return entry
}

/**
 * Extracts a public key from the passed PeerId, falling
 * back to the pubKey embedded in the ipns record.
 *
 * @param {PeerId} peerId - peer identifier object.
 * @param {IPNSEntry} entry - ipns entry record.
 */
export const extractPublicKey = async (peerId, entry) => {
  if (!entry || !peerId) {
    const error = new Error('one or more of the provided parameters are not defined')

    log.error(error)
    throw errCode(error, ERRORS.ERR_UNDEFINED_PARAMETER)
  }

  let pubKey

  if (entry.pubKey) {
    try {
      pubKey = crypto.keys.unmarshalPublicKey(entry.pubKey)
    } catch (err) {
      log.error(err)
      throw err
    }

    const otherId = await PeerId.createFromPubKey(entry.pubKey)

    if (!otherId.equals(peerId)) {
      throw errCode(new Error('Embedded public key did not match PeerID'), ERRORS.ERR_INVALID_EMBEDDED_KEY)
    }
  } else if (peerId.pubKey) {
    pubKey = peerId.pubKey
  }

  if (pubKey) {
    return pubKey
  }

  throw errCode(new Error('no public key is available'), ERRORS.ERR_UNDEFINED_PARAMETER)
}

/**
 * rawStdEncoding with RFC4648
 *
 * @param {Uint8Array} key
 */
const rawStdEncoding = (key) => base32upper.encode(key).slice(1)

/**
 * Get key for storing the record locally.
 * Format: /ipns/${base32(<HASH>)}
 *
 * @param {Uint8Array} key - peer identifier object.
 */
export const getLocalKey = (key) => new Key(`/ipns/${rawStdEncoding(key)}`)

/**
 * Get key for sharing the record in the routing mechanism.
 * Format: ${base32(/ipns/<HASH>)}, ${base32(/pk/<HASH>)}
 *
 * @param {Uint8Array} pid - peer identifier represented by the multihash of the public key as Uint8Array.
 */
export const getIdKeys = (pid) => {
  const pkBuffer = uint8ArrayFromString('/pk/')
  const ipnsBuffer = uint8ArrayFromString('/ipns/')

  return {
    routingPubKey: new Key(uint8ArrayConcat([pkBuffer, pid]), false), // Added on https://github.com/ipfs/js-ipns/pull/8#issue-213857876 (pkKey will be deprecated in a future release)
    pkKey: new Key(rawStdEncoding(uint8ArrayConcat([pkBuffer, pid]))),
    routingKey: new Key(uint8ArrayConcat([ipnsBuffer, pid]), false), // Added on https://github.com/ipfs/js-ipns/pull/6#issue-213631461 (ipnsKey will be deprecated in a future release)
    ipnsKey: new Key(rawStdEncoding(uint8ArrayConcat([ipnsBuffer, pid])))
  }
}

/**
 * Sign ipns record data
 *
 * @param {PrivateKey} privateKey
 * @param {Uint8Array} value
 * @param {number} validityType
 * @param {Uint8Array} validity
 */
const sign = (privateKey, value, validityType, validity) => {
  try {
    const dataForSignature = ipnsEntryDataForV1Sig(value, validityType, validity)

    return privateKey.sign(dataForSignature)
  } catch (/** @type {any} */ error) {
    log.error('record signature creation failed')
    throw errCode(new Error('record signature creation failed: ' + error.message), ERRORS.ERR_SIGNATURE_CREATION)
  }
}

/**
 * Utility for getting the validity type code name of a validity
 *
 * @param {number} validityType
 */
const getValidityType = (validityType) => {
  if (validityType.toString() === '0') {
    return 'EOL'
  }

  const error = new Error(`unrecognized validity type ${validityType.toString()}`)
  log.error(error)
  throw errCode(error, ERRORS.ERR_UNRECOGNIZED_VALIDITY)
}

/**
 * Utility for creating the record data for being signed
 *
 * @param {Uint8Array} value
 * @param {number} validityType
 * @param {Uint8Array} validity
 */
const ipnsEntryDataForV1Sig = (value, validityType, validity) => {
  const validityTypeBuffer = uint8ArrayFromString(getValidityType(validityType))

  return uint8ArrayConcat([value, validity, validityTypeBuffer])
}

/**
 * Utility for creating the record data for being signed
 *
 * @param {Uint8Array} data
 */
const ipnsEntryDataForV2Sig = (data) => {
  const entryData = uint8ArrayFromString('ipns-signature:')

  return uint8ArrayConcat([entryData, data])
}

/**
 * Utility for extracting the public key from a peer-id
 *
 * @param {PeerId} peerId
 */
const extractPublicKeyFromId = (peerId) => {
  const digest = Digest.decode(peerId.id)

  if (digest.code !== ID_MULTIHASH_CODE) {
    return null
  }

  return crypto.keys.unmarshalPublicKey(digest.digest)
}

/**
 * @param {IPNSEntry} obj
 */
export const marshal = (obj) => {
  return ipnsEntryProto.encode({
    ...obj,
    sequence: Long.fromString(obj.sequence.toString()),
    ttl: obj.ttl == null ? undefined : Long.fromString(obj.ttl.toString())
  }).finish()
}

/**
 * @param {Uint8Array} buf
 * @returns {IPNSEntry}
 */
export const unmarshal = (buf) => {
  const message = ipnsEntryProto.decode(buf)
  const object = ipnsEntryProto.toObject(message, {
    defaults: false,
    arrays: true,
    objects: false
  })

  return {
    value: object.value,
    signature: object.signature,
    validityType: object.validityType,
    validity: object.validity,
    sequence: Object.hasOwnProperty.call(object, 'sequence') ? BigInt(`${object.sequence}`) : 0n,
    pubKey: object.pubKey,
    ttl: Object.hasOwnProperty.call(object, 'ttl') ? BigInt(`${object.ttl}`) : undefined,
    signatureV2: object.signatureV2,
    data: object.data
  }
}

export const validator = {
  /**
   * @param {Uint8Array} marshalledData
   * @param {Uint8Array} key
   */
  validate: async (marshalledData, key) => {
    const receivedEntry = unmarshal(marshalledData)
    const bufferId = key.slice(IPNS_PREFIX.length)
    const peerId = PeerId.createFromBytes(bufferId)

    // extract public key
    const pubKey = await extractPublicKey(peerId, receivedEntry)

    // Record validation
    await validate(pubKey, receivedEntry)
  },

  /**
   * @param {Uint8Array} dataA
   * @param {Uint8Array} dataB
   */
  select: (dataA, dataB) => {
    const entryA = unmarshal(dataA)
    const entryB = unmarshal(dataB)

    // having a newer signature version is better than an older signature version
    if (entryA.signatureV2 && !entryB.signatureV2) {
      return 0
    } else if (entryB.signatureV2 && !entryA.signatureV2) {
      return 1
    }

    // choose later sequence number
    if (entryA.sequence > entryB.sequence) {
      return 0
    } else if (entryA.sequence < entryB.sequence) {
      return 1
    }

    // choose longer lived record if sequence numbers the same
    const entryAValidityDate = parseRFC3339(uint8ArrayToString(entryA.validity))
    const entryBValidityDate = parseRFC3339(uint8ArrayToString(entryB.validity))

    return entryBValidityDate.getTime() > entryAValidityDate.getTime() ? 1 : 0
  }
}
