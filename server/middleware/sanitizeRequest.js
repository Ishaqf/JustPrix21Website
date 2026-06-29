const { FilterXSS } = require('xss');

// Empty whitelist + stripIgnoreTag/Body: no HTML is ever legitimate in any
// of our text fields (names, titles, addresses, etc.), so strip all tags
// entirely rather than the default xss() behaviour of just neutralizing
// dangerous ones while leaving harmless-looking tags in place.
const xssFilter = new FilterXSS({
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script'],
});

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return xssFilter.process(value);
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      value[i] = sanitizeValue(value[i]);
    }
    return value;
  }
  if (value !== null && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      value[key] = sanitizeValue(value[key]);
    });
    return value;
  }
  return value;
};

// req.body/req.params are plain mutable properties by the time this runs
// (assigned by body-parser/multer and the router respectively), so mutating
// their contents in place works normally.
//
// req.query does NOT work the same way: Express 5 defines it as a getter
// that re-parses req.url from scratch on every single access (verified
// against the installed express@5 source — there is no caching). Mutating
// the object returned by one access is silently discarded the moment
// anything reads req.query again, including the controller. Reassigning
// `req.query = x` also doesn't work — it throws, since the property has no
// setter. The fix is to redefine the property itself to a static value,
// which `configurable: true` permits without going through the (missing)
// setter.
const sanitizeRequest = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    sanitizeValue(req.body);
  }

  if (req.params && typeof req.params === 'object') {
    sanitizeValue(req.params);
  }

  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = sanitizeValue({ ...req.query });
    Object.defineProperty(req, 'query', {
      value: sanitizedQuery,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  next();
};

module.exports = sanitizeRequest;
