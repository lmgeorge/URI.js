/*!
* URI.js - Mutating URLs
*
* Version: 1.19.1
*
* Author: Rodney Rehm
* Web: http://medialize.github.io/URI.js/
*
* Licensed under
*   MIT License http://www.opensource.org/licenses/mit-license
*
*/

/*jshint camelcase: false */

// --------------------------------------------------
// Utility Functions
// --------------------------------------------------

// encoding / decoding according to RFC3986
import URI from 'src/urn';


function escapeForDumbFirefox36(value) {
  // https://github.com/medialize/URI.js/issues/91
  return escape(value);
}


export function escapeRegEx(string) {
  // https://github.com/medialize/URI.js/commit/85ac21783c11f8ccab06106dba9735a31a86924d#commitcomment-821963
  return string.replace(/([.*+?^=!:${}()|[\]\/\\])/ug, '\\$1');
}

export function getType(value) {
  // IE8 doesn't return [Object Undefined] but [Object Object] for undefined value
  if (value === undefined) {
    return 'Undefined';
  }

  return String(Object.prototype.toString.call(value)).slice(8, -1);
}

export function isArray(obj) {
  return getType(obj) === 'Array';
}

export function filterArrayValues(data, value) {
  let lookup = {};
  let i, length;

  if (getType(value) === 'RegExp') {
    lookup = null;
  } else if (isArray(value)) {
    for (i = 0, length = value.length; i < length; i++) {
      lookup[value[i]] = true;
    }
  } else {
    lookup[value] = true;
  }

  for (i = 0, length = data.length; i < length; i++) {
    const _match = lookup && lookup[data[i]] !== undefined
                   || !lookup && value.test(data[i]);
    if (_match) {
      data.splice(i, 1);
      length--;
      i--;
    }
  }

  return data;
}

export function arrayContains(list, value) {
  let i, length;

  // value may be string, number, array, regexp
  if (isArray(value)) {
    // Note: this can be optimized to O(n) (instead of current O(m * n))
    for (i = 0, length = value.length; i < length; i++) {
      if (!arrayContains(list, value[i])) {
        return false;
      }
    }

    return true;
  }

  const _type = getType(value);
  for (i = 0, length = list.length; i < length; i++) {
    if (_type === 'RegExp') {
      if (typeof list[i] === 'string' && list[i].match(value)) {
        return true;
      }
    } else if (list[i] === value) {
      return true;
    }
  }

  return false;
}

export function arraysEqual(one, two) {
  if (!isArray(one) || !isArray(two)) {
    return false;
  }

  // arrays can't be equal if they have different amount of content
  if (one.length !== two.length) {
    return false;
  }

  one.sort();
  two.sort();

  let i = 0;
  const l = one.length;
  for (; i < l; i++) {
    if (one[i] !== two[i]) {
      return false;
    }
  }

  return true;
}

export function trimSlashes(text) {
  const trim_expression = /^\/+|\/+$/ug;
  return text.replace(trim_expression, '');
}

export function isInteger(value) {
  return /^[0-9]+$/u.test(value);
}

export function strictEncodeURIComponent(string) {
  // see
  // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
  return encodeURIComponent(string)
    .replace(/[!'()*]/ug, escapeForDumbFirefox36)
    .replace(/\*/ug, '%2A');
}// generate encode/decode path functions
export function generateAccessor(_group, _part) {
  return function(string) {
    try {
      return URI[_part](string + '').replace(URI.characters[_group][_part].expression, function(c) {
        return URI.characters[_group][_part].map[c];
      });
    } catch (e) {
      // we're not going to mess with weird encodings,
      // give up and return the undecoded original string
      // see https://github.com/medialize/URI.js/issues/87
      // see https://github.com/medialize/URI.js/issues/92
      return string;
    }
  };
}

export function generateSimpleAccessor(_part) {
  return function(v, build) {
    if (v === undefined) {
      return this._parts[_part] || '';
    } else {
      this._parts[_part] = v || null;
      this.build(!build);
      return this;
    }
  };
}

export function generatePrefixAccessor(_part, _key) {
  return function(v, build) {
    if (v === undefined) {
      return this._parts[_part] || '';
    } else {
      if (v !== null) {
        v = v + '';
        if (v.charAt(0) === _key) {
          v = v.substring(1);
        }
      }

      this._parts[_part] = v;
      this.build(!build);
      return this;
    }
  };
}

export function generateSegmentedPathFunction(_sep, _codingFuncName, _innerCodingFuncName) {
  return function(string) {
    // Why pass in names of functions, rather than the function objects themselves? The
    // definitions of some functions (but in particular, URI.decode) will occasionally change due
    // to URI.js having ISO8859 and Unicode modes. Passing in the name and getting it will ensure
    // that the functions we use here are "fresh".
    let actualCodingFunc;
    if (!_innerCodingFuncName) {
      actualCodingFunc = URI[_codingFuncName];
    } else {
      actualCodingFunc = function(string) {
        return URI[_codingFuncName](URI[_innerCodingFuncName](string));
      };
    }

    const segments = (string + '').split(_sep);

    let i = 0;
    const length = segments.length;
    for (; i < length; i++) {
      segments[i] = actualCodingFunc(segments[i]);
    }

    return segments.join(_sep);
  };
}
