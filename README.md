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
  - [Extract public key from record](#extract-public-key-from-record)
  - [Marshal data with proto buffer](#marshal-data-with-proto-buffer)
  - [Unmarshal data from proto buffer](#unmarshal-data-from-proto-buffer)
- [API Docs](#api-docs)
  - [Namespace](#namespace)
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

const ipnsRecord = await ipns.createIPNSRecord(privateKey, value, sequenceNumber, lifetime)
```

### Validate record against public key

```js
import { validate } from 'ipns/validator'

await validate(publicKey, marshalledRecord)
// if no error thrown, the record is valid
```

### Validate record against routing key

This is useful when validating IPNS names that use RSA keys, whose public key is embedded in the record (rather than in the routing key as with Ed25519).

```js
import { ipnsValidator } from 'ipns/validator'

await ipnsValidator(routingKey, marshalledRecord)
```

### Extract public key from record

```js
import * as ipns from 'ipns'

const publicKey = await ipns.extractPublicKeyFromIPNSRecord(peerId, ipnsRecord)
```

### Marshal data with proto buffer

```js
import * as ipns from 'ipns'

const ipnsRecord = await ipns.createIPNSRecord(privateKey, value, sequenceNumber, lifetime)
// ...
const marshalledData = ipns.marshalIPNSRecord(ipnsRecord)
// ...
```

Returns the record data serialized.

### Unmarshal data from proto buffer

```js
import * as ipns from 'ipns'

const ipnsRecord = ipns.unmarshalIPNSRecord(storedData)
```

Returns the `IPNSRecord` after being deserialized.


## API Docs

- <https://ipfs.github.io/js-ipns>


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
