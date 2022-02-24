const { state, transition, guard } = require('robot3')

const generateTransitions = conversationSet => Object.entries(conversationSet)
  .filter(([, value ]) => value.intent)
  .reduce((acc, [ key, value ]) => ({ ...acc, [key]: value }), {})

module.exports = ({ conversationSet = {}}) => ({
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
    interceptCallback: ({ conversationStack, currentSubConversation, intent }) => {
      const transitions = generateTransitions(conversationSet)
      const transitionTypes = Object.keys(transitions).filter(transitionType => transitions[transitionType].canInterrupt)
      const conversationToTransition = Object.keys(transitions).find(transitionType => transitions[transitionType].intent === intent?.name)

      return !transitionTypes.length || !transitionTypes.includes(conversationToTransition) || !conversationToTransition ?
       {} : transitionTypes.reduce((acc, transitionType) => ({
        ...acc,
        [transitionType]: () => ({
          conversationStack: [ ...conversationStack, currentSubConversation ],
          currentSubConversation: { [transitionType]: {}},
        })
      }), {})[conversationToTransition]()
    },
    dialogMap: {
      fresh: (ctx, dialog) => `${dialog('home.welcome')} ${dialog('home.engage')}`,
      resume: (ctx, dialog) => dialog('home.reEngage'),
    },
    overrideResume: true,
  })
})
