const { reactivateIfUnique } = require('./util/reactivateIfUnique')

module.exports = ({ conversationSet, fetchSession, saveSession }) => ({
  canHandle: () => {
    console.log('in canHandle', JSON.stringify({ conversationSet, fetchSession, saveSession, isTheFunctionThere: typeof conversationSet.engagement.acceptIntent }))

    return true
  },
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

    const getSession = fetchSession || getSessionAttributes
    const setSession = saveSession || setSessionAttributes
    let sessionAttributes = await getSession(userId)
    const { t: dialog } = getRequestAttributes()

    if (requestType === 'LaunchRequest') {
      const previouslyWasEngagement = sessionAttributes.state && Object.keys(sessionAttributes.state.currentSubConversation)[0] === 'engagement'

      if (!sessionAttributes.state || previouslyWasEngagement) {
        sessionAttributes = {
          ...sessionAttributes,
          previousPoppedConversation: '',
          state: {
            currentSubConversation: { engagement: {}},
            conversationStack: previouslyWasEngagement ? sessionAttributes.state.conversationStack : [],
          },
        }
      } else {
        sessionAttributes = {
          ...sessionAttributes,
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

    let fallThrough = false
    let pop = false
    let whatToSay = ''

    const acceptIntent = async ({
      subConversation = currentSubConversation,
      topConversation = true,
      newConversation = false,
      poppedConversation = false,
    }) => {
      await ({
        conversationStack,
        currentSubConversation,
        sessionAttributes,
        fallThrough,
        pop,
      } = await conversationSet[Object.keys(subConversation)[0]].acceptIntent({
        conversationStack,
        currentSubConversation,
        sessionAttributes,
        intent,
        topConversation,
        newConversation,
        fallThrough,
        poppedConversation,
      }))
    }

    const craftResponse = ({
      subConversation = currentSubConversation,
      finalWords = true,
    }) => {
      const newSpeech = conversationSet[Object.keys(subConversation)[0]].craftResponse({
        dialog,
        subConversation,
        conversationStack,
        intent,
        sessionAttributes,
        finalWords,
      })

      if (whatToSay && newSpeech) {
        whatToSay = `${whatToSay} ${newSpeech}`
      } else {
        whatToSay = newSpeech || whatToSay
      }
    }

    for await (subConversation of conversationStack) {
      const oldSubConversation = currentSubConversation
      await acceptIntent({ subConversation, topConversation: false })

      if (oldSubConversation !== currentSubConversation) {
        currentSubConversation[Object.keys(currentSubConversation)[0]].parent = Object.keys(subConversation)[0]
        ({ currentSubConversation, conversationStack } = reactivateIfUnique({ currentSubConversation, conversationStack, conversationSet }))
      }
    }

    await acceptIntent({})

    let oldSubConversation = currentSubConversation
    while (oldSubConversation !== currentSubConversation) {
      currentSubConversation[Object.keys(currentSubConversation)[0]].parent = Object.keys(oldSubConversation)[0]
      ({ currentSubConversation, conversationStack } = reactivateIfUnique({ currentSubConversation, conversationStack, conversationSet }))

      craftResponse({ subConversation: oldSubConversation })

      oldSubConversation = currentSubConversation

      await acceptIntent({ newConversation: true })
    }

    //In case of pop, loop through as many convos as want to pop off with the current situation
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
      userId,
    })

    return responseBuilder
      .speak(whatToSay)
      .withShouldEndSession(false)
      .getResponse()
  },
})
