/* eslint-env mocha */

import { randomBytes } from '@libp2p/crypto'
import { generateKeyPair, unmarshalPrivateKey } from '@libp2p/crypto/keys'
import { peerIdFromKeys, peerIdFromString } from '@libp2p/peer-id'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { expect } from 'aegir/chai'
import * as cbor from 'cborg'
import { base36 } from 'multiformats/bases/base36'
import { base58btc } from 'multiformats/bases/base58'
import { CID } from 'multiformats/cid'
import { toString as uint8ArrayToString } from 'uint8arrays'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as ERRORS from '../src/errors.js'
import * as ipns from '../src/index.js'
import { IpnsEntry } from '../src/pb/ipns.js'
import { extractPublicKey, peerIdToRoutingKey, parseCborData, createCborData, ipnsRecordDataForV2Sig } from '../src/utils.js'
import { ipnsValidator } from '../src/validator.js'
import { kuboRecord } from './fixtures/records.js'
import type { PeerId } from '@libp2p/interface'

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

    expect(record.value).to.equal(contentPath)
    expect(record.validityType).to.equal(IpnsEntry.ValidityType.EOL)
    expect(record.validity).to.exist()
    expect(record.sequence).to.equal(BigInt(0))
    expect(record.ttl).to.equal(BigInt(validity * 100000))
    expect(record.signatureV1).to.exist()
    expect(record.signatureV2).to.exist()
    expect(record.data).to.exist()

    // Protobuf must have all fields!
    const pb = IpnsEntry.decode(ipns.marshal(record))
    expect(pb.value).to.equalBytes(uint8ArrayFromString(contentPath))
    expect(pb.validityType).to.equal(IpnsEntry.ValidityType.EOL)
    expect(pb.validity).to.exist()
    expect(pb.sequence).to.equal(BigInt(sequence))
    expect(pb.ttl).to.equal(BigInt(validity * 100000))
    expect(pb.signatureV1).to.exist()
    expect(pb.signatureV2).to.exist()
    expect(pb.data).to.exist()

    // Protobuf.Data must have all fields and match!
    const data = parseCborData(pb.data ?? new Uint8Array(0))
    expect(data.Value).to.equalBytes(pb.value)
    expect(data.ValidityType).to.equal(pb.validityType)
    expect(data.Validity).to.equalBytes(pb.validity)
    expect(data.Sequence).to.equal(pb.sequence)
    expect(data.TTL).to.equal(pb.ttl)
  })

  it('should create an ipns record (V2) correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity, { v1Compatible: false })

    expect(record.value).to.equal(contentPath)
    expect(record.validityType).to.equal(IpnsEntry.ValidityType.EOL)
    expect(record.validity).to.exist()
    expect(record.sequence).to.equal(BigInt(0))
    expect(record.ttl).to.equal(BigInt(validity * 100000))
    expect(record.signatureV2).to.exist()
    expect(record).to.not.have.property('signatureV1')
    expect(record.data).to.exist()

    // PB must only have signature and data.
    const pb = IpnsEntry.decode(ipns.marshal(record))
    expect(pb.value).to.not.exist()
    expect(pb.validityType).to.not.exist()
    expect(pb.validity).to.not.exist()
    expect(pb.sequence).to.not.exist()
    expect(pb.ttl).to.not.exist()
    expect(pb.signatureV1).to.not.exist()
    expect(pb.signatureV2).to.exist()
    expect(pb.data).to.exist()

    // Protobuf.Data must have all fields and match!
    const data = parseCborData(pb.data ?? new Uint8Array(0))
    expect(data.Value).to.equalBytes(uint8ArrayFromString(contentPath))
    expect(data.ValidityType).to.equal(IpnsEntry.ValidityType.EOL)
    expect(data.Validity).to.exist()
    expect(data.Sequence).to.equal(BigInt(sequence))
    expect(data.TTL).to.equal(BigInt(validity * 100000))
  })

  it('should be able to create a record (V1+V2) with a fixed expiration', async () => {
    const sequence = 0
    const expiration = '2033-05-18T03:33:20.000000000Z'

    const record = await ipns.createWithExpiration(peerId, contentPath, sequence, expiration)
    const marshalledRecord = ipns.marshal(record)

    await ipnsValidator(peerIdToRoutingKey(peerId), marshalledRecord)

    const pb = IpnsEntry.decode(marshalledRecord)
    expect(pb).to.have.property('validity')
    expect(pb.validity).to.equalBytes(uint8ArrayFromString(expiration))
  })

  it('should be able to create a record (V2) with a fixed expiration', async () => {
    const sequence = 0
    const expiration = '2033-05-18T03:33:20.000000000Z'

    const record = await ipns.createWithExpiration(peerId, contentPath, sequence, expiration, { v1Compatible: false })
    const marshalledRecord = ipns.marshal(record)

    await ipnsValidator(peerIdToRoutingKey(peerId), marshalledRecord)

    const pb = IpnsEntry.decode(ipns.marshal(record))
    expect(pb).to.not.have.property('validity')

    const data = parseCborData(pb.data ?? new Uint8Array(0))
    expect(data.Validity).to.equalBytes(uint8ArrayFromString(expiration))
  })

  it('should create an ipns record (V1+V2) and validate it correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)
    await ipnsValidator(peerIdToRoutingKey(peerId), ipns.marshal(record))
  })

  it('should create an ipns record (V2) and validate it correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity, { v1Compatible: false })
    await ipnsValidator(peerIdToRoutingKey(peerId), ipns.marshal(record))
  })

  it('should normalize value when creating an ipns record (arbitrary string path)', async () => {
    const inputValue = '/foo/bar/baz'
    const expectedValue = '/foo/bar/baz'
    const record = await ipns.create(peerId, inputValue, 0, 1000000)
    expect(record.value).to.equal(expectedValue)
  })

  it('should normalize value when creating a recursive ipns record (peer id)', async () => {
    const inputValue = await createEd25519PeerId()
    const expectedValue = `/ipns/${inputValue.toCID().toString(base36)}`
    const record = await ipns.create(peerId, inputValue, 0, 1000000)
    expect(record.value).to.equal(expectedValue)
  })

  it('should normalize value when creating a recursive ipns record (peer id as CID)', async () => {
    const inputValue = await createEd25519PeerId()
    const expectedValue = `/ipns/${inputValue.toCID().toString(base36)}`
    const record = await ipns.create(peerId, inputValue.toCID(), 0, 1000000)
    expect(record.value).to.equal(expectedValue)
  })

  it('should normalize value when creating an ipns record (v0 cid)', async () => {
    const inputValue = CID.parse('QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq')
    const expectedValue = '/ipfs/bafybeidvkqhl6dwsdzx5km7tupo33ywt7czkl5topwogxx6lybko2d7pua'
    const record = await ipns.create(peerId, inputValue, 0, 1000000)
    expect(record.value).to.equal(expectedValue)
  })

  it('should normalize value when creating an ipns record (v1 cid)', async () => {
    const inputValue = CID.parse('bafkqae3imvwgy3zamzzg63janjzs22lqnzzqu')
    const expectedValue = '/ipfs/bafkqae3imvwgy3zamzzg63janjzs22lqnzzqu'
    const record = await ipns.create(peerId, inputValue, 0, 1000000)
    expect(record.value).to.equal(expectedValue)
  })

  it('should normalize value when reading an ipns record (string v0 cid path)', async () => {
    const inputValue = '/ipfs/QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq'
    const expectedValue = '/ipfs/QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq'
    const record = await ipns.create(peerId, inputValue, 0, 1000000)

    const pb = IpnsEntry.decode(ipns.marshal(record))
    pb.data = createCborData(uint8ArrayFromString(inputValue), pb.validityType ?? IpnsEntry.ValidityType.EOL, pb.validity ?? new Uint8Array(0), pb.sequence ?? 0n, pb.ttl ?? 0n)
    pb.value = uint8ArrayFromString(inputValue)

    const modifiedRecord = ipns.unmarshal(IpnsEntry.encode(pb))
    expect(modifiedRecord.value).to.equal(expectedValue)
  })

  it('should normalize value when reading an ipns record (string v1 cid path)', async () => {
    const inputValue = '/ipfs/bafkqae3imvwgy3zamzzg63janjzs22lqnzzqu'
    const expectedValue = '/ipfs/bafkqae3imvwgy3zamzzg63janjzs22lqnzzqu'
    const record = await ipns.create(peerId, inputValue, 0, 1000000)

    const pb = IpnsEntry.decode(ipns.marshal(record))
    pb.data = createCborData(uint8ArrayFromString(inputValue), pb.validityType ?? IpnsEntry.ValidityType.EOL, pb.validity ?? new Uint8Array(0), pb.sequence ?? 0n, pb.ttl ?? 0n)
    pb.value = uint8ArrayFromString(inputValue)

    const modifiedRecord = ipns.unmarshal(IpnsEntry.encode(pb))
    expect(modifiedRecord.value).to.equal(expectedValue)
  })

  it('should fail to normalize non-path value', async () => {
    const inputValue = 'hello'

    await expect(ipns.create(peerId, inputValue, 0, 1000000)).to.eventually.be.rejected
      .with.property('code', ERRORS.ERR_INVALID_VALUE)
  })

  it('should fail to normalize path value that is too short', async () => {
    const inputValue = '/'

    await expect(ipns.create(peerId, inputValue, 0, 1000000)).to.eventually.be.rejected
      .with.property('code', ERRORS.ERR_INVALID_VALUE)
  })

  it('should fail to validate a v1 (deprecated legacy) message', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)
    const pb = IpnsEntry.decode(ipns.marshal(record))

    // remove the extra fields added for v2 sigs
    delete pb.data
    delete pb.signatureV2

    // confirm a v1 exists
    expect(pb).to.have.property('signatureV1')

    await expect(ipnsValidator(peerIdToRoutingKey(peerId), IpnsEntry.encode(pb))).to.eventually.be.rejected().with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should fail to validate a v2 without v2 signature (ignore v1)', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)
    const pb = IpnsEntry.decode(ipns.marshal(record))

    // remove v2 sig
    delete pb.signatureV2

    // confirm a v1 exists
    expect(pb).to.have.property('signatureV1')

    await expect(ipnsValidator(peerIdToRoutingKey(peerId), IpnsEntry.encode(pb))).to.eventually.be.rejected().with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should fail to validate a bad record', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)

    // corrupt the record by changing the value to random bytes
    record.value = uint8ArrayToString(randomBytes(46))

    await expect(ipnsValidator(peerIdToRoutingKey(peerId), ipns.marshal(record))).to.eventually.be.rejected().with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should create an ipns record with a validity of 1 nanosecond correctly and it should not be valid 1ms later', async () => {
    const sequence = 0
    const validity = 0.00001

    const record = await ipns.create(peerId, contentPath, sequence, validity)

    await new Promise(resolve => setTimeout(resolve, 1))

    await expect(ipnsValidator(peerIdToRoutingKey(peerId), ipns.marshal(record))).to.eventually.be.rejected().with.property('code', ERRORS.ERR_IPNS_EXPIRED_RECORD)
  })

  it('should create an ipns record, marshal and unmarshal it, as well as validate it correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const createdRecord = await ipns.create(peerId, contentPath, sequence, validity)

    const marshalledData = ipns.marshal(createdRecord)
    const unmarshalledData = ipns.unmarshal(marshalledData)

    expect(createdRecord.value).to.equal(unmarshalledData.value)
    expect(createdRecord.validity.toString()).to.equal(unmarshalledData.validity.toString())
    expect(createdRecord.validityType).to.equal(unmarshalledData.validityType)
    expect(createdRecord.signatureV1).to.equalBytes('signatureV1' in unmarshalledData ? unmarshalledData.signatureV1 : new Uint8Array(0))
    expect(createdRecord.sequence).to.equal(unmarshalledData.sequence)
    expect(createdRecord.ttl).to.equal(unmarshalledData.ttl)
    expect(createdRecord.signatureV2).to.equalBytes(unmarshalledData.signatureV2)
    expect(createdRecord.data).to.equalBytes(unmarshalledData.data)

    await ipnsValidator(peerIdToRoutingKey(peerId), marshalledData)
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
    expect(record.pubKey).to.equalBytes(peerId.publicKey)

    const pb = IpnsEntry.decode(ipns.marshal(record))
    expect(pb.pubKey).to.equalBytes(peerId.publicKey)
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

    expect(record).to.not.have.property('pubKey') // ed25519 keys should not be embedded
  })

  it('validator with no valid public key should error', async () => {
    const sequence = 0
    const validity = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, validity)
    delete record.pubKey

    const marshalledData = ipns.marshal(record)
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

  it('should unmarshal a record with raw CID bytes', async () => {
    // we may encounter these in the wild due to older versions of this module
    // but IPNS records should have string path values

    // create a dummy record with an arbitrary string path
    const input = await ipns.create(peerId, '/foo', 0n, 10000, {
      v1Compatible: false
    })

    // we will store the raw bytes from this CID
    const cid = CID.parse('bafkqae3imvwgy3zamzzg63janjzs22lqnzzqu')

    // override data with raw CID bytes
    const data = cbor.decode(input.data)
    data.Value = cid.bytes
    input.data = cbor.encode(data)

    // re-sign record
    const privateKey = await unmarshalPrivateKey(peerId.privateKey ?? new Uint8Array(0))
    const sigData = ipnsRecordDataForV2Sig(input.data)
    input.signatureV2 = await privateKey.sign(sigData)

    const buf = ipns.marshal(input)
    const record = ipns.unmarshal(buf)

    expect(record).to.have.property('value', '/ipfs/bafkqae3imvwgy3zamzzg63janjzs22lqnzzqu')
  })

  it('should round trip kubo records to bytes and back', async () => {
    // the IPNS spec gives an example for the Validity field as
    // 1970-01-01T00:00:00.000000001Z - e.g. nanosecond precision but Kubo only
    // uses microsecond precision. The value is a timestamp as defined by
    // rfc3339 which doesn't have a strong opinion on fractions of seconds so
    // both are valid but we must be able to round trip them intact.
    const unmarshalled = ipns.unmarshal(kuboRecord.bytes)
    const remarhshalled = ipns.marshal(unmarshalled)

    const reUnmarshalled = ipns.unmarshal(remarhshalled)

    expect(unmarshalled).to.deep.equal(reUnmarshalled)
    expect(remarhshalled).to.equalBytes(kuboRecord.bytes)
  })
})
