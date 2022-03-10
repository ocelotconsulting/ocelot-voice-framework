# Ocelot Voice Framework

Ocelot Voice Framework is designed to enable you to build context aware state machines as conversations for Alexa/Lex voice platforms.

Note: this framework requires the [`robot3`](https://www.npmjs.com/package/robot3) library for building state machines capable of handling the necessary conversation transitions.

---

# Use (Alexa)

This framework is used alongside Amazon's [`ask-sdk-core`](https://www.npmjs.com/package/ask-sdk-core). To get started, install this package to your alexa project. If you've never set up an Alexa project before, [start here](https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/develop-your-first-skill.html)

The key differences between this framework and a normal Alexa application are:

- conversations have contextual information stored as json that can be used to influence the conversation. for example, you can keep track of how many unexpected responses you've received from a user and show longer helpful messages rather than the quick convenient responses for most users.

- session data storage can be managed by you. that means that if your session with alexa is interrupted, you can resume it by restarting the app, even if you're using a different device. if you don't want to use this feature, simply omit the `fetchSession` and `saveSession` functions from your state handler invocation.

- normal alexa apps add a new request handler and intent for each conversation option - the intent is used to navigate to the correct request handler. this framework uses it's own request handler behind the scenes for every request so you don't worry about writing them. intents are used for navigating between sub conversations rather than handlers.

- slots TODO

---

# Documentation

## [`generate`](https://github.com/ocelotconsulting/ocelot-voice-framework/blob/master/createHandler.js) (function)

generates your alexa application using your conversationSet and dialog options

`conversationSet` (array\*) \
json for each of your subConversations where the app's logic lives. Each conversation will be an object with a `handle` function, and for root conversations an `intent` to match the associated intent in the interaction model. There are other options you can return, but intent and handle are the most important. A conversationSet with the two conversations `greeting` and `randomFact` would look like this

```javascript
{
  greeting: {
    intent: 'GreetingIntent',
    handle: () => { ... },
  },
  randomFact: {
    intent: 'RandomFactIntent',
    handle: () => { ... },
  },
}
```

`fetchSession` (function) \
asynchronous function that's called to retrieve session data for a particular user - could be a get request to an api. If omitted, your application will use Alexa's default session storage. With this approach, you don\'t need to manage the data for your session state but users will lose the ability to resume conversations from previous sessions.

`saveSession` (function) \
asynchronous function that's called at the end of each interaction with the user to save the state the session is in between invocations. If omitted, your application will use Alexa's built in session storage.
Note: If using fetchSession, you must also use saveSession and vice versa. If one is missing, the feedback loop won\'t be complete. In this case, we\'ll use Alexa's session storage and warn you in the console that your fetch/save will be ignored until the missing function is provided.

`dialog` (object) \
a master list of all your application's dialog options

### Example

```javascript
const {
	saveSessionToDynamoDb,
	getSessionFromDynamoDb,
} = require('../service/SessionAttributesService')
const { generate } = require('@ocelot-consulting/ocelot-voice-framework')

exports.handler = generate({
	conversationSet: {
		...require('./subConversations/greeting'),
		...require('./subConversations/randomFact'),
	},
  dialog: {
    ...require('./dialog/GreetingDialog'),
    ...require('./dialog/RandomFactDialog'),
  },
  fetchSession: getSessionFromDynamoDb,
  saveSession: saveSessionToDynamoDb,
})
```

---

## [`acceptIntent`](https://github.com/ocelotconsulting/ocelot-voice-framework/blob/master/util/acceptIntent.js) (async func)

## [`handle`](https://github.com/ocelotconsulting/ocelot-voice-framework/blob/master/util/craftResponse.js) (function)






The primary place for your subConversation's logic. In the handle function, each of your sub conversations have the following available parameters for you to use

`conversationSet` (object) \
contains all of your subConversations - this is the same object you passed to the generate function

`conversationStack` (array) \
array of all active subConversations in order or oldest to newest. when a subConversation triggers a new subConversation, the current subConversation is pushed into the conversationStack and replaced with the new subConversation

`sessionAttributes` (object) \
json that exposes all of the application's state.  can be used as global state but warning; the conversation relies on some of the values. sessionAttributes.conversationAttributes is what you should use for global state in your conversation

`intent` (object) \
intent json from alexa with slot data

`poppedConversation` (boolean) \
indicates when the subConversation being processed has been popped from the stack.  This happens when a subConversation is resolved

`dialog` (function) \
function that exposes your dialog options to speak to the user

`currentSubConversation` (object) \
the subConversation that the conversation engine is currently generating a response for - the most recent subConversation

`subConversation` (object) \
the subConversation that the conversation engine is processing during the loop.  not to be confused with currentSubConversation

`finalWords` (boolean) \
indicates that there's nothing left to say and that the subConversation is over








From your handle function, you should return the following

`finalWords` (boolean) \
indicates that there's nothing left to say and that the subConversation is over

`formatContext` (function) \
sometimes, the information alexa collects isn't in a form that allows you to repeat it back to the user. for example, when scheduling appointments, collecting a date using amazon's AMAZON.DATE slot type leaves you with an ISO code. the formatContext function allows you to modify the data that gets written to the conversation's context

```javascript
const makeAppointment = {
  handle: () => ({
    formatContext: ctx => ({
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











# Putting it all together

Example below is of a conversation designed to collect a user's first and last name

```javascript
const {
  state,
  transition,
  guard,
  invoke,
  immediate,
} = require('robot3')
const { utils } = require('@ocelot-consulting/ocelot-voice-framework')

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
				firstName: utils.getSlotValueId(intent.slots.firstName),
			}))
		),
		// instead, re-ask about first name
		transition('processIntent', 'askFirstName')
	),
	askLastName: state(
		transition(
			'processIntent',
			'askForConfirmation',
			guard((ctx, { intent }) => intent.slots.lastName !== ''),
			reduce((ctx, { intent }) => ({
				...ctx,
				lastName: utils.getSlotValueId(intent.slots.lastName),
			}))
		),
		transition('processIntent', 'askLastName')
	),
  askForConfirmation: state(
    transition('processIntent', 'thankYou',
      guard((ctx, { intent }) => utils.getSlotValueId(intent.slots.confirmed) === 'yes',
    ),
    transition('processIntent', 'restart',
      guard((ctx, { intent }) => utils.getSlotValueId(intent.slots.confirmed) === 'no'),
    ),
    transition('processIntent', 'askForConfirmation')
  ),
  restart: immediate('askFirstName'),
	thankYou: state(),
}

