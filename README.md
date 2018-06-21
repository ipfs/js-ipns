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

ipns.create(privateKey, value, seqNumber, eol, (err, entryData) => {
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

ipns.getDatastoreKey(peerId);
```

Returns a key to be used for storing the ipns entry in the datastore according to the specs, that is:

```
/ipns/${base32(<HASH>)}
```

## API

#### Create record

```js

ipns.create(privateKey, value, sequenceNumber, eol, callback);
```

Create an IPNS record for being stored in a protocol buffer.

- `privateKey` (`PrivKey` RSA Instance): key to be used for cryptographic operations.
- `value` (string): ipfs path of the object to be published.
- `sequenceNumber` (Number): sequence number of the record.
- `eol` (string): end of life datetime of the record (according to RFC3339).
- `callback` (function): operation result.

#### Create record

```js

ipns.validate(publicKey, ipnsEntry, callback);
```

Create an IPNS record for being stored in a protocol buffer.

- `publicKey` (`PubKey` RSA Instance): key to be used for cryptographic operations.
- `ipnsEntry` (Object): ipns entry record (obtained using the create function).
- `callback` (function): operation result (if no error, validation successful).

#### Datastore key

```js
ipns.getDatastoreKey(peerId);
```

Get a key for storing the ipns entry in the datastore.

- `peerId` (`Uint8Array`): peer identifier.

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipns/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
