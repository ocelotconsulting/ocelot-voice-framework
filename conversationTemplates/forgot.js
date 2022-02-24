const { state, transition, guard, reduce } = require('robot3')

const stateMap = {
  fresh: state(
    transition('processIntent', 'returnContext',
      guard(({ previousConversation }) => previousConversation !== 'engagement'),
      reduce(ctx => ({ ...ctx, previousConversation: ctx.previousConversationName || ctx.previousConversationType })),
    ),
    transition('processIntent', 'noContext'),
  ),
  returnContext: state(),
  noContext: state(),
}

module.exports = {
  intent: 'ForgotIntent',
  canInterrupt: true,
  handle: ({ conversationStack, conversationSet, dialog }) => ({
    stateMap,
    initialState: {
      previousConversationType: Object.keys(conversationStack[conversationStack.length - 1])[0],
      previousConversationName: conversationSet[Object.keys(conversationStack[conversationStack.length - 1])[0]].description,
      previousConversation: '',
    },
    dialogMap: {
      returnContext: ({ previousConversation }) => dialog('home.returnContext', { previousConversation }),
      noContext: () => dialog('home.noContext')
    },
  }),
}
