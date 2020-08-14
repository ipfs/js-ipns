'use strict'

module.exports = {
  webpack: {
    node: {
      // needed by the ipfs-repo-migrations module
      path: true,

      // needed by the abstract-leveldown module
      Buffer: true
    }
  }
}