/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const chaiBytes = require('chai-bytes')
const chaiString = require('chai-string')
const expect = chai.expect
chai.use(dirtyChai)
chai.use(chaiBytes)
chai.use(chaiString)

const ipfs = require('ipfs')
const ipfsHttpClient = require('ipfs-http-client')
const DaemonFactory = require('ipfsd-ctl')
const crypto = require('libp2p-crypto')
const { fromB58String } = require('multihashes')
const promisify = require('promisify-es6')

const ipns = require('../src')
const ERRORS = require('../src/errors')

const df = DaemonFactory.create({
  type: 'proc',
  exec: ipfs,
  IpfsClient: ipfsHttpClient
})

describe('ipns', function () {
  this.timeout(20 * 1000)

  const cid = 'QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq'

  let ipfs = null
  let ipfsd = null
  let ipfsId = null
  let rsa = null

  before(async () => {
    rsa = await promisify(crypto.keys.generateKeyPair, {
      context: crypto.keys
    })('RSA', 2048)
    ipfsd = await df.spawn({ initOptions: { bits: 512 } })
    ipfs = ipfsd.api
    ipfsId = await ipfs.id()
  })

  after(async () => {
    if (ipfsd) {
      await ipfsd.stop()
    }
  })

  it('should create an ipns record correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    expect(entry).to.deep.include({
      value: cid,
      sequence: sequence
    })
    expect(entry).to.have.a.property('validity')
    expect(entry).to.have.a.property('signature')
    expect(entry).to.have.a.property('validityType')
  })

  it('should be able to create a record with a fixed expiration', async () => {
    const sequence = 0
    // 2033-05-18T03:33:20.000000000Z
    const expiration = '2033-05-18T03:33:20.000000000Z'

    const entry = await ipns.createWithExpiration(rsa, cid, sequence, expiration)

    await ipns.validate(rsa.public, entry)
    expect(entry).to.have.a.property('validity')
    expect(entry.validity).to.equal('2033-05-18T03:33:20.000000000Z')
  })

  it('should create an ipns record and validate it correctly', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    return ipns.validate(rsa.public, entry)
  })

  it('should fail to validate a bad record', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)

    // corrupt the record by changing the value to random bytes
    entry.value = crypto.randomBytes(46).toString()

    try {
      await ipns.validate(rsa.public, entry)
    } catch (err) {
      expect(err).to.exist()
      expect(err).to.include({
        code: ERRORS.ERR_SIGNATURE_VERIFICATION
      })
    }
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

    expect(entryDataCreated.value).to.equal(unmarshalledData.value.toString())
    expect(entryDataCreated.validity).to.equal(unmarshalledData.validity.toString())
    expect(entryDataCreated.validityType).to.equal(unmarshalledData.validityType)
    expect(entryDataCreated.signature).to.equalBytes(unmarshalledData.signature)
    expect(entryDataCreated.sequence).to.equal(unmarshalledData.sequence)

    return ipns.validate(rsa.public, unmarshalledData)
  })

  it('should get datastore key correctly', () => {
    const datastoreKey = ipns.getLocalKey(fromB58String(ipfsId.id))

    expect(datastoreKey).to.exist()
  })

  it('should get id keys correctly', () => {
    const idKeys = ipns.getIdKeys(fromB58String(ipfsId.id))

    expect(idKeys).to.exist()
    expect(idKeys).to.have.a.property('routingPubKey')
    expect(idKeys).to.have.a.property('pkKey')
    expect(idKeys).to.have.a.property('ipnsKey')
    expect(idKeys).to.have.a.property('routingKey')
    expect(idKeys.routingPubKey).to.not.startsWith('/pk/')
    expect(idKeys.pkKey).to.not.startsWith('/pk/')
    expect(idKeys.ipnsKey).to.not.startsWith('/ipns/')
    expect(idKeys.routingKey).to.not.startsWith('/ipns/')
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

  // It should have a public key embeded for newer ed25519 keys
  // https://github.com/ipfs/go-ipns/blob/d51115b4b14ed7fcca5472aadff0fee6772aca8c/ipns.go#L81
  // https://github.com/ipfs/go-ipns/blob/d51115b4b14ed7fcca5472aadff0fee6772aca8c/ipns_test.go
  // https://github.com/libp2p/go-libp2p-peer/blob/7f219a1e70011a258c5d3e502aef6896c60d03ce/peer.go#L80
  // IDFromEd25519PublicKey is not currently implement on js-libp2p-peer
  // https://github.com/libp2p/go-libp2p-peer/pull/30
  it.skip('should be able to extract a public key directly from the peer', async () => {
    const sequence = 0
    const validity = 1000000

    const ed25519 = await promisify(crypto.keys.generateKeyPair, {
      context: crypto.keys
    })('ed25519', 2048)
    const entry = await ipns.create(ed25519, cid, sequence, validity)
    const entryWithKey = ipns.embedPublicKey(ed25519.public, entry)
    expect(entryWithKey).to.not.exist() // Should be null
  })

  it('validator with no valid public key should error', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)

    const marshalledData = ipns.marshal(entry)
    const key = Buffer.from(`/ipns/${ipfsId.id}`)

    try {
      await ipns.validator.validate(marshalledData, key)
    } catch (err) {
      expect(err.code).to.eql(ERRORS.ERR_UNDEFINED_PARAMETER)
      return
    }
    expect.fail('Expected ERR_UNDEFINED_PARAMETER')
  })

  it('should be able to export a previously embed public key from an ipns record', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    await ipns.embedPublicKey(rsa.public, entry)
    const publicKey = ipns.extractPublicKey(ipfsId, entry)
    expect(publicKey.bytes).to.equalBytes(rsa.public.bytes)
  })

  it('should use validator.validate to validate a record', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    await ipns.embedPublicKey(rsa.public, entry)

    const marshalledData = ipns.marshal(entry)
    const key = Buffer.from(`/ipns/${ipfsId.id}`)

    const valid = await ipns.validator.validate(marshalledData, key)
    expect(valid).to.equal(true)
  })

  it('should use validator.validate to verify that a record is not valid', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    await ipns.embedPublicKey(rsa.public, entry)

    // corrupt the record by changing the value to random bytes
    entry.value = crypto.randomBytes(46).toString()
    const marshalledData = ipns.marshal(entry)
    const key = Buffer.from(`/ipns/${ipfsId.id}`)

    try {
      await ipns.validator.validate(marshalledData, key)
    } catch (err) {
      expect(err).to.exist()
      expect(err).to.include({
        code: ERRORS.ERR_SIGNATURE_VERIFICATION
      })
    }
  })

  it('should use validator.select to select the record with the highest sequence number', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(rsa, cid, sequence, validity)
    const newEntry = await ipns.create(rsa, cid, (sequence + 1), validity)

    const marshalledData = ipns.marshal(entry)
    const marshalledNewData = ipns.marshal(newEntry)

    let valid = ipns.validator.select(marshalledNewData, marshalledData)
    expect(valid).to.equal(0) // new data is the selected one

    valid = ipns.validator.select(marshalledData, marshalledNewData)
    expect(valid).to.equal(1) // new data is the selected one
  })
})
