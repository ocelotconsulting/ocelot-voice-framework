const ErrorHandler = {
  canHandle: () => true,
  handle: (handlerInput, error) => {
    console.log(`~~~~~ Error handled: ${error.message}: ${error.stack}`)

    return handlerInput
      .responseBuilder
      .speak('Sorry, an error occurred. Please try again')
      .withShouldEndSession(false)
      .getResponse()
  }
}

module.exports = ErrorHandler
