// const { mockGetSession, mockSaveSession } = require('./mocks/mockSessionAttributesService')
// const { conversationSet } = require('./mocks/mockConversationSet')
// const { handlerInput, setSlots } = require('./mocks/mockHandlerInput')
// const createHandler = require('../generate/createHandler')

// const conversation = createHandler({
//   conversationSet,
//   fetchSession: mockGetSession,
//   saveSession: mockSaveSession,
// })

// describe('Conversation Tests', () => {
//   beforeEach(() => {
//     handlerInput.requestEnvelope.request.type = 'IntentRequest'
//     handlerInput.responseBuilder.speak.mockClear()
//     handlerInput.responseBuilder.reprompt.mockClear()
//     handlerInput.responseBuilder.addElicitSlotDirective.mockClear()
//     handlerInput.responseBuilder.addConfirmSlotDirective.mockClear()
//     handlerInput.responseBuilder.withShouldEndSession.mockClear()
//     handlerInput.responseBuilder.getResponse.mockClear()
//     mockGetSession.mockClear()
//     mockSaveSession.mockClear()
//   })

//   it('handles all of the things', () => {
//     expect(conversation.canHandle("test")).toBeTruthy();
//   })

//   it('sets current conversation to engagement on start', async () => {
//     handlerInput.attributesManager.setSessionAttributes({
//     });
//     const slots = {};
//     setSlots(slots);

//     handlerInput.requestEnvelope.request.type = 'LaunchRequest';

//     await conversation.handle(handlerInput);

//     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
//     const state = sessionAttributes.state;
//     expect(state.currentSubConversation).toEqual({engagement:{}});
//     expect(state.conversationStack.length).toEqual(0);
//   })

//   it('responds with engagement when blank', async () => {
//     handlerInput.attributesManager.setSessionAttributes({
//     });
//     const slots = {};
//     setSlots(slots);

//     handlerInput.requestEnvelope.request.type = 'LaunchRequest';

//     await conversation.handle(handlerInput);

//     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
//     const state = sessionAttributes.state;
//     expect(state.currentSubConversation).toEqual({engagement:{}});
//     expect(state.conversationStack.length).toEqual(0);
//     expect(handlerInput.responseBuilder.speak.mock.calls.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls[0][0]).toEqual("engagement text");
//   })

//   it('moves to step 1 with intent', async () => {
//     const slots = {};
//     setSlots(slots);

//     handlerInput.requestEnvelope.request.intent.name = 'step1Intent';

//     await conversation.handle(handlerInput);

//     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
//     const state = sessionAttributes.state;
//     expect(state.currentSubConversation).toEqual({step1:{parent:'engagement'}});
//     expect(state.conversationStack.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls[0][0]).toEqual("step1 text");
//   })

//   it('already in step 1 with intent', async () => {
//     handlerInput.attributesManager.setSessionAttributes({
//       state: {
//         currentSubConversation: {step1:{}},
//         conversationStack: [{engagement:{}}]
//       }
//     });
//     const slots = {};
//     setSlots(slots);

//     handlerInput.requestEnvelope.request.intent.name = 'step1Intent';

//     await conversation.handle(handlerInput);

//     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
//     const state = sessionAttributes.state;
//     expect(state.currentSubConversation).toEqual({step1:{complain: true}});
//     expect(state.conversationStack.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls[0][0]).toEqual("you're already in step1");
//   })

//   it('moves to step 2 with intent', async () => {
//     handlerInput.attributesManager.setSessionAttributes({
//       state: {
//         currentSubConversation: {engagement:{}},
//         conversationStack: []
//       }
//     });
//     const slots = {};
//     setSlots(slots);

//     handlerInput.requestEnvelope.request.intent.name = 'step2Intent';

//     await conversation.handle(handlerInput);

//     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
//     const state = sessionAttributes.state;
//     expect(state.currentSubConversation).toEqual({step2:{parent:'engagement'}});
//     expect(state.conversationStack.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls[0][0]).toEqual("step2 text");
//   })

//   it('moves to step 2 with intent and slot', async () => {
//     handlerInput.attributesManager.setSessionAttributes({
//       state: {
//         currentSubConversation: {engagement:{}},
//         conversationStack: []
//       }
//     });
//     const slots = {
//       num: {
//         name: 'num',
//         value: '3',
//         confirmationStatus: 'NONE',
//       },
//       good: {
//         name: 'good',
//         value: '',
//         confirmationStatus: 'NONE',
//       },
//     };
//     setSlots(slots);

//     handlerInput.requestEnvelope.request.intent.name = 'step2Intent';

//     await conversation.handle(handlerInput);

//     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
//     const state = sessionAttributes.state;
//     expect(state.currentSubConversation).toEqual({step2:{numValue:'3',parent:'engagement'}});
//     expect(state.conversationStack.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls[0][0]).toEqual("step2 text 3");
//   })

//   it('moves to step 2 with intent and slots with reset', async () => {
//     handlerInput.attributesManager.setSessionAttributes({
//       state: {
//         currentSubConversation: {engagement:{}},
//         conversationStack: []
//       }
//     });
//     const slots = {
//       num: {
//         name: 'num',
//         value: '3',
//         confirmationStatus: 'NONE',
//       },
//       good: {
//         name: 'good',
//         value: 'no',
//         confirmationStatus: 'NONE',
//       },
//     };
//     setSlots(slots);

//     handlerInput.requestEnvelope.request.intent.name = 'step2Intent';

//     await conversation.handle(handlerInput);

//     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
//     const state = sessionAttributes.state;
//     expect(state.currentSubConversation).toEqual({step2:{parent:'engagement'}});
//     expect(state.conversationStack.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls[0][0]).toEqual("step2 text");
//   })

