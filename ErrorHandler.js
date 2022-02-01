const ErrorHandler = {
  canHandle: () => true,
  handle: (handlerInput, error) => {
    console.log(`~~~~~ Error handled: ${error.message}: ${error.stack}`)
    console.log('Error handlerInput: ', JSON.stringify(handlerInput))

    return 'Sorry, an error occurred. Please try again'
  }
}

module.exports = ErrorHandler
