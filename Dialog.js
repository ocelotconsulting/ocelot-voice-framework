const i18next = require('i18next')
const sprintf = require('i18next-sprintf-postprocessor')
const formatAndMerge = require('./util/formatAndMerge')
const getVariationOfAOrAn = require('./util/getVariationOfAOrAn')

module.exports = class Dialog {
  constructor(locale = 'en-US', translations = {}, options = {}) {
    this.locale = locale;
    this.translations = translations;
    this.initialized = false;

    const i18n = i18next.createInstance().use(sprintf);

    i18n.init({
      lng: this.locale,
      debug: options.debug || false, // toggle this for extra logging in i18next
      returnObjects: true,
      fallbackLng: 'en-US',
      initImmediate: true,
      resources: formatAndMerge(this.translations),
      interpolation: {
        format: (value, format, lng) => {
          if (format === 'en-handle-an') return (!lng || lng === 'en-US' || lng === 'en') ? getVariationOfAOrAn(value, false) + ' ' + value : value;
          if (format === 'en-handle-an-capitalized') return (!lng || lng === 'en-US' || lng === 'en') ? getVariationOfAOrAn(value, true) + ' ' + value : value;
          return value;
        }
     },
    });

    this.i18n = i18n;

    return this;
  }

  getText(key, params = {}) {
    const value = this.i18n.t(key, { ...params, returnObjects: true });
    // i18next returns the key if the value isn't available in the locale, or
    // fallback translation.
    // TODO: Discuss how to verify that each function will return a valid dialog text

    if (value === key) {
      throw new Error('No translation key available for key [' + key + '].');
    }

    if (Array.isArray(value)) {
      return value[Math.floor(Math.random() * value.length)];
    }

    return value;
  }
};
