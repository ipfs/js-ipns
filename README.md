# IPNS

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
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

ipns.create(privateKey, value, sequenceNumber, lifetime, (err, entryData) => {
  // your code goes here
});
```

#### Validate record

```js
const ipns = require('ipns')

ipns.validate(publicKey, ipnsEntry, (err) => {
  // your code goes here
  // if no error, the record is valid
});
```

#### Embed public key to record

> Not available yet

#### Extract public key from record

> Not available yet

#### Datastore key

```js
const ipns = require('ipns')

ipns.getLocalKey(peerId);
```

Returns a key to be used for storing the ipns entry locally, that is:

```
/ipns/${base32(<HASH>)}
```

#### Marshal data with proto buffer

```js
const ipns = require('ipns')

ipns.create(privateKey, value, sequenceNumber, lifetime, (err, entryData) => {
  // ...
  const marshalledData = ipns.marshal(entryData)
  // ...
});
```

Returns the entry data serialized.

#### Unmarshal data from proto buffer

```js
const ipns = require('ipns')

const data = ipns.unmarshal(storedData)
```

Returns the entry data structure after being serialized.

## API

#### Create record

```js

ipns.create(privateKey, value, sequenceNumber, lifetime, [callback]);
```

Create an IPNS record for being stored in a protocol buffer.

- `privateKey` (`PrivKey` [RSA Instance](https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/rsa-class.js)): key to be used for cryptographic operations.
- `value` (string): ipfs path of the object to be published.
- `sequenceNumber` (Number): number representing the current version of the record.
- `lifetime` (string): lifetime of the record (in milliseconds).
- `callback` (function): operation result.

`callback` must follow `function (err, ipnsEntry) {}` signature, where `err` is an error if the operation was not successful. `ipnsEntry` is an object that contains the entry's properties, such as:
  
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

ipns.validate(publicKey, ipnsEntry, [callback]);
```

Validate an IPNS record previously stored in a protocol buffer.

- `publicKey` (`PubKey` [RSA Instance](https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/rsa-class.js)): key to be used for cryptographic operations.
- `ipnsEntry` (Object): ipns entry record (obtained using the create function).
- `callback` (function): operation result.

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful. This way, if no error, the validation was successful.

#### Datastore key

```js
ipns.getDatastoreKey(peerId);
```

Get a key for storing the ipns entry in the datastore.

- `peerId` (`Uint8Array`): peer identifier.

#### Marshal data with proto buffer

```js
const marshalledData = ipns.marshal(entryData)
});
```

Returns the entry data serialized.

- `entryData` (Object): ipns entry record (obtained using the create function).

#### Unmarshal data from proto buffer

```js
const data = ipns.unmarshal(storedData)
```

Returns the entry data structure after being serialized.

- `storedData` (Buffer): ipns entry record serialized.

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipns/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

Copyright (c) Protocol Labs, Inc. under the **MIT**. See [MIT](./LICENSE) for details.
