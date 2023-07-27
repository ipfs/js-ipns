import { unmarshal } from './utils.js'
import type { SelectFn } from '@libp2p/interface-dht'

export const ipnsSelector: SelectFn = (key, data) => {
  const entries = data.map((buf, index) => ({
    record: unmarshal(buf),
    index
  }))

  entries.sort((a, b) => {
    // having a newer signature version is better than an older signature version
    if (a.record.pb.signatureV2 != null && b.record.pb.signatureV2 == null) {
      return -1
    } else if (a.record.pb.signatureV2 == null && b.record.pb.signatureV2 != null) {
      return 1
    }

    const aSeq = a.record.sequence()
    const bSeq = b.record.sequence()

    // choose later sequence number
    if (aSeq > bSeq) {
      return -1
    } else if (aSeq < bSeq) {
      return 1
    }

    // choose longer lived record if sequence numbers the same
    const recordAValidityDate = a.record.validity()
    const recordBValidityDate = b.record.validity()

    if (recordAValidityDate.getTime() > recordBValidityDate.getTime()) {
      return -1
    }

    if (recordAValidityDate.getTime() < recordBValidityDate.getTime()) {
      return 1
    }

    return 0
  })

  return entries[0].index
}
