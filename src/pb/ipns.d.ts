import $protobuf from "protobufjs";
/** Properties of an IpnsEntry. */
export interface IIpnsEntry {

    /** IpnsEntry value */
    value?: (Uint8Array|null);

    /** IpnsEntry signature */
    signature?: (Uint8Array|null);

    /** IpnsEntry validityType */
    validityType?: (IpnsEntry.ValidityType|null);

    /** IpnsEntry validity */
    validity?: (Uint8Array|null);

    /** IpnsEntry sequence */
    sequence?: (number|Long|null);

    /** IpnsEntry ttl */
    ttl?: (number|Long|null);

    /** IpnsEntry pubKey */
    pubKey?: (Uint8Array|null);

    /** IpnsEntry signatureV2 */
    signatureV2?: (Uint8Array|null);

    /** IpnsEntry data */
    data?: (Uint8Array|null);
}

/** Represents an IpnsEntry. */
export class IpnsEntry implements IIpnsEntry {

    /**
     * Constructs a new IpnsEntry.
     * @param [p] Properties to set
     */
    constructor(p?: IIpnsEntry);

    /** IpnsEntry value. */
    public value: Uint8Array;

    /** IpnsEntry signature. */
    public signature: Uint8Array;

    /** IpnsEntry validityType. */
    public validityType: IpnsEntry.ValidityType;

    /** IpnsEntry validity. */
    public validity: Uint8Array;

    /** IpnsEntry sequence. */
    public sequence: (number|Long);

    /** IpnsEntry ttl. */
    public ttl: (number|Long);

    /** IpnsEntry pubKey. */
    public pubKey: Uint8Array;

    /** IpnsEntry signatureV2. */
    public signatureV2: Uint8Array;

    /** IpnsEntry data. */
    public data: Uint8Array;

    /**
     * Encodes the specified IpnsEntry message. Does not implicitly {@link IpnsEntry.verify|verify} messages.
     * @param m IpnsEntry message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(m: IIpnsEntry, w?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an IpnsEntry message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns IpnsEntry
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): IpnsEntry;

    /**
     * Creates an IpnsEntry message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns IpnsEntry
     */
    public static fromObject(d: { [k: string]: any }): IpnsEntry;

    /**
     * Creates a plain object from an IpnsEntry message. Also converts values to other types if specified.
     * @param m IpnsEntry
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(m: IpnsEntry, o?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this IpnsEntry to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

export namespace IpnsEntry {

    /** ValidityType enum. */
    enum ValidityType {
        EOL = 0
    }
}
