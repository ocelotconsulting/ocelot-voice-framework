module.exports = {
  createHandler: require('./createHandler'),
  acceptIntent: require('./util/acceptIntent'),
  craftResponse: require('./util/craftResponse'),
  slotMatcher: require('./util/alexaSlotMatcher'),
  ErrorHandler: require('./ErrorHandler'),
}
