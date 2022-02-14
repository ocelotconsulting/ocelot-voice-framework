# Ocelot Voice Framework

Ocelot Voice Framework is designed to enable you to build context aware state machines as conversations within Alexa or Lex voice platforms.

Note: this framework requires the [`robot3`](https://www.npmjs.com/package/robot3) library for building state machines capable of handling the necessary conversation transitions.

---

# Use (Alexa)

This framework is used alongside Amazon's [`ask-sdk-core`](https://www.npmjs.com/package/ask-sdk-core). To get started, install this package to your alexa project. If you've never set up an Alexa project before, [start here](https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/develop-your-first-skill.html). Your application's entry point will look something like this

```javascript
const {
  ErrorHandler,
  createHandler,
  createLocalizationInterceptor,
} = require('@ocelot-consulting/ocelot-voice-framework')
const Alexa = require('ask-sdk-core')

const StateHandler = createHandler({
  conversationSet: [ ... ],
  fetchSession: () => { ... },
  saveSession: () => { ... },
})

const LocalizationInterceptor = createLocalizationInterceptor({
  fakeDialogOption1: { ... },
  fakeDialogOption2: { ... },
  fakeDialogOption3: { ... },
})

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(StateHandler)
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda()
```

The key difference between this framework and a normal Alexa application are:

- conversations have contextual information stored as json that can be used to influence the conversation. for example, you can keep track of how many unexpected responses you've received from a user and show longer helpful messages rather than the quick convenient responses for most users.

- session data storage can be managed by you. that means that if your session with alexa is interrupted, you can resume it by restarting the app, even if you're using a different device. if you don't want to use this feature, simply omit the `fetchSession` and `saveSession` functions from your state handler invocation.

- normal alexa apps add a new request handler and intent for each conversation option - the intent is used to navigate to the correct request handler. this framework uses the code generated by `createHandler` as the one and only request handler for the whole application so you don't need to worry about writing them. intents are used for navigating between sub conversations rather than handlers.

- slots TODO

---

# Documentation

## [`createHandler`](https://github.com/ocelotconsulting/ocelot-voice-framework/blob/master/createHandler.js) (function)

generates the one and only request handler you need for your application. Has one object for a parameter, keys defined below

`conversationSet` (array\*) \
json for each of your subConversations where the app's logic lives. Each conversation will be an object with a single key (the conversation\'s name) with it's own set of `acceptIntent` and `craftResponse` definitions. For example, a conversationSet with the two conversations `greeting` and `askName` would look like this

```javascript
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

`fetchSession` (function) \
asynchronous function that's called to retrieve session data for a particular user - could be a get request to an api. If omitted, your application will use Alexa's default session storage. With this approach, you don\'t need to manage the data for your session state but users will lose the ability to resume conversations from previous sessions.

`saveSession` (function) \
asynchronous function that's called at the end of each interaction with the user to save the state the session is in between invocations. If omitted, your application will use Alexa's built in session storage.
Note: If using fetchSession, you must also use saveSession and vice versa. If one is missing, the feedback loop won\'t be complete. In this case, we\'ll use Alexa's session storage and warn you in the console that your fetch/save will be ignored until the missing function is provided.

### Example

```javascript
const {
	saveSessionToDynamoDb,
	getSessionFromDynamoDb,
} = require('../service/SessionAttributesService')
const { createHandler } = require('@ocelot-consulting/ocelot-voice-framework')

const StateHandler = createHandler({
	conversationSet: {
		...require('./subConversations/engagement'),
		...require('./subConversations/greeting'),
		...require('./subConversations/askName'),
		...require('./subConversations/resume'),
	},
	fetchSession: getSessionFromDynamoDb,
	saveSession: saveSessionToDynamoDb,
})
```

---

## [`createLocalizationInterceptor`](https://github.com/ocelotconsulting/ocelot-voice-framework/blob/master/createLocalizationInterceptor.js) (function)

generates a request interceptor for your application that injects all dialog options for use in your application's craftResponse calls. It has built in support for different locales
The function takes your dialog options (in json) as the only argument

### Example

```javascript
const {
	createLocalizationInterceptor,
} = require('@ocelot-consulting/ocelot-voice-framework')

const LocalizationInterceptor = createLocalizationInterceptor({
	...require('../dialog/en-US/SupportDialog'),
	...require('../dialog/en-US/HelpDialog'),
	...require('../dialog/en-US/TimeTrackingDialog'),
})
```

Dialog options are json objects merged together. The leaf nodes of the json tree are the phrases alexa speaks to the user. They're passed as an array because you can give alexa different variations of each phrase so things don't feel scripted. The localization interceptor chooses one of the options at random. There will be an example dialog object below.

---

## [`ErrorHandler`](https://github.com/ocelotconsulting/ocelot-voice-framework/blob/master/ErrorHandler.js) (object)

Generic error handler that prints errors to the console and responds to the user with "Sorry, an error occurred". Can be used as your only error handler, or as a "catch all" handler when your more specific error handlers are'nt triggered
There are no inputs or calls like there are with createHandler and createLocalizationInterceptor - you just pass this object directly to your Alexa SkillBuilder's `addErrorHandlers` function on creation

---

## [`acceptIntent`](https://github.com/ocelotconsulting/ocelot-voice-framework/blob/master/util/acceptIntent.js) (async func)

Utility function used in each of your sub conversations in order to process the intent and handle any necessary state changes or conversational transitions

`conversationStack` (array)

`currentSubConversation` (object)

`intent` (object)

`topConversation` (boolean)

`fallThrough` (boolean)

`initialState` (object)

`context` (function)

`transitionStates` (array)

`interceptCallback` (function)

---

## [`craftResponse`](https://github.com/ocelotconsulting/ocelot-voice-framework/blob/master/util/craftResponse.js) (function)

Utility function used in each of your sub conversations that generates the response to be spoken back to the user based one the current state of the conversation

`finalWords` (boolean) \
this indicates that there's nothing left to say and craftResponse returns an empty string when true. this is passed internally by the state handler and should be forwarded

`formatContext` (function) \
sometimes, the information alexa collects isn't in a form that allows you to repeat it back to the user. for example, when scheduling appointments, collecting a date using amazon's AMAZON.DATE slot type leaves you with an ISO code. the formatContext function allows you to modify the data that gets written to the conversation's context. code for the example above;

```javascript
const makeAppointment = {
	craftResponse: ({ subConversation, dialog, finalWords }) =>
		craftResponse({
			formatContext: (ctx) => ({
				...ctx,
				date: formatDate(ctx.date),
			}),
		}),
}
```

`overrideResume` (boolean) \
when you transition from one state to another mid conversation, coming back to the previous conversation will trigger the resume state for your conversation. in cases where you don't the resume to trigger, you override it by setting overrideResume to true.

`states` (object) \
key map that correlates each transitory state with the text alexa should speak to the user.

`subConversation` (object) \
the subConversation that you're generating a response for. this is provided by the framework and just needs to be passed along as you call the function

---

## [`slotMatcher`](https://github.com/ocelotconsulting/ocelot-voice-framework/blob/master/util/alexaSlotMatcher.js)

Alexa-specific utility functions for slots

`slotMatches` returns true or false based on whether or not the user's response matched a slot correctly

`getSlotValueId` returns the resolved value Alexa matched to the user\'s response. i.e. if the user responds with "yup" and it matches a yes/no slot, the return value would be "yes", not "yup"
The input for both functions is the slot object from Alexa - they\'re specific to Alexa because they assume the json will be structured in the format Alexa provides.

---

# Putting it all together

Example below is of a conversation designed to collect a user's first and last name

```javascript
const { state, transition, guard } = require('robot3')
const {
	acceptIntent,
	craftResponse,
	slotMatcher,
} = require('@ocelot-consulting/ocelot-voice-framework')

const stateMap = {
	fresh: state(transition('processIntent', 'askFirstName')),
	askFirstName: state(
		transition(
			'processIntent',
			'askLastName',
			// if the user didn't successfully fill the firstName slot,
			// don't move on to asking about last name
			guard((ctx, { intent }) => intent.slots.firstName !== ''),
			reduce((ctx, { intent }) => ({
				...ctx,
				firstName: slotMatcher.getSlotValueId(intent.slots.firstName),
			}))
		),
		// instead, re-ask about first name
		transition('processIntent', 'askFirstName')
	),
	askLastName: state(
		transition(
			'processIntent',
			'thankYou',
			guard((ctx, { intent }) => intent.slots.lastName !== ''),
			reduce((ctx, { intent }) => ({
				...ctx,
				lastName: slotMatcher.getSlotValueId(intent.slots.lastName),
			}))
		),
		transition('processIntent', 'askLastName')
	),
	thankYou: state(),
}

const askName = {
	acceptIntent: async (args) =>
		await acceptIntent({
			...args,
			initialState: {
				firstName: '',
				lastName: '',
			},
			stateMap,
			transitionStates: ['confirmName'],
		}),
	craftResponse: ({ dialog, subConversation }) =>
		craftResponse({
			subConversation,
			states: {
				askFirstName: () => dialog('askName.askFirstName'),
				askLastName: ({ firstName }) =>
					dialog('askName.askLastName', { firstName }),
				thankYou: ({ firstName, lastName }) =>
					dialog('askName.thankYou', { firstName, lastName }),
			},
		}),
}
```

And the dialog options for this conversation (pass them to `createLocalizationInterceptor` so they're available when calling `dialog`)

```javascript
const askName = {
	askFirstName: [
		`Hi. What is your first name?`,
		`Hello. What's your first name?``Hey there. What is your first name?`,
	],
	askLastName: [
		`Thanks {{firstName}}.  What's your last name?`,
		`Got it, {{firstName}}.  Now what about your last name?`,
		`Great.  Can you give me your last name next, {{firstName}}?`,
	],
	thankYou: [
		`Thanks for your response {{firstName}} {{lastName}}.`,
		`{{firstName}} {{lastName}} thank you for answering.`,
		`Okay, got it {{firstName}} {{lastName}}.`,
	],
}
```