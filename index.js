module.exports = {
  createHandler: require('./createHandler'),
  createLocalizationInterceptor: require('./createLocalizationInterceptor'),
  ErrorHandler: require('./ErrorHandler'),
  acceptIntent: require('./util/acceptIntent'),
  craftResponse: require('./util/craftResponse'),
  slotMatcher: require('./util/alexaSlotMatcher'),
}
