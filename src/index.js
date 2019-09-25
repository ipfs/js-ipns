'use strict'

const base32Encode = require('base32-encode')
const NanoDate = require('timestamp-nano')
const { Key } = require('interface-datastore')
const crypto = require('libp2p-crypto')
const PeerId = require('peer-id')
const multihash = require('multihashes')
const errCode = require('err-code')
const promisify = require('promisify-es6')

const debug = require('debug')
const log = debug('jsipns')
log.error = debug('jsipns:error')

const ipnsEntryProto = require('./pb/ipns.proto')
const { parseRFC3339 } = require('./utils')
const ERRORS = require('./errors')

const ID_MULTIHASH_CODE = multihash.names.id

const namespace = '/ipns/'

/**
 * IPNS entry
 * @typedef {Object} IpnsEntry
 * @property {string} value - value to be stored in the record
 * @property {Buffer} signature - signature of the record
 * @property {number} validityType - Type of validation being used
 * @property {string} validity - expiration datetime for the record in RFC3339 format
 * @property {number} sequence - number representing the version of the record
 */

/**
 * Creates a new ipns entry and signs it with the given private key.
 * The ipns entry validity should follow the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision.
 * Note: This function does not embed the public key. If you want to do that, use `EmbedPublicKey`.
 *
 * @param {Object} privateKey private key for signing the record.
 * @param {string} value value to be stored in the record.
 * @param {number} seq number representing the current version of the record.
 * @param {number|string} lifetime lifetime of the record (in milliseconds).
 * @returns {Promise<IpnsEntry>} entry
 */
const create = (privateKey, value, seq, lifetime) => {
  // Validity in ISOString with nanoseconds precision and validity type EOL
  const isoValidity = new NanoDate(Date.now() + Number(lifetime)).toString()
  const validityType = ipnsEntryProto.ValidityType.EOL
  return _create(privateKey, value, seq, isoValidity, validityType)
}

/**
 * Same as create(), but instead of generating a new Date, it receives the intended expiration time
 * WARNING: nano precision is not standard, make sure the value in seconds is 9 orders of magnitude lesser than the one provided.
 * @param {Object} privateKey private key for signing the record.
 * @param {string} value value to be stored in the record.
 * @param {number} seq number representing the current version of the record.
 * @param {string} expiration expiration datetime for record in the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision.
 * @returns {Promise<IpnsEntry>} entry
 */
const createWithExpiration = (privateKey, value, seq, expiration) => {
  const validityType = ipnsEntryProto.ValidityType.EOL
  return _create(privateKey, value, seq, expiration, validityType)
}

const _create = async (privateKey, value, seq, isoValidity, validityType) => {
  const signature = await sign(privateKey, value, validityType, isoValidity)

  const entry = {
    value: value,
    signature: signature,
    validityType: validityType,
    validity: isoValidity,
    sequence: seq
  }

  log(`ipns entry for ${value} created`)
  return entry
}

/**
 * Validates the given ipns entry against the given public key.
 *
 * @param {Object} publicKey public key for validating the record.
 * @param {IpnsEntry} entry ipns entry record.
 * @returns {Promise}
 */
