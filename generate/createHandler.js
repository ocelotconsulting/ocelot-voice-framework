const acceptIntentHelper = require('../utils/acceptIntent')
const craftResponseHelper = require('../utils/craftResponse')
const generateHome = require('../conversationTemplates/home')
const resume = require('../conversationTemplates/resume')
const forgot = require('../conversationTemplates/forgot')
const reactivateIfUnique = require('../utils/reactivateIfUnique')

const run = async ({
  setSession,
  sessionAttributes,
  dialog,
  conversationSet,
  responseBuilder,
  intent,
  requestType,
  userId,
}) => {
  if (requestType === 'LaunchRequest') {
    const previouslyWasHome = sessionAttributes.state && Object.keys(sessionAttributes.state.currentSubConversation)[0] === 'home'

    if (!sessionAttributes.state || previouslyWasHome) {
      sessionAttributes = {
        ...sessionAttributes,
        userId,
        previousPoppedConversation: '',
        state: {
          currentSubConversation: { home: {}},
          conversationStack: previouslyWasHome ? sessionAttributes.state.conversationStack : [],
        },
      }
    } else {
      sessionAttributes = {
        ...sessionAttributes,
        userId,
        previousPoppedConversation: '',
        state: {
          currentSubConversation: { resume: {}},
          conversationStack: [ ...sessionAttributes.state.conversationStack, sessionAttributes.state.currentSubConversation ]
        },
      }
    }
  }

  let {
    state: {
      currentSubConversation,
      conversationStack,
    },
  } = sessionAttributes

  let pop = false
  let whatToSay = ''

  const acceptIntent = async ({
    subConversation = currentSubConversation,
    poppedConversation = false,
  }) => {
    await ({
      conversationStack,
      currentSubConversation,
      sessionAttributes,
      pop,
    } = await acceptIntentHelper({
      conversationStack,
      currentSubConversation,
      subConversation,
      sessionAttributes,
      intent,
      poppedConversation,
      ...conversationSet[Object.keys(subConversation)[0]].handle({
        conversationSet,
        conversationStack,
        currentSubConversation,
        subConversation,
        sessionAttributes,
        intent,
        poppedConversation,
      }),
    }))
  }

  const craftResponse = ({
    subConversation = currentSubConversation,
    finalWords = true,
  }) => {
    const newSpeech = craftResponseHelper({
      currentSubConversation: subConversation,
      dialog,
      ...conversationSet[Object.keys(subConversation)[0]].handle({
        conversationSet,
        dialog,
        currentSubConversation: subConversation,
        conversationStack,
        intent,
        sessionAttributes,
        finalWords,
      }),
    })

    if (whatToSay && newSpeech) {
      whatToSay = `${whatToSay} ${newSpeech}`
    } else {
      whatToSay = newSpeech || whatToSay
    }
  }

  for await (subConversation of conversationStack) {
    const oldSubConversation = currentSubConversation
    await acceptIntent({ subConversation })

    if (oldSubConversation !== currentSubConversation) {
      currentSubConversation[Object.keys(currentSubConversation)[0]].parent = Object.keys(subConversation)[0]
      await ({ currentSubConversation, conversationStack } = reactivateIfUnique({ currentSubConversation, conversationStack, conversationSet }))
    }
  }

  let oldSubConversation = currentSubConversation
  await acceptIntent({})

  while (oldSubConversation !== currentSubConversation) {
    currentSubConversation[Object.keys(currentSubConversation)[0]].parent = Object.keys(oldSubConversation)[0]
    await ({ currentSubConversation, conversationStack } = reactivateIfUnique({ currentSubConversation, conversationStack, conversationSet }))

    craftResponse({ subConversation: oldSubConversation })

    oldSubConversation = currentSubConversation

    await acceptIntent({})
  }

  while (pop && conversationStack.length > 0) {
    craftResponse({})

    sessionAttributes = {
      ...sessionAttributes,
      previousPoppedConversation: Object.keys(currentSubConversation)[0],
    }
    currentSubConversation = conversationStack.pop()

    await acceptIntent({ poppedConversation: true })
  }

  craftResponse({ finalWords: false })

  await setSession({
    ...sessionAttributes,
    state: {
      currentSubConversation,
      conversationStack,
    },
  })

  return responseBuilder
    .speak(whatToSay)
    .withShouldEndSession(false)
    .getResponse()
}

module.exports = ({
  conversationSet: initialConversationSet,
  fetchSession,
  saveSession,
}) => ({
  canHandle: () => true,
  handle: async handlerInput => {
    const {
      responseBuilder,
      requestEnvelope: {
        request: {
          intent,
          type: requestType,
        },
        session: {
          user: { userId },
        },
      },
      attributesManager: {
        getRequestAttributes,
        getSessionAttributes,
        setSessionAttributes,
      },
    } = handlerInput

    if (![ 'LaunchRequest', 'IntentRequest' ].includes(requestType)) {
      return responseBuilder.getResponse()
    }

    const setSession = saveSession || setSessionAttributes
    const getSession = fetchSession || getSessionAttributes
    const sessionAttributes = await getSession(userId)
    const { t: dialog } = getRequestAttributes()

    const home = generateHome({ conversationSet: initialConversationSet })
    const conversationSet = {
      home,
      resume,
      forgot,
      ...initialConversationSet,
    }

    const args = {
      setSession,
      sessionAttributes,
      dialog,
      conversationSet,
      responseBuilder,
      intent,
      requestType,
      userId,
    }

    try {
      const result = await run(args)

      return result
    } catch (err) {
      if (requestType === 'LaunchRequest') {
        console.log('Error with loaded data: ', JSON.stringify(err))
        console.log('Loaded data: ', JSON.stringify(sessionAttributes))
        console.log('Starting session with fresh data...')

        return await run({
          ...args,
          getSession: getSessionAttributes,
          setSession: setSessionAttributes,
          sessionAttributes: await getSessionAttributes(),
        })
      } else {
        throw err
      }
    }
  },
})
