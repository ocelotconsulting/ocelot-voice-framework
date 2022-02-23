const { createMachine, interpret, state, immediate } = require('robot3');

const newMachine = (stateMap, context, initialState) => initialState ?
  createMachine(initialState, stateMap, context) :
  createMachine(stateMap, context)

module.exports = async ({
  conversationStack,
  currentSubConversation,
  intent,
  topConversation,
  poppedConversation,
  sessionAttributes,
  stateMap,
  initialState = {},
  transitionStates = [],
  interceptCallback = data => data,
}) => {
  console.log('in accept intent', JSON.stringify({ currentSubConversation, conversationStack, topConversation }))
  if (!topConversation) {
    return {
      conversationStack,
      intent,
      sessionAttributes,
      currentSubConversation,
      ...interceptCallback({ conversationStack, intent, sessionAttributes, currentSubConversation }),
    }
  }

  let pop = false
  const subConversationType = Object.keys(currentSubConversation)[0]
  const conversationAttributes = sessionAttributes.conversationAttributes || {}
  const transitions = typeof transitionStates === 'string' ? [ transitionStates ] : transitionStates
  const finalStates = Object.keys(stateMap).filter(state => stateMap[state].final)
  const {
    machineContext: previousMachineContext,
    machineState: previousMachineState = 'fresh',
  } = currentSubConversation[subConversationType];

  const innerContext = ctx => ({
    ...ctx,
    previousMachineState: previousMachineState,
    resuming: poppedConversation,
    conversationAttributes,
    error: ctx.error || '',
    misunderstandingCount: ctx.misunderstandingCount || 0,
  })
  const innerStateMap = {
    ...stateMap,
    ...stateMap.resume ? {} : {
      resume: state(immediate(previousMachineState)),
    },
  }
  const innerMachineState = poppedConversation ? 'resume' : previousMachineState
  const assembledContext = { ...initialState, ...previousMachineContext };

  const machine = newMachine(innerStateMap, innerContext, innerMachineState);
  const service = await interpret(machine, () => {}, assembledContext);

  if (!poppedConversation) {
    await service.send({ type: 'processIntent', intent });
  }

  const {
    machine: { current: machineState },
    context: machineContext,
  } = service

  currentSubConversation[subConversationType] = { ...currentSubConversation[subConversationType], machineState, machineContext }

  if (conversationAttributes.resume?.wipeConversation) {
    conversationStack = [{ engagement: {}}]
    conversationAttributes.resume.wipeConversation = false
    pop = true
  } else {
    if (finalStates.includes(machineState)) {
      pop = true
    }

    if (transitions.includes(machineState)) {
      conversationStack.push(currentSubConversation)
      currentSubConversation = {[machineState]: {}}
    }
  }

  return {
    conversationStack,
    currentSubConversation,
    sessionAttributes: {
      ...sessionAttributes,
      conversationAttributes: {
        ...conversationAttributes,
        ...machineContext.conversationAttributes,
      },
    },
    pop,
  }
}
