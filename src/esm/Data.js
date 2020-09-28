
class Data {
    constructor(data) {
        this.data = data;
        this.cache = {};
    }
    // simplify data structures
    get(key) {
        // performance crap
        var data = this.data;
        // cache for processed data-point
        var d = {
            // type of data 0: undefined/null, 1: string, 2: object, 3: array
            type: 0,
            // original values (except undefined/null)
            val: [],
            // cache for encoded values (only for non-maxlength expansion)
            encode: [],
            encodeReserved: []
        };
        var i, l, value;
        if (this.cache[key] !== undefined) {
            // we've already processed this key
            return this.cache[key];
        }
        this.cache[key] = d;
        if (String(Object.prototype.toString.call(data)) === '[object Function]') {
            // data itself is a callback (global callback)
            value = data(key);
        }
        else if (String(Object.prototype.toString.call(data[key])) === '[object Function]') {
            // data is a map of callbacks (local callback)
            value = data[key](key);
        }
        else {
            // data is a map of data
            value = data[key];
        }
        // generalize input into [ [name1, value1], [name2, value2], … ]
        // so expansion has to deal with a single data structure only
        if (value === undefined || value === null) {
            // undefined and null values are to be ignored completely
            return d;
        }
        else if (String(Object.prototype.toString.call(value)) === '[object Array]') {
            for (i = 0, l = value.length; i < l; i++) {
                if (value[i] !== undefined && value[i] !== null) {
                    // arrays don't have names
                    d.val.push([undefined, String(value[i])]);
                }
            }
            if (d.val.length) {
                // only treat non-empty arrays as arrays
                d.type = 3; // array
            }
        }
        else if (String(Object.prototype.toString.call(value)) === '[object Object]') {
            for (i in value) {
                if (FN_HAS_OWN.call(value, i) && value[i] !== undefined && value[i] !== null) {
                    // objects have keys, remember them for named expansion
                    d.val.push([i, String(value[i])]);
                }
            }
            if (d.val.length) {
                // only treat non-empty objects as objects
                d.type = 2; // object
            }
        }
        else {
            d.type = 1; // primitive string (could've been string, number, boolean and objects with a toString())
            // arrays don't have names
            d.val.push([undefined, String(value)]);
        }
        return d;
    }
}

export default Data