const validate = async (publicKey, entry) => {
  const { value, validityType, validity } = entry
  const dataForSignature = ipnsEntryDataForSig(value, validityType, validity)

  // Validate Signature
  let isValid
  try {
    isValid = await promisify(publicKey.verify, {
      context: publicKey
    })(dataForSignature, entry.signature)
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
      validityDate = parseRFC3339(validity.toString())
    } catch (e) {
      log.error('unrecognized validity format (not an rfc3339 format)')
      throw errCode(new Error('unrecognized validity format (not an rfc3339 format)'), ERRORS.ERR_UNRECOGNIZED_FORMAT)
    }

    if (validityDate < Date.now()) {
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
 * Embed the given public key in the given entry. While not strictly required,
 * some nodes (eg. DHT servers) may reject IPNS entries that don't embed their
 * public keys as they may not be able to validate them efficiently.
 * As a consequence of nodes needing to validade a record upon receipt, they need
 * the public key associated with it. For olde RSA keys, it is easier if we just
 * send this as part of the record itself. For newer ed25519 keys, the public key
 * can be embedded in the peerId.
 *
 * @param {Object} publicKey public key to embed.
 * @param {Object} entry ipns entry record.
 * @return {IpnsEntry} entry with public key embedded
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
    peerId = await promisify(PeerId.createFromPubKey)(publicKey.bytes)
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
 * @param {Object} peerId peer identifier object.
 * @param {IpnsEntry} entry ipns entry record.
 * @returns {Object} the public key
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

// rawStdEncoding with RFC4648
const rawStdEncoding = (key) => base32Encode(key, 'RFC4648', { padding: false })

/**
 * Get key for storing the record locally.
 * Format: /ipns/${base32(<HASH>)}
 *
 * @param {Buffer} key peer identifier object.
 * @returns {string}
 */
const getLocalKey = (key) => new Key(`/ipns/${rawStdEncoding(key)}`)

/**
 * Get key for sharing the record in the routing mechanism.
 * Format: ${base32(/ipns/<HASH>)}, ${base32(/pk/<HASH>)}
 *
 * @param {Buffer} pid peer identifier represented by the multihash of the public key as Buffer.
 * @returns {Object} containing the `nameKey` and the `ipnsKey`.
 */
const getIdKeys = (pid) => {
  const pkBuffer = Buffer.from('/pk/')
  const ipnsBuffer = Buffer.from('/ipns/')

  return {
    routingPubKey: new Key(Buffer.concat([pkBuffer, pid])), // Added on https://github.com/ipfs/js-ipns/pull/8#issue-213857876 (pkKey will be deprecated in a future release)
    pkKey: new Key(rawStdEncoding(Buffer.concat([pkBuffer, pid]))),
    routingKey: new Key(Buffer.concat([ipnsBuffer, pid])), // Added on https://github.com/ipfs/js-ipns/pull/6#issue-213631461 (ipnsKey will be deprecated in a future release)
    ipnsKey: new Key(rawStdEncoding(Buffer.concat([ipnsBuffer, pid])))
  }
}

// Sign ipns record data
const sign = (privateKey, value, validityType, validity) => {
  try {
    const dataForSignature = ipnsEntryDataForSig(value, validityType, validity)

    return promisify(privateKey.sign, {
      context: privateKey
    })(dataForSignature)
  } catch (error) {
    log.error('record signature creation failed')
    throw errCode(new Error('record signature creation failed: ' + error.message), ERRORS.ERR_SIGNATURE_CREATION)
  }
}

// Utility for getting the validity type code name of a validity
const getValidityType = (validityType) => {
  if (validityType.toString() === '0') {
    return 'EOL'
  }

  const error = new Error(`unrecognized validity type ${validityType.toString()}`)
  log.error(error)
  throw errCode(error, ERRORS.ERR_UNRECOGNIZED_VALIDITY)
}

// Utility for creating the record data for being signed
const ipnsEntryDataForSig = (value, validityType, validity) => {
  const valueBuffer = Buffer.from(value)
  const validityTypeBuffer = Buffer.from(getValidityType(validityType))
  const validityBuffer = Buffer.from(validity)

  return Buffer.concat([valueBuffer, validityBuffer, validityTypeBuffer])
}

// Utility for extracting the public key from a peer-id
const extractPublicKeyFromId = (peerId) => {
  const decodedId = multihash.decode(peerId.id)

  if (decodedId.code !== ID_MULTIHASH_CODE) {
    return null
  }

  return crypto.keys.unmarshalPublicKey(decodedId.digest)
}

const marshal = ipnsEntryProto.encode

const unmarshal = ipnsEntryProto.decode

const validator = {
  validate: async (marshalledData, key) => {
    const receivedEntry = unmarshal(marshalledData)
    const bufferId = key.slice('/ipns/'.length)
    const peerId = PeerId.createFromBytes(bufferId)

    // extract public key
    const pubKey = extractPublicKey(peerId, receivedEntry)

    // Record validation
    await validate(pubKey, receivedEntry)
    return true
  },
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
