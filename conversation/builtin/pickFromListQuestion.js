const {
  reduce,
  state,
  transition,
  guard,
} = require('robot3')
const { slotMatcher } = require('../../util/slotMatcher')

const stateMap = {
  fresh: state(
    transition('processIntent', 'pickFromListQuestion',
      reduce(ctx => ({ ...ctx }))
    ),
  ),
  pickFromListQuestion: state(
    transition('processIntent', 'letterSelected',
      guard((ctx, { intent }) => intent.name === 'PickALetterIntent' && Object.keys(ctx.itemList).includes(slotMatcher.getSlotValueId(intent.slots.letter))),
      reduce((ctx, { intent }) => ({ ...ctx, ...ctx.setResult({selectedValue: ctx.itemList[slotMatcher.getSlotValueId(intent.slots.letter)], misunderstandingCount: ctx.misunderstandingCount, selectedLetter: intent.slots.letter})})),
    ),
    transition('processIntent', 'goBack',
      guard((ctx, { intent }) => intent.name === 'GoBackIntent')
    ),
    transition('processIntent', 'goBack',
      guard(({ misunderstandingCount }) => misunderstandingCount > 3)
    ),
    transition('processIntent', 'pickFromListQuestion',
      reduce(ctx => ({ ...ctx, misunderstandingCount: ctx.misunderstandingCount + 1 })),
    ),
  ),
  letterSelected: state(),
  goBack: state(),
}

const pickFromListQuestion = ({
  itemList = [],
  setResult = ({selectedLetter, misunderstandingCount}) => '',
  questionResponse = () => '',
  letterSelectedResponse = () => '',
  misheardResponse = () => '',
  resumeResponse = () => ''
}) => ({
  acceptIntent: async ({acceptIntent}) => await acceptIntent({
    initialState: {
      misunderstandingCount: 0,
      setResult,
      itemList,
    },
    stateMap,
  }),
  craftResponse: ({ dialog, craftResponse }) => craftResponse({
    states: {
      pickFromListQuestion: ({ misunderstandingCount }) => misunderstandingCount > 0 ? misheardResponse(dialog, {misunderstandingCount}) : questionResponse(dialog, {misunderstandingCount}),
      letterSelected: ({ misunderstandingCount, selectedLetter }) => letterSelectedResponse(dialog, {misunderstandingCount, selectedLetter}),
      goBack: ({ misunderstandingCount }) => goBackResponse(dialog, {misunderstandingCount}),
      resume: ({ misunderstandingCount }) => resumeResponse(dialog, {misunderstandingCount}),
    },
  }),
})

module.exports = { pickFromListQuestion }
