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
      const transitionTypes = Object.keys(transitions).filter(transitionType => transitions[transitionType].canInterrupt)

      if (!transitionTypes.length) {
        return {}
      }

        return transitionTypes.reduce((acc, transitionType) => ({
          ...acc,
          [transitionType]: () => {
            if (intent?.name === transitions[transitionType].intent) {
              conversationStack.push(currentSubConversation)
              currentSubConversation = { [transitionType]: {}}

              return { conversationStack, currentSubConversation }
            }

            return {}
          },
        }), {})[currentSubConversation[Object.keys(currentSubConversation)[0]]]()
    },
    dialogMap: {
      fresh: greetingDialog,
      resume: reEngageDialog,
    },
    overrideResume: true,
  })
})
