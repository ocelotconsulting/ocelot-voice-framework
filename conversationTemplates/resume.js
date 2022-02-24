const yesNoQuestion = require('./yesNoQuestion')
const { startCase } = require('lodash')

module.exports = yesNoQuestion({
  questionResponse: (dialog, { conversationSet, conversationStack }) => `${dialog('home.welcome')} ${dialog('home.promptResume', {
    subConversation: conversationSet[Object.keys(conversationStack[conversationStack.length - 1])[0]].description || startCase(Object.keys(conversationStack[conversationStack.length - 1])[0]),
  })}`,
  handleNo: () => ({ resume: { wipeConversation: true }}),
  noResponse: dialog => `${dialog('home.denyResume')} ${dialog('home.reEngage')}`,
  misheardResponse: dialog => dialog('home.misheardResume'),
})
