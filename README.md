# ipns <!-- omit in toc -->

[![ipfs.tech](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](https://ipfs.tech)
[![Discuss](https://img.shields.io/discourse/https/discuss.ipfs.tech/posts.svg?style=flat-square)](https://discuss.ipfs.tech)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipns.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipns)
[![CI](https://img.shields.io/github/actions/workflow/status/ipfs/js-ipns/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/ipfs/js-ipns/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> IPNS Record definitions

## Table of contents <!-- omit in toc -->

- [Install](#install)
  - [Browser `<script>` tag](#browser-script-tag)
- [Usage](#usage)
  - [Create record](#create-record)
  - [Validate record](#validate-record)
  - [Embed public key to record](#embed-public-key-to-record)
  - [Extract public key from record](#extract-public-key-from-record)
  - [Datastore key](#datastore-key)
  - [Marshal data with proto buffer](#marshal-data-with-proto-buffer)
  - [Unmarshal data from proto buffer](#unmarshal-data-from-proto-buffer)
  - [Validator](#validator)
- [API](#api)
  - [Create record](#create-record-1)
  - [Validate record](#validate-record-1)
  - [Marshal data with proto buffer](#marshal-data-with-proto-buffer-1)
  - [Unmarshal data from proto buffer](#unmarshal-data-from-proto-buffer-1)
  - [Extract public key from record](#extract-public-key-from-record-1)
  - [Namespace](#namespace)
- [API Docs](#api-docs)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i ipns
```

### Browser `<script>` tag

Loading this module through a script tag will make it's exports available as `Ipns` in the global namespace.

```html
<script src="https://unpkg.com/ipns/dist/index.min.js"></script>
```

This module contains all the necessary code for creating, understanding and validating IPNS records.

## Usage

### Create record

```js
import * as ipns from 'ipns'

const ipnsRecord = await ipns.create(privateKey, value, sequenceNumber, lifetime)
```

### Validate record

```js
import * as ipns from 'ipns'

await ipns.validate(publicKey, marshalledData)
// if no error thrown, the record is valid
```

### Embed public key to record

```js
import * as ipns from 'ipns'

const ipnsRecordWithEmbeddedPublicKey = await ipns.embedPublicKey(publicKey, ipnsRecord)
```

### Extract public key from record

```js
import * as ipns from 'ipns'

const publicKey = await ipns.extractPublicKey(peerId, ipnsRecord)
```

### Datastore key

```js
import * as ipns from 'ipns'

ipns.getLocalKey(peerId)
```

Returns a key to be used for storing the IPNS record locally, that is:

```
/ipns/${base32(<HASH>)}
```

### Marshal data with proto buffer

```js
import * as ipns from 'ipns'

const ipnsRecord = await ipns.create(privateKey, value, sequenceNumber, lifetime)
// ...
const marshalledData = ipns.marshal(ipnsRecord)
// ...
```

Returns the record data serialized.

### Unmarshal data from proto buffer

```js
import * as ipns from 'ipns'

const ipnsRecord = ipns.unmarshal(storedData)
```

Returns the `IPNSRecord` after being deserialized.

### Validator

```js
import * as ipns from 'ipns'

const validator = ipns.validator
```

Contains an object with `validate (marshalledData, key)` and `select (dataA, dataB)` functions.

The `validate` async function aims to verify if an IPNS record is valid. First the record is unmarshalled, then the public key is obtained and finally the record is validated (`signatureV2` of CBOR `data` is verified).

The `select` function is responsible for deciding which IPNS record is the best (newer) between two records. Both records are unmarshalled and their sequence numbers are compared. If the first record provided is the newer, the operation result will be `0`, otherwise the operation result will be `1`.

## API

### Create record

```js

ipns.create(privateKey, value, sequenceNumber, lifetime, options)
```

Create an IPNS record for being stored in a protocol buffer.

- `privateKey` ([PrivateKey](https://libp2p.github.io/js-libp2p/interfaces/_libp2p_interface.keys.PrivateKey.html)): key to be used for cryptographic operations.
- `value` (string): IPFS path of the object to be published.
- `sequenceNumber` (Number): number representing the current version of the record.
- `lifetime` (Number): lifetime of the record (in milliseconds).
- `options` (CreateOptions): additional creation options.

Returns a `Promise` that resolves to an object with a `IPNSRecord`.

### Validate record

```js
ipns.validate(publicKey, ipnsRecord)
```

Validate an IPNS record previously stored in a protocol buffer.

- `publicKey` ([PublicKey](https://libp2p.github.io/js-libp2p/interfaces/_libp2p_interface.keys.PublicKey.html)): key to be used for cryptographic operations.
- `ipnsRecord` (`IPNSRecord`): IPNS record (obtained using the create function).

Returns a `Promise`, which may be rejected if the validation was not successful.

### Marshal data with proto buffer

```js
const marshalledData = ipns.marshal(ipnsRecord)
```

Returns the serialized IPNS record.

- `ipnsRecord` (`IPNSRecord`): ipns record (obtained using the create function).

### Unmarshal data from proto buffer

```js
const data = ipns.unmarshal(storedData)
```

Returns a `IPNSRecord` after being serialized.

- `storedData` (Uint8Array): ipns record serialized.

### Extract public key from record

```js
const publicKey = await ipns.extractPublicKey(peerId, ipnsRecord)
```

Extract a public key from an IPNS record.

- `peerId` ([PeerId](https://libp2p.github.io/js-libp2p/types/_libp2p_interface.peer_id.PeerId.html)): peer identifier object.
- `ipnsRecord` (`IPNSRecord`): ipns record (obtained using the create function).

Returns a `Promise` which resolves to public key ([`PublicKey`](https://github.com/libp2p/js-libp2p-interfaces/blob/master/packages/interface-keys/src/index.ts) ): may be used for cryptographic operations.

### Namespace

Namespace constants for records.

```js
ipns.namespace

// '/ipns/'
```

```js
ipns.namespaceLength

// 6
```

## API Docs

- <https://ipfs.github.io/js-ipns>

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Contributions welcome! Please check out [the issues](https://github.com/ipfs/js-ipns/issues).

Also see our [contributing document](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md) for more information on how we work, and about contributing in general.

Please be aware that all interactions related to this repo are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)
