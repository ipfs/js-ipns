# IPNS

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![Matrix](https://img.shields.io/badge/matrix-%23ipfs%3Amatrix.org-blue.svg?style=flat-square)](https://matrix.to/#/#ipfs:matrix.org)
[![IRC](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Discord](https://img.shields.io/discord/475789330380488707?color=blueviolet&label=discord&style=flat-square)](https://discord.gg/24fmuwR)
[![standard-readme](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> ipns record definitions

This module contains all the necessary code for creating, understanding and validating IPNS records.

## Lead Maintainer

[Vasco Santos](https://github.com/vasco-santos).

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Create Record](#create-record)
  - [Validate Record](#validate-record)
  - [Embed public key to record](#embed-public-key-to-record)
  - [Extract public key from record](#extract-public-key-from-record)
  - [Datastore key](#datastore-key)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

### Install

> npm install ipns

## Usage

#### Create record

```js
const ipns = require('ipns')

const entryData = await ipns.create(privateKey, value, sequenceNumber, lifetime)
```

#### Validate record

```js
const ipns = require('ipns')

await ipns.validate(publicKey, ipnsEntry)
// if no error thrown, the record is valid
```

#### Embed public key to record

```js
const ipns = require('ipns')

const ipnsEntryWithEmbedPublicKey = await ipns.embedPublicKey(publicKey, ipnsEntry)
```

#### Extract public key from record

```js
const ipns = require('ipns')

const publicKey = ipns.extractPublicKey(peerId, ipnsEntry)
```

#### Datastore key

```js
const ipns = require('ipns')

ipns.getLocalKey(peerId)
```

Returns a key to be used for storing the ipns entry locally, that is:

```
/ipns/${base32(<HASH>)}
```

#### Marshal data with proto buffer

```js
const ipns = require('ipns')

const entryData = await ipns.create(privateKey, value, sequenceNumber, lifetime)
// ...
const marshalledData = ipns.marshal(entryData)
// ...
```

Returns the entry data serialized.

#### Unmarshal data from proto buffer

```js
const ipns = require('ipns')

const data = ipns.unmarshal(storedData)
```

Returns the entry data structure after being serialized.

#### Validator

```js
const ipns = require('ipns')

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
- `value` (string): ipfs path of the object to be published.
- `sequenceNumber` (Number): number representing the current version of the record.
- `lifetime` (string): lifetime of the record (in milliseconds).

Returns a `Promise` that resolves to an object with the entry's properties eg:
  
```js
{
  value: '/ipfs/QmWEekX7EZLUd9VXRNMRXW3LXe4F6x7mB8oPxY5XLptrBq',
  signature: Buffer,
  validityType: 0,
  validity: '2018-06-27T14:49:14.074000000Z',
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

- `storedData` (Buffer): ipns entry record serialized.

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

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

Copyright (c) Protocol Labs, Inc. under the **MIT License**. See [LICENSE file](./LICENSE) for details.
