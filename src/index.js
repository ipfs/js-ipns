'use strict'

const NanoDate = require('timestamp-nano')
const { Key } = require('interface-datastore')
const crypto = require('libp2p-crypto')
const PeerId = require('peer-id')
const multihash = require('multihashes')
const errCode = require('err-code')
const multibase = require('multibase')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayConcat = require('uint8arrays/concat')
const uint8ArrayEquals = require('uint8arrays/equals')
const cborg = require('cborg')
const Long = require('long')

const debug = require('debug')
const log = Object.assign(debug('jsipns'), {
  error: debug('jsipns:error')
})

const {
  IpnsEntry: ipnsEntryProto
} = require('./pb/ipns.js')
const { parseRFC3339 } = require('./utils')
const ERRORS = require('./errors')

const ID_MULTIHASH_CODE = multihash.names.identity

const namespace = '/ipns/'

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
const create = (privateKey, value, seq, lifetime) => {
  // Validity in ISOString with nanoseconds precision and validity type EOL
  const expirationDate = new NanoDate(Date.now() + Number(lifetime))
  const validityType = ipnsEntryProto.ValidityType.EOL
  const [ms, ns] = lifetime.toString().split('.')
  const lifetimeNs = BigInt(ms) * 100000n + BigInt(ns || 0)

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
const createWithExpiration = (privateKey, value, seq, expiration) => {
  const expirationDate = NanoDate.fromString(expiration)
  const validityType = ipnsEntryProto.ValidityType.EOL

  const ttlMs = expirationDate.toDate().getTime() - Date.now()
  const ttlNs = (BigInt(ttlMs) * 100000n) + BigInt(expirationDate.getNano())

  return _create(privateKey, value, seq, validityType, expirationDate, ttlNs)
}

/**
 * @param {PrivateKey} privateKey
 * @param {Uint8Array} value
 * @param {number | bigint} seq
 * @param {number} validityType
 * @param {NanoDate} expirationDate
 * @param {bigint} ttl
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
    value,
    validity,
    validityType,
    sequence,
    ttl
  }

  return cborg.encode(data)
}

/**
 * Validates the given ipns entry against the given public key.
 *
 * @param {PublicKey} publicKey - public key for validating the record.
 * @param {IPNSEntry} entry - ipns entry record.
 */
const validate = async (publicKey, entry) => {
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

  if (Number.isInteger(data.sequence)) {
    // sequence must be a BigInt, but DAG-CBOR doesn't preserve this for Numbers within the safe-integer range
    data.sequence = BigInt(data.sequence)
  }

  if (Number.isInteger(data.ttl)) {
    // ttl must be a BigInt, but DAG-CBOR doesn't preserve this for Numbers within the safe-integer range
    data.ttl = BigInt(data.ttl)
  }

  if (!uint8ArrayEquals(data.value, entry.value)) {
    throw errCode(new Error('Field "value" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (!uint8ArrayEquals(data.validity, entry.validity)) {
    throw errCode(new Error('Field "validity" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (data.validityType !== entry.validityType) {
    throw errCode(new Error('Field "validityType" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (data.sequence !== entry.sequence) {
    throw errCode(new Error('Field "sequence" did not match between protobuf and CBOR'), ERRORS.ERR_SIGNATURE_VERIFICATION)
  }

  if (data.ttl !== entry.ttl) {
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
const embedPublicKey = async (publicKey, entry) => {
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
 * Extracts a public key matching `pid` from the ipns record.
 *
 * @param {PeerId} peerId - peer identifier object.
 * @param {IPNSEntry} entry - ipns entry record.
 */
const extractPublicKey = (peerId, entry) => {
  if (!entry || !peerId) {
    const error = new Error('one or more of the provided parameters are not defined')

    log.error(error)
    throw errCode(error, ERRORS.ERR_UNDEFINED_PARAMETER)
  }

  if (entry.pubKey) {
    let pubKey
    try {
      pubKey = crypto.keys.unmarshalPublicKey(entry.pubKey)
    } catch (err) {
      log.error(err)
      throw err
    }
    return pubKey
  }

  if (peerId.pubKey) {
    return peerId.pubKey
  }
  throw Object.assign(new Error('no public key is available'), { code: ERRORS.ERR_UNDEFINED_PARAMETER })
}

/**
 * rawStdEncoding with RFC4648
 *
 * @param {Uint8Array} key
 */
const rawStdEncoding = (key) => uint8ArrayToString(multibase.encode('base32', key)).slice(1).toUpperCase()

/**
 * Get key for storing the record locally.
 * Format: /ipns/${base32(<HASH>)}
 *
 * @param {Uint8Array} key - peer identifier object.
 */
const getLocalKey = (key) => new Key(`/ipns/${rawStdEncoding(key)}`)

/**
 * Get key for sharing the record in the routing mechanism.
 * Format: ${base32(/ipns/<HASH>)}, ${base32(/pk/<HASH>)}
 *
 * @param {Uint8Array} pid - peer identifier represented by the multihash of the public key as Uint8Array.
 */
const getIdKeys = (pid) => {
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
  } catch (error) {
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
  const decodedId = multihash.decode(peerId.id)

  if (decodedId.code !== ID_MULTIHASH_CODE) {
    return null
  }

  return crypto.keys.unmarshalPublicKey(decodedId.digest)
}

/**
 * @param {IPNSEntry} obj
 */
const marshal = (obj) => {
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
const unmarshal = (buf) => {
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
    ttl: Object.hasOwnProperty.call(object, 'ttl') ? BigInt(`${object.ttl}`) : undefined
  }
}

const validator = {
  /**
   * @param {Uint8Array} marshalledData
   * @param {Uint8Array} key
   */
  validate: async (marshalledData, key) => {
    const receivedEntry = unmarshal(marshalledData)
    const bufferId = key.slice('/ipns/'.length)
    const peerId = PeerId.createFromBytes(bufferId)

    // extract public key
    const pubKey = extractPublicKey(peerId, receivedEntry)

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

    return entryA.sequence > entryB.sequence ? 0 : 1
  }
}

module.exports = {
  // create ipns entry record
  create,
  // create ipns entry record specifying the expiration time
  createWithExpiration,
  // validate ipns entry record
  validate,
  // embed public key in the record
  embedPublicKey,
  // extract public key from the record
  extractPublicKey,
  // get key for storing the entry locally
  getLocalKey,
  // get keys for routing
  getIdKeys,
  // marshal
  marshal,
  // unmarshal
  unmarshal,
  // validator
  validator,
  // namespace
  namespace,
  namespaceLength: namespace.length
}
