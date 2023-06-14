/* eslint-env mocha */

import { randomBytes } from '@libp2p/crypto'
import { generateKeyPair } from '@libp2p/crypto/keys'
import { peerIdFromKeys } from '@libp2p/peer-id'
import { expect } from 'aegir/chai'
import { base58btc } from 'multiformats/bases/base58'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as ERRORS from '../src/errors.js'
import * as ipns from '../src/index.js'
import { marshal, peerIdToRoutingKey } from '../src/utils.js'
import { ipnsValidator } from '../src/validator.js'
import type { PeerId } from '@libp2p/interface-peer-id'

describe('validator', function () {
  this.timeout(20 * 1000)

  const cid = uint8ArrayFromString('QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq')
  let peerId1: PeerId
  let peerId2: PeerId

  before(async () => {
    const rsa = await generateKeyPair('RSA', 2048)
    peerId1 = await peerIdFromKeys(rsa.public.bytes, rsa.bytes)

    const rsa2 = await generateKeyPair('RSA', 2048)
    peerId2 = await peerIdFromKeys(rsa2.public.bytes, rsa2.bytes)
  })

  it('should validate a record', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(peerId1, cid, sequence, validity)
    const marshalledData = marshal(entry)

    const keyBytes = base58btc.decode(`z${peerId1.toString()}`)
    const key = uint8ArrayConcat([uint8ArrayFromString('/ipns/'), keyBytes])

    await ipnsValidator(key, marshalledData)
  })

  it('should use validator.validate to verify that a record is not valid', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(peerId1, cid, sequence, validity)

    // corrupt the record by changing the value to random bytes
    entry.value = randomBytes(entry.value.length)
    const marshalledData = marshal(entry)

    const key = peerIdToRoutingKey(peerId1)

    await expect(ipnsValidator(key, marshalledData)).to.eventually.be.rejected().with.property('code', ERRORS.ERR_SIGNATURE_VERIFICATION)
  })

  it('should use validator.validate to verify that a record is not valid when it is passed with the wrong IPNS key', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(peerId1, cid, sequence, validity)
    const marshalledData = marshal(entry)

    const key = peerIdToRoutingKey(peerId2)

    await expect(ipnsValidator(key, marshalledData)).to.eventually.be.rejected().with.property('code', ERRORS.ERR_INVALID_EMBEDDED_KEY)
  })

  it('should use validator.validate to verify that a record is not valid when the wrong key is embedded', async () => {
    const sequence = 0
    const validity = 1000000

    const entry = await ipns.create(peerId1, cid, sequence, validity)
    entry.pubKey = peerId2.publicKey
    const marshalledData = marshal(entry)

    const key = peerIdToRoutingKey(peerId1)

    await expect(ipnsValidator(key, marshalledData)).to.eventually.be.rejected().with.property('code', ERRORS.ERR_INVALID_EMBEDDED_KEY)
  })
})
