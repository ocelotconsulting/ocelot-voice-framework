const { state, transition, guard } = require('robot3')

module.exports = ({
  transitions = {},
  greetingDialog = () => 'Hi.  Welcome to Ocelot Voice Framework.',
  reEngageDialog = () => 'How else can I help you?',
}) => ({
  handle: () => ({
    stateMap: (transitionsMap => {
      const allTransitions = state(
        ...Object.keys(transitionsMap).map(key => transition(
          'processIntent',
          key,
          guard((ctx, { intent }) => typeof transitionsMap[key].intent === 'string' ?
            intent?.name === transitionsMap[key].intent :
            transitionsMap[key].intent.includes(intent?.name)
          ),
        ))
      )

      return Object.keys(transitionsMap).reduce((acc, transition) => ({
        ...acc,
        [transition]: allTransitions,
      }), {
        fresh: allTransitions,
        resume: allTransitions,
      })
    })(transitions),
    transitionStates: Object.keys(transitions),
    interceptCallback: ({ conversationStack, currentSubConversation, intent }) => {
      const subConversationType = currentSubConversation[Object.keys(currentSubConversation)[0]]
      const transitionTypes = Object.keys(transitions).filter(transitionType => transitions[transitionType].canInterrupt)

      if (!transitionTypes.length || !transitionTypes.includes(subConversationType)) {
        return {}
      }

      const transitionMap = transitionTypes.reduce((acc, transitionType) => ({
        ...acc,
        [transitionType]: () => {
          if (intent?.name === transitions[transitionType].intent) {
            conversationStack.push(currentSubConversation)
            currentSubConversation = { [transitionType]: {}}

            return { conversationStack, currentSubConversation }
          }

          return {}
        },
      }), {})

      return transitionMap[subConversationType]()
    },
    dialogMap: {
      fresh: (ctx, dialog) => greetingDialog(dialog),
      resume: (ctx, dialog) => reEngageDialog(dialog),
    },
    overrideResume: true,
  })
})
