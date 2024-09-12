export class SignatureCreationError extends Error {
  static name = 'SignatureCreationError'

  constructor (message = 'Record signature creation failed') {
    super(message)
    this.name = 'SignatureCreationError'
  }
}

export class SignatureVerificationError extends Error {
  static name = 'SignatureVerificationError'

  constructor (message = 'Record signature verification failed') {
    super(message)
    this.name = 'SignatureVerificationError'
  }
}

export class RecordExpiredError extends Error {
  static name = 'RecordExpiredError'

  constructor (message = 'Record has expired') {
    super(message)
    this.name = 'RecordExpiredError'
  }
}

export class UnsupportedValidityError extends Error {
  static name = 'UnsupportedValidityError'

  constructor (message = 'The validity type is unsupported') {
    super(message)
    this.name = 'UnsupportedValidityError'
  }
}

export class RecordTooLargeError extends Error {
  static name = 'RecordTooLargeError'

  constructor (message = 'The record is too large') {
    super(message)
    this.name = 'RecordTooLargeError'
  }
}

export class InvalidValueError extends Error {
  static name = 'InvalidValueError'

  constructor (message = 'Value must be a valid content path starting with /') {
    super(message)
    this.name = 'InvalidValueError'
  }
}

export class InvalidRecordDataError extends Error {
  static name = 'InvalidRecordDataError'

  constructor (message = 'Invalid record data') {
    super(message)
    this.name = 'InvalidRecordDataError'
  }
}

export class InvalidEmbeddedPublicKeyError extends Error {
  static name = 'InvalidEmbeddedPublicKeyError'

  constructor (message = 'Invalid embedded public key') {
    super(message)
    this.name = 'InvalidEmbeddedPublicKeyError'
  }
}
