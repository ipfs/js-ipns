## [0.13.3](https://github.com/ipfs/js-ipns/compare/v0.13.2...v0.13.3) (2021-08-11)


### Bug Fixes

* cbor keys should be pascal case ([#128](https://github.com/ipfs/js-ipns/issues/128)) ([1f8bcd3](https://github.com/ipfs/js-ipns/commit/1f8bcd379a7ba37daef0ceefc1ef69f4c15dab63))



## [0.13.2](https://github.com/ipfs/js-ipns/compare/v0.12.0...v0.13.2) (2021-07-12)


### Bug Fixes

* parse peer id from message correctly ([#127](https://github.com/ipfs/js-ipns/issues/127)) ([d7c8e51](https://github.com/ipfs/js-ipns/commit/d7c8e51c1505b1d75ef800d65c8896a3fe66d6d5))


### chore

* update deps ([#126](https://github.com/ipfs/js-ipns/issues/126)) ([063fc85](https://github.com/ipfs/js-ipns/commit/063fc85f831a33ebcbda45e2a9526712cc327d8c))


### BREAKING CHANGES

* uses new peer-id class and supporting ecosystem modules



## [0.13.1](https://github.com/ipfs/js-ipns/compare/v0.13.0...v0.13.1) (2021-07-10)



# [0.13.0](https://github.com/ipfs/js-ipns/compare/v0.12.0...v0.13.0) (2021-07-09)


### chore

* update deps ([#126](https://github.com/ipfs/js-ipns/issues/126)) ([063fc85](https://github.com/ipfs/js-ipns/commit/063fc85f831a33ebcbda45e2a9526712cc327d8c))


### BREAKING CHANGES

* uses new peer-id class and supporting ecosystem modules



# [0.12.0](https://github.com/ipfs/js-ipns/compare/v0.11.0...v0.12.0) (2021-06-10)


### Features

* validate v2 ipns signatures ([#121](https://github.com/ipfs/js-ipns/issues/121)) ([d1421f9](https://github.com/ipfs/js-ipns/commit/d1421f9389961ac6bf7b0ab4d80442fd7b78c14f))



# [0.11.0](https://github.com/ipfs/js-ipns/compare/v0.10.2...v0.11.0) (2021-04-21)


### Bug Fixes

* ipns validate should return void ([#118](https://github.com/ipfs/js-ipns/issues/118)) ([67d0ad4](https://github.com/ipfs/js-ipns/commit/67d0ad40d10fced861b7b4825882f648b64528f1))
* specify pbjs root ([#119](https://github.com/ipfs/js-ipns/issues/119)) ([7cad961](https://github.com/ipfs/js-ipns/commit/7cad9611f87566047bc9e104be28970a877e9861))


### BREAKING CHANGES

* ipns validate function returns a void promise instead of boolean promise



## [0.10.2](https://github.com/ipfs/js-ipns/compare/v0.10.1...v0.10.2) (2021-04-15)



## [0.10.1](https://github.com/ipfs/js-ipns/compare/v0.10.0...v0.10.1) (2021-04-13)


### Bug Fixes

* encode ipns key correctly ([#115](https://github.com/ipfs/js-ipns/issues/115)) ([a10889c](https://github.com/ipfs/js-ipns/commit/a10889c9bb0fdcb644081e7861d8a563249c6fd1))



# [0.10.0](https://github.com/ipfs/js-ipns/compare/v0.9.1...v0.10.0) (2021-03-10)


### Bug Fixes

* remove value ambiguity ([#109](https://github.com/ipfs/js-ipns/issues/109)) ([5c589da](https://github.com/ipfs/js-ipns/commit/5c589da247d3103b2753eb435110ea6688e7bfa0))


### BREAKING CHANGES

* strings are no longer accepted as valid values to publish



## [0.9.1](https://github.com/ipfs/js-ipns/compare/v0.9.0...v0.9.1) (2021-03-09)


### Bug Fixes

* add files list to package.json ([#108](https://github.com/ipfs/js-ipns/issues/108)) ([e990d8b](https://github.com/ipfs/js-ipns/commit/e990d8b3914f71356d5df3a8e3ad48eab4c05561))



# [0.9.0](https://github.com/ipfs/js-ipns/compare/v0.8.2...v0.9.0) (2021-03-05)


### Features

* add types ([#106](https://github.com/ipfs/js-ipns/issues/106)) ([135552b](https://github.com/ipfs/js-ipns/commit/135552b3e0bcaa1b625d2b6789ff481e40b1c107))



## [0.8.2](https://github.com/ipfs/js-ipns/compare/v0.8.1...v0.8.2) (2021-01-19)



## [0.8.1](https://github.com/ipfs/js-ipns/compare/v0.8.0...v0.8.1) (2020-12-22)



<a name="0.8.0"></a>
# [0.8.0](https://github.com/ipfs/js-ipns/compare/v0.7.4...v0.8.0) (2020-08-14)


### Bug Fixes

* replace node buffers with uint8arrays ([#67](https://github.com/ipfs/js-ipns/issues/67)) ([06ee535](https://github.com/ipfs/js-ipns/commit/06ee535))


### BREAKING CHANGES

* - All deps of this module use Uint8Arrays instead of Buffers
- value and validity fields of IPNSEntries are now Uint8Arrays instead
  of Strings as they are `bytes` in the protobuf definition



<a name="0.7.4"></a>
## [0.7.4](https://github.com/ipfs/js-ipns/compare/v0.7.3...v0.7.4) (2020-08-06)



<a name="0.7.3"></a>
## [0.7.3](https://github.com/ipfs/js-ipns/compare/v0.7.2...v0.7.3) (2020-06-22)


### Bug Fixes

* key encoding ([#48](https://github.com/ipfs/js-ipns/issues/48)) ([7c6c672](https://github.com/ipfs/js-ipns/commit/7c6c672)), closes [ipfs/js-ipfs#2930](https://github.com/ipfs/js-ipfs/issues/2930)



<a name="0.7.2"></a>
## [0.7.2](https://github.com/ipfs/js-ipns/compare/v0.7.1...v0.7.2) (2020-05-12)


### Bug Fixes

* **ci:** add empty commit to fix lint checks on master ([929525f](https://github.com/ipfs/js-ipns/commit/929525f))



<a name="0.7.1"></a>
## [0.7.1](https://github.com/ipfs/js-ipns/compare/v0.7.0...v0.7.1) (2020-04-24)


### Bug Fixes

* add buffer and use multibase ([#34](https://github.com/ipfs/js-ipns/issues/34)) ([26eec66](https://github.com/ipfs/js-ipns/commit/26eec66))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ipfs/js-ipns/compare/v0.6.1...v0.7.0) (2019-12-18)


### Bug Fixes

* remove unused left-pad ([#30](https://github.com/ipfs/js-ipns/issues/30)) ([2ab0fbd](https://github.com/ipfs/js-ipns/commit/2ab0fbd))



<a name="0.6.1"></a>
## [0.6.1](https://github.com/ipfs/js-ipns/compare/v0.6.0...v0.6.1) (2019-09-25)



<a name="0.6.0"></a>
# [0.6.0](https://github.com/ipfs/js-ipns/compare/v0.5.2...v0.6.0) (2019-07-19)


### Chores

* convert from callbacks to async ([#19](https://github.com/ipfs/js-ipns/issues/19)) ([89e9903](https://github.com/ipfs/js-ipns/commit/89e9903))


### BREAKING CHANGES

* All places in the API that used callbacks are now replaced with async/await



<a name="0.5.2"></a>
## [0.5.2](https://github.com/ipfs/js-ipns/compare/v0.5.1...v0.5.2) (2019-05-23)


### Bug Fixes

* month in RFC3339 util ([94bd20d](https://github.com/ipfs/js-ipns/commit/94bd20d))
* remove leftpad ([#22](https://github.com/ipfs/js-ipns/issues/22)) ([e04babc](https://github.com/ipfs/js-ipns/commit/e04babc))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/ipfs/js-ipns/compare/v0.4.4...v0.5.1) (2019-04-03)


### Bug Fixes

* reduce bundle size ([#17](https://github.com/ipfs/js-ipns/issues/17)) ([a978c7d](https://github.com/ipfs/js-ipns/commit/a978c7d))
* verify public key exists in validator ([#21](https://github.com/ipfs/js-ipns/issues/21)) ([602e27f](https://github.com/ipfs/js-ipns/commit/602e27f))


### BREAKING CHANGES

* method createWithExpiration signature changed

expiration param changed from time of the record (in nanoseconds) to datetime for record in the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision



<a name="0.5.0"></a>
## [0.5.0](https://github.com/ipfs/js-ipns/compare/v0.4.4...v0.5.0) (2019-01-10)


### Bug Fixes

* reduce bundle size ([#17](https://github.com/ipfs/js-ipns/issues/17)) ([a978c7d](https://github.com/ipfs/js-ipns/commit/a978c7d))


### BREAKING CHANGES

* method createWithExpiration signature changed

expiration param changed from time of the record (in nanoseconds) to datetime for record in the [RFC3339]{@link https://www.ietf.org/rfc/rfc3339.txt} with nanoseconds precision



<a name="0.4.4"></a>
## [0.4.4](https://github.com/ipfs/js-ipns/compare/v0.4.3...v0.4.4) (2019-01-04)



<a name="0.4.3"></a>
## [0.4.3](https://github.com/ipfs/js-ipns/compare/v0.4.2...v0.4.3) (2018-11-30)



<a name="0.4.2"></a>
## [0.4.2](https://github.com/ipfs/js-ipns/compare/v0.4.1...v0.4.2) (2018-11-29)


### Bug Fixes

* validator select should return if no callback ([#15](https://github.com/ipfs/js-ipns/issues/15)) ([0845877](https://github.com/ipfs/js-ipns/commit/0845877))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/ipfs/js-ipns/compare/v0.4.0...v0.4.1) (2018-11-26)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipfs/js-ipns/compare/v0.3.0...v0.4.0) (2018-11-16)


### Bug Fixes

* validator should create peer id ([#13](https://github.com/ipfs/js-ipns/issues/13)) ([e1c1332](https://github.com/ipfs/js-ipns/commit/e1c1332))


### BREAKING CHANGES

* having the libp2p-record protobuf definition compliant with go-libp2p-record. Author and signature were removed.



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipfs/js-ipns/compare/v0.2.2...v0.3.0) (2018-10-26)



<a name="0.2.2"></a>
## [0.2.2](https://github.com/ipfs/js-ipns/compare/v0.2.1...v0.2.2) (2018-10-25)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ipfs/js-ipns/compare/v0.2.0...v0.2.1) (2018-09-24)


### Features

* add creatWithExpiration function ([#9](https://github.com/ipfs/js-ipns/issues/9)) ([576bc1a](https://github.com/ipfs/js-ipns/commit/576bc1a))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/js-ipns/compare/v0.1.6...v0.2.0) (2018-09-20)



<a name="0.1.6"></a>
## [0.1.6](https://github.com/ipfs/js-ipns/compare/v0.1.5...v0.1.6) (2018-09-07)


### Bug Fixes

* routing publick key format ([#8](https://github.com/ipfs/js-ipns/issues/8)) ([25c53cc](https://github.com/ipfs/js-ipns/commit/25c53cc))



<a name="0.1.5"></a>
## [0.1.5](https://github.com/ipfs/js-ipns/compare/v0.1.4...v0.1.5) (2018-09-06)


### Bug Fixes

* routing key format ([#7](https://github.com/ipfs/js-ipns/issues/7)) ([70036af](https://github.com/ipfs/js-ipns/commit/70036af))



<a name="0.1.4"></a>
## [0.1.4](https://github.com/ipfs/js-ipns/compare/v0.1.2...v0.1.4) (2018-09-06)


### Bug Fixes

* **security:** ensure validate is properly checking verify status ([33684e3](https://github.com/ipfs/js-ipns/commit/33684e3))


### Features

* add libp2p id key ([#6](https://github.com/ipfs/js-ipns/issues/6)) ([3d868fe](https://github.com/ipfs/js-ipns/commit/3d868fe))
* add records validator ([#5](https://github.com/ipfs/js-ipns/issues/5)) ([34468e1](https://github.com/ipfs/js-ipns/commit/34468e1))



<a name="0.1.3"></a>
## [0.1.3](https://github.com/ipfs/js-ipns/compare/v0.1.2...v0.1.3) (2018-08-23)


### Bug Fixes

* **security:** ensure validate is properly checking verify status ([33684e3](https://github.com/ipfs/js-ipns/commit/33684e3))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/ipfs/js-ipns/compare/v0.1.1...v0.1.2) (2018-08-09)


### Bug Fixes

* local key for datastore ([439fcc0](https://github.com/ipfs/js-ipns/commit/439fcc0))
* readme license text ([981801e](https://github.com/ipfs/js-ipns/commit/981801e))
* typo in README ([d7c90ef](https://github.com/ipfs/js-ipns/commit/d7c90ef))


### Features

* add public key support ([#4](https://github.com/ipfs/js-ipns/issues/4)) ([e743632](https://github.com/ipfs/js-ipns/commit/e743632))



<a name="0.1.1"></a>
## 0.1.1 (2018-06-29)


### Features

* initial implementation ([b8eb65f](https://github.com/ipfs/js-ipns/commit/b8eb65f))



