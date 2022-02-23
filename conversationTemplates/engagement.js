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
      const transitions = generateTransitions(conversationSet)
      const transitionTypes = Object.keys(transitions).filter(transitionType => transitions[transitionType].canInterrupt)
      const conversationToTransition = Object.keys(transitions).find(transitionType => transitions[transitionType].intent === intent?.name)

      console.log('in the interceptor', JSON.stringify({ transitions, transitionTypes, conversationToTransition }))

      if (!transitionTypes.length || !transitionTypes.includes(conversationToTransition) || !conversationToTransition) {
        return {}
      }

      const transitionMap = transitionTypes.reduce((acc, transitionType) => ({
        ...acc,
        [transitionType]: () => ({
          conversationStack: [ ...conversationStack, currentSubConversation ],
          currentSubConversation: { [transitionType]: {}},
        })
      }), {})

      const toReturn = transitionMap[conversationToTransition]()
      console.log('deeeebug', JSON.stringify({ transitions, transitionTypes, transitionMap, toReturn }))

      return transitionMap[conversationToTransition]()
    },
    dialogMap: {
      fresh: (ctx, dialog) => greetingDialog(dialog),
      resume: (ctx, dialog) => reEngageDialog(dialog),
    },
    overrideResume: true,
  })
})
