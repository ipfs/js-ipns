'use strict'

const base32Encode = require('base32-encode')
const Big = require('big.js')
const NanoDate = require('nano-date').default

const debug = require('debug')
const log = debug('jsipns')
log.error = debug('jsipns:error')

const ipnsEntryProto = require('./pb/ipns.proto')
const { parseRFC3339 } = require('./utils')
const ERRORS = require('./errors')

/**
 * Creates a new ipns entry and signs it with the given private key.
 * The ipns entry validity should follow the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision.
 * Note: This function does not embed the public key. If you want to do that, use `EmbedPublicKey`.
 *
 * @param {Object} privateKey private key for signing the record.
 * @param {string} value value to be stored in the record.
 * @param {number} seq number representing the current version of the record.
 * @param {string} lifetime lifetime of the record (in milliseconds).
 * @param {function(Error, entry)} [callback]
 * @return {Void}
 */
const create = (privateKey, value, seq, lifetime, callback) => {
  // Calculate eol with nanoseconds precision
  const bnLifetime = new Big(lifetime)
  const bnCurrentDate = new Big(new NanoDate())
  const bnEol = bnCurrentDate.plus(bnLifetime).times('10e+6')
  const nanoDateEol = new NanoDate(bnEol.toString())

  // Validity in ISOString with nanoseconds precision and validity type EOL
  const isoValidity = nanoDateEol.toISOStringFull()
  const validityType = ipnsEntryProto.ValidityType.EOL

  sign(privateKey, value, validityType, isoValidity, (error, signature) => {
    if (error) {
      log.error('record signature creation failed')
      return callback(Object.assign(new Error('record signature verification failed'), { code: ERRORS.ERR_SIGNATURE_CREATION }))
    }

    const entry = {
      value: value,
      signature: signature, // TODO confirm format compliance with go-ipfs
      validityType: validityType,
      validity: isoValidity,
      sequence: seq
    }

    log(`ipns entry for ${value} created`)
    return callback(null, entry)
  })
}

/**
 * Validates the given ipns entry against the given public key.
 *
 * @param {Object} publicKey public key for validating the record.
 * @param {Object} entry ipns entry record.
 * @param {function(Error)} [callback]
 * @return {Void}
 */
const validate = (publicKey, entry, callback) => {
  const { value, validityType, validity } = entry
  const dataForSignature = ipnsEntryDataForSig(value, validityType, validity)

  // Validate Signature
  publicKey.verify(dataForSignature, entry.signature, (err, result) => {
    if (err) {
      log.error('record signature verification failed')
      return callback(Object.assign(new Error('record signature verification failed'), { code: ERRORS.ERR_SIGNATURE_VERIFICATION }))
    }

    // Validate according to the validity type
    if (validityType === ipnsEntryProto.ValidityType.EOL) {
      let validityDate

      try {
        validityDate = parseRFC3339(validity.toString())
      } catch (e) {
        log.error('unrecognized validity format (not an rfc3339 format)')
        return callback(Object.assign(new Error('unrecognized validity format (not an rfc3339 format)'), { code: ERRORS.ERR_UNRECOGNIZED_FORMAT }))
      }

      if (validityDate < Date.now()) {
        log.error('record has expired')
        return callback(Object.assign(new Error('record has expired'), { code: ERRORS.ERR_IPNS_EXPIRED_RECORD }))
      }
    } else if (validityType) {
      log.error('unrecognized validity type')
      return callback(Object.assign(new Error('unrecognized validity type'), { code: ERRORS.ERR_UNRECOGNIZED_VALIDITY }))
    }

    log(`ipns entry for ${value} is valid`)
    return callback(null, null)
  })
}

/**
 * Validates the given ipns entry against the given public key.
 *
 * @param {Object} publicKey public key for validating the record.
 * @param {Object} entry ipns entry record.
 * @param {function(Error)} [callback]
 * @return {Void}
 */
const embedPublicKey = (publicKey, entry, callback) => {
  callback(new Error('not implemented yet'))
}

/**
 * Extracts a public key matching `pid` from the ipns record.
 *
 * @param {Object} peerId peer identifier object.
 * @param {Object} entry ipns entry record.
 * @param {function(Error)} [callback]
 * @return {Void}
 */
const extractPublicKey = (peerId, entry, callback) => {
  callback(new Error('not implemented yet'))
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
const getLocalKey = (key) => `/ipns/${rawStdEncoding(key)}`

/**
 * Get key for sharing the record in the routing mechanism.
 * Format: ${base32(/ipns/<HASH>)}, ${base32(/pk/<HASH>)}
 *
 * @param {Buffer} key peer identifier object.
 * @returns {Object} containing the `nameKey` and the `ipnsKey`.
 */
const getIdKeys = (key) => {
  const pkBuffer = Buffer.from('/pk/')
  const ipnsBuffer = Buffer.from('/ipns/')

  return {
    nameKey: rawStdEncoding(Buffer.concat([pkBuffer, key])),
    ipnsKey: rawStdEncoding(Buffer.concat([ipnsBuffer, key]))
  }
}

// Sign ipns record data
const sign = (privateKey, value, validityType, validity, callback) => {
  const dataForSignature = ipnsEntryDataForSig(value, validityType, validity)

  privateKey.sign(dataForSignature, (err, signature) => {
    if (err) {
      return callback(err)
    }
    return callback(null, signature)
  })
}

// Create record data for being signed
const ipnsEntryDataForSig = (value, validityType, eol) => {
  const valueBuffer = Buffer.from(value)
  const validityTypeBuffer = Buffer.from(validityType.toString())
  const eolBuffer = Buffer.from(eol)

  return Buffer.concat([valueBuffer, validityTypeBuffer, eolBuffer])
}

module.exports = {
  // create ipns entry record
  create,
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
  marshal: ipnsEntryProto.encode,
  // unmarshal
  unmarshal: ipnsEntryProto.decode
}
