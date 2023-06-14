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
import { unmarshal, marshal, extractPublicKey, peerIdToRoutingKey } from '../src/utils.js'
import { ipnsValidator } from '../src/validator.js'
import type { PeerId } from '@libp2p/interface-peer-id'

describe('ipns', function () {
  this.timeout(20 * 1000)

  const cid = uint8ArrayFromString('QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq')
  let peerId: PeerId

  before(async () => {
    const rsa = await generateKeyPair('RSA', 2048)
    peerId = await peerIdFromKeys(rsa.public.bytes, rsa.bytes)
  })

  it('should create an ipns record correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(peerId, cid, sequence, validity)
    expect(entry).to.deep.include({
      value: cid,
      sequence: BigInt(sequence)
    })
    expect(entry).to.have.property('validity')
    expect(entry).to.have.property('signature')
    expect(entry).to.have.property('validityType')
    expect(entry).to.have.property('signatureV2')
    expect(entry).to.have.property('data')
  })

  it('should be able to create a record with a fixed expiration', async () => {
    const sequence = 0
    // 2033-05-18T03:33:20.000000000Z
    const expiration = '2033-05-18T03:33:20.000000000Z'

    const entry = await ipns.createWithExpiration(peerId, cid, sequence, expiration)

    await ipnsValidator(peerIdToRoutingKey(peerId), marshal(entry))
    expect(entry).to.have.property('validity')
    expect(entry.validity).to.equalBytes(uint8ArrayFromString('2033-05-18T03:33:20.000000000Z'))
  })

  it('should create an ipns record and validate it correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(peerId, cid, sequence, validity)
    await ipnsValidator(peerIdToRoutingKey(peerId), marshal(entry))
  })

  it('should fail to validate a v1 (deprecated legacy) message', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(peerId, cid, sequence, validity)

    // remove the extra fields added for v2 sigs
    delete entry.data
    delete entry.signatureV2

    // confirm a v1 exists
    expect(entry).to.have.property('signature')

    await expect(ipnsValidator(peerIdToRoutingKey(peerId), marshal(entry))).to.eventually.be.rejected().with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should fail to validate a v2 without v2 signature (ignore v1)', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(peerId, cid, sequence, validity)

    // remove v2 sig
    delete entry.signatureV2

    // confirm a v1 exists
    expect(entry).to.have.property('signature')

    await expect(ipnsValidator(peerIdToRoutingKey(peerId), marshal(entry))).to.eventually.be.rejected().with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should fail to validate a bad record', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(peerId, cid, sequence, validity)

    // corrupt the record by changing the value to random bytes
    entry.value = randomBytes(46)

    await expect(ipnsValidator(peerIdToRoutingKey(peerId), marshal(entry))).to.eventually.be.rejected().with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should create an ipns record with a validity of 1 nanosecond correctly and it should not be valid 1ms later', async () => {
    const sequence = 0
    const validity = 0.00001

    const entry = await ipns.create(peerId, cid, sequence, validity)

    await new Promise(resolve => setTimeout(resolve, 1))

    await expect(ipnsValidator(peerIdToRoutingKey(peerId), marshal(entry))).to.eventually.be.rejected().with.property('code', ERRORS.ERR_IPNS_EXPIRED_RECORD)
  })

  it('should create an ipns record, marshal and unmarshal it, as well as validate it correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const entryDataCreated = await ipns.create(peerId, cid, sequence, validity)

    const marshalledData = marshal(entryDataCreated)
    const unmarshalledData = unmarshal(marshalledData)

    expect(entryDataCreated.value).to.equalBytes(unmarshalledData.value)
    expect(entryDataCreated.validity).to.equalBytes(unmarshalledData.validity)
    expect(entryDataCreated.validityType).to.equal(unmarshalledData.validityType)
    expect(entryDataCreated.signature).to.equalBytes(unmarshalledData.signature)
    expect(entryDataCreated.sequence).to.equal(unmarshalledData.sequence)
    expect(entryDataCreated.ttl).to.equal(unmarshalledData.ttl)

    if (unmarshalledData.signatureV2 == null) {
      throw new Error('No v2 sig found')
    }

    expect(entryDataCreated.signatureV2).to.equalBytes(unmarshalledData.signatureV2)

    if (unmarshalledData.data == null) {
      throw new Error('No v2 data found')
    }

    expect(entryDataCreated.data).to.equalBytes(unmarshalledData.data)

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

    const entry = await ipns.create(peerId, cid, sequence, validity)

    expect(entry).to.deep.include({
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
    const entry = await ipns.create(ed25519, cid, sequence, validity)

    expect(entry).to.not.have.property('pubKey') // ed25519 keys should not be embedded
  })

  it('validator with no valid public key should error', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(peerId, cid, sequence, validity)
    delete entry.pubKey

    const marshalledData = marshal(entry)
    const key = peerIdToRoutingKey(peerId)

    await expect(ipnsValidator(key, marshalledData)).to.eventually.be.rejected().with.property('code', ERRORS.ERR_UNDEFINED_PARAMETER)
  })

  it('should be able to export a previously embedded public key from an ipns record', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(peerId, cid, sequence, validity)

    const publicKey = await extractPublicKey(peerId, entry)
    expect(publicKey).to.deep.include({
      bytes: peerId.publicKey
    })
  })
})
