const { state, transition, guard } = require('robot3')

const generateTransitions = conversationSet => Object.entries(conversationSet)
  .filter(([, value ]) => value.intent)
  .reduce((acc, [ key, value ]) => ({ ...acc, [key]: value }), {})

module.exports = ({
  conversationSet = {},
  greetingDialog = () => 'Hi.  Welcome to Ocelot Voice Framework.',
  reEngageDialog = () => 'How else can I help you?',
}) => ({
  handle: () => ({
    stateMap: (transitionsMap => {
      const transitionStates = state(
        ...Object.entries(transitionsMap).map(([ key, value ]) => transition(
          'processIntent',
          key,
          guard((ctx, { intent }) => typeof value.intent === 'string' ?
            intent?.name === value.intent : value.intent.includes(intent?.name),
          ),
        ))
      )

      return Object.keys(transitionsMap).reduce((acc, transition) => ({
        ...acc,
        [transition]: transitionStates,
      }), {
        fresh: transitionStates,
        resume: transitionStates,
      })
    })(generateTransitions(conversationSet)),
    transitionStates: Object.keys(generateTransitions(conversationSet)),
    interceptCallback: ({ conversationStack, currentSubConversation, subConversation, intent }) => {
      const subConversationType = subConversation[Object.keys(subConversation)[0]]
      const transitionTypes = Object.keys(transitions).filter(transitionType => transitions[transitionType].canInterrupt)

      if (!transitionTypes.length || !transitionTypes.includes(subConversationType)) {
        return {}
      }

      const transitionMap = transitionTypes.reduce((acc, transitionType) => ({
        ...acc,
        [transitionType]: () => intent?.name === transitions[transitionType].intent ? {
          conversationStack: [ ...conversationStack, currentSubConversation ],
          currentSubConversation: { [transitionType]: {}},
        } : {}
      }), {})

      const toReturn = transitionMap[subConversationType]()
      console.log('deeeebug', JSON.stringify({ transitions, transitionTypes, transitionMap, toReturn }))

      return transitionMap[subConversationType]()
    },
    dialogMap: {
      fresh: (ctx, dialog) => greetingDialog(dialog),
      resume: (ctx, dialog) => reEngageDialog(dialog),
    },
    overrideResume: true,
  })
})
