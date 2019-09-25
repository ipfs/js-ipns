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



