/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { peerIdFromKeys } from '@libp2p/peer-id'
import { generateKeyPair } from '@libp2p/crypto/keys'
import * as ipns from '../src/index.js'
import { marshal, peerIdToRoutingKey } from '../src/utils.js'
import { ipnsSelector } from '../src/selector.js'
import type { PeerId } from '@libp2p/interface-peer-id'

describe('selector', function () {
  this.timeout(20 * 1000)

  const cid = uint8ArrayFromString('QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq')
  let peerId: PeerId

  before(async () => {
    const rsa = await generateKeyPair('RSA', 2048)
    peerId = await peerIdFromKeys(rsa.public.bytes, rsa.bytes)
  })

  it('should use validator.select to select the record with the highest sequence number', async () => {
    const sequence = 0
    const lifetime = 1000000

    const entry = await ipns.create(peerId, cid, sequence, lifetime)
    const newEntry = await ipns.create(peerId, cid, (sequence + 1), lifetime)

    const marshalledData = marshal(entry)
    const marshalledNewData = marshal(newEntry)

    const key = peerIdToRoutingKey(peerId)

    let valid = ipnsSelector(key, [marshalledNewData, marshalledData])
    expect(valid).to.equal(0) // new data is the selected one

    valid = ipnsSelector(key, [marshalledData, marshalledNewData])
    expect(valid).to.equal(1) // new data is the selected one
  })

  it('should use validator.select to select the record with the longest validity', async () => {
    const sequence = 0
    const lifetime = 1000000

    const entry = await ipns.create(peerId, cid, sequence, lifetime)
    const newEntry = await ipns.create(peerId, cid, sequence, (lifetime + 1))

    const marshalledData = marshal(entry)
    const marshalledNewData = marshal(newEntry)

    const key = peerIdToRoutingKey(peerId)

    let valid = ipnsSelector(key, [marshalledNewData, marshalledData])
    expect(valid).to.equal(0) // new data is the selected one

    valid = ipnsSelector(key, [marshalledData, marshalledNewData])
    expect(valid).to.equal(1) // new data is the selected one
  })

  it('should use validator.select to select an older record with a v2 sig when the newer record only uses v1', async () => {
    const sequence = 0
    const lifetime = 1000000

    const entry = await ipns.create(peerId, cid, sequence, lifetime)

    const newEntry = await ipns.create(peerId, cid, sequence + 1, lifetime)
    delete newEntry.signatureV2

    const marshalledData = marshal(entry)
    const marshalledNewData = marshal(newEntry)

    const key = peerIdToRoutingKey(peerId)

    let valid = ipnsSelector(key, [marshalledNewData, marshalledData])
    expect(valid).to.equal(1) // old data is the selected one

    valid = ipnsSelector(key, [marshalledData, marshalledNewData])
    expect(valid).to.equal(0) // old data is the selected one
  })
})
