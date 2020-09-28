/*!
 * URI.js - Mutating URLs
 * Second Level Domain (SLD) Support
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
import SLDList from './SecondLevelDomains.jsd'
class SLD {
  // list of known Second Level Domains
  // converted list of SLDs from https://github.com/gavingmiller/second-level-domains
  // ----
  // publicsuffix.org is more current and actually used by a couple of browsers internally.
  // downside is it also contains domains like "dyndns.org" - which is fine for the security
  // issues browser have to deal with (SOP for cookies, etc) - but is way overboard for URI.js
  // ----
  // gorhill 2013-10-25: Using indexOf() instead Regexp(). Significant boost
  // in both performance and memory footprint. No initialization required.
  // http://jsperf.com/uri-js-sld-regex-vs-binary-search/4
  // Following methods use lastIndexOf() rather than array.split() in order
  // to avoid any memory allocations.

  static has(domain) {
    const tldOffset = domain.lastIndexOf('.');
    if (tldOffset <= 0 || tldOffset >= (domain.length - 1)) {
      return false;
    }
    const sldOffset = domain.lastIndexOf('.', tldOffset - 1);
    if (sldOffset <= 0 || sldOffset >= (tldOffset - 1)) {
      return false;
    }
    const sldList = SLDList[domain.slice(tldOffset + 1)];
    if (!sldList) {
      return false;
    }
    return sldList.indexOf(' ' + domain.slice(sldOffset + 1, tldOffset) + ' ') >= 0;
  }
  static is(domain) {
    const tldOffset = domain.lastIndexOf('.');
    if (tldOffset <= 0 || tldOffset >= (domain.length - 1)) {
      return false;
    }
    const sldOffset = domain.lastIndexOf('.', tldOffset - 1);
    if (sldOffset >= 0) {
      return false;
    }
    const sldList = SLDList[domain.slice(tldOffset + 1)];
    if (!sldList) {
      return false;
    }
    return sldList.indexOf(' ' + domain.slice(0, tldOffset) + ' ') >= 0;
  }
  static get(domain) {
    const tldOffset = domain.lastIndexOf('.');
    if (tldOffset <= 0 || tldOffset >= (domain.length - 1)) {
      return null;
    }
    const sldOffset = domain.lastIndexOf('.', tldOffset - 1);
    if (sldOffset <= 0 || sldOffset >= (tldOffset - 1)) {
      return null;
    }
    const sldList = SLDList[domain.slice(tldOffset + 1)];
    if (!sldList) {
      return null;
    }
    if (sldList.indexOf(' ' + domain.slice(sldOffset + 1, tldOffset) + ' ') < 0) {
      return null;
    }
    return domain.slice(sldOffset + 1);
  }
}

export default SLD
