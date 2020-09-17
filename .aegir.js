'use strict'

module.exports = {
  webpack: {
    node: {
      // required by the cbor module
      stream: true,

      // needed by the ipfs-repo-migrations module
      path: true,

      // needed by the abstract-leveldown module
      Buffer: true
    }
  }
}