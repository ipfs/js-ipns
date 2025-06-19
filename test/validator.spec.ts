/* eslint-env mocha */

import { randomBytes } from '@libp2p/crypto'
import { generateKeyPair, publicKeyToProtobuf } from '@libp2p/crypto/keys'
import { expect } from 'aegir/chai'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { InvalidEmbeddedPublicKeyError, RecordTooLargeError, SignatureVerificationError, RecordExpiredError, UnsupportedValidityError } from '../src/errors.js'
import { createIPNSRecord, marshalIPNSRecord, multihashToIPNSRoutingKey } from '../src/index.js'
import { ipnsValidator, validFor } from '../src/validator.js'
import type { PrivateKey } from '@libp2p/interface'

describe('validator', function () {
  this.timeout(20 * 1000)

  const contentPath = '/ipfs/bafkqae3imvwgy3zamzzg63janjzs22lqnzzqu'
  let privateKey1: PrivateKey
  let privateKey2: PrivateKey

  before(async () => {
    privateKey1 = await generateKeyPair('RSA', 2048)
    privateKey2 = await generateKeyPair('RSA', 2048)
  })

  it('should validate a (V2) record', async () => {
    const sequence = 0
    const validity = 1000000
    const record = await createIPNSRecord(privateKey1, contentPath, sequence, validity, { v1Compatible: false })
    const marshalledData = marshalIPNSRecord(record)
    const key = multihashToIPNSRoutingKey(privateKey1.publicKey.toMultihash())

    await ipnsValidator(key, marshalledData)
  })

  it('should validate a (V1+V2) record', async () => {
    const sequence = 0
    const validity = 1000000
    const record = await createIPNSRecord(privateKey1, contentPath, sequence, validity, { v1Compatible: true })
    const marshalledData = marshalIPNSRecord(record)
    const key = multihashToIPNSRoutingKey(privateKey1.publicKey.toMultihash())

    await ipnsValidator(key, marshalledData)
  })

  it('should use validator.validate to verify that a record is not valid', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await createIPNSRecord(privateKey1, contentPath, sequence, validity)

    // corrupt the record by changing the value to random bytes
    record.value = uint8ArrayToString(randomBytes(record.value?.length ?? 0))
    const marshalledData = marshalIPNSRecord(record)

    const key = multihashToIPNSRoutingKey(privateKey1.publicKey.toMultihash())

    await expect(ipnsValidator(key, marshalledData)).to.eventually.be.rejected()
      .with.property('name', SignatureVerificationError.name)
  })

  it('should use validator.validate to verify that a record is not valid when it is passed with the wrong IPNS key', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await createIPNSRecord(privateKey1, contentPath, sequence, validity)
    const marshalledData = marshalIPNSRecord(record)

    const key = multihashToIPNSRoutingKey(privateKey2.publicKey.toMultihash())

    await expect(ipnsValidator(key, marshalledData)).to.eventually.be.rejected()
      .with.property('name', InvalidEmbeddedPublicKeyError.name)
  })

  it('should use validator.validate to verify that a record is not valid when the wrong key is embedded', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await createIPNSRecord(privateKey1, contentPath, sequence, validity)
    record.pubKey = publicKeyToProtobuf(privateKey2.publicKey)
    const marshalledData = marshalIPNSRecord(record)

    const key = multihashToIPNSRoutingKey(privateKey1.publicKey.toMultihash())

    await expect(ipnsValidator(key, marshalledData)).to.eventually.be.rejected()
      .with.property('name', InvalidEmbeddedPublicKeyError.name)
  })

  it('should limit the size of incoming records', async () => {
    const marshalledData = new Uint8Array(1024 * 1024)
    const key = new Uint8Array()

    await expect(ipnsValidator(key, marshalledData)).to.eventually.be.rejected()
      .with.property('name', RecordTooLargeError.name)
  })

  describe('validFor', () => {
    it('should return the number of milliseconds until the record expires', async () => {
      const record = await createIPNSRecord(privateKey1, contentPath, 0, 1000000)
      const result = validFor(record)
      expect(result).to.be.greaterThan(0)
    })

    it('should throw RecordExpiredError for expired records', async () => {
      const record = await createIPNSRecord(privateKey1, contentPath, 0, 0)

      expect(() => validFor(record)).to.throw(RecordExpiredError)
    })

    it('should throw UnsupportedValidityError for non-EOL validity types', async () => {
      const record = await createIPNSRecord(privateKey1, contentPath, 0, 1000000)
      record.validityType = 5 as any

      expect(() => validFor(record)).to.throw(UnsupportedValidityError)
    })

    it('should throw UnsupportedValidityError for null validity', async () => {
      const record = await createIPNSRecord(privateKey1, contentPath, 0, 1000000)
      record.validityType = null as any

      expect(() => validFor(record)).to.throw(UnsupportedValidityError)
    })

    it('should return correct milliseconds until expiration', async () => {
      const record = await createIPNSRecord(privateKey1, contentPath, 0, 5000)

      const result = validFor(record)

      expect(result).to.be.within(4900, 5000)
    })
  })
})
