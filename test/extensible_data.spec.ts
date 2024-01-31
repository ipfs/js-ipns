/* eslint-env mocha */

import { generateKeyPair } from '@libp2p/crypto/keys'
import { peerIdFromKeys } from '@libp2p/peer-id'
import { expect } from 'aegir/chai'
import * as ipns from '../src/index.js'
import { IpnsEntry } from '../src/pb/ipns.js'
import type { PeerId } from '@libp2p/interface'
import { parseCborData } from "../src/utils.js"

const defaultCreateOptions: Object = {
  v1Compatible: true
}

describe('ipns extensible data', function () {
  this.timeout(20 * 1000)

  const contentPath = '/ipfs/bafkqae3imvwgy3zamzzg63janjzs22lqnzzqu'
  let peerId: PeerId

  before(async () => {
    const rsa = await generateKeyPair('RSA', 2048)
    peerId = await peerIdFromKeys(rsa.public.bytes, rsa.bytes)
  })



    it('should be able add a kv store to IPFS record', async () => {
        const sequence = 0
        const validity = 1000000

        let kv_data = {"KEY" : "VALUE"}
        const record = await ipns.create(peerId, contentPath, sequence, validity, defaultCreateOptions, { kv_data : kv_data })
        expect(record.pubKey).to.equalBytes(peerId.publicKey)

        let raw_parsed_cbor_data = parseCborData(record.data)
        let parsed_cbor_data = raw_parsed_cbor_data as any;


        // console.log("\nparsed_cbor_data")
        // console.log(raw_parsed_cbor_data)
        // console.log("\nrecord.data")
        // console.log(record.data)
        // console.log("Object.keys(parsed_cbor_data)")
        // console.log(Object.keys(raw_parsed_cbor_data))
        // console.log("raw_parsed_cbor_data.data")
        // // console.log(parsed_cbor_data) // Produces error, "Property 'data' does not exist on type 'IPNSRecordData'."
        // console.log("parsed_cbor_data.data")
        // console.log(parsed_cbor_data.data)
        // console.log("\n\n")
        // console.log(parsed_cbor_data.data)
        // console.log({ kv_data : kv_data })


        expect(parsed_cbor_data.data.kv_data.KEY).to.equal("VALUE")

        const pb = IpnsEntry.decode(ipns.marshal(record))
        expect(pb.pubKey).to.equalBytes(peerId.publicKey)
    })


    it('should be able add a raw object as kv store to IPFS record', async () => {
      const sequence = 0
      const validity = 1000000

      let kv_data = {
        "KEY" : "VALUE",
        "KEY2" : "VALUE2"
      }
      const record = await ipns.create(peerId, contentPath, sequence, validity, defaultCreateOptions, kv_data)
      expect(record.pubKey).to.equalBytes(peerId.publicKey)

      let raw_parsed_cbor_data = parseCborData(record.data)
      let parsed_cbor_data = raw_parsed_cbor_data as any;


      // console.log("\nparsed_cbor_data")
      // console.log(raw_parsed_cbor_data)
      // console.log("\nrecord.data")
      // console.log(record.data)
      // console.log("Object.keys(parsed_cbor_data)")
      // console.log(Object.keys(raw_parsed_cbor_data))
      // console.log("raw_parsed_cbor_data.data")
      // // console.log(parsed_cbor_data) // Produces error, "Property 'data' does not exist on type 'IPNSRecordData'."
      // console.log("parsed_cbor_data.data")
      // console.log(parsed_cbor_data.data)
      // console.log("\n\n")
      // console.log(parsed_cbor_data.data)
      // console.log({ kv_data : kv_data })


      expect(parsed_cbor_data.data.KEY).to.equal("VALUE")
      expect(parsed_cbor_data.data.KEY2).to.equal("VALUE2")

      const pb = IpnsEntry.decode(ipns.marshal(record))
      expect(pb.pubKey).to.equalBytes(peerId.publicKey)
  })



})