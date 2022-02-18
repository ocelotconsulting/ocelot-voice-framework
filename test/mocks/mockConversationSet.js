const conversationSet = {
  engagement: {
    craftResponse: ({ dialog, conversationStack, subConversation, sessionAttributes, intent, finalWords }) => {
      if ( finalWords ) {
        return '';
      }
      return "engagement text";
    },
    acceptIntent: async ({ conversationStack, currentSubConversation, sessionAttributes, intent, topConversation, newConversation, poppedConversation, fallThrough }) => {
      if (!fallThrough) {
        if (topConversation) {
          if (!poppedConversation) {
            switch (intent.name) {
              case 'step1Intent' : {
                conversationStack.push({engagement:{}});
                currentSubConversation = {step1: {}};
                return {conversationStack, currentSubConversation, sessionAttributes, fallThrough: false, pop: false};
              }
              case 'step2Intent' : {
                conversationStack.push({engagement: {}});
                currentSubConversation = {step2: {}};
                return {conversationStack, currentSubConversation, sessionAttributes, fallThrough: false, pop: false};
              }
            }
          }
        } else {
          switch (intent.name) {
            case 'step2Intent' : {
              if (Object.keys(currentSubConversation)[0] != Object.keys({step2: {}})[0] || currentSubConversation.step2.numValue != intent.slots.num.value) {
                conversationStack.push(currentSubConversation);
                currentSubConversation = {step2: {}};
                return {conversationStack, currentSubConversation, sessionAttributes, fallThrough: false, pop: false};
              }
            }
          }
        }
      }
      //all accept intents must return these if nothing is changed
      return {conversationStack, currentSubConversation, sessionAttributes, fallThrough: false, pop: false};
    },
  },
  step1: {
    craftResponse: ({ dialog, conversationStack, subConversation, sessionAttributes, intent, finalWords }) => {
      if (subConversation.step1.complain) {
        return "you're already in step1";
      }
      return "step1 text";
    },
    acceptIntent: async ({ conversationStack, currentSubConversation, sessionAttributes, intent, topConversation, newConversation, poppedConversation, fallThrough }) => {
      if (!fallThrough) {
        if (topConversation) {
          switch (intent.name) {
            case 'step1Intent' : {
              if (!newConversation) {
                currentSubConversation.step1.complain = true;
                return {conversationStack, currentSubConversation, sessionAttributes, fallThrough: false, pop: false};
              }
            }
          }
        }
      }
      return {conversationStack, currentSubConversation, sessionAttributes, fallThrough: false, pop: false};
    },
  },
  step2: {
    craftResponse: ({ dialog, conversationStack, subConversation, sessionAttributes, intent, finalWords }) => {
      if (subConversation.step2.resumeStatement) {
        return "step2 resume";
      }
      if (subConversation.step2.numValue && !subConversation.step2.goodValue) {
        //confirm numval
        return `step2 text ${subConversation.step2.numValue}`;
      } else if (subConversation.step2.numValue && intent.slots.good.value === 'yes') {
        return "step2 thanks";
      } else {
        //ask for numval
        return "step2 text";
      }
    },
    acceptIntent: async ({ conversationStack, currentSubConversation, sessionAttributes, intent, topConversation, newConversation, poppedConversation, fallThrough }) => {
      if (!fallThrough) {
        if (topConversation) {
          delete currentSubConversation.step2.resumeStatement;
          switch(intent.name) {
            case 'step2Intent':
              if (poppedConversation) {
                currentSubConversation.step2.resumeStatement = true;
                return {conversationStack, currentSubConversation, sessionAttributes, fallThrough: false, pop: false};
              }
              if(intent.slots.num?.value){
                currentSubConversation.step2.numValue = intent.slots.num.value;
              }
              if(intent.slots.good?.value){
                if (intent.slots.good.value === 'yes') {
                  //Call an API, pop this conversation while saying something...?
                  currentSubConversation.step2.goodValue = intent.slots.good.value;

                  return {conversationStack, currentSubConversation, sessionAttributes, fallThrough: false, pop: true};
                } else {
                  delete currentSubConversation.step2.numValue;
                  delete currentSubConversation.step2.goodValue;
                }
              }
              return {conversationStack, currentSubConversation, sessionAttributes, fallThrough: false, pop: false};
            case 'yesNoIntent':
              if (currentSubConversation.step2.numValue) {
                if (intent.slots.good.value === 'yes') {
                  //Call an API, pop this conversation while saying something...?
                  currentSubConversation.step2.goodValue = intent.slots.yesNo.value;
                  return {conversationStack, currentSubConversation, sessionAttributes, fallThrough: false, pop: true};
                } else {
                  delete currentSubConversation.step2.numValue;
                  delete currentSubConversation.step2.goodValue;
                }
              }
              return {conversationStack, currentSubConversation, sessionAttributes, fallThrough: false, pop: false};
            }
        }
      }
      return {conversationStack, currentSubConversation, sessionAttributes, fallThrough: false, pop: false};
    },
  },
}

module.exports = { conversationSet };
