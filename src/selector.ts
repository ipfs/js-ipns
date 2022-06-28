import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { IpnsEntry } from './pb/ipns.js'
import { parseRFC3339 } from './utils.js'
import type { SelectFn } from '@libp2p/interface-dht'

export const ipnsSelector: SelectFn = (key, data) => {
  const entries = data.map((buf, index) => ({
    entry: IpnsEntry.decode(buf),
    index
  }))

  entries.sort((a, b) => {
    // having a newer signature version is better than an older signature version
    if (a.entry.signatureV2 != null && b.entry.signatureV2 == null) {
      return -1
    } else if (a.entry.signatureV2 == null && b.entry.signatureV2 != null) {
      return 1
    }

    const aSeq = a.entry.sequence ?? 0n
    const bSeq = b.entry.sequence ?? 0n

    // choose later sequence number
    if (aSeq > bSeq) {
      return -1
    } else if (aSeq < bSeq) {
      return 1
    }

    const aValidty = a.entry.validity ?? new Uint8Array(0)
    const bValidty = b.entry.validity ?? new Uint8Array(0)

    // choose longer lived record if sequence numbers the same
    const entryAValidityDate = parseRFC3339(uint8ArrayToString(aValidty))
    const entryBValidityDate = parseRFC3339(uint8ArrayToString(bValidty))

    if (entryAValidityDate.getTime() > entryBValidityDate.getTime()) {
      return -1
    }

    if (entryAValidityDate.getTime() < entryBValidityDate.getTime()) {
      return 1
    }

    return 0
  })

  return entries[0].index
}
