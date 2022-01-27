const _ = require('lodash');
const i18next = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

const format = (string = "") => string.replace(/(\r\n|\r|\n)/g, ' ').replace(/ +(?= )/g,'').trim();

const deepFormat = obj => {
	Object.keys(obj).forEach(key => {
    const data = obj[key];

    if (Array.isArray(data)) {
      obj[key] = data.map(format);
    } else if (typeof data === 'object' && data !== null) {
      obj[key] = deepFormat(obj[key]);
    } else if (typeof data === 'string') {
      obj[key] = format(data);
    }
	});

	return obj;
}

const formatAndMerge = (...objects) => {
  const formatted = objects.reduce((acc, obj = {}) => acc.concat(deepFormat(obj)), []);

  return _.merge(...formatted);
}

/**
 * i18next translation object format
 * locale:
 *     namespace:
 *         actual_translation_values
 *
 * The default namespace is 'translation'.
 **/

// const translations = formatAndMerge({
//   ['en-US']: {
//     translation: {
//       ...require('./en-US/SupportDialog'),
//       ...require('./en-US/BillingDialog'),
//       ...require('./en-US/ReportOutageDialog'),
//       ...require('./en-US/EstimatedRestorationDialog'),
//       ...require('./en-US/HelpDialog'),
//       ...require('./en-US/SimpleRPGDialog'),
//       ...require('./en-US/TimeTrackingDialog'),
//       ...require('./en-US/ConfirmAddressDialog'),
//     },
//   },
// });

const getVariationOfAOrAn = (value, capitalize) => [ 'a', 'e', 'i', 'o', 'u', 'h' ].includes(value.substring(0, 1)) ?
  capitalize ? 'An' : 'an' :
  capitalize ? 'A' : 'a';

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
