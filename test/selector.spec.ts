/* eslint-env mocha */

import { generateKeyPair } from '@libp2p/crypto/keys'
import { peerIdFromKeys } from '@libp2p/peer-id'
import { expect } from 'aegir/chai'
import * as ipns from '../src/index.js'
import { ipnsSelector } from '../src/selector.js'
import { marshal, peerIdToRoutingKey } from '../src/utils.js'
import type { PeerId } from '@libp2p/interface/peer-id'

describe('selector', function () {
  this.timeout(20 * 1000)

  const contentPath = '/ipfs/bafkqae3imvwgy3zamzzg63janjzs22lqnzzqu'
  let peerId: PeerId

  before(async () => {
    const rsa = await generateKeyPair('RSA', 2048)
    peerId = await peerIdFromKeys(rsa.public.bytes, rsa.bytes)
  })

  it('should use validator.select to select the record with the highest sequence number', async () => {
    const sequence = 0
    const lifetime = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, lifetime)
    const newRecord = await ipns.create(peerId, contentPath, (sequence + 1), lifetime)

    const marshalledData = marshal(record)
    const marshalledNewData = marshal(newRecord)

    const key = peerIdToRoutingKey(peerId)

    let valid = ipnsSelector(key, [marshalledNewData, marshalledData])
    expect(valid).to.equal(0) // new data is the selected one

    valid = ipnsSelector(key, [marshalledData, marshalledNewData])
    expect(valid).to.equal(1) // new data is the selected one
  })

  it('should use validator.select to select the record with the longest validity', async () => {
    const sequence = 0
    const lifetime = 1000000

    const record = await ipns.create(peerId, contentPath, sequence, lifetime)
    const newRecord = await ipns.create(peerId, contentPath, sequence, (lifetime + 1))

    const marshalledData = marshal(record)
    const marshalledNewData = marshal(newRecord)

    const key = peerIdToRoutingKey(peerId)

    let valid = ipnsSelector(key, [marshalledNewData, marshalledData])
    expect(valid).to.equal(0) // new data is the selected one

    valid = ipnsSelector(key, [marshalledData, marshalledNewData])
    expect(valid).to.equal(1) // new data is the selected one
  })
})
