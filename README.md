Ocelot Voice Framework

Ocelot Voice Framework is designed to enable you to build context aware state machines as conversations within Alexa or Lex voice platforms

createHandler
Generates the one and only request handler you need for your application
`conversationSet` json for each of your subConversations. Each conversation will be an object with a single key (the conversation\'s name) with it's own set of `acceptIntent` and `craftResponse` definitions. For example, a conversationSet with the two conversations `greeting` and `randomFact` would look like

```
{
  greeting: {
    acceptIntent: () => { ... },
    craftResponse: () => { ... },
  },
  randomFact: {
    acceptIntent: () => { ... },
    craftResponse: () => { ... },
  },
}
```

`fetchSession` (optional) async function that's called to retrieve session data for a particular user - could be a get request to an api. If omitted, your application will use Alexa's default session storage. With this approach, you don\'t need to manage the data for your session state but users will lose the ability to resume conversations from previous sessions.
`saveSession` (optional) async function that's called at the end of each interaction with the user to save the state the session is in between invocations. If omitted, your application will use Alexa's built in session storage.
Note: If using fetchSession, you must also use saveSession and vice versa. If one is missing, the feedback loop won\'t be complete. In this case, we\'ll use Alexa's session storage and warn you in the console that your fetch/save will be ignored until the missing function is provided.
Example:

```
const { saveSessionToDynamoDb, getSessionFromDynamoDb } = require('../service/SessionAttributesService');
const { createHandler } = require('@ocelot-consulting/ocelot-voice-framework')

const StateHandler = createHandler({
  conversationSet: {
    ...require('./subConversations/engagement'),
    ...require('./subConversations/help'),
    ...require('./subConversations/timeTracking'),
    ...require('./subConversations/resume'),
  },
  fetchSession: getSessionFromDynamoDb,
  saveSession: saveSessionToDynamoDb,
})
```

createLocalizationInterceptor
Generates a request interceptor for your application that injects all dialog options for use in your application's craftResponse calls. It has built in support for different locales
The function takes your dialog options (in json) as the only argument
Example:

```
const { createLocalizationInterceptor } = require('@ocelot-consulting/ocelot-voice-framework')

const LocalizationInterceptor = createLocalizationInterceptor({
  ...require('../dialog/en-US/SupportDialog'),
  ...require('../dialog/en-US/HelpDialog'),
  ...require('../dialog/en-US/TimeTrackingDialog'),
})
```

ErrorHandler
Generic error handler that prints errors to the console and responds to the user with "Sorry, an error occurred". Can be used as your only error handler, or as a "catch all" handler when your more specific error handlers are\'nt triggered
There are no inputs or calls like there are with createHandler and createLocalizationInterceptor - you just pass this object directly to your Alexa SkillBuilder\'s `addErrorHandlers` function on creation

acceptIntent
Utility function used in each of your sub conversations in order to process the intent and handle any necessary state changes or conversational transitions
`conversationStack` (arr)
`currentSubConversation` (obj)
`intent` (obj)
`topConversation` (bool)
`fallThrough` (bool)
`poppedConversation` (bool)
`sessionAttributes` (obj)
`stateMap` (obj)
`initialState` (obj)
`context` (func)
`transitionStates` (arr)
`interceptCallback` (func)

craftResponse
Utility function used in each of your sub conversations that generates the response to be spoken back to the user based one the current state of the conversation
`finalWords` (bool)
`formatContext` (func)
`overrideResume` (bool)
`states` (obj)
`subConversation` (obj)

slotMatcher
Alexa-specific utility functions for slots;
`slotMatches` returns true or false based on whether or not the user's response matched a slot correctly
`getSlotValueId` returns the resolved value Alexa matched to the user\'s response. i.e. if the user responds with "yup" and it matches a yes/no slot, the return value would be "yes", not "yup"
The input for both functions is the slot object from Alexa - they\'re specific to Alexa because they assume the json will be structured in the format Alexa provides.
