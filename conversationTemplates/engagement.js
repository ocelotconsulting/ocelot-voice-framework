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
    interceptCallback: ({ conversationStack, currentSubConversation, intent }) => Object.keys(transitions)
      .filter(({ canInterrupt }) => canInterrupt)
      .reduce((acc, transitionType) => ({
        ...acc,
        [transitionType]: intent => {
          if (intent?.name === transitions[transitionType].intent) {
            conversationStack.push(currentSubConversation)
            currentSubConversation = { [transitionType]: {}}
          }

          return { conversationStack, currentSubConversation }
        },
      }, {}))[currentSubConversation[Object.keys(currentSubConversation)[0]]](intent),
    dialogMap: {
      fresh: greetingDialog,
      resume: reEngageDialog,
    },
    overrideResume: true,
  })
})
