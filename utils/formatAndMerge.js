const _ = require('lodash')

const format = (string = "") => string.replace(/(\r\n|\r|\n)/g, ' ').replace(/ +(?= )/g,'').trim()

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

module.exports = (...objects) => {
  const formatted = objects.reduce((acc, obj = {}) => acc.concat(deepFormat(obj)), []);

  return _.merge(...formatted);
}
