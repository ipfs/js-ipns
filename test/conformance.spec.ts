/* eslint-env mocha */

import { peerIdFromCID, peerIdFromString } from '@libp2p/peer-id'
import { expect } from 'aegir/chai'
import loadFixture from 'aegir/fixtures'
import { base36 } from 'multiformats/bases/base36'
import { CID } from 'multiformats/cid'
import { SignatureVerificationError } from '../src/errors.js'
import { marshalIPNSRecord, multihashToIPNSRoutingKey, unmarshalIPNSRecord } from '../src/index.js'
import { ipnsValidator, validate } from '../src/validator.js'

describe('conformance', function () {
  it('should reject a v1 only record', async () => {
    const buf = loadFixture('test/fixtures/k51qzi5uqu5dm4tm0wt8srkg9h9suud4wuiwjimndrkydqm81cqtlb5ak6p7ku_v1.ipns-record')

    expect(() => unmarshalIPNSRecord(buf)).to.throw(/Missing data or signatureV2/)
      .with.property('name', SignatureVerificationError.name)
  })

  it('should validate a record with v1 and v2 signatures', async () => {
    const buf = loadFixture('test/fixtures/k51qzi5uqu5dlkw8pxuw9qmqayfdeh4kfebhmreauqdc6a7c3y7d5i9fi8mk9w_v1-v2.ipns-record')
    const record = unmarshalIPNSRecord(buf)

    const cid = CID.parse('k51qzi5uqu5dlkw8pxuw9qmqayfdeh4kfebhmreauqdc6a7c3y7d5i9fi8mk9w', base36)
    const peerId = peerIdFromCID(cid)

    if (peerId.publicKey == null) {
      throw new Error('Peer ID embedded in CID had no public key')
    }

    const publicKey = peerId.publicKey
    await validate(publicKey, buf)

    expect(record.value).to.equal('/ipfs/bafkqaddwgevxmmraojswg33smq')
  })

  it('should validate an RSA record created with Nabu', async () => {
    const buf = loadFixture('test/fixtures/k2k4r8orrik6wc7t78d8g505udi87kk36lplczjaw5g0enj8qkmph59e.nabu.ipns-record')
    const record = unmarshalIPNSRecord(buf)
    console.log(record.value)

    const peerId = peerIdFromString('QmcoDbhCiVXGrWs6rwBvB59Gm44veo7Qxn2zmRnPw7BaCH')

    await ipnsValidator(multihashToIPNSRoutingKey(peerId.toMultihash()), buf)

    // expect(record.value).to.equal('/ipfs/bafkqaddwgevxmmraojswg33smq')
  })

  it('should reject a record with inconsistent value fields', async () => {
    const buf = loadFixture('test/fixtures/k51qzi5uqu5dlmit2tuwdvnx4sbnyqgmvbxftl0eo3f33wwtb9gr7yozae9kpw_v1-v2-broken-v1-value.ipns-record')

    expect(() => unmarshalIPNSRecord(buf)).to.throw(/Field "value" did not match/)
      .with.property('name', SignatureVerificationError.name)
  })

  it('should reject a record with v1 and v2 signatures but invalid v2', async () => {
    const buf = loadFixture('test/fixtures/k51qzi5uqu5diamp7qnnvs1p1gzmku3eijkeijs3418j23j077zrkok63xdm8c_v1-v2-broken-signature-v2.ipns-record')
    const cid = CID.parse('k51qzi5uqu5diamp7qnnvs1p1gzmku3eijkeijs3418j23j077zrkok63xdm8c', base36)
    const peerId = peerIdFromCID(cid)

    if (peerId.publicKey == null) {
      throw new Error('Peer ID embedded in CID had no public key')
    }

    const publicKey = peerId.publicKey

    await expect(validate(publicKey, buf)).to.eventually.be.rejectedWith(/Record signature verification failed/)
      .with.property('name', SignatureVerificationError.name)
  })

  it('should reject a record with v1 and v2 signatures but invalid v1', async () => {
    const buf = loadFixture('test/fixtures/k51qzi5uqu5dilgf7gorsh9vcqqq4myo6jd4zmqkuy9pxyxi5fua3uf7axph4y_v1-v2-broken-signature-v1.ipns-record')
    const record = unmarshalIPNSRecord(buf)

    expect(record.value).to.equal('/ipfs/bafkqahtwgevxmmrao5uxi2bamjzg623fnyqhg2lhnzqxi5lsmuqhmmi')
  })

  it('should validate a record with only v2 signature', async () => {
    const buf = loadFixture('test/fixtures/k51qzi5uqu5dit2ku9mutlfgwyz8u730on38kd10m97m36bjt66my99hb6103f_v2.ipns-record')
    const record = unmarshalIPNSRecord(buf)

    const cid = CID.parse('k51qzi5uqu5dit2ku9mutlfgwyz8u730on38kd10m97m36bjt66my99hb6103f', base36)
    const peerId = peerIdFromCID(cid)

    if (peerId.publicKey == null) {
      throw new Error('Peer ID embedded in CID had no public key')
    }

    const publicKey = peerId.publicKey
    await validate(publicKey, buf)

    expect(record.value).to.equal('/ipfs/bafkqadtwgiww63tmpeqhezldn5zgi')
  })

  it('should round trip fixtures', () => {
    const fixtures = [
      'test/fixtures/k51qzi5uqu5dlkw8pxuw9qmqayfdeh4kfebhmreauqdc6a7c3y7d5i9fi8mk9w_v1-v2.ipns-record',
      'test/fixtures/k51qzi5uqu5diamp7qnnvs1p1gzmku3eijkeijs3418j23j077zrkok63xdm8c_v1-v2-broken-signature-v2.ipns-record',
      'test/fixtures/k51qzi5uqu5dilgf7gorsh9vcqqq4myo6jd4zmqkuy9pxyxi5fua3uf7axph4y_v1-v2-broken-signature-v1.ipns-record',
      'test/fixtures/k51qzi5uqu5dit2ku9mutlfgwyz8u730on38kd10m97m36bjt66my99hb6103f_v2.ipns-record'
    ]

    for (const fixture of fixtures) {
      const buf = loadFixture(fixture)
      const record = unmarshalIPNSRecord(buf)
      const marshalled = marshalIPNSRecord(record)

      expect(buf).to.equalBytes(marshalled)
    }
  })
})
