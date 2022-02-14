const {
  reduce,
  state,
  transition,
  guard,
  immediate,
} = require('robot3')
const { slotMatcher } = require('../../util/slotMatcher')

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
      guard((ctx, { intent }) => intent.name === 'YesNoIntent' && slotMatcher.getSlotValueId(intent.slots.yesNo) === 'yes'),
      reduce(ctx => ({
        ...ctx,
        conversationAttributes: {
          ...ctx.conversationAttributes,
          ...ctx.handleYes(ctx),
        },
      })),
    ),
    transition('processIntent', 'noAnswer',
      guard((ctx, { intent }) => intent.name === 'YesNoIntent' && slotMatcher.getSlotValueId(intent.slots.yesNo) === 'no'),
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
  acceptIntent: () => ({
    initialState: {
      misunderstandingCount: 0,
      alreadyAnswered,
      answer,
      handleNo,
      handleYes,
    },
    stateMap,
  }),
  craftResponse: ({ conversationStack, dialog }) => ({
    states: {
      yesNoQuestion: ({ misunderstandingCount }) => misunderstandingCount > 0 ?
        misheardResponse(dialog, { misunderstandingCount }) :
        questionResponse(dialog, { misunderstandingCount, conversationStack }),
      yesAnswer: ({ misunderstandingCount }) => yesResponse(dialog, { misunderstandingCount }),
      noAnswer: ({ misunderstandingCount }) => noResponse(dialog, { misunderstandingCount }),
      resume: ({ misunderstandingCount }) => resumeResponse(dialog, { misunderstandingCount }),
    },
  }),
})
