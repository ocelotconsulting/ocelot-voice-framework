const { handlerInput } = require('./mockHandlerInput')

const mockGetSession = jest.fn(() => handlerInput.attributesManager.getSessionAttributes())
const mockSaveSession = jest.fn(sessionAttributes => handlerInput.attributesManager.setSessionAttributes(sessionAttributes))

module.exports = {
  mockGetSession,
  mockSaveSession,
}
