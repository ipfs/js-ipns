/* eslint-env mocha */

import { randomBytes } from '@libp2p/crypto'
import { generateKeyPair } from '@libp2p/crypto/keys'
import { peerIdFromKeys, peerIdFromString } from '@libp2p/peer-id'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { expect } from 'aegir/chai'
import { base58btc } from 'multiformats/bases/base58'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as ERRORS from '../src/errors.js'
import * as ipns from '../src/index.js'
import { IpnsEntry } from '../src/pb/ipns.js'
import { unmarshal, marshal, extractPublicKey, peerIdToRoutingKey } from '../src/utils.js'
import { ipnsValidator } from '../src/validator.js'
import type { PeerId } from '@libp2p/interface-peer-id'

describe('ipns', function () {
  this.timeout(20 * 1000)

  const contentPath = '/ipfs/bafkqae3imvwgy3zamzzg63janjzs22lqnzzqu'
  let peerId: PeerId

  before(async () => {
    const rsa = await generateKeyPair('RSA', 2048)
    peerId = await peerIdFromKeys(rsa.public.bytes, rsa.bytes)
  })

  it('should create an ipns record (V1+V2) correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)

    expect(record.value()).to.equal(contentPath)
    expect(record.sequence()).to.equal(BigInt(0))
    expect(record.validityType()).to.equal(IpnsEntry.ValidityType.EOL)
    expect(record.validity()).to.exist()
    expect(record.ttl()).to.equal(BigInt(validity * 100000))

    expect(record.pb).to.deep.include({
      value: uint8ArrayFromString(contentPath),
      sequence: BigInt(sequence)
    })
    expect(record.pb).to.have.property('validity')
    expect(record.pb).to.have.property('signatureV1')
    expect(record.pb).to.have.property('validityType')
    expect(record.pb).to.have.property('signatureV2')
    expect(record.pb).to.have.property('data')
  })

  it('should create an ipns record (V2) correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity, { v1Compatible: false })

    expect(record.value()).to.equal(contentPath)
    expect(record.sequence()).to.equal(BigInt(0))
    expect(record.validityType()).to.equal(IpnsEntry.ValidityType.EOL)
    expect(record.validity()).to.exist()
    expect(record.ttl()).to.equal(BigInt(validity * 100000))

    expect(record.pb).to.not.have.property('value')
    expect(record.pb).to.not.have.property('sequence')
    expect(record.pb).to.not.have.property('validity')
    expect(record.pb).to.not.have.property('signatureV1')
    expect(record.pb).to.not.have.property('validityType')
    expect(record.pb).to.have.property('signatureV2')
    expect(record.pb).to.have.property('data')
  })

  it('should be able to create a record (V1+V2) with a fixed expiration', async () => {
    const sequence = 0
    // 2033-05-18T03:33:20.000000000Z
    const expiration = '2033-05-18T03:33:20.000000000Z'

    const record = await ipns.createWithExpiration(peerId, contentPath, sequence, expiration)

    await ipnsValidator(peerIdToRoutingKey(peerId), marshal(record))
    expect(record.pb).to.have.property('validity')
    expect(record.validity().getTime()).to.equal(new Date('2033-05-18T03:33:20.000000000Z').getTime())
  })

  it('should be able to create a record (V2) with a fixed expiration', async () => {
    const sequence = 0
    // 2033-05-18T03:33:20.000000000Z
    const expiration = '2033-05-18T03:33:20.000000000Z'

    const record = await ipns.createWithExpiration(peerId, contentPath, sequence, expiration, { v1Compatible: false })

    await ipnsValidator(peerIdToRoutingKey(peerId), marshal(record))
    expect(record.pb).to.not.have.property('validity')
    expect(record.validity().getTime()).to.equal(new Date('2033-05-18T03:33:20.000000000Z').getTime())
  })

  it('should create an ipns record (V1+V2) and validate it correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)
    await ipnsValidator(peerIdToRoutingKey(peerId), marshal(record))
  })

  it('should create an ipns record (V2) and validate it correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity, { v1Compatible: false })
    await ipnsValidator(peerIdToRoutingKey(peerId), marshal(record))
  })

  it('should fail to validate a v1 (deprecated legacy) message', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)

    // remove the extra fields added for v2 sigs
    delete record.pb.data
    delete record.pb.signatureV2

    // confirm a v1 exists
    expect(record.pb).to.have.property('signatureV1')

    await expect(ipnsValidator(peerIdToRoutingKey(peerId), marshal(record))).to.eventually.be.rejected().with.property('code', ERRORS.ERR_INVALID_RECORD_DATA)
  })

  it('should fail to validate a v2 without v2 signature (ignore v1)', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)

    // remove v2 sig
    delete record.pb.signatureV2

    // confirm a v1 exists
    expect(record.pb).to.have.property('signatureV1')

    await expect(ipnsValidator(peerIdToRoutingKey(peerId), marshal(record))).to.eventually.be.rejected().with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should fail to validate a bad record', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)

    // corrupt the record by changing the value to random bytes
    record.pb.value = randomBytes(46)

    await expect(ipnsValidator(peerIdToRoutingKey(peerId), marshal(record))).to.eventually.be.rejected().with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should create an ipns record with a validity of 1 nanosecond correctly and it should not be valid 1ms later', async () => {
    const sequence = 0
    const validity = 0.00001

    const record = await ipns.create(peerId, contentPath, sequence, validity)

    await new Promise(resolve => setTimeout(resolve, 1))

    await expect(ipnsValidator(peerIdToRoutingKey(peerId), marshal(record))).to.eventually.be.rejected().with.property('code', ERRORS.ERR_IPNS_EXPIRED_RECORD)
  })

  it('should create an ipns record, marshal and unmarshal it, as well as validate it correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const createdRecord = await ipns.create(peerId, contentPath, sequence, validity)

    const marshalledData = marshal(createdRecord)
    const unmarshalledData = unmarshal(marshalledData)

    expect(createdRecord.pb.value).to.equalBytes(unmarshalledData.pb.value)
    expect(createdRecord.pb.validity).to.equalBytes(unmarshalledData.pb.validity)
    expect(createdRecord.pb.validityType).to.equal(unmarshalledData.pb.validityType)
    expect(createdRecord.pb.signatureV1).to.equalBytes(unmarshalledData.pb.signatureV1)
    expect(createdRecord.pb.sequence).to.equal(unmarshalledData.pb.sequence)
    expect(createdRecord.pb.ttl).to.equal(unmarshalledData.pb.ttl)

    if (unmarshalledData.pb.signatureV2 == null) {
      throw new Error('No v2 sig found')
    }

    expect(createdRecord.pb.signatureV2).to.equalBytes(unmarshalledData.pb.signatureV2)

    if (unmarshalledData.pb.data == null) {
      throw new Error('No v2 data found')
    }

    expect(createdRecord.pb.data).to.equalBytes(unmarshalledData.pb.data)

    await ipnsValidator(peerIdToRoutingKey(peerId), marshal(unmarshalledData))
  })

  it('should get datastore key correctly', () => {
    const datastoreKey = ipns.getLocalKey(base58btc.decode(`z${peerId.toString()}`))

    expect(datastoreKey).to.exist()
    expect(datastoreKey.toString()).to.startWith('/ipns/CIQ')
  })

  it('should be able to turn routing key back into id', () => {
    const keys = [
      'QmQd5Enz5tzP8u5wHur8ADuJMbcNhEf86CkWkqRzoWUhst',
      'QmW6mcoqDKJRch2oph2FmvZhPLJn6wPU648Vv9iMyMtmtG'
    ]

    keys.forEach(key => {
      const routingKey = ipns.peerIdToRoutingKey(peerIdFromString(key))
      const id = ipns.peerIdFromRoutingKey(routingKey)

      expect(id.toString()).to.equal(key)
    })
  })

  it('should be able to embed a public key in an ipns record', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)

    expect(record.pb).to.deep.include({
      pubKey: peerId.publicKey
    })
  })

  // It should have a public key embedded for newer ed25519 keys
  // https://github.com/ipfs/go-ipns/blob/d51115b4b14ed7fcca5472aadff0fee6772aca8c/ipns.go#L81
  // https://github.com/ipfs/go-ipns/blob/d51115b4b14ed7fcca5472aadff0fee6772aca8c/ipns_test.go
  // https://github.com/libp2p/go-libp2p-peer/blob/7f219a1e70011a258c5d3e502aef6896c60d03ce/peer.go#L80
  // IDFromEd25519PublicKey is not currently implement on js-libp2p-peer
  // https://github.com/libp2p/go-libp2p-peer/pull/30
  it('should be able to extract a public key directly from the peer', async () => {
    const sequence = 0
    const validity = 1000000

    const ed25519 = await createEd25519PeerId()
    const record = await ipns.create(ed25519, contentPath, sequence, validity)

    expect(record.pb).to.not.have.property('pubKey') // ed25519 keys should not be embedded
  })

  it('validator with no valid public key should error', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)
    delete record.pb.pubKey

    const marshalledData = marshal(record)
    const key = peerIdToRoutingKey(peerId)

    await expect(ipnsValidator(key, marshalledData)).to.eventually.be.rejected().with.property('code', ERRORS.ERR_UNDEFINED_PARAMETER)
  })

  it('should be able to export a previously embedded public key from an ipns record', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)

    const publicKey = await extractPublicKey(peerId, record)
    expect(publicKey).to.deep.include({
      bytes: peerId.publicKey
    })
  })
})
