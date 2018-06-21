/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const chaiString = require('chai-string')
const expect = chai.expect
chai.use(dirtyChai)
chai.use(chaiString)

const ipfs = require('ipfs')
const DaemonFactory = require('ipfsd-ctl')
const crypto = require('libp2p-crypto')
const { fromB58String } = require('multihashes')

const ipns = require('../src')

const df = DaemonFactory.create({ type: 'proc', exec: ipfs })

describe('ipns', function () {
  const cid = 'QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq'

  let ipfs = null
  let ipfsd = null
  let ipfsId = null
  let rsa = null

  const spawnDaemon = (cb) => {
    df.spawn({ initOptions: { bits: 512 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api

      ipfs.id((err, id) => {
        if (err) {
          throw err
        }

        ipfsId = id
        cb()
      })
    })
  }

  before(function (done) {
    crypto.keys.generateKeyPair('RSA', 2048, (err, keypair) => {
      expect(err).to.not.exist()
      rsa = keypair

      spawnDaemon(done)
    })
  })

  after(function (done) {
    ipfsd.stop(() => done())
  })

  it('should create an ipns record correctly', () => {
    const sequence = 0
    const eol = new Date(Date.now())

    ipns.create(rsa, cid, sequence, eol, (err, entry) => {
      expect(err).to.not.exist()
      expect(entry).to.deep.include({
        value: cid,
        sequence: sequence,
        validity: eol
      })
      expect(entry).to.have.a.property('signature')
      expect(entry).to.have.a.property('validityType')
    })
  })

  it('should create an ipns record and validate it correctly', () => {
    const sequence = 0
    const eol = new Date(Date.now())

    ipns.create(rsa, cid, sequence, eol, (err, entry) => {
      expect(err).to.not.exist()

      ipns.validate(rsa.public, entry, (err, res) => {
        expect(err).to.not.exist()
      })
    })
  })

  it('should get datastore key correctly', () => {
    const datastoreKey = ipns.getDatastoreKey(fromB58String(ipfsId.id))

    expect(datastoreKey).to.exist()
    expect(datastoreKey).to.startsWith('/ipns/')
  })

  it('should get id keys correctly', () => {
    const idKeys = ipns.getIdKeys(fromB58String(ipfsId.id))

    expect(idKeys).to.exist()
    expect(idKeys).to.have.a.property('nameKey')
    expect(idKeys).to.have.a.property('ipnsKey')
    expect(idKeys.nameKey).to.not.startsWith('/pk/')
    expect(idKeys.ipnsKey).to.not.startsWith('/ipns/')
  })
})
