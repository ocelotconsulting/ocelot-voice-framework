const ErrorHandler = {
  canHandle: () => true,
  handle: (handlerInput, error) => {
    console.log(`~~~ Error handled: ${error.message}: ${error.stack}`)

    return 'Sorry, an error occurred. Please try again'
  }
}

module.exports = ErrorHandler
