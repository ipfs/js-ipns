/* eslint-env mocha */

import { unmarshalPublicKey } from '@libp2p/crypto/keys'
import { peerIdFromCID } from '@libp2p/peer-id'
import { expect } from 'aegir/chai'
import loadFixture from 'aegir/fixtures'
import { base36 } from 'multiformats/bases/base36'
import { CID } from 'multiformats/cid'
import * as ERRORS from '../src/errors.js'
import * as ipns from '../src/index.js'
import { validate } from '../src/validator.js'

describe('conformance', function () {
  it('should reject a v1 only record', async () => {
    const buf = loadFixture('test/fixtures/k51qzi5uqu5dm4tm0wt8srkg9h9suud4wuiwjimndrkydqm81cqtlb5ak6p7ku_v1.ipns-record')

    expect(() => ipns.unmarshal(buf)).to.throw(/missing data or signatureV2/)
      .with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should validate a record with v1 and v2 signatures', async () => {
    const buf = loadFixture('test/fixtures/k51qzi5uqu5dlkw8pxuw9qmqayfdeh4kfebhmreauqdc6a7c3y7d5i9fi8mk9w_v1-v2.ipns-record')
    const record = ipns.unmarshal(buf)

    const cid = CID.parse('k51qzi5uqu5dlkw8pxuw9qmqayfdeh4kfebhmreauqdc6a7c3y7d5i9fi8mk9w', base36)
    const peerId = peerIdFromCID(cid)
    const publicKey = unmarshalPublicKey(peerId.publicKey ?? new Uint8Array())
    await validate(publicKey, buf)

    expect(record.value).to.equal('/ipfs/bafkqaddwgevxmmraojswg33smq')
  })

  it('should reject a record with inconsistent value fields', async () => {
    const buf = loadFixture('test/fixtures/k51qzi5uqu5dlmit2tuwdvnx4sbnyqgmvbxftl0eo3f33wwtb9gr7yozae9kpw_v1-v2-broken-v1-value.ipns-record')

    expect(() => ipns.unmarshal(buf)).to.throw(/Field "value" did not match/)
      .with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should reject a record with v1 and v2 signatures but invalid v2', async () => {
    const buf = loadFixture('test/fixtures/k51qzi5uqu5diamp7qnnvs1p1gzmku3eijkeijs3418j23j077zrkok63xdm8c_v1-v2-broken-signature-v2.ipns-record')
    const cid = CID.parse('k51qzi5uqu5diamp7qnnvs1p1gzmku3eijkeijs3418j23j077zrkok63xdm8c', base36)
    const peerId = peerIdFromCID(cid)
    const publicKey = unmarshalPublicKey(peerId.publicKey ?? new Uint8Array())

    await expect(validate(publicKey, buf)).to.eventually.be.rejectedWith(/record signature verification failed/)
      .with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should reject a record with v1 and v2 signatures but invalid v1', async () => {
    const buf = loadFixture('test/fixtures/k51qzi5uqu5dilgf7gorsh9vcqqq4myo6jd4zmqkuy9pxyxi5fua3uf7axph4y_v1-v2-broken-signature-v1.ipns-record')
    const record = ipns.unmarshal(buf)

    expect(record.value).to.equal('/ipfs/bafkqahtwgevxmmrao5uxi2bamjzg623fnyqhg2lhnzqxi5lsmuqhmmi')
  })

  it('should validate a record with only v2 signature', async () => {
    const buf = loadFixture('test/fixtures/k51qzi5uqu5dit2ku9mutlfgwyz8u730on38kd10m97m36bjt66my99hb6103f_v2.ipns-record')
    const record = ipns.unmarshal(buf)

    const cid = CID.parse('k51qzi5uqu5dit2ku9mutlfgwyz8u730on38kd10m97m36bjt66my99hb6103f', base36)
    const peerId = peerIdFromCID(cid)
    const publicKey = unmarshalPublicKey(peerId.publicKey ?? new Uint8Array())
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
      const record = ipns.unmarshal(buf)
      const marshalled = ipns.marshal(record)

      expect(buf).to.equalBytes(marshalled)
    }
  })
})
