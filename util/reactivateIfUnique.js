const reactivateIfUnique = ({ currentSubConversation, conversationStack, conversationSet }) => {
  console.log('first', JSON.stringify({ currentSubConversation, conversationStack, conversationSet }))
  if (conversationSet[Object.keys(currentSubConversation)[0]].shouldBeUnique) {
    console.log('second', JSON.stringify({ currentSubConversation, conversationStack, conversationSet }))
    let index = conversationStack.flatMap(conversation => Object.keys(conversation)).indexOf(Object.keys(currentSubConversation)[0])

    if (index > -1) {
      const startIndex = index
      let parentName = Object.keys(conversationStack[index])[0]

      while (index < conversationStack.length - 1 && conversationStack[index + 1][Object.keys(conversationStack[index + 1])[0]].parent === parentName) {
        index++
        parentName = Object.keys(conversationStack[index])[0]
      }

      const endIndex = index

      const moveArray = conversationStack.splice(startIndex, (endIndex - startIndex) + 1)
      currentSubConversation = moveArray.splice(moveArray.length - 1, 1)[0]
      conversationStack.splice(conversationStack.length, 0, ...moveArray)
      console.log('third', JSON.stringify({ currentSubConversation, conversationStack, conversationSet }))
    }
  }
  console.log('fourth', JSON.stringify({ currentSubConversation, conversationStack, conversationSet }))
  return { currentSubConversation, conversationStack }
}

module.exports = { reactivateIfUnique }
