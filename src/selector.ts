import NanoDate from 'timestamp-nano'
import { IpnsEntry } from './pb/ipns.js'
import { unmarshal } from './utils.js'

export function ipnsSelector (key: Uint8Array, data: Uint8Array[]): number {
  const entries = data.map((buf, index) => ({
    record: unmarshal(buf),
    index
  }))

  entries.sort((a, b) => {
    // Before we'd sort based on the signature version. Unmarshal now fails if
    // a record does not have SignatureV2, so that is no longer needed. V1-only
    // records haven't been issues in a long time.

    const aSeq = a.record.sequence
    const bSeq = b.record.sequence

    // choose later sequence number
    if (aSeq > bSeq) {
      return -1
    } else if (aSeq < bSeq) {
      return 1
    }

    if (a.record.validityType === IpnsEntry.ValidityType.EOL && b.record.validityType === IpnsEntry.ValidityType.EOL) {
      // choose longer lived record if sequence numbers the same
      const recordAValidityDate = NanoDate.fromString(a.record.validity).toDate()
      const recordBValidityDate = NanoDate.fromString(b.record.validity).toDate()

      if (recordAValidityDate.getTime() > recordBValidityDate.getTime()) {
        return -1
      }

      if (recordAValidityDate.getTime() < recordBValidityDate.getTime()) {
        return 1
      }
    }

    return 0
  })

  return entries[0].index
}
