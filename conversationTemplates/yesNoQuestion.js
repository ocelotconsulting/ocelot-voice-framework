const {
  reduce,
  state,
  transition,
  guard,
  immediate,
} = require('robot3')
const getSlotValueId = require('../utils/getSlotValueId')

const stateMap = {
  fresh: state(
    transition('processIntent', 'yesNoQuestion'),
  ),
  yesNoQuestion: state(
    immediate('yesAnswer',
      guard(ctx => ctx.resuming && ctx.alreadyAnswered(ctx) && ctx.answer(ctx)),
    ),
    immediate('noAnswer',
      guard(ctx => ctx.resuming && ctx.alreadyAnswered(ctx) && !ctx.answer(ctx)),
    ),
    transition('processIntent', 'yesAnswer',
      guard((ctx, { intent }) => intent.name === 'YesNoIntent' && getSlotValueId(intent.slots.yesNo) === 'yes'),
      reduce(ctx => ({
        ...ctx,
        conversationAttributes: {
          ...ctx.conversationAttributes,
          ...ctx.handleYes(ctx),
        },
      })),
    ),
    transition('processIntent', 'noAnswer',
      guard((ctx, { intent }) => intent.name === 'YesNoIntent' && getSlotValueId(intent.slots.yesNo) === 'no'),
      reduce(ctx => ({
        ...ctx,
        conversationAttributes: {
          ...ctx.conversationAttributes,
          ...ctx.handleNo(ctx),
        },
      })),
    ),
    transition('processIntent', 'yesNoQuestion',
      reduce(ctx => ({ ...ctx, misunderstandingCount: ctx.misunderstandingCount + 1 })),
    ),
  ),
  yesAnswer: state(),
  noAnswer: state(),
}

module.exports = ({
  alreadyAnswered = () => false,
  answer = () => false,
  questionResponse = () => '',
  yesResponse = () => '',
  handleNo = () => ({}),
  handleYes = () => ({}),
  noResponse = () => '',
  misheardResponse = () => '',
  resumeResponse = () => '',
}) => ({
  handle: ({ conversationSet, conversationStack, dialog }) => ({
    initialState: {
      misunderstandingCount: 0,
      alreadyAnswered,
      answer,
      handleNo,
      handleYes,
    },
    stateMap,
    dialogMap: {
      yesNoQuestion: ({ misunderstandingCount }) => misunderstandingCount > 0 ?
        misheardResponse(dialog, { misunderstandingCount, conversationSet, conversationStack }) :
        questionResponse(dialog, { misunderstandingCount, conversationSet, conversationStack }),
      yesAnswer: ({ misunderstandingCount }) => yesResponse(dialog, { misunderstandingCount, conversationSet, conversationStack }),
      noAnswer: ({ misunderstandingCount }) => noResponse(dialog, { misunderstandingCount, conversationSet, conversationStack }),
      resume: ({ misunderstandingCount }) => resumeResponse(dialog, { misunderstandingCount, conversationSet, conversationStack }),
    },
  }),
})
