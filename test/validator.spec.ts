/* eslint-env mocha */

import { randomBytes } from '@libp2p/crypto'
import { generateKeyPair, publicKeyToProtobuf } from '@libp2p/crypto/keys'
import { expect } from 'aegir/chai'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { InvalidEmbeddedPublicKeyError, RecordTooLargeError, SignatureVerificationError } from '../src/errors.js'
import { createIPNSRecord, marshalIPNSRecord, multihashToIPNSRoutingKey } from '../src/index.js'
import { ipnsValidator, isValidityValid } from '../src/validator.js'
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

  describe('isValidityValid', () => {
    it('should return true for a valid EOL record with future expiration', async () => {
      const sequence = 0
      const validity = 1000000
      const record = await createIPNSRecord(privateKey1, contentPath, sequence, validity, { v1Compatible: false })

      const result = await isValidityValid(record)

      expect(result).to.be.true
    })


    it('should return false for a record with null validity', async () => {
      const record = await createIPNSRecord(privateKey1, contentPath, 0, 1000000, { v1Compatible: false })
      // Manually override validity to null
      record.validity = null as any

      const result = await isValidityValid(record)

      expect(result).to.be.false
    })

    it('should return false for an expired record', async () => {
      const sequence = 0
      const validity = 1000000
      const record = await createIPNSRecord(privateKey1, contentPath, sequence, validity, { v1Compatible: false })

      // Manually set validity to a past date
      record.validity = '2020-01-01T00:00:00.000000000Z'

      const result = await isValidityValid(record)

      expect(result).to.be.false
    })

    it('should return true for a V1+V2 record with valid EOL validity', async () => {
      const sequence = 0
      const validity = 1000000
      const record = await createIPNSRecord(privateKey1, contentPath, sequence, validity, { v1Compatible: true })

      const result = await isValidityValid(record)

      expect(result).to.be.true
    })
  })
})
