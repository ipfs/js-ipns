/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { base58btc } from 'multiformats/bases/base58'
import { base64urlpad } from 'multiformats/bases/base64'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import PeerId from 'peer-id'
import crypto from 'libp2p-crypto'
import * as ipns from '../src/index.js'
import * as ERRORS from '../src/errors.js'

describe('ipns', function () {
  this.timeout(20 * 1000)

  const cid = uint8ArrayFromString('QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq')

  /** @type {{ id: string, publicKey: string }} */
  let ipfsId
  /** @type {import('libp2p-crypto').keys.supportedKeys.rsa.RsaPrivateKey} */
  let rsa
  /** @type {import('libp2p-crypto').keys.supportedKeys.rsa.RsaPrivateKey} */
  let rsa2

  before(async () => {
    rsa = await crypto.keys.generateKeyPair('RSA', 2048)
    rsa2 = await crypto.keys.generateKeyPair('RSA', 2048)

    const peerId = await PeerId.createFromPubKey(rsa.public.bytes)

    ipfsId = {
      id: peerId.toB58String(),
      publicKey: base64urlpad.encode(rsa.public.bytes)
    }
  })

  it('should create an ipns record correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
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

    const entry = await ipns.createWithExpiration(rsa, cid, sequence, expiration)

    await ipns.validate(rsa.public, entry)
    expect(entry).to.have.property('validity')
    expect(entry.validity).to.equalBytes(uint8ArrayFromString('2033-05-18T03:33:20.000000000Z'))
  })

  it('should create an ipns record and validate it correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    return ipns.validate(rsa.public, entry)
  })

  it('should validate a v1 message', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)

    // extra fields added for v2 sigs
    delete entry.data
    delete entry.signatureV2

    return ipns.validate(rsa.public, entry)
  })

  it('should fail to validate a bad record', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)

    // corrupt the record by changing the value to random bytes
    entry.value = crypto.randomBytes(46)

    return expect(ipns.validate(rsa.public, entry)).to.eventually.be.rejected().with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should create an ipns record with a validity of 1 nanosecond correctly and it should not be valid 1ms later', async () => {
    const sequence = 0
    const validity = 0.00001

    const entry = await ipns.create(rsa, cid, sequence, validity)

    await new Promise(resolve => setTimeout(resolve, 1))
    try {
      await ipns.validate(rsa.public, entry)
    } catch (err) {
      expect(err).to.exist()
      expect(err).to.include({
        code: ERRORS.ERR_IPNS_EXPIRED_RECORD
      })
    }
  })

  it('should create an ipns record, marshal and unmarshal it, as well as validate it correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const entryDataCreated = await ipns.create(rsa, cid, sequence, validity)

    const marshalledData = ipns.marshal(entryDataCreated)
    const unmarshalledData = ipns.unmarshal(marshalledData)

    expect(entryDataCreated.value).to.equalBytes(unmarshalledData.value)
    expect(entryDataCreated.validity).to.equalBytes(unmarshalledData.validity)
    expect(entryDataCreated.validityType).to.equal(unmarshalledData.validityType)
    expect(entryDataCreated.signature).to.equalBytes(unmarshalledData.signature)
    expect(entryDataCreated.sequence).to.equal(unmarshalledData.sequence)
    expect(entryDataCreated.ttl).to.equal(unmarshalledData.ttl)

    if (!unmarshalledData.signatureV2) {
      throw new Error('No v2 sig found')
    }

    expect(entryDataCreated.signatureV2).to.equalBytes(unmarshalledData.signatureV2)

    if (!unmarshalledData.data) {
      throw new Error('No v2 data found')
    }

    expect(entryDataCreated.data).to.equalBytes(unmarshalledData.data)

    return ipns.validate(rsa.public, unmarshalledData)
  })

  it('should get datastore key correctly', () => {
    const datastoreKey = ipns.getLocalKey(base58btc.decode(`z${ipfsId.id}`))

    expect(datastoreKey).to.exist()
    expect(datastoreKey.toString()).to.startWith('/ipns/CIQ')
  })

  it('should get id keys correctly', () => {
    const idKeys = ipns.getIdKeys(base58btc.decode(`z${ipfsId.id}`))

    expect(idKeys).to.exist()
    expect(idKeys).to.have.property('routingPubKey')
    expect(idKeys).to.have.property('pkKey')
    expect(idKeys).to.have.property('ipnsKey')
    expect(idKeys).to.have.property('routingKey')
    expect(idKeys.routingPubKey).to.not.startsWith('/pk/')
    expect(idKeys.pkKey).to.not.startsWith('/pk/')
    expect(idKeys.ipnsKey).to.not.startsWith('/ipns/')
    expect(idKeys.routingKey).to.not.startsWith('/ipns/')
  })

  it('should be able to turn routing key back into id', () => {
    const keys = [
      'QmQd5Enz5tzP8u5wHur8ADuJMbcNhEf86CkWkqRzoWUhst',
      'QmW6mcoqDKJRch2oph2FmvZhPLJn6wPU648Vv9iMyMtmtG'
    ]

    keys.forEach(key => {
      const { routingKey } = ipns.getIdKeys(base58btc.decode(`z${key}`))
      const id = base58btc.encode(routingKey.uint8Array().subarray(ipns.namespaceLength)).substring(1)

      expect(id).to.equal(key)
    })
  })

  it('should be able to embed a public key in an ipns record', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    const entryWithKey = await ipns.embedPublicKey(rsa.public, entry)
    expect(entryWithKey).to.deep.include({
      pubKey: rsa.public.bytes
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

    const ed25519 = await crypto.keys.generateKeyPair('ed25519', 2048)
    const entry = await ipns.create(ed25519, cid, sequence, validity)
    const entryWithKey = ipns.embedPublicKey(ed25519.public, entry)
    expect(entryWithKey).to.not.have.property('pubKey') // ed25519 keys should not be embedded
  })

  it('validator with no valid public key should error', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)

    const marshalledData = ipns.marshal(entry)
    const keyBytes = base58btc.decode(`z${ipfsId.id}`)
    const key = uint8ArrayConcat([uint8ArrayFromString('/ipns/'), keyBytes])

    try {
      await ipns.validator.validate(marshalledData, key)
    } catch (/** @type {any} */ err) {
      expect(err.code).to.eql(ERRORS.ERR_UNDEFINED_PARAMETER)
      return
    }
    expect.fail('Expected ERR_UNDEFINED_PARAMETER')
  })

  it('should be able to export a previously embedded public key from an ipns record', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    await ipns.embedPublicKey(rsa.public, entry)
    const publicKey = await ipns.extractPublicKey(PeerId.createFromB58String(ipfsId.id), entry)
    expect(publicKey.bytes).to.equalBytes(rsa.public.bytes)
  })

  it('should use validator.validate to validate a record', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    await ipns.embedPublicKey(rsa.public, entry)

    const marshalledData = ipns.marshal(entry)

    const keyBytes = base58btc.decode(`z${ipfsId.id}`)
    const key = uint8ArrayConcat([uint8ArrayFromString('/ipns/'), keyBytes])

    await ipns.validator.validate(marshalledData, key)
  })

  it('should use validator.validate to verify that a record is not valid', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    await ipns.embedPublicKey(rsa.public, entry)

    // corrupt the record by changing the value to random bytes
    entry.value = crypto.randomBytes(46)
    const marshalledData = ipns.marshal(entry)

    const keyBytes = base58btc.decode(`z${ipfsId.id}`)
    const key = uint8ArrayConcat([uint8ArrayFromString('/ipns/'), keyBytes])

    await expect(ipns.validator.validate(marshalledData, key))
      .to.eventually.be.rejected().with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should use validator.validate to verify that a record is not valid when it is passed with the wrong IPNS key', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    await ipns.embedPublicKey(rsa.public, entry)
    const marshalledData = ipns.marshal(entry)

    const keyBytes = (await PeerId.createFromPrivKey(rsa2.bytes)).toBytes()
    const key = uint8ArrayConcat([uint8ArrayFromString('/ipns/'), keyBytes])

    await expect(ipns.validator.validate(marshalledData, key))
      .to.eventually.be.rejected().with.property('code', ERRORS.ERR_INVALID_EMBEDDED_KEY)
  })

  it('should use validator.validate to verify that a record is not valid when the wrong key is embedded', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    await ipns.embedPublicKey(rsa2.public, entry)
    const marshalledData = ipns.marshal(entry)

    const keyBytes = (await PeerId.createFromPrivKey(rsa.bytes)).toBytes()
    const key = uint8ArrayConcat([uint8ArrayFromString('/ipns/'), keyBytes])

    await expect(ipns.validator.validate(marshalledData, key))
      .to.eventually.be.rejected().with.property('code', ERRORS.ERR_INVALID_EMBEDDED_KEY)
  })

  it('should use validator.select to select the record with the highest sequence number', async () => {
    const sequence = 0
    const lifetime = 1000000

    const entry = await ipns.create(rsa, cid, sequence, lifetime)
    const newEntry = await ipns.create(rsa, cid, (sequence + 1), lifetime)

    const marshalledData = ipns.marshal(entry)
    const marshalledNewData = ipns.marshal(newEntry)

    let valid = ipns.validator.select(marshalledNewData, marshalledData)
    expect(valid).to.equal(0) // new data is the selected one

    valid = ipns.validator.select(marshalledData, marshalledNewData)
    expect(valid).to.equal(1) // new data is the selected one
  })

  it('should use validator.select to select the record with the longest validity', async () => {
    const sequence = 0
    const lifetime = 1000000

    const entry = await ipns.create(rsa, cid, sequence, lifetime)
    const newEntry = await ipns.create(rsa, cid, sequence, (lifetime + 1))

    const marshalledData = ipns.marshal(entry)
    const marshalledNewData = ipns.marshal(newEntry)

    let valid = ipns.validator.select(marshalledNewData, marshalledData)
    expect(valid).to.equal(0) // new data is the selected one

    valid = ipns.validator.select(marshalledData, marshalledNewData)
    expect(valid).to.equal(1) // new data is the selected one
  })

  it('should use validator.select to select an older record with a v2 sig when the newer record only uses v1', async () => {
    const sequence = 0
    const lifetime = 1000000

    const entry = await ipns.create(rsa, cid, sequence, lifetime)

    const newEntry = await ipns.create(rsa, cid, sequence + 1, lifetime)
    delete newEntry.signatureV2

    const marshalledData = ipns.marshal(entry)
    const marshalledNewData = ipns.marshal(newEntry)

    let valid = ipns.validator.select(marshalledNewData, marshalledData)
    expect(valid).to.equal(1) // old data is the selected one

    valid = ipns.validator.select(marshalledData, marshalledNewData)
    expect(valid).to.equal(0) // old data is the selected one
  })
})
