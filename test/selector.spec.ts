/* eslint-env mocha */

import { generateKeyPair } from '@libp2p/crypto/keys'
import { expect } from 'aegir/chai'
import { createIPNSRecord, marshalIPNSRecord, multihashToIPNSRoutingKey } from '../src/index.js'
import { ipnsSelector } from '../src/selector.js'
import type { PrivateKey } from '@libp2p/interface'

describe('selector', function () {
  this.timeout(20 * 1000)

  const contentPath = '/ipfs/bafkqae3imvwgy3zamzzg63janjzs22lqnzzqu'
  let privateKey: PrivateKey

  before(async () => {
    privateKey = await generateKeyPair('RSA', 2048)
  })

  it('should use validator.select to select the record with the highest sequence number', async () => {
    const sequence = 0
    const lifetime = 1000000

    const record = await createIPNSRecord(privateKey, contentPath, sequence, lifetime)
    const newRecord = await createIPNSRecord(privateKey, contentPath, (sequence + 1), lifetime)

    const marshalledData = marshalIPNSRecord(record)
    const marshalledNewData = marshalIPNSRecord(newRecord)

    const key = multihashToIPNSRoutingKey(privateKey.publicKey.toMultihash())

    let valid = ipnsSelector(key, [marshalledNewData, marshalledData])
    expect(valid).to.equal(0) // new data is the selected one

    valid = ipnsSelector(key, [marshalledData, marshalledNewData])
    expect(valid).to.equal(1) // new data is the selected one
  })

  it('should use validator.select to select the record with the longest validity', async () => {
    const sequence = 0
    const lifetime = 1000000

    const record = await createIPNSRecord(privateKey, contentPath, sequence, lifetime)
    const newRecord = await createIPNSRecord(privateKey, contentPath, sequence, (lifetime + 1))

    const marshalledData = marshalIPNSRecord(record)
    const marshalledNewData = marshalIPNSRecord(newRecord)

    const key = multihashToIPNSRoutingKey(privateKey.publicKey.toMultihash())

    let valid = ipnsSelector(key, [marshalledNewData, marshalledData])
    expect(valid).to.equal(0) // new data is the selected one

    valid = ipnsSelector(key, [marshalledData, marshalledNewData])
    expect(valid).to.equal(1) // new data is the selected one
  })
})
