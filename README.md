# ipns

[![ipfs.tech](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](https://ipfs.tech)
[![Discuss](https://img.shields.io/discourse/https/discuss.ipfs.tech/posts.svg?style=flat-square)](https://discuss.ipfs.tech)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipns.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipns)
[![CI](https://img.shields.io/github/actions/workflow/status/ipfs/js-ipns/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/ipfs/js-ipns/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> IPNS record definitions

# About

<!--

!IMPORTANT!

Everything in this README between "# About" and "# Install" is automatically
generated and will be overwritten the next time the doc generator is run.

To make changes to this section, please update the @packageDocumentation section
of src/index.js or src/index.ts

To experiment with formatting, please run "npm run docs" from the root of this
repo and examine the changes made.

-->

Implements parsing and serialization of [IPNS Records](https://specs.ipfs.tech/ipns/ipns-record/).

## Example - Create record

```TypeScript
import { createIPNSRecord } from 'ipns'
import { generateKeyPair } from '@libp2p/crypto/keys'

const privateKey = await generateKeyPair('Ed25519')
const value = 'hello world'
const sequenceNumber = 0
const lifetime = 3_600_000 // ms, e.g. one hour

const ipnsRecord = await createIPNSRecord(privateKey, value, sequenceNumber, lifetime)
```

## Example - Validate record against public key

```TypeScript
import { validate } from 'ipns/validator'
import { generateKeyPair } from '@libp2p/crypto/keys'

const privateKey = await generateKeyPair('Ed25519')
const publicKey = privateKey.publicKey
const marshalledRecord = Uint8Array.from([0, 1, 2, 3])

await validate(publicKey, marshalledRecord)
// if no error thrown, the record is valid
```

## Example - Validate record against routing key

This is useful when validating IPNS names that use RSA keys, whose public key is embedded in the record (rather than in the routing key as with Ed25519).

```TypeScript
import { ipnsValidator } from 'ipns/validator'
import { multihashToIPNSRoutingKey } from 'ipns'
import { generateKeyPair } from '@libp2p/crypto/keys'

const privateKey = await generateKeyPair('Ed25519')
const routingKey = multihashToIPNSRoutingKey(privateKey.publicKey.toMultihash())
const marshalledRecord = Uint8Array.from([0, 1, 2, 3])

await ipnsValidator(routingKey, marshalledRecord)
```

## Example - Extract public key from record

```TypeScript
import { extractPublicKeyFromIPNSRecord, createIPNSRecord } from 'ipns'
import { generateKeyPair } from '@libp2p/crypto/keys'

const privateKey = await generateKeyPair('Ed25519')
const record = await createIPNSRecord(privateKey, 'hello world', 0, 3_600_000)

const publicKey = await extractPublicKeyFromIPNSRecord(record)
```

## Example - Marshal data with proto buffer

```TypeScript
import { createIPNSRecord, marshalIPNSRecord } from 'ipns'
import { generateKeyPair } from '@libp2p/crypto/keys'

const privateKey = await generateKeyPair('Ed25519')
const record = await createIPNSRecord(privateKey, 'hello world', 0, 3_600_000)
// ...
const marshalledData = marshalIPNSRecord(record)
// ...
```

Returns the record data serialized.

## Example - Unmarshal data from proto buffer

```TypeScript
import { unmarshalIPNSRecord } from 'ipns'

const storedData = Uint8Array.from([0, 1, 2, 3, 4])
const ipnsRecord = unmarshalIPNSRecord(storedData)
```

Returns the `IPNSRecord` after being deserialized.

# Install

```console
$ npm i ipns
```

## Browser `<script>` tag

Loading this module through a script tag will make its exports available as `Ipns` in the global namespace.

```html
<script src="https://unpkg.com/ipns/dist/index.min.js"></script>
```

# API Docs

- <https://ipfs.github.io/js-ipns>

# License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](https://github.com/ipfs/js-ipns/LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](https://github.com/ipfs/js-ipns/LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

# Contribute

Contributions welcome! Please check out [the issues](https://github.com/ipfs/js-ipns/issues).

Also see our [contributing document](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md) for more information on how we work, and about contributing in general.

Please be aware that all interactions related to this repo are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)
