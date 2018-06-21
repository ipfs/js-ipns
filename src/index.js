'use strict'

const base32Encode = require('base32-encode')
const debug = require('debug')
const log = debug('jsipns')
log.error = debug('jsipns:error')

const ipnsEntryProto = require('./pb/ipns.proto')
const ERRORS = require('./errors')

/**
 * Create creates a new ipns entry and signs it with the given private key.
 * Note: This function does not embed the public key. If you want to do that, use `EmbedPublicKey`.
 *
 * @param {Object} privateKey private key for signing the record.
 * @param {string} value value to be stored in the record.
 * @param {number} seq sequence number of the record.
 * @param {string} eol end of life datetime of the record.
 * @param {function(Error)} [callback]
 * @returns {Promise|void}
 */
const create = (privateKey, value, seq, eol, callback) => {
  const validity = eol.toISOString()
  const validityType = ipnsEntryProto.ValidityType.EOL

  sign(privateKey, value, validityType, validity, (error, signature) => {
    if (error) {
      log.error(error)
      return callback(error)
    }

    const entry = {
      value: value,
      signature: signature, // TODO confirm format compliance with go-ipfs
      validityType: validityType,
      validity: validity,
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
 * @returns {Promise|void}
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
      const validityDate = Date.parse(validity.toString())

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
 * @returns {Promise|void}
 */
const embedPublicKey = (publicKey, entry, callback) => {
  return callback(new Error('not implemented yet'))
}

/**
 * Extracts a public key matching `pid` from the ipns record.
 *
 * @param {Object} peerId peer identifier object.
 * @param {Object} entry ipns entry record.
 * @param {function(Error)} [callback]
 * @returns {Promise|void}
 */
const extractPublicKey = (peerId, entry, callback) => {
  return callback(new Error('not implemented yet'))
}

// rawStdEncoding as go
// TODO Remove once resolved
// Created PR for allowing this inside base32-encode https://github.com/LinusU/base32-encode/issues/2
const regex = new RegExp('=', 'g')
const rawStdEncoding = (key) => base32Encode(key, 'RFC4648').replace(regex, '')

/**
 * Get key for storing the record in the datastore.
 * Format: /ipns/${base32(<HASH>)}
 *
 * @param {Buffer} key peer identifier object.
 * @returns {string}
 */
const getDatastoreKey = (key) => `/ipns/${rawStdEncoding(key)}`

/**
 * Get key for sharing the record in the routing mechanism.
 * Format: ${base32(/ipns/<HASH>)}, ${base32(/pk/<HASH>)}
 *
 * @param {Buffer} key peer identifier object.
 * @returns {string}
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
  // get key for datastore
  getDatastoreKey,
  // get keys for routing
  getIdKeys,
  // marshal
  marshal: ipnsEntryProto.encode,
  // unmarshal
  unmarshal: ipnsEntryProto.decode
}
