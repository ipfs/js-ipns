/*eslint-disable*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["ipfs-ipns"] || ($protobuf.roots["ipfs-ipns"] = {});

$root.IpnsEntry = (function() {

    /**
     * Properties of an IpnsEntry.
     * @exports IIpnsEntry
     * @interface IIpnsEntry
     * @property {Uint8Array|null} [value] IpnsEntry value
     * @property {Uint8Array|null} [signature] IpnsEntry signature
     * @property {IpnsEntry.ValidityType|null} [validityType] IpnsEntry validityType
     * @property {Uint8Array|null} [validity] IpnsEntry validity
     * @property {number|Long|null} [sequence] IpnsEntry sequence
     * @property {number|Long|null} [ttl] IpnsEntry ttl
     * @property {Uint8Array|null} [pubKey] IpnsEntry pubKey
     * @property {Uint8Array|null} [signatureV2] IpnsEntry signatureV2
     * @property {Uint8Array|null} [data] IpnsEntry data
     */

    /**
     * Constructs a new IpnsEntry.
     * @exports IpnsEntry
     * @classdesc Represents an IpnsEntry.
     * @implements IIpnsEntry
     * @constructor
     * @param {IIpnsEntry=} [p] Properties to set
     */
    function IpnsEntry(p) {
        if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null)
                    this[ks[i]] = p[ks[i]];
    }

    /**
     * IpnsEntry value.
     * @member {Uint8Array} value
     * @memberof IpnsEntry
     * @instance
     */
    IpnsEntry.prototype.value = $util.newBuffer([]);

    /**
     * IpnsEntry signature.
     * @member {Uint8Array} signature
     * @memberof IpnsEntry
     * @instance
     */
    IpnsEntry.prototype.signature = $util.newBuffer([]);

    /**
     * IpnsEntry validityType.
     * @member {IpnsEntry.ValidityType} validityType
     * @memberof IpnsEntry
     * @instance
     */
    IpnsEntry.prototype.validityType = 0;

    /**
     * IpnsEntry validity.
     * @member {Uint8Array} validity
     * @memberof IpnsEntry
     * @instance
     */
    IpnsEntry.prototype.validity = $util.newBuffer([]);

    /**
     * IpnsEntry sequence.
     * @member {number|Long} sequence
     * @memberof IpnsEntry
     * @instance
     */
    IpnsEntry.prototype.sequence = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * IpnsEntry ttl.
     * @member {number|Long} ttl
     * @memberof IpnsEntry
     * @instance
     */
    IpnsEntry.prototype.ttl = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * IpnsEntry pubKey.
     * @member {Uint8Array} pubKey
     * @memberof IpnsEntry
     * @instance
     */
    IpnsEntry.prototype.pubKey = $util.newBuffer([]);

    /**
     * IpnsEntry signatureV2.
     * @member {Uint8Array} signatureV2
     * @memberof IpnsEntry
     * @instance
     */
    IpnsEntry.prototype.signatureV2 = $util.newBuffer([]);

    /**
     * IpnsEntry data.
     * @member {Uint8Array} data
     * @memberof IpnsEntry
     * @instance
     */
    IpnsEntry.prototype.data = $util.newBuffer([]);

    /**
     * Encodes the specified IpnsEntry message. Does not implicitly {@link IpnsEntry.verify|verify} messages.
     * @function encode
     * @memberof IpnsEntry
     * @static
     * @param {IIpnsEntry} m IpnsEntry message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    IpnsEntry.encode = function encode(m, w) {
        if (!w)
            w = $Writer.create();
        if (m.value != null && Object.hasOwnProperty.call(m, "value"))
            w.uint32(10).bytes(m.value);
        if (m.signature != null && Object.hasOwnProperty.call(m, "signature"))
            w.uint32(18).bytes(m.signature);
        if (m.validityType != null && Object.hasOwnProperty.call(m, "validityType"))
            w.uint32(24).int32(m.validityType);
        if (m.validity != null && Object.hasOwnProperty.call(m, "validity"))
            w.uint32(34).bytes(m.validity);
        if (m.sequence != null && Object.hasOwnProperty.call(m, "sequence"))
            w.uint32(40).uint64(m.sequence);
        if (m.ttl != null && Object.hasOwnProperty.call(m, "ttl"))
            w.uint32(48).uint64(m.ttl);
        if (m.pubKey != null && Object.hasOwnProperty.call(m, "pubKey"))
            w.uint32(58).bytes(m.pubKey);
        if (m.signatureV2 != null && Object.hasOwnProperty.call(m, "signatureV2"))
            w.uint32(66).bytes(m.signatureV2);
        if (m.data != null && Object.hasOwnProperty.call(m, "data"))
            w.uint32(74).bytes(m.data);
        return w;
    };

    /**
     * Decodes an IpnsEntry message from the specified reader or buffer.
     * @function decode
     * @memberof IpnsEntry
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {IpnsEntry} IpnsEntry
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    IpnsEntry.decode = function decode(r, l) {
        if (!(r instanceof $Reader))
            r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l, m = new $root.IpnsEntry();
        while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
            case 1:
                m.value = r.bytes();
                break;
            case 2:
                m.signature = r.bytes();
                break;
            case 3:
                m.validityType = r.int32();
                break;
            case 4:
                m.validity = r.bytes();
                break;
            case 5:
                m.sequence = r.uint64();
                break;
            case 6:
                m.ttl = r.uint64();
                break;
            case 7:
                m.pubKey = r.bytes();
                break;
            case 8:
                m.signatureV2 = r.bytes();
                break;
            case 9:
                m.data = r.bytes();
                break;
            default:
                r.skipType(t & 7);
                break;
            }
        }
        return m;
    };

    /**
     * Creates an IpnsEntry message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof IpnsEntry
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {IpnsEntry} IpnsEntry
     */
    IpnsEntry.fromObject = function fromObject(d) {
        if (d instanceof $root.IpnsEntry)
            return d;
        var m = new $root.IpnsEntry();
        if (d.value != null) {
            if (typeof d.value === "string")
                $util.base64.decode(d.value, m.value = $util.newBuffer($util.base64.length(d.value)), 0);
            else if (d.value.length)
                m.value = d.value;
        }
        if (d.signature != null) {
            if (typeof d.signature === "string")
                $util.base64.decode(d.signature, m.signature = $util.newBuffer($util.base64.length(d.signature)), 0);
            else if (d.signature.length)
                m.signature = d.signature;
        }
        switch (d.validityType) {
        case "EOL":
        case 0:
            m.validityType = 0;
            break;
        }
        if (d.validity != null) {
            if (typeof d.validity === "string")
                $util.base64.decode(d.validity, m.validity = $util.newBuffer($util.base64.length(d.validity)), 0);
            else if (d.validity.length)
                m.validity = d.validity;
        }
        if (d.sequence != null) {
            if ($util.Long)
                (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
            else if (typeof d.sequence === "string")
                m.sequence = parseInt(d.sequence, 10);
            else if (typeof d.sequence === "number")
                m.sequence = d.sequence;
            else if (typeof d.sequence === "object")
                m.sequence = new $util.LongBits(d.sequence.low >>> 0, d.sequence.high >>> 0).toNumber(true);
        }
        if (d.ttl != null) {
            if ($util.Long)
                (m.ttl = $util.Long.fromValue(d.ttl)).unsigned = true;
            else if (typeof d.ttl === "string")
                m.ttl = parseInt(d.ttl, 10);
            else if (typeof d.ttl === "number")
                m.ttl = d.ttl;
            else if (typeof d.ttl === "object")
                m.ttl = new $util.LongBits(d.ttl.low >>> 0, d.ttl.high >>> 0).toNumber(true);
        }
        if (d.pubKey != null) {
            if (typeof d.pubKey === "string")
                $util.base64.decode(d.pubKey, m.pubKey = $util.newBuffer($util.base64.length(d.pubKey)), 0);
            else if (d.pubKey.length)
                m.pubKey = d.pubKey;
        }
        if (d.signatureV2 != null) {
            if (typeof d.signatureV2 === "string")
                $util.base64.decode(d.signatureV2, m.signatureV2 = $util.newBuffer($util.base64.length(d.signatureV2)), 0);
            else if (d.signatureV2.length)
                m.signatureV2 = d.signatureV2;
        }
        if (d.data != null) {
            if (typeof d.data === "string")
                $util.base64.decode(d.data, m.data = $util.newBuffer($util.base64.length(d.data)), 0);
            else if (d.data.length)
                m.data = d.data;
        }
        return m;
    };

    /**
     * Creates a plain object from an IpnsEntry message. Also converts values to other types if specified.
     * @function toObject
     * @memberof IpnsEntry
     * @static
     * @param {IpnsEntry} m IpnsEntry
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    IpnsEntry.toObject = function toObject(m, o) {
        if (!o)
            o = {};
        var d = {};
        if (o.defaults) {
            if (o.bytes === String)
                d.value = "";
            else {
                d.value = [];
                if (o.bytes !== Array)
                    d.value = $util.newBuffer(d.value);
            }
            if (o.bytes === String)
                d.signature = "";
            else {
                d.signature = [];
                if (o.bytes !== Array)
                    d.signature = $util.newBuffer(d.signature);
            }
            d.validityType = o.enums === String ? "EOL" : 0;
            if (o.bytes === String)
                d.validity = "";
            else {
                d.validity = [];
                if (o.bytes !== Array)
                    d.validity = $util.newBuffer(d.validity);
            }
            if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.sequence = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
            } else
                d.sequence = o.longs === String ? "0" : 0;
            if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.ttl = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
            } else
                d.ttl = o.longs === String ? "0" : 0;
            if (o.bytes === String)
                d.pubKey = "";
            else {
                d.pubKey = [];
                if (o.bytes !== Array)
                    d.pubKey = $util.newBuffer(d.pubKey);
            }
            if (o.bytes === String)
                d.signatureV2 = "";
            else {
                d.signatureV2 = [];
                if (o.bytes !== Array)
                    d.signatureV2 = $util.newBuffer(d.signatureV2);
            }
            if (o.bytes === String)
                d.data = "";
            else {
                d.data = [];
                if (o.bytes !== Array)
                    d.data = $util.newBuffer(d.data);
            }
        }
        if (m.value != null && m.hasOwnProperty("value")) {
            d.value = o.bytes === String ? $util.base64.encode(m.value, 0, m.value.length) : o.bytes === Array ? Array.prototype.slice.call(m.value) : m.value;
        }
        if (m.signature != null && m.hasOwnProperty("signature")) {
            d.signature = o.bytes === String ? $util.base64.encode(m.signature, 0, m.signature.length) : o.bytes === Array ? Array.prototype.slice.call(m.signature) : m.signature;
        }
        if (m.validityType != null && m.hasOwnProperty("validityType")) {
            d.validityType = o.enums === String ? $root.IpnsEntry.ValidityType[m.validityType] : m.validityType;
        }
        if (m.validity != null && m.hasOwnProperty("validity")) {
            d.validity = o.bytes === String ? $util.base64.encode(m.validity, 0, m.validity.length) : o.bytes === Array ? Array.prototype.slice.call(m.validity) : m.validity;
        }
        if (m.sequence != null && m.hasOwnProperty("sequence")) {
            if (typeof m.sequence === "number")
                d.sequence = o.longs === String ? String(m.sequence) : m.sequence;
            else
                d.sequence = o.longs === String ? $util.Long.prototype.toString.call(m.sequence) : o.longs === Number ? new $util.LongBits(m.sequence.low >>> 0, m.sequence.high >>> 0).toNumber(true) : m.sequence;
        }
        if (m.ttl != null && m.hasOwnProperty("ttl")) {
            if (typeof m.ttl === "number")
                d.ttl = o.longs === String ? String(m.ttl) : m.ttl;
            else
                d.ttl = o.longs === String ? $util.Long.prototype.toString.call(m.ttl) : o.longs === Number ? new $util.LongBits(m.ttl.low >>> 0, m.ttl.high >>> 0).toNumber(true) : m.ttl;
        }
        if (m.pubKey != null && m.hasOwnProperty("pubKey")) {
            d.pubKey = o.bytes === String ? $util.base64.encode(m.pubKey, 0, m.pubKey.length) : o.bytes === Array ? Array.prototype.slice.call(m.pubKey) : m.pubKey;
        }
        if (m.signatureV2 != null && m.hasOwnProperty("signatureV2")) {
            d.signatureV2 = o.bytes === String ? $util.base64.encode(m.signatureV2, 0, m.signatureV2.length) : o.bytes === Array ? Array.prototype.slice.call(m.signatureV2) : m.signatureV2;
        }
        if (m.data != null && m.hasOwnProperty("data")) {
            d.data = o.bytes === String ? $util.base64.encode(m.data, 0, m.data.length) : o.bytes === Array ? Array.prototype.slice.call(m.data) : m.data;
        }
        return d;
    };

    /**
     * Converts this IpnsEntry to JSON.
     * @function toJSON
     * @memberof IpnsEntry
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    IpnsEntry.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * ValidityType enum.
     * @name IpnsEntry.ValidityType
     * @enum {number}
     * @property {number} EOL=0 EOL value
     */
    IpnsEntry.ValidityType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "EOL"] = 0;
        return values;
    })();

    return IpnsEntry;
})();

module.exports = $root;