const askName = {
  intent: 'AskNameIntent',
  handle: () => ({
    initialState: {
      firstName: '',
      lastName: '',
    },
    stateMap,
  })
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
  askForConfirmation: [
    `So your name is {{firstName}} {{lastName}}?`,
    `Got it.  I heard your name was {{firstName}} {{lastName}}.  Is that correct?`
  ],
  restart: [
    `Oops. Let's try again.`
  ],
	thankYou: [
		`Thanks for your response {{firstName}} {{lastName}}.`,
		`{{firstName}} {{lastName}} thank you for answering.`,
		`Okay, got it {{firstName}} {{lastName}}.`,
	],
}
```

And finally, the json for the interaction model

```json
{
  "interactionModel": {
    "languageModel": {
      "invocationName": "ask name skill",
      "intents": [
        {
          "name": "AskNameIntent",
          "samples": [
            "Ask my name",
            "Ask me my name",
            "Ask for my name"
          ],
          "slots": [
            {
              "name": "firstName",
              "type": "AMAZON.FirstName",
              "samples": [
                "{firstName}"
              ]
            },
            {
              "name": "lastName",
              "type": "AMAZON.LastName",
              "samples": [
                "{lastName}"
              ]
            },
            {
              "name": "confirmed",
              "type": "yesNoType",
              "samples": [
                "{confirmed}"
              ]
            },
          ]
        }
      ],
      "types": [
        {
          "name": "yesNoType",
          "values": [
            {
              "id": "no",
              "name": {
                "value": "no",
                "synonyms": [
                  "no thanks",
                  "nah",
                  "negative",
                  "incorrect",
                  "never",
                  "nope",
                  "false"
                ]
              }
            },
            {
              "id": "yes",
              "name": {
                "value": "yes",
                "synonyms": [
                  "sounds good",
                  "yup",
                  "yeah",
                  "affirmative",
                  "correct",
                  "always",
                  "ok",
                  "sure",
                  "true"
                ]
              }
            }
          ]
        },
      ],
    }
  },
  "dialog": {
    "intents": [
      {
        "name": "AskNameIntent",
        "confirmationRequired": false,
        "prompts": {},
        "slots": [
          {
            "name": "firstName",
            "type": "AMAZON.FirstName",
            "elicitationRequired": false,
            "confirmationRequired": false,
            "prompts": {}
          },
          {
            "name": "lastName",
            "type": "AMAZON.LastName",
            "elicitationRequired": false,
            "confirmationRequired": false,
            "prompts": {}
          },
          {
            "name": "confirmed",
            "type": "yesNoType",
            "elicitationRequired": false,
            "confirmationRequired": false,
            "prompts": {}
          }
        ]
      }
    ]
  }
}

```
