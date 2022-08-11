# ipns <!-- omit in toc -->

[![ipfs.io](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io)
[![IRC](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Discord](https://img.shields.io/discord/806902334369824788?style=flat-square)](https://discord.gg/ipfs)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipns.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipns)
[![CI](https://img.shields.io/github/workflow/status/ipfs/js-ipns/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/ipfs/js-ipns/actions/workflows/js-test-and-release.yml)

> ipns record definitions

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Lead Maintainer <!-- omit in toc -->](#lead-maintainer----omit-in-toc---)
- [Usage](#usage)
  - - [Create record](#create-record)
    - [Validate record](#validate-record)
    - [Embed public key to record](#embed-public-key-to-record)
    - [Extract public key from record](#extract-public-key-from-record)
    - [Datastore key](#datastore-key)
    - [Marshal data with proto buffer](#marshal-data-with-proto-buffer)
    - [Unmarshal data from proto buffer](#unmarshal-data-from-proto-buffer)
    - [Validator](#validator)
- [API](#api)
  - - [Create record](#create-record-1)
    - [Validate record](#validate-record-1)
    - [Datastore key](#datastore-key-1)
    - [Marshal data with proto buffer](#marshal-data-with-proto-buffer-1)
    - [Unmarshal data from proto buffer](#unmarshal-data-from-proto-buffer-1)
    - [Embed public key to record](#embed-public-key-to-record-1)
    - [Extract public key from record](#extract-public-key-from-record-1)
    - [Namespace](#namespace)
- [Contribute](#contribute)
- [License](#license)
- [Contribute](#contribute-1)

## Install

```console
$ npm i ipns
```

This module contains all the necessary code for creating, understanding and validating IPNS records.

## Lead Maintainer <!-- omit in toc -->

[Vasco Santos](https://github.com/vasco-santos).

## Usage

#### Create record

```js
import * as ipns from 'ipns'

const entryData = await ipns.create(privateKey, value, sequenceNumber, lifetime)
```

#### Validate record

```js
import * as ipns from 'ipns'

await ipns.validate(publicKey, ipnsEntry)
// if no error thrown, the record is valid
```

#### Embed public key to record

```js
import * as ipns from 'ipns'

const ipnsEntryWithEmbedPublicKey = await ipns.embedPublicKey(publicKey, ipnsEntry)
```

#### Extract public key from record

```js
import * as ipns from 'ipns'

const publicKey = ipns.extractPublicKey(peerId, ipnsEntry)
```

#### Datastore key

```js
import * as ipns from 'ipns'

ipns.getLocalKey(peerId)
```

Returns a key to be used for storing the ipns entry locally, that is:

    /ipns/${base32(<HASH>)}

#### Marshal data with proto buffer

```js
import * as ipns from 'ipns'

const entryData = await ipns.create(privateKey, value, sequenceNumber, lifetime)
// ...
const marshalledData = ipns.marshal(entryData)
// ...
```

Returns the entry data serialized.

#### Unmarshal data from proto buffer

```js
import * as ipns from 'ipns'

const data = ipns.unmarshal(storedData)
```

Returns the entry data structure after being serialized.

#### Validator

```js
import * as ipns from 'ipns'

const validator = ipns.validator
```

Contains an object with `validate (marshalledData, key)` and `select (dataA, dataB)` functions.

The `validate` async function aims to verify if an IPNS record is valid. First the record is unmarshalled, then the public key is obtained and finally the record is validated (signature and validity are verified).

The `select` function is responsible for deciding which ipns record is the best (newer) between two records. Both records are unmarshalled and their sequence numbers are compared. If the first record provided is the newer, the operation result will be `0`, otherwise the operation result will be `1`.

## API

#### Create record

```js

ipns.create(privateKey, value, sequenceNumber, lifetime)
```

Create an IPNS record for being stored in a protocol buffer.

- `privateKey` (`PrivKey` [RSA Instance](https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/rsa-class.js)): key to be used for cryptographic operations.
- `value` (Uint8Array): ipfs path of the object to be published.
- `sequenceNumber` (Number): number representing the current version of the record.
- `lifetime` (Number): lifetime of the record (in milliseconds).

Returns a `Promise` that resolves to an object with the entry's properties eg:

```js
{
  value: Uint8Array,
  signature: Uint8Array,
  validityType: 0,
  validity: Uint8Array,
  sequence: 2
}
```

#### Validate record

```js
ipns.validate(publicKey, ipnsEntry)
```

Validate an IPNS record previously stored in a protocol buffer.

- `publicKey` (`PubKey` [RSA Instance](https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/rsa-class.js)): key to be used for cryptographic operations.
- `ipnsEntry` (Object): ipns entry record (obtained using the create function).

Returns a `Promise`, which may be rejected if the validation was not successful.

#### Datastore key

```js
ipns.getDatastoreKey(peerId)
```

Get a key for storing the ipns entry in the datastore.

- `peerId` (`Uint8Array`): peer identifier.

#### Marshal data with proto buffer

```js
const marshalledData = ipns.marshal(entryData)
```

Returns the entry data serialized.

- `entryData` (Object): ipns entry record (obtained using the create function).

#### Unmarshal data from proto buffer

```js
const data = ipns.unmarshal(storedData)
```

Returns the entry data structure after being serialized.

- `storedData` (Uint8Array): ipns entry record serialized.

#### Embed public key to record

```js
const recordWithPublicKey = await ipns.embedPublicKey(publicKey, ipnsEntry)
```

Embed a public key in an IPNS entry. If it is possible to extract the public key from the `peer-id`, there is no need to embed.

- `publicKey` (`PubKey` [RSA Instance](https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/rsa-class.js)): key to be used for cryptographic operations.
- `ipnsEntry` (Object): ipns entry record (obtained using the create function).

Returns a `Promise`. If the promise resolves to null it means the public key can be extracted directly from the `peer-id`.

#### Extract public key from record

```js
ipns.extractPublicKey(peerId, ipnsEntry, [callback])
```

Extract a public key from an IPNS entry.

- `peerId` (`PeerId` [Instance](https://github.com/libp2p/js-peer-id)): peer identifier object.
- `ipnsEntry` (Object): ipns entry record (obtained using the create function).

The returned public key (`PubKey` [RSA Instance](https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/rsa-class.js)): may be used for cryptographic operations.

#### Namespace

Namespace constants for records.

```js
ipns.namespace

// '/ipns/'
```

```js
ipns.namespaceLength

// 6
```

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipns/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs-unixfs-importer/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)
