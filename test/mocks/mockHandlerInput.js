const mock_ = require('lodash')

let mockRequestAttributesKeys = {}
let mockSessionAttributes = {}
let mockSlots = {}

const setRequestAttributes = newKeys => {
  mockRequestAttributesKeys = mock_.merge(mockRequestAttributesKeys, newKeys)
}

const setSlots = newSlots => {
  mockSlots = mock_.merge(mockSlots, newSlots)
}

const handlerInput = {
  attributesManager: {
    getRequestAttributes: () => ({
      t: key => {
        if (!mockRequestAttributesKeys[key]) console.log(`getRequestAttributes called with missing key: ${key}`);
        return mockRequestAttributesKeys[key];
      }
    }),
    setRequestAttributes,
    getSessionAttributes: () => mockSessionAttributes,
    setSessionAttributes: newSession => {
      mockSessionAttributes = newSession
    },
  },
  responseBuilder: {
    speak: jest.fn().mockReturnThis(),
    withShouldEndSession: jest.fn().mockReturnThis(),
    getResponse: jest.fn().mockReturnThis(),
    addElicitSlotDirective: jest.fn().mockReturnThis(),
    addConfirmSlotDirective: jest.fn().mockReturnThis(),
    reprompt: jest.fn().mockReturnThis(),
    addDelegateDirective: jest.fn().mockReturnThis(),
    withSimpleCard: jest.fn().mockReturnThis(),
  },
  requestEnvelope: {
    request: {
      intent: {
        name: 'GenericIntentName',
        slots: mockSlots,
      },
      type: 'GenericRequestType',
    },
    session: {
      user: {
        userId: 'fakeUserId'
      },
    },
  },
}

module.exports = {
  handlerInput,
  setSlots,
}
