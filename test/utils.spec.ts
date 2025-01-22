import { peerIdFromString } from '@libp2p/peer-id'
import { expect } from 'aegir/chai'
import { CID } from 'multiformats/cid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { normalizeValue, multihashFromIPNSRoutingKey, multihashToIPNSRoutingKey, normalizeByteValue } from '../src/utils.js'
import type { PeerId } from '@libp2p/interface'

describe('utils', () => {
  describe('normalizeValue', () => {
    const cases: Record<string, { input: any, output: string }> = {
      // CID input
      'v0 CID': {
        input: CID.parse('QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq'),
        output: '/ipfs/bafybeidvkqhl6dwsdzx5km7tupo33ywt7czkl5topwogxx6lybko2d7pua'
      },
      'v1 CID': {
        input: CID.parse('bafybeidvkqhl6dwsdzx5km7tupo33ywt7czkl5topwogxx6lybko2d7pua'),
        output: '/ipfs/bafybeidvkqhl6dwsdzx5km7tupo33ywt7czkl5topwogxx6lybko2d7pua'
      },
      'v1 Libp2p Key CID': {
        input: CID.parse('bafzaajqaeqeaceralaazlm56u23dyhpm7ztoo5x4dcus2ghpqwedhoezk4h6yijbl6rq'),
        output: '/ipns/k73ap3wtp70r7cd9ofyhwgogv1j96huvtvfnsof5spyfaaopkxmonumi4fckgguqr'
      },

      // path input
      '/ipfs/CID path': {
        input: '/ipfs/QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq/docs/readme.md',
        output: '/ipfs/QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq/docs/readme.md'
      },
      '/ipns/CID path': {
        input: '/ipns/k51qzi5uqu5djni72pr40dt64kxlh0zb8baat8h7dtdvkov66euc2lho0oidr3',
        output: '/ipns/k51qzi5uqu5djni72pr40dt64kxlh0zb8baat8h7dtdvkov66euc2lho0oidr3'
      },

      // peer id input
      'Ed25519 PeerId': {
        input: peerIdFromString('12D3KooWKBpVwnRACfEsk6QME7dA5CZnFYVHQ7Zc927BEzuUekQe'),
        output: '/ipns/k51qzi5uqu5djni72pr40dt64kxlh0zb8baat8h7dtdvkov66euc2lho0oidr3'
      },
      'secp256k1 PeerId': {
        input: peerIdFromString('16Uiu2HAkyBsAs6fPyJYVNq3pUDFxyFnUPTQYL2JpLMEViMUwEnp2'),
        output: '/ipns/kzwfwjn5ji4pul2d7gonydo4rtncuequd647001hm1afmxxvhfs1pz9ckfrc1c3'
      },
      'RSA PeerId': {
        input: peerIdFromString('QmPofjNRgPN3ndH5RbcSr3X5EekvpCRsUw1E8ji8kJaQJa'),
        output: '/ipns/k2k4r8jyk192oxg2e40x4av8re5e6frptftrwrhu6k1ia6whqsew13f3'
      },

      // string input
      'string path': {
        input: '/hello',
        output: '/hello'
      }
    }

    Object.entries(cases).forEach(([name, { input, output }]) => {
      it(`should normalize a ${name}`, async () => {
        expect(normalizeValue(await input)).to.equal(output)
      })
    })
  })

  describe('normalizeByteValue', () => {
    const cases: Record<string, { input: Uint8Array, output: string }> = {
      // Uint8Array input
      'v0 CID bytes': {
        input: CID.parse('QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq').bytes,
        output: '/ipfs/bafybeidvkqhl6dwsdzx5km7tupo33ywt7czkl5topwogxx6lybko2d7pua'
      },
      'v1 CID bytes': {
        input: CID.parse('bafybeidvkqhl6dwsdzx5km7tupo33ywt7czkl5topwogxx6lybko2d7pua').bytes,
        output: '/ipfs/bafybeidvkqhl6dwsdzx5km7tupo33ywt7czkl5topwogxx6lybko2d7pua'
      },
      'v1 Libp2p Key CID bytes': {
        input: CID.parse('bafzaajqaeqeaceralaazlm56u23dyhpm7ztoo5x4dcus2ghpqwedhoezk4h6yijbl6rq').bytes,
        output: '/ipfs/bafzaajqaeqeaceralaazlm56u23dyhpm7ztoo5x4dcus2ghpqwedhoezk4h6yijbl6rq'
      },
      'string path Uint8Array': {
        input: uint8ArrayFromString('/hello'),
        output: '/hello'
      },
      'IPFS path v0 CID Uint8Array': {
        input: uint8ArrayFromString('/ipfs/QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq'),
        output: '/ipfs/QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq'
      },
      'IPFS path v1 CID Uint8Array': {
        input: uint8ArrayFromString('/ipfs/bafybeidvkqhl6dwsdzx5km7tupo33ywt7czkl5topwogxx6lybko2d7pua'),
        output: '/ipfs/bafybeidvkqhl6dwsdzx5km7tupo33ywt7czkl5topwogxx6lybko2d7pua'
      },
      'IPFS path v1 Libp2p Key CID Uint8Array': {
        input: uint8ArrayFromString('/ipfs/bafzaajqaeqeaceralaazlm56u23dyhpm7ztoo5x4dcus2ghpqwedhoezk4h6yijbl6rq'),
        output: '/ipfs/bafzaajqaeqeaceralaazlm56u23dyhpm7ztoo5x4dcus2ghpqwedhoezk4h6yijbl6rq'
      }
    }

    Object.entries(cases).forEach(([name, { input, output }]) => {
      it(`should normalize a ${name}`, () => {
        expect(normalizeByteValue(input)).to.equal(output)
      })
    })
  })

  describe('routing keys', () => {
    const cases: Record<string, PeerId> = {
      Ed25519: peerIdFromString('12D3KooWKBpVwnRACfEsk6QME7dA5CZnFYVHQ7Zc927BEzuUekQe'),
      secp256k1: peerIdFromString('16Uiu2HAkyBsAs6fPyJYVNq3pUDFxyFnUPTQYL2JpLMEViMUwEnp2'),
      RSA: peerIdFromString('QmPofjNRgPN3ndH5RbcSr3X5EekvpCRsUw1E8ji8kJaQJa')
    }

    Object.entries(cases).forEach(([name, input]) => {
      it(`should round trip a ${name} key`, async () => {
        const key = multihashToIPNSRoutingKey(input.toMultihash())
        const output = multihashFromIPNSRoutingKey(key)

        expect(input.toMultihash().bytes).to.equalBytes(output.bytes)
      })
    })
  })
})
