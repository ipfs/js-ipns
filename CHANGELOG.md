## [9.0.0](https://github.com/ipfs/js-ipns/compare/v8.0.4...v9.0.0) (2024-01-18)


### ⚠ BREAKING CHANGES

* the validity field is now a string

### Bug Fixes

* treat validity as opaque ([#307](https://github.com/ipfs/js-ipns/issues/307)) ([461190e](https://github.com/ipfs/js-ipns/commit/461190e215173e0ac2aad1dca107de5cb65a52ef))

## [8.0.4](https://github.com/ipfs/js-ipns/compare/v8.0.3...v8.0.4) (2024-01-18)


### Bug Fixes

* log type as string ([#306](https://github.com/ipfs/js-ipns/issues/306)) ([de68e4c](https://github.com/ipfs/js-ipns/commit/de68e4c0601702fb5d567a97e305b26f65c34fc2))

## [8.0.3](https://github.com/ipfs/js-ipns/compare/v8.0.2...v8.0.3) (2024-01-16)


### Bug Fixes

* mark package as side-effect free ([#305](https://github.com/ipfs/js-ipns/issues/305)) ([a389fe8](https://github.com/ipfs/js-ipns/commit/a389fe8f0e6dff4867ef22b6ddada43880476754))

## [8.0.2](https://github.com/ipfs/js-ipns/compare/v8.0.1...v8.0.2) (2024-01-15)


### Dependencies

* bump @libp2p/crypto from 3.0.4 to 4.0.0 ([#304](https://github.com/ipfs/js-ipns/issues/304)) ([ed83244](https://github.com/ipfs/js-ipns/commit/ed832448a9c903dc2ea0dd6158cc73211eacded7))

## [8.0.1](https://github.com/ipfs/js-ipns/compare/v8.0.0...v8.0.1) (2024-01-12)


### Trivial Changes

* Update .github/workflows/stale.yml [skip ci] ([e612553](https://github.com/ipfs/js-ipns/commit/e612553dab45bf102ef1f5b239fc4e13c0f96f3f))


### Dependencies

* **dev:** bump aegir from 41.3.5 to 42.1.1 ([#303](https://github.com/ipfs/js-ipns/issues/303)) ([9f0ab52](https://github.com/ipfs/js-ipns/commit/9f0ab52009d8163311fb116a87ebd5a3876c48c9))

## [8.0.0](https://github.com/ipfs/js-ipns/compare/v7.0.2...v8.0.0) (2023-12-30)


### ⚠ BREAKING CHANGES

* requires libp2p v1 or later

### Trivial Changes

* rename master to main ([4f520b1](https://github.com/ipfs/js-ipns/commit/4f520b1946eacbed5ddb3dc567d2ba5423034ca0))


### Dependencies

* update libp2p deps to v1 ([#299](https://github.com/ipfs/js-ipns/issues/299)) ([5ae5b93](https://github.com/ipfs/js-ipns/commit/5ae5b934c391d652462765c102b6d01997a4d090))

## [7.0.2](https://github.com/ipfs/js-ipns/compare/v7.0.1...v7.0.2) (2023-12-30)


### Dependencies

* bump uint8arrays from 4.0.10 to 5.0.1 ([#297](https://github.com/ipfs/js-ipns/issues/297)) ([6043eab](https://github.com/ipfs/js-ipns/commit/6043eabe135c1659001a27657a602ca34c6ba3bc))

## [7.0.1](https://github.com/ipfs/js-ipns/compare/v7.0.0...v7.0.1) (2023-09-15)


### Bug Fixes

* add extra signature for empty options object ([#260](https://github.com/ipfs/js-ipns/issues/260)) ([ecbc699](https://github.com/ipfs/js-ipns/commit/ecbc699db81b0979520ed736df3550b2360d6d0e))

## [7.0.0](https://github.com/ipfs/js-ipns/compare/v6.0.7...v7.0.0) (2023-09-15)


### ⚠ BREAKING CHANGES

* all /ipns/* keys are now encoded as base36 encoded CIDv1 libp2p-cid

### Features

* opt-in V2-only records, IPIP-428 verification ([#234](https://github.com/ipfs/js-ipns/issues/234)) ([df71fed](https://github.com/ipfs/js-ipns/commit/df71fedd29f15c4f5a93d3d6aaa4dc895e98ddc9)), closes [#217](https://github.com/ipfs/js-ipns/issues/217)

## [6.0.7](https://github.com/ipfs/js-ipns/compare/v6.0.6...v6.0.7) (2023-09-14)


### Bug Fixes

* update libp2p interfaces to the latest version ([#259](https://github.com/ipfs/js-ipns/issues/259)) ([65f9d9b](https://github.com/ipfs/js-ipns/commit/65f9d9b328451d997ab99e3f5b7964ce4f7357f0))


### Trivial Changes

* update docs command ([#258](https://github.com/ipfs/js-ipns/issues/258)) ([705ef3e](https://github.com/ipfs/js-ipns/commit/705ef3efb94b76a598d9738612b8e83880eb87c9))

## [6.0.6](https://github.com/ipfs/js-ipns/compare/v6.0.5...v6.0.6) (2023-09-14)


### Dependencies

* bump cborg from 2.0.5 to 4.0.1 ([#257](https://github.com/ipfs/js-ipns/issues/257)) ([c51dc2f](https://github.com/ipfs/js-ipns/commit/c51dc2ff4d7b0e75ab51bb82f898e0b5f3acdd5d))

## [6.0.5](https://github.com/ipfs/js-ipns/compare/v6.0.4...v6.0.5) (2023-08-24)


### Dependencies

* bump @libp2p/peer-id from 2.0.4 to 3.0.2 ([#250](https://github.com/ipfs/js-ipns/issues/250)) ([69c52d7](https://github.com/ipfs/js-ipns/commit/69c52d70058172d6c61388b010f1e5c7f9b663e8))

## [6.0.4](https://github.com/ipfs/js-ipns/compare/v6.0.3...v6.0.4) (2023-08-24)


### Trivial Changes

* add or force update .github/workflows/js-test-and-release.yml ([#247](https://github.com/ipfs/js-ipns/issues/247)) ([3d3807f](https://github.com/ipfs/js-ipns/commit/3d3807f9a0ed5b1d5b06990c916a426d7c9200d0))
* delete templates [skip ci] ([#246](https://github.com/ipfs/js-ipns/issues/246)) ([c57dd46](https://github.com/ipfs/js-ipns/commit/c57dd46147816b78513ee0f22858fd8d12f2ec93))
* Update .github/workflows/stale.yml [skip ci] ([5139ee5](https://github.com/ipfs/js-ipns/commit/5139ee50b97670a1d713e891178cc6216f41a362))
* Update .github/workflows/stale.yml [skip ci] ([70735d1](https://github.com/ipfs/js-ipns/commit/70735d1d1f502f1b49b83433ca74ba30067fc23c))


### Dependencies

* bump @libp2p/crypto from 1.0.17 to 2.0.3 ([#249](https://github.com/ipfs/js-ipns/issues/249)) ([b12b1f7](https://github.com/ipfs/js-ipns/commit/b12b1f791eb0516a1357d95f91f3b1193013be08))
* bump @libp2p/logger from 2.1.1 to 3.0.2 ([#254](https://github.com/ipfs/js-ipns/issues/254)) ([73ba154](https://github.com/ipfs/js-ipns/commit/73ba154e73652731858cc836d2598f9bcaf4ac0b))
* bump cborg from 1.10.2 to 2.0.4 ([#252](https://github.com/ipfs/js-ipns/issues/252)) ([2c4d575](https://github.com/ipfs/js-ipns/commit/2c4d575aefd776dfe845699cfac6e5cab9800034))
* bump multiformats from 11.0.2 to 12.0.1 ([#229](https://github.com/ipfs/js-ipns/issues/229)) ([656fe3d](https://github.com/ipfs/js-ipns/commit/656fe3d13742fa1d6f33ce326631a2fd52dbf799))
* **dev:** bump @libp2p/peer-id-factory from 2.0.4 to 3.0.3 ([#251](https://github.com/ipfs/js-ipns/issues/251)) ([c6acf18](https://github.com/ipfs/js-ipns/commit/c6acf189dd81921e9416298e144e7047b0f175a2))
* **dev:** bump aegir from 39.0.13 to 40.0.11 ([#253](https://github.com/ipfs/js-ipns/issues/253)) ([45d81d7](https://github.com/ipfs/js-ipns/commit/45d81d743f33d638f624ae0e8a449f995c25578d))

## [6.0.3](https://github.com/ipfs/js-ipns/compare/v6.0.2...v6.0.3) (2023-06-14)


### Bug Fixes

* limit valid message size ([#226](https://github.com/ipfs/js-ipns/issues/226)) ([8a3e4f4](https://github.com/ipfs/js-ipns/commit/8a3e4f434701abf4ea997f50674a9659b2774c29))


### Documentation

* update readme and project ([#227](https://github.com/ipfs/js-ipns/issues/227)) ([3b587c2](https://github.com/ipfs/js-ipns/commit/3b587c2b7fa50501385a176a882e27d24ea6b6df))

## [6.0.2](https://github.com/ipfs/js-ipns/compare/v6.0.1...v6.0.2) (2023-06-14)


### Bug Fixes

* export extractPublicKey and update README ([#216](https://github.com/ipfs/js-ipns/issues/216)) ([eb34070](https://github.com/ipfs/js-ipns/commit/eb340700da56d89c0dc0e81d2da6dde1ed2d8ed9)), closes [#208](https://github.com/ipfs/js-ipns/issues/208)

## [6.0.1](https://github.com/ipfs/js-ipns/compare/v6.0.0...v6.0.1) (2023-06-14)


### Dependencies

* **dev:** bump aegir from 38.1.8 to 39.0.10 ([#225](https://github.com/ipfs/js-ipns/issues/225)) ([1c9fce1](https://github.com/ipfs/js-ipns/commit/1c9fce138abaefbe6e704261aa10705ce9b39b1b))

## [6.0.0](https://github.com/ipfs/js-ipns/compare/v5.0.2...v6.0.0) (2023-03-21)


### ⚠ BREAKING CHANGES

* bump interface-datastore from 7.0.4 to 8.1.0 (#215)

### Dependencies

* bump interface-datastore from 7.0.4 to 8.1.0 ([#215](https://github.com/ipfs/js-ipns/issues/215)) ([100799c](https://github.com/ipfs/js-ipns/commit/100799c97f177893417a70bcc8e5255013546031))
* bump protons-runtime from 4.0.2 to 5.0.0 ([#201](https://github.com/ipfs/js-ipns/issues/201)) ([60c3a15](https://github.com/ipfs/js-ipns/commit/60c3a156f78e407b2194ab51cc7c5ae9b3fc503d))
* **dev:** bump protons from 6.1.3 to 7.0.2 ([#204](https://github.com/ipfs/js-ipns/issues/204)) ([eb05501](https://github.com/ipfs/js-ipns/commit/eb05501647cc16efb34eb6a8ad7bc4263cdc84d9))

## [5.0.2](https://github.com/ipfs/js-ipns/compare/v5.0.1...v5.0.2) (2023-03-21)


### Dependencies

* **dev:** bump aegir from 37.12.1 to 38.1.7 ([#211](https://github.com/ipfs/js-ipns/issues/211)) ([9b7cca0](https://github.com/ipfs/js-ipns/commit/9b7cca02f4ed0a94ae23bd76a803508d4f75dbc9))

## [5.0.1](https://github.com/ipfs/js-ipns/compare/v5.0.0...v5.0.1) (2023-01-07)


### Documentation

* publish API docs ([#197](https://github.com/ipfs/js-ipns/issues/197)) ([ec88bf8](https://github.com/ipfs/js-ipns/commit/ec88bf8ce996fe049da336ef1ab7e1610706c1f6))

## [5.0.0](https://github.com/ipfs/js-ipns/compare/v4.0.0...v5.0.0) (2023-01-07)


### ⚠ BREAKING CHANGES

* update multiformats to v11 (#196)

### Dependencies

* update multiformats to v11 ([#196](https://github.com/ipfs/js-ipns/issues/196)) ([e06d891](https://github.com/ipfs/js-ipns/commit/e06d891ecfff3001eb98226d6270b354c4ad4349))

## [4.0.0](https://github.com/ipfs/js-ipns/compare/v3.0.0...v4.0.0) (2022-10-17)


### ⚠ BREAKING CHANGES

* update multiformats, protons and uint8arrays (#189)

### Dependencies

* update multiformats, protons and uint8arrays ([#189](https://github.com/ipfs/js-ipns/issues/189)) ([645c3b8](https://github.com/ipfs/js-ipns/commit/645c3b8c11c02ba43714b9806d0d2b0e0940217e))

## [3.0.0](https://github.com/ipfs/js-ipns/compare/v2.0.3...v3.0.0) (2022-09-20)


### ⚠ BREAKING CHANGES

* IPNS V1 signatures are ignored, records without V2 signature are no longer marked as Valid.

### Bug Fixes

* require V2 signatures ([#180](https://github.com/ipfs/js-ipns/issues/180)) ([d522bcc](https://github.com/ipfs/js-ipns/commit/d522bccdacb645c887ca1ce566fe17eac1bcd1fd))

## [2.0.3](https://github.com/ipfs/js-ipns/compare/v2.0.2...v2.0.3) (2022-08-14)


### Bug Fixes

* ensure bigints are bigints ([#177](https://github.com/ipfs/js-ipns/issues/177)) ([4d1c0dd](https://github.com/ipfs/js-ipns/commit/4d1c0ddd6974f74494dd3b0a4defc56e51e75c3e))

## [2.0.2](https://github.com/ipfs/js-ipns/compare/v2.0.1...v2.0.2) (2022-08-14)


### Dependencies

* bump interface-datastore from 6.1.1 to 7.0.0 ([#176](https://github.com/ipfs/js-ipns/issues/176)) ([7f8caa0](https://github.com/ipfs/js-ipns/commit/7f8caa0538318d111da3b48e0503859308d161fd))

## [2.0.1](https://github.com/ipfs/js-ipns/compare/v2.0.0...v2.0.1) (2022-08-11)


### Trivial Changes

* Update .github/workflows/stale.yml [skip ci] ([116d5ec](https://github.com/ipfs/js-ipns/commit/116d5ecd8024a8edd70501e0b259bbe90587d089))
* update project config ([#174](https://github.com/ipfs/js-ipns/issues/174)) ([5200b95](https://github.com/ipfs/js-ipns/commit/5200b952699e0e32be0b62488d65ce1b3ec2e22a))


### Dependencies

* update protons to 5.1.0 ([#175](https://github.com/ipfs/js-ipns/issues/175)) ([4c50ec9](https://github.com/ipfs/js-ipns/commit/4c50ec9f750de1c154339396ebf30c9ea3c5fba7))

## [2.0.0](https://github.com/ipfs/js-ipns/compare/v1.0.2...v2.0.0) (2022-06-28)


### ⚠ BREAKING CHANGES

* update to new libp2p interface versions

### Features

* update deps ([#163](https://github.com/ipfs/js-ipns/issues/163)) ([719925a](https://github.com/ipfs/js-ipns/commit/719925a8ae250bba1f0221613a7c430d82414391))

### [1.0.2](https://github.com/ipfs/js-ipns/compare/v1.0.1...v1.0.2) (2022-05-25)


### Trivial Changes

* **deps:** bump @libp2p/interfaces from 1.3.32 to 2.0.2 ([#159](https://github.com/ipfs/js-ipns/issues/159)) ([0f4bb9f](https://github.com/ipfs/js-ipns/commit/0f4bb9ff7f1831f080b79afb7d087416300e891c))

### [1.0.1](https://github.com/ipfs/js-ipns/compare/v1.0.0...v1.0.1) (2022-05-10)


### Bug Fixes

* encode enums correctly ([#156](https://github.com/ipfs/js-ipns/issues/156)) ([9267f06](https://github.com/ipfs/js-ipns/commit/9267f0645c980bf0727bf87a4316996a07cb2147))

## [1.0.0](https://github.com/ipfs/js-ipns/compare/v0.16.0...v1.0.0) (2022-04-13)


### ⚠ BREAKING CHANGES

* this module is now ESM-only

### Features

* convert to typescript ([#154](https://github.com/ipfs/js-ipns/issues/154)) ([dd308f0](https://github.com/ipfs/js-ipns/commit/dd308f010311bd07a375270cf0ac505883bb740f))

# [0.16.0](https://github.com/ipfs/js-ipns/compare/v0.15.1...v0.16.0) (2021-12-02)


### chore

* update deps ([#149](https://github.com/ipfs/js-ipns/issues/149)) ([87068ad](https://github.com/ipfs/js-ipns/commit/87068ad0c592f0eb481b7423598ad1054c462240))


### BREAKING CHANGES

* requires node 15+



## [0.15.1](https://github.com/ipfs/js-ipns/compare/v0.15.0...v0.15.1) (2021-11-30)



# [0.15.0](https://github.com/ipfs/js-ipns/compare/v0.14.1...v0.15.0) (2021-09-14)



## [0.14.1](https://github.com/ipfs/js-ipns/compare/v0.14.0...v0.14.1) (2021-09-10)


### chore

* switch to ESM ([#136](https://github.com/ipfs/js-ipns/issues/136)) ([e4175cc](https://github.com/ipfs/js-ipns/commit/e4175ccf887d8ebc5590693759ef46b31a5ee18f))


### BREAKING CHANGES

* deep imports/requires are no longer possible



# [0.14.0](https://github.com/ipfs/js-ipns/compare/v0.13.4...v0.14.0) (2021-09-02)


### Bug Fixes

* update record selection rules ([#134](https://github.com/ipfs/js-ipns/issues/134)) ([fd1481a](https://github.com/ipfs/js-ipns/commit/fd1481a8fc00138d4543ca27050e080aefd8b31d)), closes [/github.com/ipfs/go-ipns/blob/a2d4e93f7e8ffc9f996471eb1a24ff12c8484120/ipns.go#L325-L362](https://github.com//github.com/ipfs/go-ipns/blob/a2d4e93f7e8ffc9f996471eb1a24ff12c8484120/ipns.go/issues/L325-L362)


### BREAKING CHANGES

* extractPublicKey is now async



## [0.13.4](https://github.com/ipfs/js-ipns/compare/v0.13.2...v0.13.4) (2021-08-19)


### Bug Fixes

* cbor keys should be pascal case ([#128](https://github.com/ipfs/js-ipns/issues/128)) ([1f8bcd3](https://github.com/ipfs/js-ipns/commit/1f8bcd379a7ba37daef0ceefc1ef69f4c15dab63))



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