//   it('moves to step 2 with intent and slots with pop back to engagement', async () => {
//     handlerInput.attributesManager.setSessionAttributes({
//       state: {
//         currentSubConversation: {step2:{numValue: '3'}},
//         conversationStack: [{engagement:{}}]
//       }
//     });
//     const slots = {
//       num: {
//         name: 'num',
//         value: '3',
//         confirmationStatus: 'NONE',
//       },
//       good: {
//         name: 'good',
//         value: 'yes',
//         confirmationStatus: 'NONE',
//       },
//     };
//     setSlots(slots);

//     handlerInput.requestEnvelope.request.intent.name = 'step2Intent';

//     await conversation.handle(handlerInput);

//     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
//     const state = sessionAttributes.state;
//     expect(state.currentSubConversation).toEqual({engagement:{}});
//     expect(state.conversationStack.length).toEqual(0);
//     expect(handlerInput.responseBuilder.speak.mock.calls.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls[0][0]).toEqual("step2 thanks engagement text");
//   })

//   it('engagement with full intent pops all the way back out', async () => {
//     handlerInput.attributesManager.setSessionAttributes({
//       state: {
//         currentSubConversation: {engagement:{}},
//         conversationStack: []
//       }
//     });
//     const slots = {
//       num: {
//         name: 'num',
//         value: '3',
//         confirmationStatus: 'NONE',
//       },
//       good: {
//         name: 'good',
//         value: 'yes',
//         confirmationStatus: 'NONE',
//       },
//     };
//     setSlots(slots);

//     handlerInput.requestEnvelope.request.intent.name = 'step2Intent';

//     await conversation.handle(handlerInput);

//     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
//     const state = sessionAttributes.state;
//     expect(state.currentSubConversation).toEqual({engagement:{}});
//     expect(state.conversationStack.length).toEqual(0);
//     expect(handlerInput.responseBuilder.speak.mock.calls.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls[0][0]).toEqual("step2 thanks engagement text");
//   })

//   it('down and up again', async () => {
//     handlerInput.attributesManager.setSessionAttributes({
//       state: {
//         currentSubConversation: {engagement: {}},
//         conversationStack: []
//       }
//     });

//     const slots1 = {};
//     setSlots(slots1);

//     handlerInput.requestEnvelope.request.type = 'LaunchRequest';
//     handlerInput.requestEnvelope.request.intent.name = 'GenericIntentName';

//     await conversation.handle(handlerInput);

//     const sessionAttributes1 = handlerInput.attributesManager.getSessionAttributes();
//     const state1 = sessionAttributes1.state;
//     expect(state1.currentSubConversation).toEqual({engagement:{}});
//     expect(state1.conversationStack.length).toEqual(0);
//     expect(handlerInput.responseBuilder.speak.mock.calls.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls[0][0]).toEqual("engagement text");
//     handlerInput.responseBuilder.speak.mockClear();

//     const slots2 = {
//       num: {
//         name: 'num',
//         value: '3',
//         confirmationStatus: 'NONE',
//       },
//       good: {
//         name: 'good',
//         value: '',
//         confirmationStatus: 'NONE',
//       },
//     };
//     setSlots(slots2);

//     handlerInput.requestEnvelope.request.type = 'IntentRequest';
//     handlerInput.requestEnvelope.request.intent.name = 'step2Intent';

//     await conversation.handle(handlerInput);

//     const sessionAttributes2 = handlerInput.attributesManager.getSessionAttributes();
//     const state2 = sessionAttributes2.state;
//     expect(state2.currentSubConversation).toEqual({step2:{numValue:'3',parent:'engagement'}});
//     expect(state2.conversationStack.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls[0][0]).toEqual("step2 text 3");

//     handlerInput.responseBuilder.speak.mockClear();

//     const slots3 = {
//       num: {
//         name: 'num',
//         value: '5',
//         confirmationStatus: 'NONE',
//       },
//       good: {
//         name: 'good',
//         value: 'yes',
//         confirmationStatus: 'NONE',
//       },
//     };
//     setSlots(slots3);

//     handlerInput.requestEnvelope.request.type = 'IntentRequest';
//     handlerInput.requestEnvelope.request.intent.name = 'step2Intent';

//     await conversation.handle(handlerInput);

//     const sessionAttributes3 = handlerInput.attributesManager.getSessionAttributes();
//     const state3 = sessionAttributes3.state;
//     expect(state3.currentSubConversation).toEqual({step2:{numValue:'3', resumeStatement:true,parent:'engagement'}});
//     expect(state3.conversationStack.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls[0][0]).toEqual("step2 thanks step2 resume");

//     handlerInput.responseBuilder.speak.mockClear();

//     const slots4 = {
//       yesNo: {
//         name: 'yesNo',
//         value: 'yes',
//         confirmationStatus: 'NONE',
//       },
//     };
//     setSlots(slots4);

//     handlerInput.requestEnvelope.request.type = 'IntentRequest';
//     handlerInput.requestEnvelope.request.intent.name = 'yesNoIntent';

//     await conversation.handle(handlerInput);

//     const sessionAttributes4 = handlerInput.attributesManager.getSessionAttributes();
//     const state4 = sessionAttributes4.state;
//     expect(state4.currentSubConversation).toEqual({engagement:{}});
//     expect(state4.conversationStack.length).toEqual(0);
//     expect(handlerInput.responseBuilder.speak.mock.calls.length).toEqual(1);
//     expect(handlerInput.responseBuilder.speak.mock.calls[0][0]).toEqual("step2 thanks engagement text");
//   })
// })
